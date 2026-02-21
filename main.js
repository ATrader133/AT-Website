document.addEventListener('DOMContentLoaded', function() {
    console.log("ABRAR TRADERS: Enterprise System Loaded v6.0");

    // ==========================================
    // 1. GLOBAL STATE & BASKET
    // ==========================================
    let basket = [];
    let currentUnit = 'cm';
    try {
        const stored = localStorage.getItem('at_basket');
        if (stored) basket = JSON.parse(stored);
    } catch (e) { console.error("Storage Error:", e); }

    // ==========================================
    // 2. TOAST NOTIFICATION SYSTEM
    // ==========================================
    window.showToast = function(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '✅' : 'ℹ️'; // Simplified icon for speed
        toast.innerHTML = `<span class="mr-2">${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastFadeOut 0.4s forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    // ==========================================
    // 3. PRODUCT MODAL & WHATSAPP LOGIC
    // ==========================================
    const productModal = document.getElementById('productModal');
    const productModalBackdrop = document.getElementById('productModalBackdrop');
    
    window.openProductModal = function(card) {
        const d = card.dataset;
        document.getElementById('modalProductName').textContent = d.name;
        document.getElementById('modalProductImage').src = d.image;
        document.getElementById('modalProductDescription').textContent = d.description;
        
        const specs = document.getElementById('modalProductSpecifications');
        if(specs) {
            specs.innerHTML = '';
            try {
                JSON.parse(d.specifications).forEach(s => {
                    specs.innerHTML += `<li class="flex justify-between border-b border-gray-100 py-2"><span class="text-gray-500">${s.label}</span><span class="font-bold text-gray-800">${s.value}</span></li>`;
                });
            } catch(e){}
        }
        document.getElementById('modalProductAdditionalInfo').textContent = d['additional-info'];
        
        // Connect Buttons
        const addBtn = document.getElementById('modalAddToBasket');
        if(addBtn) addBtn.onclick = () => { window.addToBasket(d.name); window.closeModal(); };

        if(productModal && productModalBackdrop) {
            productModal.classList.remove('hidden');
            productModalBackdrop.classList.add('open');
            productModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function() {
        if(productModal) {
            productModal.classList.remove('open'); 
            setTimeout(() => productModal.classList.add('hidden'), 300);
        }
        if(productModalBackdrop) productModalBackdrop.classList.remove('open');
        document.body.style.overflow = '';
    };

    // Attach click listeners to cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => window.openProductModal(card));
    });
    document.getElementById('closeProductModal')?.addEventListener('click', window.closeModal);
    productModalBackdrop?.addEventListener('click', window.closeModal);

    // ==========================================
    // 4. QUOTE BASKET LOGIC
    // ==========================================
    window.addToBasket = function(productName) {
        if(!basket.includes(productName)) {
            basket.push(productName);
            updateBasketUI();
            window.showToast(`${productName} added to Quote Basket!`, "success");
        } else {
            window.showToast(`${productName} is already in your basket.`, "info");
        }
    };

    function updateBasketUI() {
        localStorage.setItem('at_basket', JSON.stringify(basket));
        const countEl = document.getElementById('basketCount');
        const basketBtn = document.getElementById('quoteBasket');
        const formInput = document.getElementById('quoteProduct');
        if(countEl) countEl.textContent = basket.length;
        if(basketBtn) basketBtn.classList.toggle('hidden', basket.length === 0);
        if(formInput && basket.length > 0) formInput.value = basket.join(', ');
    }
    updateBasketUI();
    document.getElementById('quoteBasket')?.addEventListener('click', () => document.getElementById('quote').scrollIntoView({behavior: 'smooth'}));

    // ==========================================
    // 5. PAPER FINDER QUIZ LOGIC
    // ==========================================
    let quizState = { use: '', weight: '' };
    window.quizSelect = function(step, value) {
        quizState[step] = value;
        if (step === 'use') {
            const step1 = document.getElementById('quiz-step-1');
            const step2 = document.getElementById('quiz-step-2');
            step1.style.opacity = '0';
            setTimeout(() => {
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
                void step2.offsetWidth; 
                step2.style.opacity = '1';
            }, 300);
        } else if (step === 'weight') {
            const step2 = document.getElementById('quiz-step-2');
            step2.style.opacity = '0';
            setTimeout(() => {
                step2.classList.add('hidden');
                showQuizResult();
            }, 300);
        }
    };

    window.quizBack = function() {
        const step1 = document.getElementById('quiz-step-1');
        const step2 = document.getElementById('quiz-step-2');
        step2.style.opacity = '0';
        setTimeout(() => { step2.classList.add('hidden'); step1.classList.remove('hidden'); void step1.offsetWidth; step1.style.opacity = '1'; quizState.use = ''; }, 300);
    };

    window.quizReset = function() {
        const step1 = document.getElementById('quiz-step-1');
        const step3 = document.getElementById('quiz-step-3');
        step3.style.opacity = '0';
        setTimeout(() => { step3.classList.add('hidden'); step1.classList.remove('hidden'); void step1.offsetWidth; step1.style.opacity = '1'; quizState = { use: '', weight: '' }; }, 300);
    };

    function showQuizResult() {
        let result = { title: 'Kraft Paper', desc: 'Versatile and strong. Standard recommendation.' };
        if (quizState.use === 'packaging') {
            if (quizState.weight === 'heavy') result = { title: 'Laminated Paper Board, Kappa Board', desc: 'Maximum protection and rigidity. Ideal for heavy boxes and luxury packaging.' };
            else if (quizState.weight === 'medium') result = { title: 'Duplex Paper, Duplex Board', desc: 'The industry standard. Excellent balance of printability and strength for consumer boxes.' };
        } else if (quizState.use === 'printing') {
            if (quizState.weight === 'heavy') result = { title: 'SBS', desc: 'Solid Bleached Sulphate. High bulk, premium coated board for top-tier packaging and covers.' };
            else if (quizState.weight === 'medium') result = { title: 'FBB', desc: 'Folding Box Board. Perfect for vibrant colors and sturdy brochures or catalogs.' };
            else result = { title: 'Writing Paper, Printing Paper, Maplitho Paper', desc: 'Standard high-quality bond paper for documents, letterheads, and office use.' };
        } else if (quizState.use === 'industrial') {
            if (quizState.weight === 'heavy') result = { title: 'Sundry Grey Board, Puttha, Gatta', desc: 'Thick, economical recycled board for heavy industrial use and bookbinding.' };
        }

        document.getElementById('quiz-result-title').textContent = result.title;
        document.getElementById('quiz-result-desc').textContent = result.desc;
        document.getElementById('quiz-add-btn').onclick = () => window.addToBasket(result.title);
        
        const step3 = document.getElementById('quiz-step-3');
        step3.classList.remove('hidden');
        void step3.offsetWidth;
        step3.style.opacity = '1';
    }

    // ==========================================
    // 6. UI MICRO-INTERACTIONS (Fixed Scope Bug)
    // ==========================================
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }

    const typedEl = document.getElementById('typed');
    if (typedEl && typeof Typed !== 'undefined') {
        new Typed('#typed', { strings: ['Kraft & Duplex Paper.', 'Sustainable Packaging.', 'Industrial Solutions.'], typeSpeed: 50, backSpeed: 25, loop: true });
    }

    document.querySelectorAll('.action-button').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left) - (rect.width / 2);
            const y = (e.clientY - rect.top) - (rect.height / 2);
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px)`;
            btn.style.transition = 'transform 0.4s ease'; 
            setTimeout(() => { btn.style.transition = ''; }, 400);
        });
    });

    // Sidebar Slide Intro
    const sidebar = document.getElementById('socialSidebar');
    if (sidebar) {
        setTimeout(() => sidebar.classList.add('peek-out'), 1000);
        setTimeout(() => sidebar.classList.remove('peek-out'), 3500);
    }

    // Date
    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
    
    // Mobile Menu Toggle
    const menuButton = document.getElementById('menuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const toggleMenu = () => {
        const isOpen = mobileMenu.classList.contains('open');
        menuButton.classList.toggle('menu-open', !isOpen);
        mobileMenu.classList.toggle('open', !isOpen);
        menuBackdrop.classList.toggle('open', !isOpen);
        document.body.classList.toggle('menu-opened', !isOpen);
    };
    menuButton?.addEventListener('click', toggleMenu);
    menuBackdrop?.addEventListener('click', toggleMenu);
    document.getElementById('closeMenuButton')?.addEventListener('click', toggleMenu);
    document.querySelectorAll('#mobileMenu a').forEach(l => l.addEventListener('click', toggleMenu));

    // Calculators initialization
    window.switchTab('weight'); 
});
