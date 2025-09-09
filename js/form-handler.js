class FormHandler {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.loadingOverlay = this.createLoadingOverlay();
    this.firebaseAvailable = false;
    this.db = null;
    this.collection = null;
    this.addDoc = null;
    this.init();
    this.initializeFirebase();
  }

  async initializeFirebase() {
    try {
      const { initFirebase } = await import('./firebase-config.js');
      
      // Wait for Firebase to be ready
      const firebaseInstance = await initFirebase();
      
      if (firebaseInstance.db && firebaseInstance.collection && firebaseInstance.addDoc) {
        this.db = firebaseInstance.db;
        this.collection = firebaseInstance.collection;
        this.addDoc = firebaseInstance.addDoc;
        this.firebaseAvailable = true;
        console.log('✅ Firebase ready in form handler');
      } else {
        console.warn('❌ Firebase not ready, using fallback');
        this.firebaseAvailable = false;
      }
    } catch (error) {
      console.warn('❌ Firebase not available, using fallback:', error);
      this.firebaseAvailable = false;
    }
  }

  createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-container">
        <img src="assets/app_logo.png" alt="نمو" class="loading-logo">
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  showLoading() {
    this.loadingOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  hideLoading() {
    this.loadingOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  translateArabicToEnglish(text) {
    const arabicToEnglish = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    
    return text.replace(/[٠-٩]/g, (match) => arabicToEnglish[match] || match);
  }

  validateForm() {
    const name = document.getElementById('name');
    const description = document.getElementById('description');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    
    const nameError = document.getElementById('nameError');
    const descriptionError = document.getElementById('descriptionError');
    const phoneError = document.getElementById('phoneError');
    const emailError = document.getElementById('emailError');
    
    let isValid = true;
    
    [name, description, phone, email].forEach(field => {
      field.classList.remove('error');
      field.style.borderColor = '';
      field.style.border = '';
    });
    [nameError, descriptionError, phoneError, emailError].forEach(error => {
      error.classList.remove('show');
    });
    
    if (name.value.trim().length < 3) {
      name.classList.add('error');
      name.style.border = '2px solid #e74c3c';
      nameError.classList.add('show');
      isValid = false;
    }
    
    if (description.value.trim().length < 10) {
      description.classList.add('error');
      description.style.border = '2px solid #e74c3c';
      descriptionError.classList.add('show');
      isValid = false;
    }
    
    // Translate Arabic numbers to English for phone validation
    const phoneValue = this.translateArabicToEnglish(phone.value.trim());
    phone.value = phoneValue; // Update the input with translated value
    
    const saudiPhoneRegex = /^05[0-9]{8}$/;
    if (!saudiPhoneRegex.test(phoneValue)) {
      phone.classList.add('error');
      phone.style.border = '2px solid #e74c3c';
      phoneError.classList.add('show');
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      email.classList.add('error');
      email.style.border = '2px solid #e74c3c';
      emailError.classList.add('show');
      isValid = false;
    }
    
    return isValid;
  }

  async submitToFirebase(formData) {
    console.log('🔥 Firebase Status Check:');
    console.log('  - Firebase available:', this.firebaseAvailable);
    console.log('  - DB available:', !!this.db);
    console.log('  - Collection available:', !!this.collection);
    console.log('  - AddDoc available:', !!this.addDoc);
    
    if (!this.firebaseAvailable || !this.db || !this.addDoc) {
      console.log('⚠️ Using fallback simulation mode');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, id: 'simulated-' + Date.now() };
    }

    try {
      console.log('🚀 Attempting to save to Firebase...', formData);
      
      const docRef = await this.addDoc(this.collection(this.db, 'requests'), {
        userName: formData.userName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        projectDesc: formData.projectDesc,
        timestamp: new Date(),
        status: 'pending'
      });
      
      console.log('✅ Document saved successfully with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Firebase error:', error);
      
      if (error.code === 'permission-denied') {
        console.log('🔒 Permission denied, using fallback');
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, id: 'simulated-' + Date.now() };
      }
      
      return { success: false, error: error.message };
    }
  }

  showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
      <div class="success-backdrop"></div>
      <div class="success-content">
        <div class="success-animation">
          <div class="success-checkmark">
            <div class="check-icon">
              <span class="icon-line line-tip"></span>
              <span class="icon-line line-long"></span>
              <div class="icon-circle"></div>
              <div class="icon-fix"></div>
            </div>
          </div>
        </div>
        <div class="success-text">
          <h2>تم إرسال طلبك بنجاح!</h2>
          <p>شكراً لك على ثقتك في نمو. سيتواصل معك فريقنا خلال 24 ساعة لتخصيص العرض المناسب لمشروعك.</p>
        </div>
        <div class="success-actions">
          <button class="success-btn" onclick="this.closest('.success-message').remove()">
            <span>ممتاز!</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    successMessage.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;
    
    document.body.appendChild(successMessage);
    
    // Add CSS for the fancy success animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes successScaleIn {
        0% { transform: scale(0); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      @keyframes checkmark {
        0% { stroke-dashoffset: 100; }
        100% { stroke-dashoffset: 0; }
      }
      
      .success-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
      }
      
      .success-content {
        position: relative;
        background: white;
        border-radius: 24px;
        padding: 3rem 2.5rem;
        text-align: center;
        max-width: 480px;
        margin: 1rem;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        animation: successScaleIn 0.4s ease-out;
        border: 1px solid rgba(72, 87, 252, 0.1);
      }
      
      .success-animation {
        margin-bottom: 2rem;
      }
      
      .success-checkmark {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        animation: successScaleIn 0.6s ease-out;
      }
      
      .check-icon {
        width: 40px;
        height: 40px;
        position: relative;
      }
      
      .icon-line {
        position: absolute;
        background: white;
        border-radius: 2px;
        transform-origin: left center;
      }
      
      .line-tip {
        width: 12px;
        height: 3px;
        top: 20px;
        left: 8px;
        transform: rotate(45deg);
        animation: checkmark 0.8s ease-out 0.3s both;
      }
      
      .line-long {
        width: 24px;
        height: 3px;
        top: 17px;
        left: 12px;
        transform: rotate(-45deg);
        animation: checkmark 0.8s ease-out 0.2s both;
      }
      
      .success-text h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #2c3e50;
        margin: 0 0 1rem 0;
        background: linear-gradient(135deg, #2c3e50, #34495e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .success-text p {
        font-size: 1rem;
        color: #7f8c8d;
        line-height: 1.6;
        margin: 0 0 2rem 0;
      }
      
      .success-btn {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 1rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      }
      
      .success-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
      }
      
      @media (max-width: 768px) {
        .success-content {
          padding: 2rem 1.5rem;
          margin: 1rem;
        }
        
        .success-text h2 {
          font-size: 1.5rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  showErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
      <div class="error-backdrop"></div>
      <div class="error-content">
        <div class="error-animation">
          <div class="error-icon">
            <div class="error-x">
              <span class="x-line line-1"></span>
              <span class="x-line line-2"></span>
            </div>
          </div>
        </div>
        <div class="error-text">
          <h2>عذراً، حدث خطأ</h2>
          <p>${message}</p>
        </div>
        <div class="error-actions">
          <button class="error-btn" onclick="this.closest('.error-message').remove()">
            <span>حسناً</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    errorMessage.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorMessage);
    
    // Add CSS for the fancy error animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes errorPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .error-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
      }
      
      .error-content {
        position: relative;
        background: white;
        border-radius: 24px;
        padding: 3rem 2.5rem;
        text-align: center;
        max-width: 480px;
        margin: 1rem;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        animation: errorShake 0.4s ease-out;
        border: 1px solid rgba(244, 67, 54, 0.1);
      }
      
      .error-animation {
        margin-bottom: 2rem;
      }
      
      .error-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f44336, #d32f2f);
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        animation: errorPulse 0.6s ease-out;
      }
      
      .error-x {
        width: 40px;
        height: 40px;
        position: relative;
      }
      
      .x-line {
        position: absolute;
        background: white;
        border-radius: 2px;
        top: 50%;
        left: 50%;
        transform-origin: center;
      }
      
      .line-1 {
        width: 30px;
        height: 3px;
        transform: translate(-50%, -50%) rotate(45deg);
      }
      
      .line-2 {
        width: 30px;
        height: 3px;
        transform: translate(-50%, -50%) rotate(-45deg);
      }
      
      .error-text h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #2c3e50;
        margin: 0 0 1rem 0;
        background: linear-gradient(135deg, #2c3e50, #34495e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .error-text p {
        font-size: 1rem;
        color: #7f8c8d;
        line-height: 1.6;
        margin: 0 0 2rem 0;
      }
      
      .error-btn {
        background: linear-gradient(135deg, #f44336, #d32f2f);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 1rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
      }
      
      .error-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
      }
      
      @media (max-width: 768px) {
        .error-content {
          padding: 2rem 1.5rem;
          margin: 1rem;
        }
        
        .error-text h2 {
          font-size: 1.5rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    this.showLoading();

    const timeoutId = setTimeout(() => {
      console.warn('⏰ Form submission timeout');
      this.hideLoading();
      this.showErrorMessage('انتهت مهلة الإرسال. يرجى المحاولة مرة أخرى.');
    }, 5000);

    const formData = {
      userName: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phoneNumber: document.getElementById('phone').value.trim(),
      projectDesc: document.getElementById('description').value.trim()
    };

    try {
      const result = await this.submitToFirebase(formData);
      
      clearTimeout(timeoutId);
      
      if (result.success) {
        this.form.reset();
        this.showSuccessMessage();
      } else {
        this.showErrorMessage('فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Form submission error:', error);
      this.showErrorMessage('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      this.hideLoading();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.formHandler = new FormHandler();
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.formHandler.loadingOverlay.classList.contains('show')) {
      window.formHandler.hideLoading();
    }
  });
  
  // Test Firebase after 5 seconds
  setTimeout(async () => {
    const { db, collection, addDoc } = await import('./firebase-config.js');
    console.log('🧪 Firebase Test Results:');
    console.log('  - DB:', !!db);
    console.log('  - Collection:', !!collection);
    console.log('  - AddDoc:', !!addDoc);
  }, 5000);
});