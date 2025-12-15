document.addEventListener('DOMContentLoaded', function() {
    console.log("ABRAR TRADERS: System Loaded");

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
    // 2. WINDOW FUNCTIONS (Accessible by HTML)
    // ==========================================

    // --- CALCULATOR: Switch Tabs ---
    window.switchTab = function(tabName) {
        const btnWeight = document.getElementById('tab-weight');
        const btnReel = document.getElementById('tab-reel');
        const contentWeight = document.getElementById('tool-weight');
        const contentReel = document.getElementById('tool-reel');

        if (!btnWeight || !btnReel || !contentWeight || !contentReel) return;

        const activeBase = "px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-md bg-white";
        const inactiveBase = "px-6 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";

        if (tabName === 'weight') {
            btnWeight.className = `${activeBase} text-blue-600`;
            btnReel.className = inactiveBase;
            contentWeight.classList.remove('hidden');
            contentReel.classList.add('hidden');
        } else {
            btnWeight.className = inactiveBase;
            btnReel.className = `${activeBase} text-yellow-600`;
            contentWeight.classList.add('hidden');
            contentReel.classList.remove('hidden');
        }
    };

    // --- CALCULATOR: Set Unit ---
    window.setUnit = function(unit) {
        currentUnit = unit;
        ['cm', 'mm', 'inch'].forEach(u => {
            const btn = document.getElementById(`btn-${u}`);
            if(btn) btn.className = (u === unit) 
                ? "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all bg-blue-600 text-white shadow-md transform scale-105"
                : "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";
        });

        document.querySelectorAll('.unit-label').forEach(l => l.textContent = `(${unit})`);
        
        // Clear inputs to avoid confusion
        ['calcLength', 'calcWidth', 'sizePreset'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.value = '';
        });
        
        window.calculateWeight(); 
    };

    // --- CALCULATOR: Apply Presets ---
    window.applyPreset = function() {
        const preset = document.getElementById('sizePreset').value;
        const lInput = document.getElementById('calcLength');
        const wInput = document.getElementById('calcWidth');

        if (!preset) return;

        if (preset === 'A4') {
            window.setUnit('mm'); wInput.value = 210; lInput.value = 297;
        } else if (preset === 'A3') {
            window.setUnit('mm'); wInput.value = 297; lInput.value = 420;
        } else if (['23x36', '25x36', '30x40'].includes(preset)) {
            window.setUnit('inch');
            const [w, h] = preset.split('x'); wInput.value = w; lInput.value = h;
        }
        window.calculateWeight();
    };

    // --- CALCULATOR: Sheet Weight Logic ---
    window.calculateWeight = function() {
        const l = parseFloat(document.getElementById('calcLength').value) || 0;
        const w = parseFloat(document.getElementById('calcWidth').value) || 0;
        const gsm = parseFloat(document.getElementById('calcGsm').value) || 0;
        const qty = parseFloat(document.getElementById('calcQty').value) || 0;
        
        let m_l = 0, m_w = 0;
        if (currentUnit === 'cm') { m_l = l/100; m_w = w/100; }
        else if (currentUnit === 'mm') { m_l = l/1000; m_w = w/1000; }
        else if (currentUnit === 'inch') { m_l = l*0.0254; m_w = w*0.0254; }

        const weightPerSheet = (m_l * m_w) * gsm;
        const totalKg = (weightPerSheet * qty) / 1000;

        const resTotal = document.getElementById('resTotal');
        const moqStatus = document.getElementById('moqStatus');
        
        if (resTotal) resTotal.innerHTML = `${totalKg.toFixed(2)} <span class="text-xl text-blue-600 font-bold">kg</span>`;

        if (moqStatus) {
            if (totalKg === 0) moqStatus.textContent = "";
            else if (totalKg < 1000) moqStatus.innerHTML = `<span class="text-red-500 bg-red-50 px-2 py-1 rounded">⚠️ Below MOQ (${(1000-totalKg).toFixed(1)}kg short)</span>`;
            else moqStatus.innerHTML = `<span class="text-green-600 bg-green-50 px-2 py-1 rounded">✅ MOQ Met</span>`;
        }
    };

    // --- CALCULATOR: Reel Converter Logic ---
    window.calculateReel = function() {
        const rWeight = parseFloat(document.getElementById('reelWeight').value) || 0;
        const rWidth = parseFloat(document.getElementById('reelWidth').value) || 0;
        const rGsm = parseFloat(document.getElementById('reelGsm').value) || 0;
        const cutLen = parseFloat(document.getElementById('cutLength').value) || 0;

        if (rWeight === 0 || rWidth === 0 || rGsm === 0) return;

        const area = (rWeight * 1000) / rGsm;
        const length = area / (rWidth / 100);
        const sheets = (cutLen > 0) ? length / (cutLen / 100) : 0;

        const resLen = document.getElementById('resReelLength');
        const resSheets = document.getElementById('resSheets');

        if(resLen) resLen.innerHTML = `${Math.floor(length)} <span class="text-sm">meters</span>`;
        if(resSheets) resSheets.innerHTML = `${Math.floor(sheets)} <span class="text-xl text-yellow-600">pcs</span>`;
    };

    // --- BASKET: Add Item ---
    window.addToBasket = function(productName) {
        if(!basket.includes(productName)) {
            basket.push(productName);
            updateBasketUI();
            alert("Added to inquiry list!");
        } else {
            alert("Item already in list.");
        }
    };

    // --- DOWNLOAD MOCK ---
    window.downloadCatalog = function() {
        const email = prompt("Enter your email to download:");
        if (email) alert("Catalogue sent to " + email);
    };

    // --- MODAL: Close ---
    window.closeModal = function() {
        const modal = document.getElementById('productModal');
        const backdrop = document.getElementById('productModalBackdrop');
        if(modal) {
            modal.classList.remove('opacity-100', 'scale-100');
            modal.classList.add('opacity-0', 'scale-95');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
        if(backdrop) {
            backdrop.classList.remove('block', 'opacity-50');
            backdrop.classList.add('hidden', 'opacity-0');
        }
        document.body.style.overflow = '';
    };

    // ==========================================
    // 3. EVENT LISTENERS & UI LOGIC
    // ==========================================

    // --- Update Basket UI ---
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

    // Basket Button Click
    const basketBtn = document.getElementById('quoteBasket');
    if(basketBtn) basketBtn.addEventListener('click', () => {
        document.getElementById('quote').scrollIntoView({behavior: 'smooth'});
    });

    // --- Calculator Auto-Update ---
    ['calcLength', 'calcWidth', 'calcGsm', 'calcQty'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', window.calculateWeight);
    });
    ['reelWeight', 'reelWidth', 'reelGsm', 'cutLength'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', window.calculateReel);
    });

    // --- Modal Open Logic ---
    const productModal = document.getElementById('productModal');
    const productModalBackdrop = document.getElementById('productModalBackdrop');

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const d = card.dataset;
            document.getElementById('modalProductName').textContent = d.name;
            document.getElementById('modalProductImage').src = d.image;
            document.getElementById('modalProductDescription').textContent = d.description;
            
            const specsContainer = document.getElementById('modalProductSpecifications');
            if(specsContainer && d.specifications) {
                specsContainer.innerHTML = '';
                try {
                    JSON.parse(d.specifications).forEach(s => {
                        specsContainer.innerHTML += `<li class="flex justify-between border-b border-gray-100 py-2"><span class="text-gray-500">${s.label}</span><span class="font-bold text-gray-800">${s.value}</span></li>`;
                    });
                } catch(e){}
            }

            const addBtn = document.getElementById('modalAddToBasket');
            if(addBtn) addBtn.onclick = () => { window.addToBasket(d.name); window.closeModal(); };

            if(productModal && productModalBackdrop) {
                productModal.classList.remove('hidden');
                productModalBackdrop.classList.remove('hidden');
                setTimeout(() => {
                    productModal.classList.remove('opacity-0', 'scale-95');
                    productModal.classList.add('opacity-100', 'scale-100');
                    productModalBackdrop.classList.remove('opacity-0');
                    productModalBackdrop.classList.add('opacity-50');
                }, 10);
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close Modal Listeners
    const closeBtn = document.getElementById('closeProductModal');
    if(closeBtn) closeBtn.addEventListener('click', window.closeModal);
    if(productModalBackdrop) productModalBackdrop.addEventListener('click', window.closeModal);

    // --- Sticky Nav & Active Link ---
    const nav = document.querySelector('.sticky-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
        
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 100) current = section.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === current) link.classList.add('active');
        });
        
        // Social Sidebar
        const sidebar = document.getElementById('socialSidebar');
        if (sidebar) sidebar.classList.toggle('minimized', window.scrollY > 200);
        
        // Progress Bar
        const progressBar = document.getElementById('progressBar');
        if(progressBar) {
            const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (document.documentElement.scrollTop / scrollTotal) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // --- Mobile Menu ---
    const menuButton = document.getElementById('menuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const closeMenuButton = document.getElementById('closeMenuButton');

    const toggleMenu = (forceClose = false) => {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen || forceClose) {
            mobileMenu.classList.remove('open');
            menuBackdrop.classList.remove('open');
            document.body.classList.remove('menu-opened');
        } else {
            mobileMenu.classList.add('open');
            menuBackdrop.classList.add('open');
            document.body.classList.add('menu-opened');
        }
    };
    if(menuButton) menuButton.addEventListener('click', () => toggleMenu());
    if(closeMenuButton) closeMenuButton.addEventListener('click', () => toggleMenu(true));
    if(menuBackdrop) menuBackdrop.addEventListener('click', () => toggleMenu(true));

    // --- Quote Form AJAX ---
    const quoteForm = document.getElementById('quoteForm');
    const formStatus = document.getElementById('formStatus');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const form = e.target;
            const data = new FormData(form);
            if(formStatus) { formStatus.innerHTML = 'Sending...'; formStatus.style.color = '#333'; }

            try {
                const response = await fetch(form.action, { method: form.method, body: data, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    formStatus.innerHTML = "Thank you! Quote sent.";
                    formStatus.style.color = 'green';
                    form.reset();
                    basket = []; // Clear basket on success
                    updateBasketUI();
                } else {
                    formStatus.innerHTML = "Oops! Problem submitting form.";
                    formStatus.style.color = 'red';
                }
            } catch (error) {
                if(formStatus) { formStatus.innerHTML = "Network error."; formStatus.style.color = 'red'; }
            }
        });
    }

    // ==========================================
    // 4. PLUGIN INITIALIZATIONS
    // ==========================================
    
    // Preloader
    const spinner = document.getElementById('spinner');
    if (spinner) {
        window.addEventListener('load', () => {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.style.display = 'none', 500);
        });
    }

    // AOS Animation
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });

    // Typed.js
    if (document.getElementById('typed')) {
        new Typed('#typed', {
            strings: ['Kraft & Duplex Paper.', 'Sustainable Packaging.', 'Industrial Solutions.'],
            typeSpeed: 50, backSpeed: 25, backDelay: 2000, loop: true
        });
    }

    // 3D Tilt
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".product-card"), { max: 5, speed: 400, glare: true, "max-glare": 0.2 });
    }

    // Splide Slider
    if (document.querySelector('.splide')) {
        new Splide('.splide', {
            type: 'loop', perPage: 3, perMove: 1, gap: '1.5rem',
            pagination: true, arrows: false, autoplay: true, interval: 5000, pauseOnHover: true,
            breakpoints: { 1024: { perPage: 2 }, 768: { perPage: 1 } },
        }).mount();
    }

    // Particles
    if (typeof tsParticles !== 'undefined' && document.getElementById('tsparticles')) {
        tsParticles.load("tsparticles", {
            fpsLimit: 60,
            particles: {
                number: { value: 30, density: { enable: true, value_area: 800 } },
                color: { value: ["#607afb", "#8e9bfa", "#a78bfa"] },
                shape: { type: "circle" },
                opacity: { value: 0.5 },
                size: { value: 5, random: true },
                move: { enable: true, speed: 1 }
            }
        });
    }

    // Footer Year
    const currentYear = document.getElementById('currentYear');
    if (currentYear) currentYear.textContent = new Date().getFullYear();
});
