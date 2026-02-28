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
        ['weight', 'reel', 'strength', 'cbm', 'thickness', 'esg', 'diecut'].forEach(t => {
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
            if(tabName === 'diecut') { colorClass = "text-purple-600"; setTimeout(drawDieCut, 50); } // Add this!
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
        const l = Math.max(0, parseFloat(document.getElementById('calcLength')?.value) || 0);
        const w = Math.max(0, parseFloat(document.getElementById('calcWidth')?.value) || 0);
        const gsm = Math.max(0, parseFloat(document.getElementById('calcGsm')?.value) || 0);
        const qty = Math.max(0, parseFloat(document.getElementById('calcQty')?.value) || 0);
        
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
        // FIX: Added Math.max to prevent negative lengths/yields
        const rWeight = Math.max(0, parseFloat(document.getElementById('reelWeight')?.value) || 0);
        const rWidth = Math.max(0, parseFloat(document.getElementById('reelWidth')?.value) || 0);
        const rGsm = Math.max(0, parseFloat(document.getElementById('reelGsm')?.value) || 0);
        const cutLen = Math.max(0, parseFloat(document.getElementById('cutLength')?.value) || 0);
        if (rWeight === 0 || rWidth === 0 || rGsm === 0) return;
        const totalLength = (rWeight * 1000 * 100) / (rGsm * rWidth);
        const sheets = (cutLen > 0) ? (totalLength * 100) / cutLen : 0;
        if(document.getElementById('resReelLength')) document.getElementById('resReelLength').innerHTML = `${Math.floor(totalLength)} <span class="text-sm">meters</span>`;
        if(document.getElementById('resSheets')) document.getElementById('resSheets').innerHTML = `${Math.floor(sheets)} <span class="text-xl text-yellow-600">pcs</span>`;
    };

    window.calculateStrength = function() {
        // FIX: Added Math.max
        const gsm = Math.max(0, parseFloat(document.getElementById('strGsm')?.value) || 0);
        const bf = Math.max(0, parseFloat(document.getElementById('strBf')?.value) || 0);
        if(document.getElementById('resBs')) document.getElementById('resBs').textContent = ((gsm * bf) / 1000).toFixed(2);
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

    if (window.tsParticles && document.getElementById('tsparticles') && !window.particlesLoaded) {
        window.particlesLoaded = true; // Prevent duplicate initializations
        // Falling Paper Particles
    tsParticles.load("tsparticles", {
        particles: {
            number: { value: 35, density: { enable: true, value_area: 800 } },
            color: { value: ["#3B82F6", "#8B5CF6", "#10B981", "#ffffff", "#cbd5e1"] }, // Brand colors
            shape: { 
                type: "polygon", 
                polygon: { nb_sides: 4 } // Makes them squares/rectangles like paper sheets
            },
            opacity: { value: 0.6, random: true },
            size: { value: 8, random: true }, // Bigger pieces
            move: {
                enable: true,
                speed: 1.5,
                direction: "bottom", // Fall downwards
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
            },
            rotate: {
                value: 0,
                random: true,
                direction: "random",
                animation: { enable: true, speed: 10 } // Spin as they fall
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" }, // Paper blows away from Jet Cursor
                onclick: { enable: true, mode: "push" }, 
                resize: true
            },
            modes: {
                repulse: { distance: 100, duration: 0.4 },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });
    }

    // Advanced Magnetic Parallax Buttons
    document.querySelectorAll('.action-button, .btn-glow').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left) - (rect.width / 2);
            const y = (e.clientY - rect.top) - (rect.height / 2);
            
            // Move and slightly scale the main button
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.02)`;
            
            // Parallax the inner text/icons for depth
            const children = Array.from(btn.children);
            children.forEach(child => {
                if (child.tagName.toLowerCase() !== 'svg') {
                    child.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
                }
            });
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px) scale(1)`;
            btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'; 
            
            const children = Array.from(btn.children);
            children.forEach(child => {
                child.style.transform = `translate(0px, 0px)`;
                child.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'; 
            });
            
            setTimeout(() => { 
                btn.style.transition = ''; 
                children.forEach(c => c.style.transition = ''); 
            }, 500);
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
            if (window.scrollY > 300) {
                scrollBtn.classList.remove('opacity-0', 'invisible');
                scrollBtn.classList.add('opacity-100', 'visible');
            } else {
                scrollBtn.classList.remove('opacity-100', 'visible');
                scrollBtn.classList.add('opacity-0', 'invisible');
            }
            
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
    // 11. DARK MODE TOGGLE (Tailwind Native)
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const iconDark = document.getElementById('themeIconDark');
    const iconLight = document.getElementById('themeIconLight');
    
    // Check local storage for saved theme preference
    if (localStorage.getItem('at_theme') === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode'); 
        if(iconDark) iconDark.classList.add('hidden');
        if(iconLight) iconLight.classList.remove('hidden');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            document.body.classList.toggle('dark-mode'); 
            
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('at_theme', isDark ? 'dark' : 'light');
            
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
        const applyDynamicLighting = () => {
            const front = document.getElementById('face-front');
            const right = document.getElementById('face-right');
            const left = document.getElementById('face-left');
            
            // Calculate light intensity based on rotation angle (0 to 180 map)
            const rotY = window.cubeRotation.y % 360;
            const normalizedY = rotY < 0 ? rotY + 360 : rotY;
            
            if(front) front.style.filter = `brightness(${100 - Math.min(60, Math.abs(normalizedY > 180 ? normalizedY - 360 : normalizedY))}%)`;
            if(right) right.style.filter = `brightness(${40 + Math.min(60, Math.abs((normalizedY - 90) % 180))}%)`;
            if(left) left.style.filter = `brightness(${40 + Math.min(60, Math.abs((normalizedY + 90) % 180))}%)`;
        };

        scene.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
            window.cubeRotation.x -= deltaMove.y * 0.5; // Up/Down
            window.cubeRotation.y += deltaMove.x * 0.5; // Left/Right
            cube.style.transform = `rotateX(${window.cubeRotation.x}deg) rotateY(${window.cubeRotation.y}deg)`;
            previousMousePosition = { x: e.offsetX, y: e.offsetY };
            applyDynamicLighting();
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
    // 13. ADVANCED FLUID CURSOR (Jet & Vapor Clouds)
    // ==========================================
    // Desktop Feature
    if (window.matchMedia("(min-width: 768px)").matches) {
        const cursor = document.getElementById('customCursor');
        const follower = document.getElementById('cursorFollower');
        
        // 1. Setup the High-Performance Cloud Canvas
        const cloudCanvas = document.createElement('canvas');
        cloudCanvas.id = 'cloudCanvas';
        cloudCanvas.className = 'fixed top-0 left-0 w-full h-full pointer-events-none z-[99997] transition-opacity duration-300';
        document.body.appendChild(cloudCanvas);
        const ctx = cloudCanvas.getContext('2d', { alpha: true });
        
        let width = window.innerWidth;
        let height = window.innerHeight;
        cloudCanvas.width = width;
        cloudCanvas.height = height;
        
        window.addEventListener('resize', () => {
            width = window.innerWidth;
            height = window.innerHeight;
            cloudCanvas.width = width;
            cloudCanvas.height = height;
        });

        let particles = [];
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let followerX = mouseX;
        let followerY = mouseY;
        let currentAngle = 0;
        let targetAngle = 0;

        document.addEventListener('mousemove', (e) => {
            if (!document.body.classList.contains('has-custom-cursor')) {
                document.body.classList.add('has-custom-cursor');
            }
            
            const dx = e.clientX - mouseX;
            const dy = e.clientY - mouseY;
            const speed = Math.sqrt(dx * dx + dy * dy); // Calculate mouse speed
            
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Calculate flight angle
            if (speed > 2) { 
                targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            }

            // 2. Spawn Clouds if the Jet is flying fast enough
            if (speed > 8) { 
                // Calculate the exact 'tail' of the jet to spawn clouds from behind it
                const tailX = mouseX - Math.cos(currentAngle * (Math.PI / 180)) * 20;
                const tailY = mouseY - Math.sin(currentAngle * (Math.PI / 180)) * 20;

                // Create a new cloud particle
                particles.push({
                    x: tailX,
                    y: tailY,
                    radius: Math.min(speed * 0.4, 15) + 5, // Faster = bigger clouds
                    opacity: 0.6,
                    growth: 0.3,    // How fast the cloud expands
                    fadeRate: 0.015 // How fast it fades into the sky
                });
            }
        });

        // 3. The 60fps Physics Rendering Loop
        function animateFlightEngine() {
            // Smoothly interpolate the Angle
            let deltaAngle = targetAngle - currentAngle;
            deltaAngle = Math.atan2(Math.sin(deltaAngle * Math.PI / 180), Math.cos(deltaAngle * Math.PI / 180)) * (180 / Math.PI);
            currentAngle += deltaAngle * 0.15; 

            // Smoothly pull the vapor trail behind the mouse
            followerX += (mouseX - followerX) * 0.2; 
            followerY += (mouseY - followerY) * 0.2;
            
            // Apply coordinates to DOM Jet
            if(cursor) cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) rotate(${currentAngle}deg) translate(-50%, -50%)`;
            if(follower) follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) rotate(${currentAngle}deg) translate(-20px, -50%)`;
            
            // Render the Vapor Clouds
            ctx.clearRect(0, 0, width, height);
            const isDark = document.documentElement.classList.contains('dark');

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                
                // Create a beautiful radial gradient (Soft center, fading edges)
                let gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                if (isDark) {
                    gradient.addColorStop(0, `rgba(96, 122, 251, ${p.opacity})`); // Glowing blue clouds in dark mode
                    gradient.addColorStop(1, `rgba(96, 122, 251, 0)`);
                } else {
                    gradient.addColorStop(0, `rgba(167, 192, 255, ${p.opacity})`); // Soft white/blue in light mode
                    gradient.addColorStop(1, `rgba(167, 192, 255, 0)`);
                }

                ctx.fillStyle = gradient;
                ctx.fill();

                // Apply physics
                p.radius += p.growth;
                p.opacity -= p.fadeRate;

                // Delete clouds that have fully evaporated
                if (p.opacity <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }

            requestAnimationFrame(animateFlightEngine);
        }
        animateFlightEngine();

        // Hover Effects: Jet reacts to buttons
        const clickables = document.querySelectorAll('a, button, input, textarea, select, .product-card');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if(cursor) cursor.classList.add('scale-150', 'text-indigo-600');
                if(follower) follower.classList.add('w-20', 'opacity-100');
                cloudCanvas.style.opacity = '0'; // Hide clouds when hovering over UI
            });
            el.addEventListener('mouseleave', () => {
                if(cursor) cursor.classList.remove('scale-150', 'text-indigo-600');
                if(follower) follower.classList.remove('w-20', 'opacity-100');
                cloudCanvas.style.opacity = '1';
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
        // FIX: Added Math.max to prevent negative volume/container load
        const l = Math.max(0, parseFloat(document.getElementById('cbmL')?.value) || 0);
        const w = Math.max(0, parseFloat(document.getElementById('cbmW')?.value) || 0);
        const h = Math.max(0, parseFloat(document.getElementById('cbmH')?.value) || 0);
        const qty = Math.max(0, parseFloat(document.getElementById('cbmQty')?.value) || 1);
        
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

        // 6. 2D Pallet Visualiser
        const palletBox = document.getElementById('palletVisualizerBox');
        const canvas = document.getElementById('palletCanvas');
        
        if (palletBox && canvas && l > 0 && w > 0) {
            palletBox.classList.remove('hidden');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw Pallet Wood Slats (Visual texture)
            ctx.fillStyle = "#c2a88f";
            for(let i=10; i<360; i+=40) { ctx.fillRect(i, 0, 20, 240); }
            
            // Standard EUR Pallet = 120cm x 80cm
            // Scale: 1cm = 3 pixels (360x240 canvas)
            const pL = 120, pW = 80;
            
            // Layout Option A (Length along 120)
            const colsA = Math.floor(pL / l);
            const rowsA = Math.floor(pW / w);
            const totalA = colsA * rowsA;
            
            // Layout Option B (Width along 120 - Rotated)
            const colsB = Math.floor(pL / w);
            const rowsB = Math.floor(pW / l);
            const totalB = colsB * rowsB;
            
            // Choose the layout that fits the most boxes
            const isRotated = totalB > totalA;
            const finalCols = isRotated ? colsB : colsA;
            const finalRows = isRotated ? rowsB : rowsA;
            const boxL = isRotated ? w : l;
            const boxW = isRotated ? l : w;
            const totalBoxes = finalCols * finalRows;
            
            // Calculate Efficiency
            const usedArea = totalBoxes * (l * w);
            const totalArea = pL * pW;
            const efficiency = Math.round((usedArea / totalArea) * 100);
            
            // Draw the boxes
            const pxL = boxL * 3; // Convert cm to pixels
            const pxW = boxW * 3;
            
            // Center the payload on the pallet
            const startX = (360 - (finalCols * pxL)) / 2;
            const startY = (240 - (finalRows * pxW)) / 2;

            for (let c = 0; c < finalCols; c++) {
                for (let r = 0; r < finalRows; r++) {
                    const x = startX + (c * pxL);
                    const y = startY + (r * pxW);
                    
                    // Box Fill
                    ctx.fillStyle = "rgba(59, 130, 246, 0.85)"; // Blue box
                    ctx.fillRect(x, y, pxL, pxW);
                    
                    // Box Border
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(x, y, pxL, pxW);
                    
                    // Tape line in middle
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x + (pxL/2), y);
                    ctx.lineTo(x + (pxL/2), y + pxW);
                    ctx.stroke();
                }
            }
            
            // Update UI text
            document.getElementById('boxesPerLayerTxt').innerText = totalBoxes;
            document.getElementById('palletEfficiencyTxt').innerText = efficiency + '%';
        } else if (palletBox) {
            palletBox.classList.add('hidden');
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
    window.showToast("Initializing PDF Engine... Please wait.", "info");

    // 1. Function to actually generate the PDF once library is loaded
    const generatePDF = () => {
        const tons = Math.max(0, parseFloat(document.getElementById('esgTons').value) || 0);
        const trees = document.getElementById('esgTrees').innerText;
        const water = document.getElementById('esgWater').innerText;
        const energy = document.getElementById('esgEnergy').innerText;

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
        
        // Render physically in DOM, hidden far off-screen
        element.style.position = 'absolute';
        element.style.top = '-9999px';
        element.style.left = '-9999px';
        element.style.opacity = '1'; // MUST BE 1 FOR THE PDF TO RENDER TEXT
        element.style.zIndex = '-10000';
        element.style.pointerEvents = 'none';
        document.body.appendChild(element);
        
        html2pdf().set({
            margin: 10,
            filename: 'Abrar_Traders_CSR_Impact.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save().then(() => {
            document.body.removeChild(element);
            window.showToast("Certificate Downloaded Successfully!", "success");
        });
    };

    // 2. Check if library is already loaded
    if (typeof html2pdf !== 'undefined') {
        generatePDF();
    } else {
        // 3. Lazy Load the Script
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => {
            window.showToast("Generating PDF Certificate...", "success");
            generatePDF();
        };
        script.onerror = () => window.showToast("Failed to load PDF engine. Check connection.", "info");
        document.body.appendChild(script);
    }
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
window.openARViewer = () => { 
    const modal = document.getElementById('arViewerModal');
    modal.classList.remove('hidden'); 
    modal.classList.add('flex'); 
    document.body.style.overflow = 'hidden'; 
};

window.closeARViewer = () => {
    document.getElementById('arViewerModal').classList.add('hidden'); 
    document.getElementById('arViewerModal').classList.remove('flex'); 
    document.body.style.overflow = ''; 
};

// --- FEATURE 6: TRUE AI SUPPLY CHAIN ASSISTANT ARCHITECTURE ---
let chatHistory = [
    { role: "system", content: "You are the Abrar Traders AI Assistant. You are an expert in paper packaging, GSM, Burst Factor, Kraft paper, Duplex Board, and logistics. Be helpful, professional, and concise." }
];

window.toggleChat = () => {
    const chat = document.getElementById('aiChatWindow');
    if(chat.classList.contains('opacity-0')) {
        chat.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
        if (window.innerWidth > 768) {
            document.getElementById('chatInput').focus();
        }
    } else {
        chat.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
    }
};

window.handleChatEnter = (e) => { 
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevents new line
        sendChatMessage(); 
    }
};

window.sendChatMessage = async () => {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if(!msg) return;
    
    const log = document.getElementById('chatLog');
    
    // 1. Add User Message to UI
    log.innerHTML += `<div class="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-2xl rounded-tr-none self-end max-w-[85%] shadow-md transform transition-all animate-slide-up">${msg}</div>`;
    input.value = '';
    input.style.height = 'auto'; 
    log.scrollTop = log.scrollHeight;

    // 2. Add User Message to LLM History Array
    chatHistory.push({ role: "user", content: msg });

    // 3. Show "AI is thinking..." indicator
    const typingId = 'typing-' + Date.now();
    log.innerHTML += `
        <div id="${typingId}" class="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] flex items-center gap-2 animate-pulse">
            <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span class="w-2 h-2 bg-blue-500 rounded-full" style="animation-delay: 0.2s"></span>
            <span class="w-2 h-2 bg-blue-600 rounded-full" style="animation-delay: 0.4s"></span>
        </div>`;
    log.scrollTop = log.scrollHeight;

    // 4. REAL GEMINI API INTEGRATION
    const API_KEY = "AIzaSyAUOLlYaefxxfh0Io6_MBLCyRIiYT1Ll0w"; 
    
    const formattedHistory = chatHistory.filter(msg => msg.role !== "system").map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
    }));

    const systemInstruction = chatHistory.find(msg => msg.role === "system").content;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: formattedHistory
            })
        });

        const data = await response.json();
        
        const typingIndicator = document.getElementById(typingId);
        if(typingIndicator) typingIndicator.remove();

        if (data.error) throw new Error(data.error.message);

        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Convert Markdown bold/newlines to HTML
        const formattedHTMLResponse = aiResponse
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        // Add action buttons to the AI response
        const actionHtml = `<div class="mt-4 flex gap-2 border-t border-blue-200/50 dark:border-slate-700 pt-3">
            <a href="#quote" onclick="toggleChat()" class="text-xs bg-white dark:bg-slate-700 text-blue-600 dark:text-white px-3 py-1.5 rounded-md font-bold hover:bg-blue-50 transition border border-gray-200 dark:border-slate-600 shadow-sm">Get a Quote</a>
            <a href="#calculator" onclick="toggleChat(); switchTab('weight');" class="text-xs bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-md font-bold hover:bg-gray-50 transition border border-gray-200 dark:border-slate-600 shadow-sm">Calculate Weight</a>
        </div>`;

        // 5. Render AI Response to UI
        log.innerHTML += `
            <div class="bg-blue-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] border border-blue-100 dark:border-slate-700 shadow-sm animate-fade-in">
                ${formattedHTMLResponse}
                ${actionHtml}
            </div>`;
        
        // 6. Add AI Response to LLM History Array
        chatHistory.push({ role: "assistant", content: aiResponse });
        log.scrollTop = log.scrollHeight;

    } catch (error) {
        const typingIndicator = document.getElementById(typingId);
        if(typingIndicator) typingIndicator.remove();
        console.error("Gemini API Error:", error);
        log.innerHTML += `
            <div class="bg-red-50 text-red-600 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] text-xs">
                Connection error or Invalid API Key. Please try again later.
            </div>`;
        log.scrollTop = log.scrollHeight;
    }
};
    

window.drawDieCut = () => {
    // Get positive values only
    const l = Math.max(10, parseFloat(document.getElementById('dieL').value) || 200);
    const w = Math.max(10, parseFloat(document.getElementById('dieW').value) || 150);
    const h = Math.max(10, parseFloat(document.getElementById('dieH').value) || 100);
    
    // Standard RSC calculations
    const flap = w / 2; // Top and bottom flaps meet in the middle
    const glueTab = 30; // Standard 30mm glue tab
    const totalW = glueTab + (l * 2) + (w * 2);
    const totalH = h + (flap * 2);

    // Padding for the canvas so it doesn't touch the edges
    const pad = 20; 

    // Create SVG Elements
    const svgContent = `
        <svg id="generatedSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW + (pad*2)} ${totalH + (pad*2)}" class="w-full max-w-full h-auto" style="max-height: 50vh;">
            <style>
                .cut { stroke: #111827; stroke-width: 2; fill: none; stroke-linejoin: round; }
                .fold { stroke: #ef4444; stroke-width: 2; stroke-dasharray: 8,6; fill: none; }
                .dark-mode .cut { stroke: #f9fafb; }
            </style>
            
            <g transform="translate(${pad}, ${pad})">
                <line class="fold" x1="${glueTab}" y1="${flap}" x2="${totalW}" y2="${flap}" />
                <line class="fold" x1="${glueTab}" y1="${flap + h}" x2="${totalW}" y2="${flap + h}" />
                
                <line class="fold" x1="${glueTab}" y1="${flap}" x2="${glueTab}" y2="${flap + h}" />
                <line class="fold" x1="${glueTab + l}" y1="${flap}" x2="${glueTab + l}" y2="${flap + h}" />
                <line class="fold" x1="${glueTab + l + w}" y1="${flap}" x2="${glueTab + l + w}" y2="${flap + h}" />
                <line class="fold" x1="${glueTab + (l*2) + w}" y1="${flap}" x2="${glueTab + (l*2) + w}" y2="${flap + h}" />

                <path class="cut" d="M ${glueTab} ${flap} L 0 ${flap + 10} L 0 ${flap + h - 10} L ${glueTab} ${flap + h}" />
                
                <path class="cut" d="M ${glueTab} ${flap} L ${glueTab} 0 L ${glueTab + l} 0 L ${glueTab + l} ${flap}" />
                <path class="cut" d="M ${glueTab + l} ${flap} L ${glueTab + l} 0 L ${glueTab + l + w} 0 L ${glueTab + l + w} ${flap}" />
                <path class="cut" d="M ${glueTab + l + w} ${flap} L ${glueTab + l + w} 0 L ${glueTab + (l*2) + w} 0 L ${glueTab + (l*2) + w} ${flap}" />
                <path class="cut" d="M ${glueTab + (l*2) + w} ${flap} L ${glueTab + (l*2) + w} 0 L ${totalW} 0 L ${totalW} ${flap}" />
                
                <path class="cut" d="M ${glueTab} ${flap + h} L ${glueTab} ${totalH} L ${glueTab + l} ${totalH} L ${glueTab + l} ${flap + h}" />
                <path class="cut" d="M ${glueTab + l} ${flap + h} L ${glueTab + l} ${totalH} L ${glueTab + l + w} ${totalH} L ${glueTab + l + w} ${flap + h}" />
                <path class="cut" d="M ${glueTab + l + w} ${flap + h} L ${glueTab + l + w} ${totalH} L ${glueTab + (l*2) + w} ${totalH} L ${glueTab + (l*2) + w} ${flap + h}" />
                <path class="cut" d="M ${glueTab + (l*2) + w} ${flap + h} L ${glueTab + (l*2) + w} ${totalH} L ${totalW} ${totalH} L ${totalW} ${flap + h}" />
                
                <line class="cut" x1="${totalW}" y1="${flap}" x2="${totalW}" y2="${flap + h}" />
            </g>
        </svg>
    `;
    
    document.getElementById('svgContainer').innerHTML = svgContent;
};

// Download logic
window.downloadSVG = () => {
    const svgElement = document.getElementById('generatedSvg');
    if (!svgElement) return;
    
    // Convert SVG to string
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    // Add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    
    // Create a download link
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AbrarTraders_BoxTemplate_${document.getElementById('dieL').value}x${document.getElementById('dieW').value}x${document.getElementById('dieH').value}mm.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.showToast("SVG Die-Line Downloaded!", "success");
};

    // ==========================================
    // 19. SMART NAV SCROLL LOGIC
    // ==========================================
    const nav = document.getElementById('mainNav');
    let lastScrollY = window.scrollY;

    if (nav) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add shrink/shadow effect when not at the top
            if (currentScrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            // Hide nav when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 300) {
                nav.style.transform = 'translateY(-150%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    // ==========================================
    // 14. NEXT-GEN UI: 3D REEL, TILT & MAGNETIC BUTTONS
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        
        // --- A. 3D PRODUCT CARD TILT ---
        // Activates the vanilla-tilt.js library you already linked in the HTML head
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll(".product-card"), {
                max: 12,           // Maximum tilt rotation
                speed: 400,        // Speed of the enter/exit transition
                glare: true,       // Adds a glass reflection
                "max-glare": 0.2,  // Maximum opacity of the reflection
                perspective: 1000
            });
        }

        // --- B. MAGNETIC BUTTON PHYSICS ---
        const magneticButtons = document.querySelectorAll('.action-button');
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const h = rect.width / 2;
                const v = rect.height / 2;
                
                // Calculate mouse position relative to center of button
                const x = e.clientX - rect.left - h;
                const y = e.clientY - rect.top - v;
                
                // Remove CSS transition for instant snappy follow, apply magnetic pull
                btn.style.transition = 'none';
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                // Restore CSS transition for an elastic snap-back
                btn.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                btn.style.transform = `translate(0px, 0px)`;
            });
        });

        // --- C. 3D SCROLLING PAPER REEL ENGINE ---
        const unrolledPaper = document.getElementById('unrolledPaper');
        const reelCylinder = document.getElementById('reelCylinder');
        const scrollReelWrapper = document.getElementById('scrollReelWrapper');
        const reelText = document.getElementById('reelText');
        
        if (unrolledPaper && reelCylinder && scrollReelWrapper) {
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                
                // 1. Unroll the paper (increases height dynamically as you scroll down)
                const baseHeight = window.innerHeight * 0.15;
                const stretchAmount = baseHeight + (scrollY * 1.8);
                unrolledPaper.style.height = `${stretchAmount}px`;
                
                // 2. Bend Physics (Starts bent back into the screen, flattens out as it unrolls)
                const bendAngle = Math.max(50 - (scrollY * 0.08), 0);
                unrolledPaper.style.transform = `rotateX(${bendAngle}deg)`;
                
                // 3. Cylinder Spin (Shifts the metallic background gradient to simulate rolling)
                const spin = scrollY * 0.8;
                reelCylinder.style.backgroundPosition = `0px ${spin}px`;
                
                // 4. Parallax the entire unit (Moves up slightly slower than the user scrolls)
                scrollReelWrapper.style.transform = `translateY(${scrollY * 0.4}px)`;

                // 5. Fade in the watermark text when unrolled deep enough
                if (scrollY > 300 && reelText) {
                    reelText.style.opacity = Math.min((scrollY - 300) / 200, 0.4); 
                    reelText.style.transform = `translateY(${scrollY * 0.2}px)`; 
                } else if (reelText) {
                    reelText.style.opacity = '0';
                }
            });
        }
    });
});

































