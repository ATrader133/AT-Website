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
        const btnStrength = document.getElementById('tab-strength');
        const btnCbm = document.getElementById('tab-cbm');
        
        // Hide all contents
        ['weight', 'reel', 'strength', 'cbm'].forEach(t => {
            const el = document.getElementById('tool-' + t);
            if(el) el.classList.add('hidden');
            const btn = document.getElementById('tab-' + t);
            if(btn) btn.className = "px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";
        });

        // Show active
        const activeContent = document.getElementById('tool-' + tabName);
        if(activeContent) activeContent.classList.remove('hidden');

        // Style active button
        const activeBtn = document.getElementById('tab-' + tabName);
        if(activeBtn) {
            let colorClass = "text-blue-600";
            if(tabName === 'reel') colorClass = "text-yellow-600";
            if(tabName === 'strength') colorClass = "text-red-600";
            if(tabName === 'cbm') colorClass = "text-green-600";
            activeBtn.className = `px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-bold transition-all shadow-md bg-white ${colorClass}`;
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
        
        // Clear inputs
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
        const moqStatus = document.getElementById('moqStatus');
        
        if (resTotal) resTotal.innerHTML = `${totalKg.toFixed(2)} <span class="text-xl text-blue-600 font-bold">kg</span>`;

        if (moqStatus) {
            if (totalKg === 0) moqStatus.textContent = "";
            else if (totalKg < 1000) moqStatus.innerHTML = `<span class="text-red-500 bg-red-50 px-2 py-1 rounded">⚠️ Below MOQ (${(1000-totalKg).toFixed(1)}kg short)</span>`;
            else moqStatus.innerHTML = `<span class="text-green-600 bg-green-50 px-2 py-1 rounded">✅ MOQ Met</span>`;
        }
    };

    // --- CALCULATOR: Reel Converter ---
    window.calculateReel = function() {
        const rWeight = parseFloat(document.getElementById('reelWeight')?.value) || 0;
        const rWidth = parseFloat(document.getElementById('reelWidth')?.value) || 0;
        const rGsm = parseFloat(document.getElementById('reelGsm')?.value) || 0;
        const cutLen = parseFloat(document.getElementById('cutLength')?.value) || 0;

        if (rWeight === 0 || rWidth === 0 || rGsm === 0) return;

        const area = (rWeight * 1000) / rGsm;
        const length = (area / (rWidth / 100)); // meters
        const sheets = (cutLen > 0) ? length / (cutLen / 100) : 0;

        const resLen = document.getElementById('resReelLength');
        const resSheets = document.getElementById('resSheets');

        if(resLen) resLen.innerHTML = `${Math.floor(length)} <span class="text-sm">meters</span>`;
        if(resSheets) resSheets.innerHTML = `${Math.floor(sheets)} <span class="text-xl text-yellow-600">pcs</span>`;
    };

    // --- CALCULATOR: Strength (BF) ---
    window.calculateStrength = function() {
        const gsm = parseFloat(document.getElementById('strGsm')?.value) || 0;
        const bf = parseFloat(document.getElementById('strBf')?.value) || 0;
        const bs = (gsm * bf) / 1000;
        const resBs = document.getElementById('resBs');
        if(resBs) resBs.textContent = bs.toFixed(2);
    };

    // --- CALCULATOR: CBM ---
    window.calculateCBM = function() {
        const l = parseFloat(document.getElementById('cbmL')?.value) || 0;
        const w = parseFloat(document.getElementById('cbmW')?.value) || 0;
        const h = parseFloat(document.getElementById('cbmH')?.value) || 0;
        const qty = parseFloat(document.getElementById('cbmQty')?.value) || 0;
        
        const cbm = ((l * w * h) / 1000000) * qty;
        const resCbm = document.getElementById('resCbm');
        if(resCbm) resCbm.innerHTML = `${cbm.toFixed(3)} <span class="text-xl text-green-600">m³</span>`;
    };

    // --- BASKET & MODAL LOGIC ---
    window.addToBasket = function(productName) {
        if(!basket.includes(productName)) {
            basket.push(productName);
            updateBasketUI();
            const btn = document.getElementById('quoteBasket');
            if(btn) {
                btn.classList.add('scale-125');
                setTimeout(() => btn.classList.remove('scale-125'), 200);
            }
        } else {
            alert("Item already in basket.");
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
    if(basketBtn) basketBtn.addEventListener('click', () => {
        document.getElementById('quote').scrollIntoView({behavior: 'smooth'});
    });

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

    window.downloadCatalog = function() {
        const email = prompt("Enter your email to download:");
        if (email) alert("Catalogue sent to " + email);
    };

    // ==========================================
    // 3. EVENT LISTENERS & INITIALIZATION
    // ==========================================

    // Auto-Calculate Listeners
    ['calcLength', 'calcWidth', 'calcGsm', 'calcQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateWeight));
    ['reelWeight', 'reelWidth', 'reelGsm', 'cutLength'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateReel));
    ['strGsm', 'strBf'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateStrength));
    ['cbmL', 'cbmW', 'cbmH', 'cbmQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateCBM));

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            const icon = document.getElementById('themeIcon');
            if(icon) {
                icon.classList.toggle('ph-moon');
                icon.classList.toggle('ph-sun');
            }
        });
    }

    // Modal Listeners
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
                        specsContainer.innerHTML += `<li class="flex justify-between border-b border-gray-100 dark:border-gray-700 py-2"><span class="text-gray-500 dark:text-gray-400">${s.label}</span><span class="font-bold text-gray-800 dark:text-white">${s.value}</span></li>`;
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

    const closeBtn = document.getElementById('closeProductModal');
    if(closeBtn) closeBtn.addEventListener('click', window.closeModal);
    if(productModalBackdrop) productModalBackdrop.addEventListener('click', window.closeModal);

    // Initializations
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".product-card"), { max: 5, speed: 400, glare: true, "max-glare": 0.2 });
    }

    if (document.getElementById('typed')) {
        new Typed('#typed', {
            strings: ['Kraft & Duplex Paper.', 'Sustainable Packaging.', 'Industrial Solutions.'],
            typeSpeed: 50, backSpeed: 25, backDelay: 2000, loop: true
        });
    }

    // --- REVIEWS CAROUSEL (Splide) ---
    // This is the part that makes your reviews visible!
    if (document.querySelector('.splide')) {
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
            breakpoints: {
                1024: { perPage: 2 },
                768: { perPage: 1 }
            },
        }).mount();
    }

    // Preloader
    const spinner = document.getElementById('spinner');
    if (spinner) {
        window.addEventListener('load', () => {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.style.display = 'none', 500);
        });
    }
});
