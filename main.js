// main.js - نقطة البداية المصححة
let game;
let ui;

// الانتظار حتى تحميل الصفحة و Three.js
window.addEventListener('DOMContentLoaded', () => {
    // التحقق من تحميل Three.js
    if (typeof THREE === 'undefined') {
        console.error('❌ خطأ: مكتبة Three.js لم تُحمّل!');
        alert('خطأ: لا يمكن تحميل اللعبة. تأكد من الاتصال بالإنترنت.');
        return;
    }
    
    // التحقق من وجود الفئات
    if (typeof Ball === 'undefined') {
        console.error('❌ خطأ: ملف ball.js لم يُحمّل!');
        return;
    }
    
    if (typeof Road === 'undefined') {
        console.error('❌ خطأ: ملف road.js لم يُحمّل!');
        return;
    }
    
    if (typeof Game === 'undefined') {
        console.error('❌ خطأ: ملف game.js لم يُحمّل!');
        return;
    }
    
    if (typeof UI === 'undefined') {
        console.error('❌ خطأ: ملف ui.js لم يُحمّل!');
        return;
    }
    
    try {
        // إنشاء اللعبة
        game = new Game();
        
        // إنشاء واجهة المستخدم
        ui = new UI(game);
        
        console.log('✅ لعبة الكرة 3D جاهزة!');
        console.log('📝 استخدم الأسهم (← →) أو (A, D) للتحكم بالكرة');
        console.log('🎯 تجنب المثلثات واجمع أكبر عدد من النقاط!');
    } catch (error) {
        console.error('❌ خطأ في تشغيل اللعبة:', error);
        alert('حدث خطأ في تشغيل اللعبة. تحقق من Console.');
    }
});
