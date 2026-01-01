// ============================================
// ✏️ PROFILE EDITOR
// ============================================
// تعديل الملف الشخصي مع معاينة مباشرة

import { supabase } from './supabase-config.js';
import { getCurrentUser } from './auth-manager.js';
import { updateProfile, getProfile } from './user-profiles.js';
import { uploadAvatar, deleteAvatar, createPreview } from './avatar-manager.js';
import { getCountryByCode, isValidCountryCode } from './country-selector.js';

// 📝 التحقق من صحة اسم المستخدم
export function validateUsername(username) {
  const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push('اسم المستخدم مطلوب');
    return { valid: false, errors };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    errors.push('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
  }

  if (trimmed.length > 20) {
    errors.push('اسم المستخدم يجب ألا يتجاوز 20 حرف');
  }

  // السماح بالعربية والإنجليزية والأرقام والشرطة السفلية
  if (!/^[\u0600-\u06FFa-zA-Z0-9_]+$/.test(trimmed)) {
    errors.push('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط');
  }

  // عدم السماح بالأرقام فقط
  if (/^\d+$/.test(trimmed)) {
    errors.push('اسم المستخدم لا يمكن أن يكون أرقام فقط');
  }

  // كلمات محظورة
  const bannedWords = ['admin', 'moderator', 'official', 'support'];
  if (bannedWords.some(word => trimmed.toLowerCase().includes(word))) {
    errors.push('اسم المستخدم يحتوي على كلمة محظورة');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: trimmed
  };
}

// 📝 التحقق من صحة السيرة الذاتية
export function validateBio(bio) {
  const errors = [];

  if (!bio) {
    return { valid: true, errors: [], sanitized: null };
  }

  const trimmed = bio.trim();

  if (trimmed.length > 200) {
    errors.push('السيرة الذاتية يجب ألا تتجاوز 200 حرف');
  }

  // منع الروابط
  if (/https?:\/\/|www\./i.test(trimmed)) {
    errors.push('لا يمكن وضع روابط في السيرة الذاتية');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: trimmed || null
  };
}

// 💾 حفظ التعديلات
export async function saveProfileChanges(changes) {
  try {
    const validationErrors = {};

    // التحقق من اسم المستخدم
    if (changes.username !== undefined) {
      const usernameValidation = validateUsername(changes.username);
      if (!usernameValidation.valid) {
        validationErrors.username = usernameValidation.errors;
      } else {
        changes.username = usernameValidation.sanitized;
      }
    }

    // التحقق من السيرة الذاتية
    if (changes.bio !== undefined) {
      const bioValidation = validateBio(changes.bio);
      if (!bioValidation.valid) {
        validationErrors.bio = bioValidation.errors;
      } else {
        changes.bio = bioValidation.sanitized;
      }
    }

    // التحقق من كود الدولة
    if (changes.countryCode !== undefined && changes.countryCode !== null) {
      if (!isValidCountryCode(changes.countryCode)) {
        validationErrors.countryCode = ['كود الدولة غير صالح'];
      }
    }

    // إذا كانت هناك أخطاء
    if (Object.keys(validationErrors).length > 0) {
      return {
        success: false,
        errors: validationErrors,
        message: 'يوجد أخطاء في البيانات المدخلة'
      };
    }

    // حفظ التغييرات
    const result = await updateProfile(changes);

    if (!result.success) {
      return result;
    }

    // جلب الملف المحدث
    const { data: updatedProfile } = await getProfile();

    return {
      success: true,
      profile: updatedProfile,
      message: 'تم حفظ التغييرات بنجاح ✓'
    };

  } catch (error) {
    console.error('Save profile changes error:', error);
    return {
      success: false,
      error: 'حدث خطأ في الحفظ',
      message: 'حدث خطأ غير متوقع'
    };
  }
}

// 🖼️ تحديث الصورة الشخصية
export async function updateProfileAvatar(file) {
  try {
    if (!file) {
      return { success: false, error: 'لم يتم اختيار ملف' };
    }

    // رفع الصورة
    const uploadResult = await uploadAvatar(file);

    if (!uploadResult.success) {
      return uploadResult;
    }

    // جلب الملف المحدث
    const { data: updatedProfile } = await getProfile();

    return {
      success: true,
      avatarUrl: uploadResult.avatarUrl,
      profile: updatedProfile,
      message: 'تم تحديث الصورة بنجاح ✓'
    };

  } catch (error) {
    console.error('Update avatar error:', error);
    return {
      success: false,
      error: 'حدث خطأ في تحديث الصورة'
    };
  }
}

// 🗑️ حذف الصورة الشخصية
export async function removeProfileAvatar() {
  try {
    const deleteResult = await deleteAvatar();

    if (!deleteResult.success) {
      return deleteResult;
    }

    // جلب الملف المحدث
    const { data: updatedProfile } = await getProfile();

    return {
      success: true,
      profile: updatedProfile,
      message: 'تم حذف الصورة'
    };

  } catch (error) {
    console.error('Remove avatar error:', error);
    return {
      success: false,
      error: 'حدث خطأ في الحذف'
    };
  }
}

// 👁️ معاينة مباشرة للتغييرات
export function createLivePreview(currentProfile, changes) {
  return {
    ...currentProfile,
    ...changes,
    // حساب البيانات المشتقة
    displayName: changes.username || currentProfile.username || 'لاعب',
    countryInfo: changes.countryCode 
      ? getCountryByCode(changes.countryCode) 
      : currentProfile.country_code 
        ? getCountryByCode(currentProfile.country_code)
        : null
  };
}

// 🔄 إعادة تعيين التغييرات
export function resetChanges(originalProfile) {
  return {
    username: originalProfile.username,
    bio: originalProfile.bio,
    countryCode: originalProfile.country_code,
    avatarUrl: originalProfile.avatar_url,
    favoriteBall: originalProfile.favorite_ball,
    favoriteRoad: originalProfile.favorite_road,
    themePreference: originalProfile.theme_preference
  };
}

// 📊 مقارنة التغييرات
export function compareChanges(original, modified) {
  const changes = {};
  const fields = [
    'username', 'bio', 'countryCode', 'avatarUrl', 
    'favoriteBall', 'favoriteRoad', 'themePreference'
  ];

  fields.forEach(field => {
    const originalField = field === 'countryCode' ? original.country_code : original[field];
    if (modified[field] !== originalField) {
      changes[field] = {
        old: originalField,
        new: modified[field]
      };
    }
  });

  return {
    hasChanges: Object.keys(changes).length > 0,
    changes,
    count: Object.keys(changes).length
  };
}

// 💾 الحفظ التلقائي (مع debounce)
let autoSaveTimeout = null;

export function setupAutoSave(getChanges, saveCallback, delay = 2000) {
  return function triggerAutoSave() {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    autoSaveTimeout = setTimeout(async () => {
      const changes = getChanges();
      if (Object.keys(changes).length > 0) {
        const result = await saveCallback(changes);
        if (result.success) {
          console.log('💾 حفظ تلقائي:', new Date().toLocaleTimeString('ar'));
        }
      }
    }, delay);
  };
}

// 🧹 إلغاء الحفظ التلقائي
export function cancelAutoSave() {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = null;
  }
}

// 📸 معاينة الصورة قبل الرفع
export async function previewAvatarBeforeUpload(file) {
  try {
    const preview = await createPreview(file);
    
    if (!preview.success) {
      return preview;
    }

    return {
      success: true,
      preview: preview.preview,
      fileInfo: {
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type
      }
    };

  } catch (error) {
    console.error('Preview error:', error);
    return {
      success: false,
      error: 'فشل إنشاء المعاينة'
    };
  }
}

// 🎨 تحديث الثيم المفضل فقط
export async function updateTheme(theme) {
  try {
    const result = await saveProfileChanges({ themePreference: theme });
    return result;

  } catch (error) {
    console.error('Update theme error:', error);
    return {
      success: false,
      error: 'فشل تحديث الثيم'
    };
  }
}

// ⚽ تحديث الكرة المفضلة
export async function updateFavoriteBall(ballId) {
  try {
    const result = await saveProfileChanges({ favoriteBall: ballId });
    return result;

  } catch (error) {
    console.error('Update favorite ball error:', error);
    return {
      success: false,
      error: 'فشل تحديث الكرة المفضلة'
    };
  }
}

// 🛣️ تحديث الطريق المفضل
export async function updateFavoriteRoad(roadId) {
  try {
    const result = await saveProfileChanges({ favoriteRoad: roadId });
    return result;

  } catch (error) {
    console.error('Update favorite road error:', error);
    return {
      success: false,
      error: 'فشل تحديث الطريق المفضل'
    };
  }
}

// 📋 التحقق من اكتمال الملف الشخصي
export function checkProfileCompletion(profile) {
  const checks = {
    hasUsername: { 
      completed: !!profile.username, 
      weight: 20,
      label: 'اسم المستخدم'
    },
    hasAvatar: { 
      completed: !!profile.avatar_url, 
      weight: 25,
      label: 'الصورة الشخصية'
    },
    hasCountry: { 
      completed: !!profile.country_code, 
      weight: 15,
      label: 'البلد'
    },
    hasBio: { 
      completed: !!profile.bio, 
      weight: 10,
      label: 'السيرة الذاتية'
    },
    hasFavoriteBall: { 
      completed: !!profile.favorite_ball, 
      weight: 15,
      label: 'الكرة المفضلة'
    },
    hasFavoriteRoad: { 
      completed: !!profile.favorite_road, 
      weight: 15,
      label: 'الطريق المفضل'
    }
  };

  const completedWeight = Object.values(checks)
    .filter(check => check.completed)
    .reduce((sum, check) => sum + check.weight, 0);

  const missingItems = Object.entries(checks)
    .filter(([_, check]) => !check.completed)
    .map(([key, check]) => check.label);

  return {
    percentage: completedWeight,
    isComplete: completedWeight === 100,
    checks,
    missingItems,
    nextStep: missingItems[0] || null
  };
}

// 🎁 مكافأة إكمال الملف الشخصي
export async function claimCompletionReward(profile) {
  try {
    const completion = checkProfileCompletion(profile);

    if (!completion.isComplete) {
      return {
        success: false,
        error: 'الملف غير مكتمل',
        missingItems: completion.missingItems
      };
    }

    const user = await getCurrentUser();
    if (!user) return { success: false };

    // منح مكافأة (100 عملة)
    const { error } = await supabase
      .from('game_saves')
      .update({ 
        coins: supabase.raw('coins + 100'),
        completion_reward_claimed: true
      })
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: 'فشل منح المكافأة' };
    }

    return {
      success: true,
      reward: 100,
      message: 'مبروك! حصلت على 100 عملة 🎉'
    };

  } catch (error) {
    console.error('Claim reward error:', error);
    return { success: false, error: 'حدث خطأ' };
  }
}

// ✅ استخدام:
// import { saveProfileChanges, updateProfileAvatar, createLivePreview } from './profile-editor.js';
// 
// const result = await saveProfileChanges({ username: 'NewName', bio: 'Bio' });
// const preview = createLivePreview(profile, { username: 'NewName' });
