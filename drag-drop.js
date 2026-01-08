// نظام السحب والإفلات للحروف

const DragDrop = {
  draggedElement: null,
  sourceSlot: null,
  answerSlots: [],
  letterTiles: [],

  // تهيئة السحب والإفلات
  init(answerSlots, letterTiles) {
    this.answerSlots = answerSlots;
    this.letterTiles = letterTiles;

    this.setupLetterTiles();
    this.setupAnswerSlots();
  },

  // تهيئة بطاقات الحروف
  setupLetterTiles() {
    this.letterTiles.forEach(tile => {
      // للأجهزة التي تدعم اللمس
      tile.addEventListener('touchstart', (e) => this.handleTouchStart(e, tile));
      tile.addEventListener('touchmove', (e) => this.handleTouchMove(e));
      tile.addEventListener('touchend', (e) => this.handleTouchEnd(e));

      // للفأرة
      tile.addEventListener('dragstart', (e) => this.handleDragStart(e, tile));
      tile.addEventListener('dragend', (e) => this.handleDragEnd(e));
      
      // جعل العنصر قابل للسحب
      tile.setAttribute('draggable', 'true');
      
      // للنقر المباشر (بديل للسحب)
      tile.addEventListener('click', (e) => this.handleTileClick(e, tile));
    });
  },

  // تهيئة خانات الإجابة
  setupAnswerSlots() {
    this.answerSlots.forEach(slot => {
      // للأجهزة التي تدعم الفأرة
      slot.addEventListener('dragover', (e) => this.handleDragOver(e));
      slot.addEventListener('drop', (e) => this.handleDrop(e, slot));
      slot.addEventListener('dragleave', (e) => this.handleDragLeave(e, slot));

      // للنقر المباشر
      slot.addEventListener('click', (e) => this.handleSlotClick(e, slot));
    });
  },

  // بداية السحب (الفأرة)
  handleDragStart(e, tile) {
    if (tile.classList.contains('used')) return;
    
    this.draggedElement = tile;
    this.sourceSlot = tile.parentElement.classList.contains('answer-slot') 
      ? tile.parentElement 
      : null;
    
    tile.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', tile.innerHTML);
  },

  // نهاية السحب (الفأرة)
  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
    }
    
    // إزالة تأثير drop-target من جميع الخانات
    this.answerSlots.forEach(slot => {
      slot.classList.remove('drop-target');
    });
  },

  // السحب فوق الخانة
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const slot = e.currentTarget;
    if (!slot.hasChildNodes() || slot.querySelector('.letter-tile')) {
      slot.classList.add('drop-target');
    }
    
    return false;
  },

  // مغادرة منطقة الإفلات
  handleDragLeave(e, slot) {
    slot.classList.remove('drop-target');
  },

  // الإفلات في الخانة
  handleDrop(e, slot) {
    e.preventDefault();
    e.stopPropagation();
    
    slot.classList.remove('drop-target');
    
    if (!this.draggedElement) return;

    // إذا كانت الخانة فارغة
    if (!slot.querySelector('.letter-tile')) {
      // إذا كان الحرف من خانة أخرى، نعيده إلى مكانه الأصلي أولاً
      if (this.sourceSlot) {
        this.sourceSlot.innerHTML = '';
      }
      
      // نضيف الحرف إلى الخانة الجديدة
      slot.appendChild(this.draggedElement);
      slot.classList.add('filled');
      this.draggedElement.classList.remove('dragging');
      
      // تحديث حالة الحرف
      this.draggedElement.classList.add('used');
      
      Utils.playSound('drop');
    }

    this.draggedElement = null;
    this.sourceSlot = null;
    
    return false;
  },

  // بداية اللمس (للأجهزة المحمولة)
  handleTouchStart(e, tile) {
    if (tile.classList.contains('used')) return;
    
    this.draggedElement = tile;
    this.sourceSlot = tile.parentElement.classList.contains('answer-slot') 
      ? tile.parentElement 
      : null;
    
    tile.classList.add('dragging');
    
    // منع السلوك الافتراضي للمس
    e.preventDefault();
  },

  // حركة اللمس
  handleTouchMove(e) {
    if (!this.draggedElement) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // إذا كان العنصر خانة إجابة
    if (element && element.classList.contains('answer-slot')) {
      // تمييز الخانة
      this.answerSlots.forEach(slot => {
        slot.classList.remove('drop-target');
      });
      
      if (!element.querySelector('.letter-tile')) {
        element.classList.add('drop-target');
      }
    }
  },

  // نهاية اللمس
  handleTouchEnd(e) {
    if (!this.draggedElement) return;
    
    e.preventDefault();
    
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // إذا كان العنصر خانة إجابة فارغة
    if (element && element.classList.contains('answer-slot') && !element.querySelector('.letter-tile')) {
      // إذا كان من خانة أخرى
      if (this.sourceSlot) {
        this.sourceSlot.innerHTML = '';
      }
      
      // إضافة الحرف
      element.appendChild(this.draggedElement);
      element.classList.add('filled');
      this.draggedElement.classList.add('used');
      
      Utils.playSound('drop');
    }
    
    // تنظيف
    this.draggedElement.classList.remove('dragging');
    this.answerSlots.forEach(slot => {
      slot.classList.remove('drop-target');
    });
    
    this.draggedElement = null;
    this.sourceSlot = null;
  },

  // نقر على بطاقة حرف (بديل للسحب)
  handleTileClick(e, tile) {
    if (tile.classList.contains('used')) return;
    
    // البحث عن أول خانة فارغة
    const emptySlot = this.answerSlots.find(slot => !slot.querySelector('.letter-tile'));
    
    if (emptySlot) {
      emptySlot.appendChild(tile);
      emptySlot.classList.add('filled');
      tile.classList.add('used');
      
      Utils.playSound('drop');
    }
  },

  // نقر على خانة إجابة (لإزالة الحرف)
  handleSlotClick(e, slot) {
    const tile = slot.querySelector('.letter-tile');
    
    if (tile) {
      // إعادة الحرف إلى منطقة الحروف
      const lettersContainer = document.getElementById('lettersContainer');
      if (lettersContainer) {
        lettersContainer.appendChild(tile);
        tile.classList.remove('used');
        slot.classList.remove('filled');
        
        Utils.playSound('remove');
      }
    }
  },

  // الحصول على الإجابة الحالية
  getCurrentAnswer() {
    const answer = [];
    
    this.answerSlots.forEach(slot => {
      const tile = slot.querySelector('.letter-tile');
      if (tile) {
        answer.push(tile.dataset.letter);
      } else {
        answer.push('');
      }
    });
    
    return answer.join('');
  },

  // مسح جميع الحروف
  clearAnswer() {
    const lettersContainer = document.getElementById('lettersContainer');
    if (!lettersContainer) return;
    
    this.answerSlots.forEach(slot => {
      const tile = slot.querySelector('.letter-tile');
      if (tile) {
        lettersContainer.appendChild(tile);
        tile.classList.remove('used');
        slot.classList.remove('filled');
      }
    });
    
    Utils.playSound('clear');
  },

  // تعطيل السحب
  disable() {
    this.letterTiles.forEach(tile => {
      tile.setAttribute('draggable', 'false');
      tile.style.pointerEvents = 'none';
      tile.style.opacity = '0.5';
    });
  },

  // تفعيل السحب
  enable() {
    this.letterTiles.forEach(tile => {
      if (!tile.classList.contains('used')) {
        tile.setAttribute('draggable', 'true');
        tile.style.pointerEvents = 'auto';
        tile.style.opacity = '1';
      }
    });
  },

  // إعادة تعيين
  reset() {
    this.draggedElement = null;
    this.sourceSlot = null;
    this.clearAnswer();
  }
};

// تصدير
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DragDrop;
}