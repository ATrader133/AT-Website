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
       // 1. Setup 3D Cube Textures
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        faces.forEach(face => {
            const el = document.getElementById(`face-${face}`);
            if(el) {
                el.style.backgroundImage = `url('${d.image}')`;
                // Add fake shadows to give the box realistic lighting depth
                if(face === 'top') el.style.boxShadow = 'inset 0 0 40px rgba(255,255,255,0.4)';
                if(face === 'right' || face === 'left') el.style.boxShadow = 'inset 0 0 50px rgba(0,0,0,0.2)';
                if(face === 'bottom') el.style.boxShadow = 'inset 0 0 60px rgba(0,0,0,0.6)';
            }
        });
        
        // 2. Reset rotation so the box faces forward when newly opened
        const cube = document.getElementById('productCube');
        if(cube) {
            cube.style.transform = `rotateX(-15deg) rotateY(-25deg)`;
            window.cubeRotation = { x: -15, y: -25 };
        }
        if(document.getElementById('modalProductDescription')) document.getElementById('modalProductDescription').textContent = d.description;
        
        const specs = document.getElementById('modalProductSpecifications');
        if(specs && d.specifications) {
            specs.innerHTML = '';
            try {
                const parsedSpecs = JSON.parse(d.specifications);
                parsedSpecs.forEach((s, i) => {
                    // Remove bottom border from the very last item for a cleaner look
                    const border = i === parsedSpecs.length - 1 ? '' : 'border-b border-gray-200/60';
                    specs.innerHTML += `<li class="flex justify-between items-center py-2 ${border}"><span class="text-gray-500 text-sm font-medium">${s.label}</span><span class="font-bold text-gray-800 text-sm text-right ml-4">${s.value}</span></li>`;
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
        ['weight', 'reel', 'strength', 'cbm', 'thickness', 'esg'].forEach(t => {
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
            if(tabName === 'thickness') colorClass = "text-indigo-600";
            if(tabName === 'esg') colorClass = "text-emerald-600";
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
        
        // Fix: Lock background scrolling when menu is open
        document.body.style.overflow = isOpen ? '' : 'hidden';
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
    // ==========================================
    // 10. AJAX FORM SUBMISSION (No Redirects)
    // ==========================================
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Stops the page from leaving your website
            
            const submitBtn = quoteForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

            const formData = new FormData(quoteForm);
            
            try {
                const response = await fetch(quoteForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success! Show toast and clear the form
                    window.showToast("Quote requested successfully! We'll contact you soon.", "success");
                    quoteForm.reset();
                    
                    // Optional: Clear the quote basket after successful submission
                    if (typeof basket !== 'undefined') {
                        basket = [];
                        localStorage.setItem('at_basket', JSON.stringify(basket));
                        document.getElementById('basketCount').textContent = '0';
                        document.getElementById('quoteBasket').classList.add('hidden');
                    }
                } else {
                    window.showToast("Oops! There was a problem submitting your form.", "info");
                }
            } catch (error) {
                window.showToast("Network error. Please try again.", "info");
            } finally {
                // Reset button state
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    }
    // ==========================================
    // 11. DARK MODE TOGGLE
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const iconDark = document.getElementById('themeIconDark');
    const iconLight = document.getElementById('themeIconLight');
    
    // Check local storage for saved theme preference
    if (localStorage.getItem('at_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if(iconDark) iconDark.classList.add('hidden');
        if(iconLight) iconLight.classList.remove('hidden');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            
            // Save preference to browser
            localStorage.setItem('at_theme', isDark ? 'dark' : 'light');
            
            // Animate Icon Swap
            if (isDark) {
                iconDark.classList.add('hidden');
                iconLight.classList.remove('hidden');
                window.showToast("Midnight Carbon theme activated 🌙", "info");
            } else {
                iconLight.classList.add('hidden');
                iconDark.classList.remove('hidden');
                window.showToast("Light Glass theme activated ☀️", "info");
            }
        });
    }
    // ==========================================
    // 12. 3D CUBE DRAG LOGIC (Physics)
    // ==========================================
    const scene = document.getElementById('cubeScene');
    const cube = document.getElementById('productCube');
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    window.cubeRotation = { x: -15, y: -25 };

    if (scene && cube) {
        // Desktop Mouse Events
        scene.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.offsetX, y: e.offsetY };
        });
        document.addEventListener('mouseup', () => isDragging = false);
        scene.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
            window.cubeRotation.x -= deltaMove.y * 0.5; // Up/Down
            window.cubeRotation.y += deltaMove.x * 0.5; // Left/Right
            cube.style.transform = `rotateX(${window.cubeRotation.x}deg) rotateY(${window.cubeRotation.y}deg)`;
            previousMousePosition = { x: e.offsetX, y: e.offsetY };
        });

        // Mobile Touch Events
        scene.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            const rect = scene.getBoundingClientRect();
            previousMousePosition = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        }, {passive: true});
        document.addEventListener('touchend', () => isDragging = false);
        scene.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevents page from scrolling while spinning the box
            const touch = e.touches[0];
            const rect = scene.getBoundingClientRect();
            const currentX = touch.clientX - rect.left;
            const currentY = touch.clientY - rect.top;
            const deltaMove = { x: currentX - previousMousePosition.x, y: currentY - previousMousePosition.y };
            
            window.cubeRotation.x -= deltaMove.y * 0.6;
            window.cubeRotation.y += deltaMove.x * 0.6;
            cube.style.transform = `rotateX(${window.cubeRotation.x}deg) rotateY(${window.cubeRotation.y}deg)`;
            previousMousePosition = { x: currentX, y: currentY };
        }, {passive: false});
    }
    // ==========================================
    // 13. CUSTOM FLUID CURSOR
    // ==========================================
    // Only run on desktop devices
    if (window.matchMedia("(min-width: 768px)").matches) {
        const cursor = document.getElementById('customCursor');
        const follower = document.getElementById('cursorFollower');
        
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        // Track Mouse Movement
        document.addEventListener('mousemove', (e) => {
            // Only hide default cursor if mouse actually moves (fixes touch-laptop bug)
            if (!document.body.classList.contains('has-custom-cursor')) {
                document.body.classList.add('has-custom-cursor');
            }
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Instantly move the solid dot
            if(cursor) cursor.style.transform = `translate3d(${mouseX - 8}px, ${mouseY - 8}px, 0)`;
        });

        // Smooth follow animation for the outer ring
        function animateFollower() {
            // Easing formula for smooth trailing effect
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            if(follower) follower.style.transform = `translate3d(${followerX - 20}px, ${followerY - 20}px, 0)`;
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Hover Effect Logic: Expand when over clickable items
        const clickables = document.querySelectorAll('a, button, input, textarea, select, .product-card');
        
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if(cursor) cursor.classList.add('scale-[2.5]', 'opacity-50');
                if(follower) follower.classList.add('scale-150', 'border-transparent', 'bg-blue-200/20');
            });
            
            el.addEventListener('mouseleave', () => {
                if(cursor) cursor.classList.remove('scale-[2.5]', 'opacity-50');
                if(follower) follower.classList.remove('scale-150', 'border-transparent', 'bg-blue-200/20');
            });
        });
    }

    // ==========================================
    // 14. GSM VISUALIZER LOGIC
    // ==========================================
    const visualSlider = document.getElementById('gsmVisualSlider');
    const valDisplay = document.getElementById('gsmValueDisplay');
    const descText = document.getElementById('gsmDescText');
    const isoPaper = document.getElementById('isometricPaper');

    if (visualSlider && isoPaper) {
        visualSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            valDisplay.textContent = val;
            
            // 1. Determine Real World Description
            let desc = '';
            if (val <= 80) desc = "Tracing / Receipt Paper — Extremely thin, translucent, and highly flexible.";
            else if (val <= 120) desc = "Standard Printer Paper — Your everyday office A4 sheet. Easily foldable.";
            else if (val <= 160) desc = "Light Flyers / Posters — Slightly stiff. Good for folding without cracking.";
            else if (val <= 220) desc = "Brochure Covers — Sturdy. Feels like a high-quality magazine cover.";
            else if (val <= 280) desc = "Standard Business Cards — Rigid. Holds its shape well and resists bending.";
            else if (val <= 350) desc = "Heavy Cardstock — Very stiff. Used for premium product boxes and invitations.";
            else desc = "Rigid Packaging / Cartons — Unbending. Used for luxury rigid boxes and heavy displays.";
            
            descText.textContent = desc;

            // 2. Generate 3D Thickness via Box Shadows
            // We map 50-450 GSM to a physical pixel thickness of 1px to 45px
            const thicknessPixels = Math.max(1, Math.floor((val / 450) * 45)); 
            
            let shadows = [];
            // Adding a soft drop shadow on the "table" underneath the paper
            shadows.push(`-30px 30px 40px rgba(0,0,0,0.15)`); 
            
            // Stacking the solid edges
            for(let i = 1; i <= thicknessPixels; i++) {
                shadows.push(`-${i}px ${i}px 0px var(--edge-light)`);
            }
            // The absolute bottom edge gets a darker color to create a real 3D bevel
            shadows.push(`-${thicknessPixels + 1}px ${thicknessPixels + 1}px 0px var(--edge-dark)`);
            
            isoPaper.style.boxShadow = shadows.join(', ');
            
            // Slightly push the paper "up" into the air as it gets thicker
            isoPaper.style.transform = `rotateX(60deg) rotateY(0deg) rotateZ(-45deg) translateZ(${thicknessPixels}px) translate(-${thicknessPixels/2}px, -${thicknessPixels/2}px)`;
        });

        // Fire once on load to set initial state
        visualSlider.dispatchEvent(new Event('input'));
    }

    // ==========================================
    // 15. ESG CALCULATOR & NUMBER ANIMATION
    // ==========================================
    // Industry Standard: 1 Ton of recycled paper saves approx 17 Trees, 26,000L Water, 4,000 kWh Energy, 3 cubic yards Landfill
    window.calculateESG = function() {
        const tons = parseFloat(document.getElementById('esgTons')?.value) || 0;
        
        animateValue('esgTrees', parseInt(document.getElementById('esgTrees').innerText.replace(/,/g, '')), Math.floor(tons * 17), 800);
        animateValue('esgWater', parseInt(document.getElementById('esgWater').innerText.replace(/,/g, '')), Math.floor(tons * 26497), 800);
        animateValue('esgEnergy', parseInt(document.getElementById('esgEnergy').innerText.replace(/,/g, '')), Math.floor(tons * 4000), 800);
        animateValue('esgLandfill', parseInt(document.getElementById('esgLandfill').innerText.replace(/,/g, '')), Math.floor(tons * 3.3), 800);
    };

    // Smooth number rolling animation
    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if(!obj || start === end) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Easing formula for smooth slowdown at the end
            const easeOutProgress = 1 - Math.pow(1 - progress, 3); 
            const currentVal = Math.floor(easeOutProgress * (end - start) + start);
            obj.innerHTML = currentVal.toLocaleString(); // Adds commas (e.g., 26,000)
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    document.getElementById('esgTons')?.addEventListener('input', window.calculateESG);
    
// ==========================================
    // 16. CONTAINER LOAD SIMULATOR LOGIC
    // ==========================================
    window.calculateCBM = function() {
        const l = parseFloat(document.getElementById('cbmL')?.value) || 0;
        const w = parseFloat(document.getElementById('cbmW')?.value) || 0;
        const h = parseFloat(document.getElementById('cbmH')?.value) || 0;
        const qty = parseFloat(document.getElementById('cbmQty')?.value) || 1;
        
        // Calculate raw CBM
        const totalCbm = (l * w * h * qty) / 1000000;
        
        // Update basic text
        const resCbm = document.getElementById('resCbm');
        if (resCbm) resCbm.innerHTML = totalCbm.toFixed(3) + ' <span class="text-xl text-green-600">m³</span>';

        // 1. Unhide Simulator UI
        const simulator = document.getElementById('containerSimulatorResult');
        if (simulator && totalCbm > 0) simulator.classList.remove('hidden');

        // 2. Container Math (Standard 20ft Container holds ~33 CBM maximum)
        const maxCbm = 33.0;
        let fillPercentage = (totalCbm / maxCbm) * 100;
        let isOverflow = false;
        
        if (fillPercentage > 100) {
            fillPercentage = 100; // Cap visual bar at 100%
            isOverflow = true;
        }

        // 3. Animate Fill Bar & Change Colors dynamically
        const fillBar = document.getElementById('containerFillBar');
        const percentText = document.getElementById('containerPercentageText');
        
        if (fillBar) {
            setTimeout(() => {
                fillBar.style.width = fillPercentage + '%';
                // Dynamic colors based on efficiency
                const baseClasses = "absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end overflow-hidden shadow-[inset_-5px_0_15px_rgba(0,0,0,0.3)] ";
                if (isOverflow) {
                    fillBar.className = baseClasses + "bg-red-500";
                    percentText.style.color = "#ef4444";
                } else if (fillPercentage > 85) {
                    fillBar.className = baseClasses + "bg-green-500"; // Highly efficient load
                    percentText.style.color = "#10b981";
                } else {
                    fillBar.className = baseClasses + "bg-blue-500";
                    percentText.style.color = "#3b82f6";
                }
            }, 50); // slight delay forces the CSS animation to trigger
        }

        // 4. Animate the Percentage Number rolling up
        if (percentText) {
            let start = 0;
            const end = (totalCbm / maxCbm) * 100;
            const duration = 1000;
            let startTimestamp = null;
            
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentVal = (progress * end).toFixed(1);
                percentText.innerText = currentVal + '%';
                if (progress < 1) window.requestAnimationFrame(step);
                else percentText.innerText = end.toFixed(1) + '%';
            };
            window.requestAnimationFrame(step);
        }

        // 5. Update Logistics Text & Pallet Estimate
        const statusText = document.getElementById('containerStatusText');
        const palletText = document.getElementById('palletEstimateText');
        
        if (statusText) {
            if (isOverflow) statusText.innerText = "Warning: Exceeds 20ft limits! Requires 40ft Container.";
            else if (fillPercentage > 85) statusText.innerText = "Optimal Load! Highly cost-effective shipping.";
            else statusText.innerText = "LCL (Less than Container Load) recommended.";
        }
        
        if (palletText) {
            // Standard EUR pallet is roughly 1.5 CBM of practical space
            const pallets = Math.ceil(totalCbm / 1.5);
            palletText.innerText = `~ ${pallets} Standard Pallet${pallets !== 1 ? 's' : ''}`;
        }
    };

    // ==========================================
    // 17. APP-LIKE PAGE TRANSITIONS (Fallback)
    // ==========================================
    // 1. Add smooth fade-in on initial page load
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.6s ease-out';
        document.body.style.opacity = '1';
    });

    // 2. Intercept clicks to other pages (like blog.html)
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', e => {
            const target = link.getAttribute('href');
            
            // If it's a link to another HTML page (not a #hash or external link)
            if (target && target.includes('.html') && !target.startsWith('http')) {
                
                // If browser does NOT support native View Transitions, use our fallback
                if (!document.startViewTransition) {
                    e.preventDefault();
                    document.body.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                    document.body.style.opacity = '0';
                    document.body.style.transform = 'scale(0.98)'; // Slight zoom-out effect
                    
                    setTimeout(() => {
                        window.location.href = target;
                    }, 400);
                }
            }
        });
    });
    // ==========================================
// 18. INNOVATIVE FEATURES ENGINE (AI, AR, ESG PDF, i18n, Sample Kit)
// ==========================================

// --- FEATURE 1: ESG PDF Generator (html2pdf) ---
document.getElementById('esgTons')?.addEventListener('input', (e) => {
    const tons = parseFloat(e.target.value) || 0;
    const btn = document.getElementById('esgDownloadBtn');
    if(btn) tons > 0 ? btn.classList.remove('hidden') : btn.classList.add('hidden');
});

window.downloadESGReport = function() {
    const tons = parseFloat(document.getElementById('esgTons').value) || 0;
    const trees = document.getElementById('esgTrees').innerText;
    const water = document.getElementById('esgWater').innerText;
    const energy = document.getElementById('esgEnergy').innerText;

    // Create a temporary hidden div tailored for the PDF printout
    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding: 40px; font-family: 'Helvetica', sans-serif; color: #1f2937;">
            <div style="text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #047857; margin: 0; font-size: 32px;">Certificate of Environmental Impact</h1>
                <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Certified by ABRAR TRADERS | Sustainable Packaging Solutions</p>
            </div>
            <p style="font-size: 18px; line-height: 1.6;">This certifies that the procurement of <strong>${tons} Metric Tons</strong> of Recycled Paper Board actively contributes to the following environmental savings globally:</p>
            <div style="display: flex; justify-content: space-between; margin-top: 40px;">
                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 12px; width: 30%; text-align: center;">
                    <h2 style="color: #059669; font-size: 28px; margin: 0;">🌳 ${trees}</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Trees Saved</p>
                </div>
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 12px; width: 30%; text-align: center;">
                    <h2 style="color: #2563eb; font-size: 28px; margin: 0;">💧 ${water} L</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Water Preserved</p>
                </div>
                <div style="background: #fefce8; border: 1px solid #fef08a; padding: 20px; border-radius: 12px; width: 30%; text-align: center;">
                    <h2 style="color: #ca8a04; font-size: 28px; margin: 0;">⚡ ${energy} kWh</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Energy Conserved</p>
                </div>
            </div>
            <p style="margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center;">Generated on ${new Date().toLocaleDateString()}. Calculations based on standard recycling metrics. Thank you for choosing a greener supply chain.</p>
        </div>
    `;
    
    // Use html2pdf
    html2pdf().set({
        margin: 10,
        filename: 'Abrar_Traders_CSR_Impact.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
    
    window.showToast("Generating PDF Certificate...", "success");
};

// --- FEATURE 2: Sample Kit Modal ---
// Note: You must add a button anywhere in your HTML with `onclick="openSampleKit()"`
window.openSampleKit = () => { document.getElementById('sampleKitModal').classList.remove('hidden'); document.getElementById('sampleKitModal').classList.add('flex'); };
window.closeSampleKit = () => { document.getElementById('sampleKitModal').classList.add('hidden'); document.getElementById('sampleKitModal').classList.remove('flex'); };
window.submitSampleKit = (e) => {
    e.preventDefault();
    closeSampleKit();
    window.showToast("Sample Kit requested! Our team will contact you for dispatch details.", "success");
};

// --- FEATURE 4: Basic Multilingual Support (i18n) ---
const translations = {
    en: { home: "Home", products: "Products", tools: "Pro Tools", blog: "Blog", contact: "Contact", heroTitle: "ABRAR TRADERS" },
    hi: { home: "होम", products: "उत्पाद", tools: "उपकरण", blog: "ब्लॉग", contact: "संपर्क", heroTitle: "अबरार ट्रेडर्स" },
    gu: { home: "ઘર", products: "ઉત્પાદનો", tools: "સાધનો", blog: "બ્લોગ", contact: "સંપર્ક", heroTitle: "અબરાર ટ્રેડર્સ" }
};
// Attach data-i18n tags to elements dynamically for the demo
document.querySelectorAll('.nav-link').forEach((el, i) => {
    const keys = ["home", "products", "tools", "blog", "contact"];
    if(keys[i]) el.setAttribute('data-i18n', keys[i]);
});
document.querySelector('h1 span.bg-gradient-to-r')?.setAttribute('data-i18n', 'heroTitle');

document.getElementById('langToggle')?.addEventListener('change', (e) => {
    const lang = e.target.value;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    window.showToast(`Language changed to ${lang.toUpperCase()}`, "info");
});

// --- FEATURE 5: AR Pallet Viewer ---
window.openARViewer = () => { document.getElementById('arViewerModal').classList.remove('hidden'); document.getElementById('arViewerModal').classList.add('flex'); document.body.style.overflow = 'hidden'; };
window.closeARViewer = () => { document.getElementById('arViewerModal').classList.add('hidden'); document.getElementById('arViewerModal').classList.remove('flex'); document.body.style.overflow = ''; };

// --- FEATURE 6: AI Chatbot Matchmaker Simulator ---
window.toggleChat = () => {
    const chat = document.getElementById('aiChatWindow');
    if(chat.classList.contains('opacity-0')) {
        chat.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
        // Only auto-focus on desktop to prevent mobile keyboard from jumping the layout
        if (window.innerWidth > 768) {
            document.getElementById('chatInput').focus();
        }
    } else {
        chat.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
    }
};

window.handleChatEnter = (e) => { if (e.key === 'Enter') sendChatMessage(); };

window.sendChatMessage = () => {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if(!msg) return;
    
    const log = document.getElementById('chatLog');
    
    // Append User Message
    log.innerHTML += `<div class="bg-blue-600 text-white p-3 rounded-xl rounded-tr-none self-end max-w-[85%]">${msg}</div>`;
    input.value = '';
    log.scrollTop = log.scrollHeight;

    // Simulate AI Thinking
    const typingId = 'typing-' + Date.now();
    log.innerHTML += `<div id="${typingId}" class="text-gray-400 text-xs italic p-2 self-start">Abrar AI is calculating Burst Factor...</div>`;
    log.scrollTop = log.scrollHeight;

    setTimeout(() => {
        document.getElementById(typingId).remove();
        const lower = msg.toLowerCase();
        let reply = "I can help with that! Please specify the weight or industry (e.g., 'heavy machinery', 'food', 'glass').";
        
        // Matchmaking Logic
        if(lower.includes('glass') || lower.includes('heavy') || lower.includes('machine')) {
            reply = "📦 **Calculated Recommendation:** For heavy/fragile items, you need maximum structural integrity. We recommend our **High-Density Kraft Paper Board (150-250 GSM)** paired with a strong corrugated inner layer to achieve a high Bursting Strength (BS).";
        } else if(lower.includes('food') || lower.includes('medicine') || lower.includes('pharma')) {
            reply = "💊 **Calculated Recommendation:** For pharmaceuticals/food, cleanliness and printability are key. We recommend our **Premium Duplex Board (White Back, 250-350 GSM)** or **SBS Board** for a sterile, high-end finish.";
        } else if(lower.includes('book') || lower.includes('print') || lower.includes('magazine')) {
            reply = "🖨️ **Calculated Recommendation:** For publishing, you need smooth ink absorption. Our **Maplitho Paper (70-100 GSM)** or **FBB (Folding Box Board)** will give you vibrant, bleed-free colors.";
        } else if(lower.includes('cheap') || lower.includes('budget') || lower.includes('pad')) {
            reply = "💰 **Calculated Recommendation:** If you are looking for an economical, rigid backing (like for notepads or puzzles), our **Sundry Grey Board (1mm - 3mm)** is 100% recycled and highly cost-effective.";
        }

        log.innerHTML += `<div class="bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-3 rounded-xl rounded-tl-none self-start max-w-[85%]">${reply}<br><br><a href="#quote" onclick="toggleChat()" class="text-blue-600 font-bold text-xs underline">Request Quote Now</a></div>`;
        log.scrollTop = log.scrollHeight;
    }, 1200);
};
});













