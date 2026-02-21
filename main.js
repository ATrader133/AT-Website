document.addEventListener('DOMContentLoaded', function() {
    console.log("ABRAR TRADERS: System Loaded v7.0 (Ultimate Fix)");

    // ==========================================
    // 1. GLOBAL STATE & BASKET
    // ==========================================
    let basket = [];
    let currentUnit = 'cm';
    try {
        const stored = localStorage.getItem('at_basket');
        if (stored) basket = JSON.parse(stored);
    } catch (e) { console.error("Storage Error:", e); }

    window.showToast = function(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '✅' : 'ℹ️';
        toast.innerHTML = `<span style="margin-right:8px">${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastFadeOut 0.4s forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    // ==========================================
    // 2. PRODUCT MODAL & WHATSAPP
    // ==========================================
    const productModal = document.getElementById('productModal');
    const productModalBackdrop = document.getElementById('productModalBackdrop');
    
    window.openProductModal = function(card) {
        const d = card.dataset;
        if(document.getElementById('modalProductName')) document.getElementById('modalProductName').textContent = d.name;
        if(document.getElementById('modalProductImage')) document.getElementById('modalProductImage').src = d.image;
        if(document.getElementById('modalProductDescription')) document.getElementById('modalProductDescription').textContent = d.description;
        
        const specs = document.getElementById('modalProductSpecifications');
        if(specs && d.specifications) {
            specs.innerHTML = '';
            try {
                JSON.parse(d.specifications).forEach(s => {
                    specs.innerHTML += `<li class="flex justify-between border-b border-gray-100 py-2"><span class="text-gray-500">${s.label}</span><span class="font-bold text-gray-800">${s.value}</span></li>`;
                });
            } catch(e){}
        }
        if(document.getElementById('modalProductAdditionalInfo')) document.getElementById('modalProductAdditionalInfo').textContent = d['additional-info'];
        
        const addBtn = document.getElementById('modalAddToBasket');
        if(addBtn) addBtn.onclick = () => { window.addToBasket(d.name); window.closeModal(); };

        const waBtn = document.getElementById('modalWhatsAppBtn');
        if(waBtn) {
            const message = encodeURIComponent(`Hi Abrar Traders, I am interested in getting a quote for ${d.name}. Could you please share the pricing and details?`);
            waBtn.href = `https://wa.me/917405108950?text=${message}`;
        }

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

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => window.openProductModal(card));
    });
    document.getElementById('closeProductModal')?.addEventListener('click', window.closeModal);
    productModalBackdrop?.addEventListener('click', window.closeModal);

    // ==========================================
    // 3. QUOTE BASKET
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
    document.getElementById('quoteBasket')?.addEventListener('click', () => document.getElementById('quote')?.scrollIntoView({behavior: 'smooth'}));

    // ==========================================
    // 4. CALCULATORS
    // ==========================================
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

    window.applyPreset = function() {
        const preset = document.getElementById('sizePreset')?.value;
        const lInput = document.getElementById('calcLength');
        const wInput = document.getElementById('calcWidth');
        if (!preset || !lInput || !wInput) return;

        if (preset === 'A2') { window.setUnit('mm'); wInput.value = 420; lInput.value = 594; }
        else if (preset === 'A3') { window.setUnit('mm'); wInput.value = 297; lInput.value = 420; }
        else if (preset === 'A4') { window.setUnit('mm'); wInput.value = 210; lInput.value = 297; }
        else if (preset === 'A5') { window.setUnit('mm'); wInput.value = 148; lInput.value = 210; }
        else if (['18x23', '23x36', '25x36', '30x40'].includes(preset)) {
            window.setUnit('inch'); const [w, h] = preset.split('x'); wInput.value = w; lInput.value = h;
        }
        window.calculateWeight();
    };

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
        if(document.getElementById('resReelLength')) document.getElementById('resReelLength').innerHTML = `${Math.floor(totalLength)} <span class="text-sm">meters</span>`;
        if(document.getElementById('resSheets')) document.getElementById('resSheets').innerHTML = `${Math.floor(sheets)} <span class="text-xl text-yellow-600">pcs</span>`;
    };

    window.calculateStrength = function() {
        const gsm = parseFloat(document.getElementById('strGsm')?.value) || 0;
        const bf = parseFloat(document.getElementById('strBf')?.value) || 0;
        if(document.getElementById('resBs')) document.getElementById('resBs').textContent = ((gsm * bf) / 1000).toFixed(2);
    };

    window.calculateCBM = function() {
        const l = parseFloat(document.getElementById('cbmL')?.value) || 0;
        const w = parseFloat(document.getElementById('cbmW')?.value) || 0;
        const h = parseFloat(document.getElementById('cbmH')?.value) || 0;
        const qty = parseFloat(document.getElementById('cbmQty')?.value) || 0;
        if(document.getElementById('resCbm')) document.getElementById('resCbm').innerHTML = `${(((l * w * h) / 1000000) * qty).toFixed(3)} <span class="text-xl text-green-600">m³</span>`;
    };

    ['calcLength', 'calcWidth', 'calcGsm', 'calcQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateWeight));
    ['reelWeight', 'reelWidth', 'reelGsm', 'cutLength'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateReel));
    ['strGsm', 'strBf'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateStrength));
    ['cbmL', 'cbmW', 'cbmH', 'cbmQty'].forEach(id => document.getElementById(id)?.addEventListener('input', window.calculateCBM));

    window.switchTab('weight'); // Init

    // ==========================================
    // 5. LIVE SEARCH & FILTER
    // ==========================================
    const searchInput = document.getElementById('productSearch');
    const searchDropdown = document.getElementById('searchDropdown');
    const products = document.querySelectorAll('.product-item');
    
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            if(searchDropdown) searchDropdown.innerHTML = ''; 
            
            if(term.length === 0) {
                if(searchDropdown) searchDropdown.classList.add('hidden');
                products.forEach(item => item.style.display = 'block');
                return;
            }

            let hasResults = false;
            if(searchDropdown) {
                searchDropdown.classList.remove('hidden');
                searchDropdown.style.display = 'flex';
            }

            products.forEach(item => {
                const name = item.dataset.name.toLowerCase();
                const desc = item.dataset.description.toLowerCase();
                
                if(name.includes(term) || desc.includes(term)) {
                    hasResults = true;
                    item.style.display = 'block'; 
                    item.classList.remove('aos-animate');
                    setTimeout(() => item.classList.add('aos-animate'), 50);
                    
                    if(searchDropdown) {
                        const div = document.createElement('div');
                        div.className = 'flex items-center gap-4 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50';
                        div.innerHTML = `
                            <img src="${item.dataset.image}" alt="" class="w-10 h-10 rounded object-cover">
                            <div>
                                <div class="font-bold text-gray-800 text-sm">${item.dataset.name}</div>
                                <div class="text-xs text-gray-500">${item.dataset.category}</div>
                            </div>
                        `;
                        div.onclick = () => {
                            window.openProductModal(item);
                            searchDropdown.classList.add('hidden');
                            searchInput.value = '';
                            products.forEach(p => p.style.display = 'block');
                        };
                        searchDropdown.appendChild(div);
                    }
                } else {
                    item.style.display = 'none'; 
                }
            });

            if(!hasResults && searchDropdown) {
                searchDropdown.innerHTML = `<div class="p-4 text-center text-gray-500 text-sm">No products found</div>`;
            }
        });

        document.addEventListener('click', (e) => {
            if (searchDropdown && !searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.add('hidden');
            }
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

    // ==========================================
    // 6. PAPER FINDER QUIZ
    // ==========================================
    let quizState = { use: '', weight: '' };
    window.quizSelect = function(step, value) {
        quizState[step] = value;
        if (step === 'use') {
            const step1 = document.getElementById('quiz-step-1');
            const step2 = document.getElementById('quiz-step-2');
            if(step1 && step2) {
                step1.style.opacity = '0';
                setTimeout(() => {
                    step1.classList.add('hidden');
                    step2.classList.remove('hidden');
                    void step2.offsetWidth; 
                    step2.style.opacity = '1';
                }, 300);
            }
        } else if (step === 'weight') {
            const step2 = document.getElementById('quiz-step-2');
            if(step2) {
                step2.style.opacity = '0';
                setTimeout(() => {
                    step2.classList.add('hidden');
                    showQuizResult();
                }, 300);
            }
        }
    };

    window.quizBack = function() {
        const step1 = document.getElementById('quiz-step-1');
        const step2 = document.getElementById('quiz-step-2');
        if(step1 && step2) {
            step2.style.opacity = '0';
            setTimeout(() => { step2.classList.add('hidden'); step1.classList.remove('hidden'); void step1.offsetWidth; step1.style.opacity = '1'; quizState.use = ''; }, 300);
        }
    };

    window.quizReset = function() {
        const step1 = document.getElementById('quiz-step-1');
        const step3 = document.getElementById('quiz-step-3');
        if(step1 && step3) {
            step3.style.opacity = '0';
            setTimeout(() => { step3.classList.add('hidden'); step1.classList.remove('hidden'); void step1.offsetWidth; step1.style.opacity = '1'; quizState = { use: '', weight: '' }; }, 300);
        }
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

        if(document.getElementById('quiz-result-title')) document.getElementById('quiz-result-title').textContent = result.title;
        if(document.getElementById('quiz-result-desc')) document.getElementById('quiz-result-desc').textContent = result.desc;
        if(document.getElementById('quiz-add-btn')) document.getElementById('quiz-add-btn').onclick = () => window.addToBasket(result.title);
        
        const step3 = document.getElementById('quiz-step-3');
        if(step3) {
            step3.classList.remove('hidden');
            void step3.offsetWidth;
            step3.style.opacity = '1';
        }
    }

    // ==========================================
    // 7. FAQ ACCORDION LOGIC
    // ==========================================
    document.querySelectorAll('.faq-button').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const icon = button.querySelector('svg');
            
            document.querySelectorAll('.faq-answer').forEach(ans => {
                if(ans !== answer) {
                    ans.style.maxHeight = null;
                    const prevIcon = ans.previousElementSibling?.querySelector('svg');
                    if(prevIcon) prevIcon.style.transform = "rotate(0deg)";
                }
            });

            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                if(icon) icon.style.transform = "rotate(0deg)";
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                if(icon) icon.style.transform = "rotate(180deg)";
            }
        });
    });

    // ==========================================
    // 8. PLUGINS & MICRO-INTERACTIONS
    // ==========================================
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }

    if (document.getElementById('typed') && typeof Typed !== 'undefined') {
        new Typed('#typed', { strings: ['Kraft & Duplex Paper.', 'Sustainable Packaging.', 'Industrial Solutions.'], typeSpeed: 50, backSpeed: 25, loop: true });
    }

    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    
    if (typeof Splide !== 'undefined' && document.querySelector('.splide')) {
        new Splide('.splide', { type: 'loop', perPage: 3, gap: '1.5rem', pagination: true, arrows: false, autoplay: true, interval: 5000, breakpoints: { 1024: { perPage: 2 }, 768: { perPage: 1 } } }).mount();
    }

    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".product-card"), { max: 5, speed: 400, glare: true, "max-glare": 0.2 });
    }

    if (window.tsParticles && document.getElementById('tsparticles')) {
        tsParticles.load("tsparticles", {
            fpsLimit: 60, fullScreen: { enable: false },
            particles: {
                number: { value: 40, density: { enable: true, area: 800 } },
                color: { value: ["#607afb", "#8e9bfa", "#a78bfa"] },
                shape: { type: "circle" },
                opacity: { value: 0.4, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#607afb", opacity: 0.2 },
                move: { enable: true, speed: 1 }
            },
            interactivity: { events: { onhover: { enable: true, mode: "grab" } } }
        });
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

    // ==========================================
    // 9. UI COMPONENTS (Menu, Sidebar, TopBtn)
    // ==========================================
    const sidebar = document.getElementById('socialSidebar');
    if (sidebar) {
        setTimeout(() => sidebar.classList.add('peek-out'), 1000);
        setTimeout(() => sidebar.classList.remove('peek-out'), 3500);
    }

    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
    
    const menuButton = document.getElementById('menuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const toggleMenu = () => {
        if(!mobileMenu) return;
        const isOpen = mobileMenu.classList.contains('open');
        menuButton?.classList.toggle('menu-open', !isOpen);
        mobileMenu.classList.toggle('open', !isOpen);
        menuBackdrop?.classList.toggle('open', !isOpen);
        document.body.classList.toggle('menu-opened', !isOpen);
    };
    menuButton?.addEventListener('click', toggleMenu);
    menuBackdrop?.addEventListener('click', toggleMenu);
    document.getElementById('closeMenuButton')?.addEventListener('click', toggleMenu);
    document.querySelectorAll('#mobileMenu a').forEach(l => l.addEventListener('click', toggleMenu));

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
            progressCircle.style.strokeDashoffset = circumference - ((scrollTop / docHeight) * circumference);
        });
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
});
