// ============================================
// 🖼️ AVATAR MANAGER
// ============================================
// إدارة الصور الشخصية مع ضغط وتحسين تلقائي

import { supabase } from './supabase-config.js';
import { getCurrentUser } from './auth-manager.js';

// 📏 الإعدادات
const AVATAR_CONFIG = {
  maxSize: 500 * 1024, // 500KB
  dimensions: 512, // 512x512 بكسل
  quality: 0.85, // جودة الضغط
  format: 'image/jpeg',
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

// 📤 رفع صورة شخصية
export async function uploadAvatar(file) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول' };
    }

    // التحقق من نوع الملف
    if (!AVATAR_CONFIG.allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'نوع الملف غير مدعوم. استخدم JPG أو PNG' 
      };
    }

    // التحقق من حجم الملف الأولي
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return { 
        success: false, 
        error: 'حجم الملف كبير جداً (الحد الأقصى 10MB)' 
      };
    }

    // معالجة الصورة
    const processedImage = await processImage(file);
    
    if (!processedImage.success) {
      return processedImage;
    }

    // رفع الصورة إلى Supabase Storage
    const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, processedImage.blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'فشل رفع الصورة' };
    }

    // الحصول على رابط الصورة العام
    const { data: urlData } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // تحديث الملف الشخصي
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update profile error:', updateError);
      return { success: false, error: 'فشل تحديث الملف' };
    }

    return { 
      success: true, 
      avatarUrl,
      message: 'تم رفع الصورة بنجاح ✓' 
    };

  } catch (error) {
    console.error('Upload avatar error:', error);
    return { success: false, error: 'حدث خطأ في رفع الصورة' };
  }
}

// 🎨 معالجة الصورة (قص، تدوير، ضغط)
async function processImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = async () => {
        try {
          // إنشاء canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // حساب الأبعاد (مربع)
          const size = AVATAR_CONFIG.dimensions;
          canvas.width = size;
          canvas.height = size;
          
          // رسم الصورة مع القص المركزي
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;
          
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, size, size
          );
          
          // تطبيق فلتر تحسين (اختياري)
          applyEnhancements(ctx, size);
          
          // تحويل إلى Blob مع ضغط
          canvas.toBlob(
            (blob) => {
              if (blob.size > AVATAR_CONFIG.maxSize) {
                // محاولة ضغط أكثر
                compressMore(canvas, AVATAR_CONFIG.maxSize)
                  .then(compressedBlob => {
                    resolve({
                      success: true,
                      blob: compressedBlob,
                      size: compressedBlob.size
                    });
                  })
                  .catch(() => {
                    resolve({
                      success: false,
                      error: 'فشل ضغط الصورة لحجم مناسب'
                    });
                  });
              } else {
                resolve({
                  success: true,
                  blob,
                  size: blob.size
                });
              }
            },
            AVATAR_CONFIG.format,
            AVATAR_CONFIG.quality
          );
          
        } catch (error) {
          resolve({
            success: false,
            error: 'فشلت معالجة الصورة'
          });
        }
      };
      
      img.onerror = () => {
        resolve({
          success: false,
          error: 'فشل تحميل الصورة'
        });
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'فشل قراءة الملف'
      });
    };
    
    reader.readAsDataURL(file);
  });
}

// 🎨 تطبيق تحسينات على الصورة
function applyEnhancements(ctx, size) {
  // زيادة الوضوح قليلاً
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  // زيادة التباين بنسبة 10%
  const factor = (259 * (10 + 255)) / (255 * (259 - 10));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128;     // R
    data[i + 1] = factor * (data[i + 1] - 128) + 128; // G
    data[i + 2] = factor * (data[i + 2] - 128) + 128; // B
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// 🗜️ ضغط إضافي إذا كان الحجم كبيراً
function compressMore(canvas, targetSize) {
  return new Promise((resolve, reject) => {
    let quality = 0.7;
    
    const tryCompress = () => {
      canvas.toBlob(
        (blob) => {
          if (blob.size <= targetSize || quality < 0.3) {
            if (blob.size > targetSize) {
              reject(new Error('لا يمكن ضغط الصورة أكثر'));
            } else {
              resolve(blob);
            }
          } else {
            quality -= 0.1;
            tryCompress();
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    tryCompress();
  });
}

// 🗑️ حذف الصورة الشخصية
export async function deleteAvatar() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول' };
    }

    // الحصول على رابط الصورة الحالية
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .single();

    if (profile?.avatar_url) {
      // استخراج اسم الملف من الرابط
      const fileName = profile.avatar_url.split('/').pop();
      
      // حذف من Storage
      await supabase.storage
        .from('user-avatars')
        .remove([`avatars/${fileName}`]);
    }

    // تحديث الملف الشخصي
    const { error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: 'فشل حذف الصورة' };
    }

    return { success: true, message: 'تم حذف الصورة' };

  } catch (error) {
    console.error('Delete avatar error:', error);
    return { success: false, error: 'حدث خطأ في الحذف' };
  }
}

// 🔄 تغيير الصورة
export async function updateAvatar(file) {
  // حذف الصورة القديمة
  await deleteAvatar();
  
  // رفع الصورة الجديدة
  return await uploadAvatar(file);
}

// 📷 التقاط صورة من الكاميرا
export async function captureFromCamera() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { 
        success: false, 
        error: 'الكاميرا غير مدعومة في متصفحك' 
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 1280 },
        facingMode: 'user'
      } 
    });

    return { success: true, stream };

  } catch (error) {
    console.error('Camera error:', error);
    return { 
      success: false, 
      error: 'فشل الوصول إلى الكاميرا' 
    };
  }
}

// 🖼️ إنشاء معاينة للصورة
export function createPreview(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve({
        success: true,
        preview: e.target.result
      });
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'فشل إنشاء المعاينة'
      });
    };
    
    reader.readAsDataURL(file);
  });
}

// 🎭 توليد صورة افتراضية بناءً على الحرف الأول
export function generateDefaultAvatar(username, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // خلفية بلون عشوائي بناءً على الاسم
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  const colorIndex = username.charCodeAt(0) % colors.length;
  ctx.fillStyle = colors[colorIndex];
  ctx.fillRect(0, 0, size, size);

  // الحرف الأول
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(username.charAt(0).toUpperCase(), size / 2, size / 2);

  return canvas.toDataURL('image/png');
}

// 📊 التحقق من صلاحية الصورة
export function validateImageFile(file) {
  const errors = [];

  if (!file) {
    errors.push('لم يتم اختيار ملف');
    return { valid: false, errors };
  }

  if (!AVATAR_CONFIG.allowedTypes.includes(file.type)) {
    errors.push('نوع الملف غير مدعوم (استخدم JPG أو PNG)');
  }

  if (file.size > 10 * 1024 * 1024) {
    errors.push('حجم الملف كبير جداً (الحد الأقصى 10MB)');
  }

  return {
    valid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type
    }
  };
}

// ✅ استخدام:
// import { uploadAvatar, createPreview, generateDefaultAvatar } from './avatar-manager.js';
// 
// const result = await uploadAvatar(fileInput.files[0]);
// if (result.success) { console.log('تم رفع:', result.avatarUrl); }
