// -- main.js --

document.addEventListener('DOMContentLoaded', function() {
    console.log("ABRAR TRADERS: System Loaded v2.0");

    let basket = JSON.parse(localStorage.getItem('at_basket')) || [];
    let currentUnit = 'cm';

    // --- CALCULATOR: Switch Tabs ---
    window.switchTab = function(tabName) {
        // Hide all
        ['weight', 'reel', 'strength', 'cbm'].forEach(t => {
            document.getElementById(`tool-${t}`).classList.add('hidden');
            const btn = document.getElementById(`tab-${t}`);
            btn.className = "px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";
        });

        // Show active
        document.getElementById(`tool-${tabName}`).classList.remove('hidden');
        const activeBtn = document.getElementById(`tab-${tabName}`);
        
        // Dynamic color for active tab
        let colorClass = "text-blue-600";
        if(tabName === 'reel') colorClass = "text-yellow-600";
        if(tabName === 'strength') colorClass = "text-red-600";
        if(tabName === 'cbm') colorClass = "text-green-600";

        activeBtn.className = `px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm font-bold transition-all shadow-md bg-white ${colorClass}`;
    };

    // --- CALCULATOR 1: Sheet Weight ---
    window.setUnit = function(unit) {
        currentUnit = unit;
        ['cm', 'mm', 'inch'].forEach(u => {
            const btn = document.getElementById(`btn-${u}`);
            if(btn) btn.className = (u === unit) 
                ? "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all bg-blue-600 text-white shadow-md transform scale-105"
                : "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";
        });
        document.querySelectorAll('.unit-label').forEach(l => l.textContent = `(${unit})`);
        ['calcLength', 'calcWidth', 'sizePreset'].forEach(id => document.getElementById(id).value = '');
        window.calculateWeight(); 
    };

    window.applyPreset = function() {
        const preset = document.getElementById('sizePreset').value;
        const lInput = document.getElementById('calcLength');
        const wInput = document.getElementById('calcWidth');
        if (!preset) return;
        if (preset === 'A4') { window.setUnit('mm'); wInput.value = 210; lInput.value = 297; }
        else if (preset === 'A3') { window.setUnit('mm'); wInput.value = 297; lInput.value = 420; }
        else if (['23x36', '25x36', '30x40'].includes(preset)) {
            window.setUnit('inch'); const [w, h] = preset.split('x'); wInput.value = w; lInput.value = h;
        }
        window.calculateWeight();
    };

    window.calculateWeight = function() {
        const l = parseFloat(document.getElementById('calcLength').value) || 0;
        const w = parseFloat(document.getElementById('calcWidth').value) || 0;
        const gsm = parseFloat(document.getElementById('calcGsm').value) || 0;
        const qty = parseFloat(document.getElementById('calcQty').value) || 0;
        
        let m_l = 0, m_w = 0;
        if (currentUnit === 'cm') { m_l = l/100; m_w = w/100; }
        else if (currentUnit === 'mm') { m_l = l/1000; m_w = w/1000; }
        else if (currentUnit === 'inch') { m_l = l*0.0254; m_w = w*0.0254; }

        const totalKg = ((m_l * m_w) * gsm * qty) / 1000;
        document.getElementById('resTotal').innerHTML = `${totalKg.toFixed(2)} <span class="text-xl text-blue-600 font-bold">kg</span>`;
        
        const moqStatus = document.getElementById('moqStatus');
        if (totalKg === 0) moqStatus.textContent = "";
        else if (totalKg < 1000) moqStatus.innerHTML = `<span class="text-red-500 bg-red-50 px-2 py-1 rounded">⚠️ Below MOQ (${(1000-totalKg).toFixed(1)}kg short)</span>`;
        else moqStatus.innerHTML = `<span class="text-green-600 bg-green-50 px-2 py-1 rounded">✅ MOQ Met</span>`;
    };

    // --- CALCULATOR 2: Reel Converter ---
    window.calculateReel = function() {
        const rWeight = parseFloat(document.getElementById('reelWeight').value) || 0;
        const rWidth = parseFloat(document.getElementById('reelWidth').value) || 0;
        const rGsm = parseFloat(document.getElementById('reelGsm').value) || 0;
        const cutLen = parseFloat(document.getElementById('cutLength').value) || 0;

        if (rWeight === 0 || rWidth === 0 || rGsm === 0) return;
        const totalLength = (rWeight * 1000 * 100) / (rGsm * rWidth); // Meters
        const sheets = (cutLen > 0) ? (totalLength * 100) / cutLen : 0;

        document.getElementById('resReelLength').innerHTML = `${Math.floor(totalLength)} <span class="text-sm">meters</span>`;
        document.getElementById('resSheets').innerHTML = `${Math.floor(sheets)} <span class="text-xl text-yellow-600">pcs</span>`;
    };

    // --- CALCULATOR 3: Strength (BF) ---
    window.calculateStrength = function() {
        const gsm = parseFloat(document.getElementById('strGsm').value) || 0;
        const bf = parseFloat(document.getElementById('strBf').value) || 0;
        // Formula: BS = (GSM * BF) / 1000
        const bs = (gsm * bf) / 1000;
        document.getElementById('resBs').textContent = bs.toFixed(2);
    };

    // --- CALCULATOR 4: CBM ---
    window.calculateCBM = function() {
        const l = parseFloat(document.getElementById('cbmL').value) || 0;
        const w = parseFloat(document.getElementById('cbmW').value) || 0;
        const h = parseFloat(document.getElementById('cbmH').value) || 0;
        const qty = parseFloat(document.getElementById('cbmQty').value) || 0;
        
        // Assuming inputs in CM. CBM = (L*W*H)/1,000,000 * Qty
        const cbm = ((l * w * h) / 1000000) * qty;
        document.getElementById('resCbm').innerHTML = `${cbm.toFixed(3)} <span class="text-xl text-green-600">m³</span>`;
    };

    // --- Auto-Calculation Listeners ---
    ['calcLength', 'calcWidth', 'calcGsm', 'calcQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateWeight));
    ['reelWeight', 'reelWidth', 'reelGsm', 'cutLength'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateReel));
    ['strGsm', 'strBf'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateStrength));
    ['cbmL', 'cbmW', 'cbmH', 'cbmQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateCBM));

    // --- BASKET & MODAL LOGIC (Kept from previous version) ---
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

    window.addToBasket = function(productName) {
        if(!basket.includes(productName)) {
            basket.push(productName);
            updateBasketUI();
            alert("Added to inquiry list!");
        } else {
            alert("Item already in list.");
        }
    };

    const basketBtn = document.getElementById('quoteBasket');
    if(basketBtn) basketBtn.addEventListener('click', () => document.getElementById('quote').scrollIntoView({behavior: 'smooth'}));

    // --- Modal Logic ---
    const modal = document.getElementById('productModal');
    const backdrop = document.getElementById('productModalBackdrop');
    
    window.closeModal = function() {
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

            if(modal && backdrop) {
                modal.classList.remove('hidden');
                backdrop.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.remove('opacity-0', 'scale-95');
                    modal.classList.add('opacity-100', 'scale-100');
                    backdrop.classList.remove('opacity-0');
                    backdrop.classList.add('opacity-50');
                }, 10);
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeBtn = document.getElementById('closeProductModal');
    if(closeBtn) closeBtn.addEventListener('click', window.closeModal);
    if(backdrop) backdrop.addEventListener('click', window.closeModal);

    // --- UTILS ---
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    if (typeof VanillaTilt !== 'undefined') VanillaTilt.init(document.querySelectorAll(".product-card"), { max: 5, speed: 400, glare: true, "max-glare": 0.2 });
    
    // Sticky Nav
    const nav = document.querySelector('.sticky-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    // Mobile Menu
    const menuBtn = document.getElementById('menuButton');
    const mobMenu = document.getElementById('mobileMenu'); // Assuming you have this ID in your HTML
    // ... (Add your mobile menu toggle logic here if needed)

    // Preloader
    const spinner = document.getElementById('spinner');
    if (spinner) {
        window.addEventListener('load', () => {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.style.display = 'none', 500);
        });
    }
    
    window.downloadCatalog = function() {
        const email = prompt("Enter your email to download:");
        if (email) alert("Catalogue sent to " + email);
    };
});
