document.addEventListener('DOMContentLoaded', function() {
    console.log("ABRAR TRADERS: System Loaded v5.0 (Final Polish)");

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

    // --- TABS LOGIC (Calculators) ---
    window.switchTab = function(tabName) {
        ['weight', 'reel', 'strength', 'cbm'].forEach(t => {
            const content = document.getElementById('tool-' + t);
            const btn = document.getElementById('tab-' + t);
            if(content) content.classList.add('hidden');
            if(btn) btn.className = "px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";
        });

        const activeContent = document.getElementById('tool-' + tabName);
        if(activeContent) activeContent.classList.remove('hidden');

        const activeBtn = document.getElementById('tab-' + tabName);
        if(activeBtn) {
            let colorClass = "text-blue-600";
            if(tabName === 'reel') colorClass = "text-yellow-600";
            if(tabName === 'strength') colorClass = "text-red-600";
            if(tabName === 'cbm') colorClass = "text-green-600";
            activeBtn.className = `px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-bold transition-all shadow-md bg-white ${colorClass}`;
        }
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

    // --- CALC 1: WEIGHT ---
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

    // --- CALC 2: REEL ---
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

    // --- CALC 3: STRENGTH ---
    window.calculateStrength = function() {
        const gsm = parseFloat(document.getElementById('strGsm')?.value) || 0;
        const bf = parseFloat(document.getElementById('strBf')?.value) || 0;
        const bs = (gsm * bf) / 1000;
        const resBs = document.getElementById('resBs');
        if(resBs) resBs.textContent = bs.toFixed(2);
    };

    // --- CALC 4: CBM ---
    window.calculateCBM = function() {
        const l = parseFloat(document.getElementById('cbmL')?.value) || 0;
        const w = parseFloat(document.getElementById('cbmW')?.value) || 0;
        const h = parseFloat(document.getElementById('cbmH')?.value) || 0;
        const qty = parseFloat(document.getElementById('cbmQty')?.value) || 0;
        const cbm = ((l * w * h) / 1000000) * qty;
        const resCbm = document.getElementById('resCbm');
        if(resCbm) resCbm.innerHTML = `${cbm.toFixed(3)} <span class="text-xl text-green-600">m³</span>`;
    };

    // --- BASKET & MODAL ---
    window.addToBasket = function(productName) {
        if(!basket.includes(productName)) {
            basket.push(productName);
            updateBasketUI();
            alert(productName + " added to Quote Basket!");
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

    // --- DOWNLOAD FEATURE (Hidden Feature) ---
    window.downloadCatalog = function() {
        const email = prompt("Please enter your email to receive our latest product catalog:");
        if (email) {
            // In a real scenario, you would send this email to your backend.
            alert("Thank you! The catalog has been sent to " + email);
        }
    };

    // --- MODAL HELPERS ---
    window.closeModal = function() {
        const modal = document.getElementById('productModal');
        const backdrop = document.getElementById('productModalBackdrop');
        if(modal) {
            modal.classList.remove('open'); 
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
        if(backdrop) {
            backdrop.classList.remove('open');
        }
        document.body.style.overflow = '';
    };

    // ==========================================
    // 3. EVENT LISTENERS & INITIALIZATION
    // ==========================================

    // Auto-Calculate Inputs
    ['calcLength', 'calcWidth', 'calcGsm', 'calcQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateWeight));
    ['reelWeight', 'reelWidth', 'reelGsm', 'cutLength'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateReel));
    ['strGsm', 'strBf'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateStrength));
    ['cbmL', 'cbmW', 'cbmH', 'cbmQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateCBM));
    
    // --- MOBILE MENU TOGGLE ---
    const menuButton = document.getElementById('menuButton');
    const closeMenuButton = document.getElementById('closeMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const mobileNavLinks = mobileMenu ? mobileMenu.querySelectorAll('.nav-link') : [];

    const toggleMenu = (forceClose = false) => {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen || forceClose) {
            menuButton.classList.remove('menu-open');
            menuButton.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('open');
            menuBackdrop.classList.remove('open');
            document.body.classList.remove('menu-opened');
        } else {
            menuButton.classList.add('menu-open');
            menuButton.setAttribute('aria-expanded', 'true');
            mobileMenu.classList.add('open');
            menuBackdrop.classList.add('open');
            document.body.classList.add('menu-opened');
        }
    };
    if (menuButton) menuButton.addEventListener('click', () => toggleMenu());
    if (closeMenuButton) closeMenuButton.addEventListener('click', () => toggleMenu(true));
    if (menuBackdrop) menuBackdrop.addEventListener('click', () => toggleMenu(true));
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (link.getAttribute('href').startsWith('#')) {
                toggleMenu(true);
            }
        });
    });

    // --- MODAL TRIGGERS ---
    const productModal = document.getElementById('productModal');
    const productModalBackdrop = document.getElementById('productModalBackdrop');
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const d = card.dataset;
            document.getElementById('modalProductName').textContent = d.name;
            const img = document.getElementById('modalProductImage');
            img.src = d.image;
            document.getElementById('modalProductDescription').textContent = d.description;
            
            const specs = document.getElementById('modalProductSpecifications');
            if(specs) {
                specs.innerHTML = '';
                try {
                    // FIX: Removed 'dark:' classes so text stays gray/black
                    JSON.parse(d.specifications).forEach(s => {
                        specs.innerHTML += `<li class="flex justify-between border-b border-gray-100 py-2"><span class="text-gray-500">${s.label}</span><span class="font-bold text-gray-800">${s.value}</span></li>`;
                    });
                } catch(e){}
            }
            
            document.getElementById('modalProductAdditionalInfo').textContent = d['additional-info'];
            
            const addBtn = document.getElementById('modalAddToBasket');
            if(addBtn) addBtn.onclick = () => { window.addToBasket(d.name); window.closeModal(); };

            if(productModal && productModalBackdrop) {
                productModal.classList.remove('hidden');
                productModalBackdrop.classList.add('open');
                productModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeBtn = document.getElementById('closeProductModal');
    if(closeBtn) closeBtn.addEventListener('click', window.closeModal);
    if(productModalBackdrop) productModalBackdrop.addEventListener('click', window.closeModal);


    // --- SEARCH & FILTER ---
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

    // --- SIDEBAR & PARTICLES ---
    const sidebar = document.getElementById('socialSidebar');
    if (sidebar) {
        setTimeout(() => { sidebar.classList.add('peek-out'); }, 1000);
        setTimeout(() => { sidebar.classList.remove('peek-out'); }, 3500);
    }

    if (window.tsParticles) {
        tsParticles.load("tsparticles", {
            fpsLimit: 60,
            fullScreen: { enable: false },
            particles: {
                number: { value: 50, density: { enable: true, area: 800 } },
                color: { value: ["#607afb", "#8e9bfa", "#a78bfa"] },
                shape: { type: "circle" },
                opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#607afb", opacity: 0.25, width: 1 },
                move: { enable: true, speed: 1.5, direction: "none", random: false, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true },
                modes: { grab: { distance: 140, line_linked: { opacity: 0.6 } }, push: { particles_nb: 3 } }
            },
            retina_detect: true,
            background: { color: "transparent" }
        });
    }

    // --- SCROLL TO TOP ---
    const scrollBtn = document.getElementById('scrollTopBtn');
    const progressCircle = document.getElementById('scrollProgress');
    if(scrollBtn && progressCircle) {
        const radius = progressCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) scrollBtn.classList.add('visible');
            else scrollBtn.classList.remove('visible');
            
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const offset = circumference - ((scrollTop / docHeight) * circumference);
            progressCircle.style.strokeDashoffset = offset;
        });
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // --- INITIALIZATIONS ---
    if (typeof Splide !== 'undefined' && document.querySelector('.splide')) {
        new Splide('.splide', {
            type: 'loop', perPage: 3, perMove: 1, gap: '1.5rem', pagination: true, arrows: false, autoplay: true, interval: 5000, pauseOnHover: true,
            breakpoints: { 1024: { perPage: 2 }, 768: { perPage: 1 } },
        }).mount();
    }

    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    if (typeof VanillaTilt !== 'undefined') VanillaTilt.init(document.querySelectorAll(".product-card"), { max: 5, speed: 400, glare: true, "max-glare": 0.2 });
    if (document.getElementById('typed')) {
        new Typed('#typed', {
            strings: ['Kraft & Duplex Paper.', 'Sustainable Packaging.', 'Industrial Solutions.'],
            typeSpeed: 50, backSpeed: 25, backDelay: 2000, loop: true
        });
    }

    const spinner = document.getElementById('spinner');
    if (spinner) {
        window.addEventListener('load', () => {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.style.display = 'none', 500);
        });
    }
    
    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
});
