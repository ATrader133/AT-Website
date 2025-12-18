document.addEventListener('DOMContentLoaded', function() {
    console.log("ABRAR TRADERS: iOS 26 System Loaded v5.0");

    // ==========================================
    // 1. GLOBAL VARIABLES & SETUP
    // ==========================================
    let basket = [];
    let currentUnit = 'cm';

    try {
        const stored = localStorage.getItem('at_basket');
        if (stored) basket = JSON.parse(stored);
    } catch (e) { console.error("Local Storage Error:", e); }

    // ==========================================
    // 2. WINDOW FUNCTIONS (Logic & Tools)
    // ==========================================

    // --- CALCULATOR TABS (iOS Segmented Control) ---
    window.switchTab = function(tabName) {
        // Hide all tool content
        document.querySelectorAll('.tool-content').forEach(el => el.classList.add('hidden'));
        
        // Show active tool
        const activeContent = document.getElementById('tool-' + tabName);
        if(activeContent) activeContent.classList.remove('hidden');

        // Update Buttons (Segmented Control)
        document.querySelectorAll('.segment').forEach(btn => {
            if(btn.getAttribute('onclick').includes(tabName)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    // --- UNIT TOGGLE ---
    window.setUnit = function(unit) {
        currentUnit = unit;
        ['cm', 'mm', 'inch'].forEach(u => {
            const btn = document.getElementById(`btn-${u}`);
            if(btn) btn.className = (u === unit) 
                ? "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all bg-blue-600 text-white shadow-md transform scale-105"
                : "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";
        });

        document.querySelectorAll('.unit-label').forEach(l => l.textContent = `(${unit})`);
        ['calcLength', 'calcWidth', 'sizePreset'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.value = '';
        });
        window.calculateWeight(); 
    };

    // --- PRESETS ---
    window.applyPreset = function() {
        const preset = document.getElementById('sizePreset').value;
        const lInput = document.getElementById('calcLength');
        const wInput = document.getElementById('calcWidth');
        if (!preset) return;

        if (preset === 'A2') { window.setUnit('mm'); wInput.value = 420; lInput.value = 594; }
        else if (preset === 'A3') { window.setUnit('mm'); wInput.value = 297; lInput.value = 420; }
        else if (preset === 'A4') { window.setUnit('mm'); wInput.value = 210; lInput.value = 297; }
        else if (preset === 'A5') { window.setUnit('mm'); wInput.value = 148; lInput.value = 210; }
        else if (['18x23', '23x36', '25x36', '30x40'].includes(preset)) {
            window.setUnit('inch'); const [w, h] = preset.split('x'); wInput.value = w; lInput.value = h;
        }
        window.calculateWeight();
    };

    // --- CALCULATORS ---
    window.calculateWeight = function() {
        const l = parseFloat(document.getElementById('calcLength')?.value) || 0;
        const w = parseFloat(document.getElementById('calcWidth')?.value) || 0;
        const gsm = parseFloat(document.getElementById('calcGsm')?.value) || 0;
        const qty = parseFloat(document.getElementById('calcQty')?.value) || 0;
        
        let m_l = 0, m_w = 0;
        if (currentUnit === 'cm') { m_l = l/100; m_w = w/100; }
        else if (currentUnit === 'mm') { m_l = l/1000; m_w = w/1000; }
        else if (currentUnit === 'inch') { m_l = l*0.0254; m_w = w*0.0254; }

        const totalKg = ((m_l * m_w) * gsm * qty) / 1000;
        const resTotal = document.getElementById('resTotal');
        if(resTotal) resTotal.innerHTML = `${totalKg.toFixed(2)} <span class="text-xl text-blue-600 font-bold">kg</span>`;
        
        const moqStatus = document.getElementById('moqStatus');
        if(moqStatus) {
            if (totalKg === 0) moqStatus.textContent = "";
            else if (totalKg < 1000) moqStatus.innerHTML = `<span class="text-red-500 bg-red-50 px-2 py-1 rounded">⚠️ Below MOQ (${(1000-totalKg).toFixed(1)}kg short)</span>`;
            else moqStatus.innerHTML = `<span class="text-green-600 bg-green-50 px-2 py-1 rounded">✅ MOQ Met</span>`;
        }
    };

    window.calculateReel = function() {
        const rWeight = parseFloat(document.getElementById('reelWeight')?.value) || 0;
        const rWidth = parseFloat(document.getElementById('reelWidth')?.value) || 0;
        const rGsm = parseFloat(document.getElementById('reelGsm')?.value) || 0;
        const cutLen = parseFloat(document.getElementById('cutLength')?.value) || 0;

        if (rWeight === 0 || rWidth === 0 || rGsm === 0) return;
        const totalLength = (rWeight * 1000 * 100) / (rGsm * rWidth);
        const sheets = (cutLen > 0) ? (totalLength * 100) / cutLen : 0;

        const resLen = document.getElementById('resReelLength');
        const resSheets = document.getElementById('resSheets');
        if(resLen) resLen.innerHTML = `${Math.floor(totalLength)} <span class="text-sm">meters</span>`;
        if(resSheets) resSheets.innerHTML = `${Math.floor(sheets)} <span class="text-xl text-yellow-600">pcs</span>`;
    };

    window.calculateStrength = function() {
        const gsm = parseFloat(document.getElementById('strGsm')?.value) || 0;
        const bf = parseFloat(document.getElementById('strBf')?.value) || 0;
        const bs = (gsm * bf) / 1000;
        const resBs = document.getElementById('resBs');
        if(resBs) resBs.textContent = bs.toFixed(2);
    };

    window.calculateCBM = function() {
        const l = parseFloat(document.getElementById('cbmL')?.value) || 0;
        const w = parseFloat(document.getElementById('cbmW')?.value) || 0;
        const h = parseFloat(document.getElementById('cbmH')?.value) || 0;
        const qty = parseFloat(document.getElementById('cbmQty')?.value) || 0;
        const cbm = ((l * w * h) / 1000000) * qty;
        const resCbm = document.getElementById('resCbm');
        if(resCbm) resCbm.innerHTML = `${cbm.toFixed(3)} <span class="text-xl text-green-600">m³</span>`;
    };

    // --- BASKET LOGIC ---
    window.addToBasket = function(productName) {
        if(!basket.includes(productName)) {
            basket.push(productName);
            updateBasketUI();
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

    const basketBtn = document.getElementById('quoteBasket');
    if(basketBtn) basketBtn.addEventListener('click', () => document.getElementById('quote').scrollIntoView({behavior: 'smooth'}));


    // ==========================================
    // 3. iOS 26 INTERFACE LOGIC
    // ==========================================

    // --- UNIFIED SCROLL ENGINE ---
    // Handles Dynamic Island shrinking, Sidebar minimizing, and Active Link highlighting
    const nav = document.querySelector('.sticky-nav');
    const sidebar = document.getElementById('socialSidebar');
    const scrollBtn = document.getElementById('scrollTopBtn');
    const progressCircle = document.getElementById('scrollProgress');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.sticky-nav .nav-link');

    // Pre-calculate circle circumference for scroll to top
    let circumference = 0;
    if(progressCircle) {
        const radius = progressCircle.r.baseVal.value;
        circumference = radius * 2 * Math.PI;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;
    }

    const optimizeScroll = () => {
        const currentScroll = window.scrollY;

        // 1. Dynamic Island Shrink
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // 2. Sidebar Minimize
        if (sidebar) {
            if (currentScroll > 100) {
                sidebar.classList.add('minimized');
            } else {
                sidebar.classList.remove('minimized');
            }
        }

        // 3. Scroll To Top Button
        if (scrollBtn) {
            if (currentScroll > 300) scrollBtn.classList.add('visible');
            else scrollBtn.classList.remove('visible');
            
            if(progressCircle) {
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const offset = circumference - ((currentScroll / docHeight) * circumference);
                progressCircle.style.strokeDashoffset = offset;
            }
        }

        // 4. Active Link Highlighter
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    };

    // Use passive listener for performance
    window.addEventListener('scroll', optimizeScroll, { passive: true });

    // --- PRODUCT MODAL (Bottom Sheet) ---
    const productModal = document.getElementById('productModal');
    const productModalBackdrop = document.getElementById('productModalBackdrop');

    // Open Function
    window.openModal = function(data) {
        if(!productModal) return;

        // Populate Data
        document.getElementById('modalProductName').textContent = data.name;
        document.getElementById('modalProductImage').src = data.image;
        document.getElementById('modalProductDescription').textContent = data.description;
        document.getElementById('modalProductAdditionalInfo').textContent = data.additionalInfo;

        const specs = document.getElementById('modalProductSpecifications');
        if(specs) {
            specs.innerHTML = '';
            try {
                JSON.parse(data.specifications).forEach(s => {
                    specs.innerHTML += `<li class="flex justify-between border-b border-gray-100 py-2"><span class="text-gray-500">${s.label}</span><span class="font-bold text-gray-800">${s.value}</span></li>`;
                });
            } catch(e){}
        }

        const addBtn = document.getElementById('modalAddToBasket');
        if(addBtn) addBtn.onclick = () => { window.addToBasket(data.name); window.closeModal(); };

        // Animate Open
        productModalBackdrop.classList.add('open');
        productModal.classList.remove('hidden'); 
        requestAnimationFrame(() => {
            productModal.classList.add('open');
        });
        document.body.style.overflow = 'hidden';
    };

    // Close Function
    window.closeModal = function() {
        if(productModal) productModal.classList.remove('open');
        if(productModalBackdrop) productModalBackdrop.classList.remove('open');
        document.body.style.overflow = '';
    };

    // Attach Listeners to Cards
    document.querySelectorAll('.product-item').forEach(card => {
        card.addEventListener('click', function(e) {
            if(e.target.closest('button')) return; // Prevent double trigger
            
            const d = this.dataset;
            window.openModal({
                name: d.name,
                image: d.image,
                description: d.description,
                specifications: d.specifications,
                additionalInfo: d['additional-info']
            });
        });
    });

    const closeBtn = document.getElementById('closeProductModal');
    if(closeBtn) closeBtn.addEventListener('click', window.closeModal);
    if(productModalBackdrop) productModalBackdrop.addEventListener('click', window.closeModal);


    // --- MOBILE MENU ---
    const menuButton = document.getElementById('menuButton');
    const closeMenuButton = document.getElementById('closeMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');

    const toggleMenu = (forceClose = false) => {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen || forceClose) {
            mobileMenu.classList.remove('open');
            if(menuBackdrop) menuBackdrop.classList.remove('open');
            document.body.style.overflow = '';
            menuButton.classList.remove('menu-open');
        } else {
            mobileMenu.classList.add('open');
            if(menuBackdrop) menuBackdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
            menuButton.classList.add('menu-open');
        }
    };

    if (menuButton) menuButton.addEventListener('click', () => toggleMenu());
    if (closeMenuButton) closeMenuButton.addEventListener('click', () => toggleMenu(true));
    if (menuBackdrop) menuBackdrop.addEventListener('click', () => toggleMenu(true));
    
    // Close menu when clicking a link
    document.querySelectorAll('#mobileMenu .nav-link').forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    // ==========================================
    // 4. UTILITIES & INITIALIZATION
    // ==========================================

    // Search & Filter
    const searchInput = document.getElementById('productSearch');
    const products = document.querySelectorAll('.product-item');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            products.forEach(item => {
                const name = item.dataset.name.toLowerCase();
                const desc = item.dataset.description.toLowerCase();
                if(name.includes(term) || desc.includes(term)) {
                    item.style.display = 'block';
                    item.classList.remove('aos-animate');
                    setTimeout(() => item.classList.add('aos-animate'), 50);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            products.forEach(item => {
                if(filter === 'all' || item.dataset.category.includes(filter)) {
                    item.style.display = 'block';
                    item.classList.add('aos-animate');
                } else { item.style.display = 'none'; }
            });
        });
    });

    // Scroll To Top Click
    if(scrollBtn) scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Input Listeners for Auto-Calc
    ['calcLength', 'calcWidth', 'calcGsm', 'calcQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateWeight));
    ['reelWeight', 'reelWidth', 'reelGsm', 'cutLength'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateReel));
    ['strGsm', 'strBf'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateStrength));
    ['cbmL', 'cbmW', 'cbmH', 'cbmQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateCBM));

    // Splide Slider
    if (typeof Splide !== 'undefined' && document.querySelector('.splide')) {
        new Splide('.splide', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            gap: '1.5rem',
            pagination: true,
            arrows: false,
            autoplay: true,
            interval: 5000,
            pauseOnHover: true,
            breakpoints: { 1024: { perPage: 2 }, 768: { perPage: 1 } },
        }).mount();
    }

    // AOS Animation
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });

    // Typed JS
    if (document.getElementById('typed')) {
        new Typed('#typed', {
            strings: ['Kraft & Duplex Paper.', 'Sustainable Packaging.', 'Industrial Solutions.'],
            typeSpeed: 50, backSpeed: 25, backDelay: 2000, loop: true
        });
    }

    // Preloader
    const spinner = document.getElementById('spinner');
    if (spinner) {
        window.addEventListener('load', () => {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.style.display = 'none', 500);
        });
    }
    
    // Current Year
    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
});

