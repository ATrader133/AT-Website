// main.js

document.addEventListener('DOMContentLoaded', function() {
    // --- PRELOADER ---
    const spinner = document.getElementById('spinner');
    if (spinner) {
        window.addEventListener('load', () => {
            spinner.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => spinner.style.display = 'none', 500);
        });
    }

    // --- ANIMATE ON SCROLL INITIALIZATION ---
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50,
        });
    }

    // --- TYPED.JS FOR HERO SECTION ---
    if (document.getElementById('typed')) {
        new Typed('#typed', {
            strings: [
                'Your Trusted Partner in Paper & Packaging.',
                'Supplying Quality Kraft & Duplex Paper.',
                'Eco-Friendly Solutions for Your Business.',
                'Serving Industries Across India.'
            ],
            typeSpeed: 50,
            backSpeed: 25,
            backDelay: 2000,
            loop: true,
            smartBackspace: true
        });
    }

    // --- STICKY NAVIGATION & ACTIVE LINK HIGHLIGHTING ---
    const nav = document.querySelector('.sticky-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 100) {
                currentSection = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === currentSection) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // --- SCROLL PROGRESS BAR ---
    const progressBar = document.getElementById('progressBar');
    const updateProgressBar = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    };
    window.addEventListener('scroll', updateProgressBar);

    // --- MOBILE MENU TOGGLE ---
    const menuButton = document.getElementById('menuButton');
    const closeMenuButton = document.getElementById('closeMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const mobileNavLinks = mobileMenu.querySelectorAll('.nav-link');

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
    menuButton.addEventListener('click', () => toggleMenu());
    closeMenuButton.addEventListener('click', () => toggleMenu(true));
    menuBackdrop.addEventListener('click', () => toggleMenu(true));
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (link.getAttribute('href').startsWith('#')) {
                toggleMenu(true);
            }
        });
    });

    // --- PRODUCT FILTERING ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productItems = document.querySelectorAll('.product-item');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            button.classList.add('bg-blue-600', 'text-white');
            button.classList.remove('bg-gray-200', 'text-gray-700');
            productItems.forEach(item => {
                item.style.display = (filter === 'all' || item.dataset.category.includes(filter)) ? 'block' : 'none';
            });
        });
    });

    // --- PRODUCT MODAL ---
    const productCards = document.querySelectorAll('.product-card');
    const productModal = document.getElementById('productModal');
    const productModalBackdrop = document.getElementById('productModalBackdrop');
    const closeProductModalBtn = document.getElementById('closeProductModal');
    
    const modalName = document.getElementById('modalProductName');
    const modalImage = document.getElementById('modalProductImage');
    const modalDescription = document.getElementById('modalProductDescription');
    const modalSpecs = document.getElementById('modalProductSpecifications');
    const modalInfo = document.getElementById('modalProductAdditionalInfo');
    const modalQuoteButton = document.getElementById('modalQuoteButton');
    const quoteProductInput = document.getElementById('quoteProduct');

    const openModal = (card) => {
        const cardData = card.dataset;
        modalName.textContent = cardData.name;
        modalImage.src = cardData.image;
        modalImage.alt = cardData.name;
        modalDescription.textContent = cardData.description;
        modalInfo.textContent = cardData.additionalInfo;

        modalSpecs.innerHTML = ''; // Clear previous specs
        try {
            const specs = JSON.parse(cardData.specifications);
            specs.forEach(spec => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${spec.label}:</strong> ${spec.value}`;
                modalSpecs.appendChild(li);
            });
        } catch (e) {
            console.error('Could not parse product specifications:', e);
            modalSpecs.innerHTML = '<li>Specifications not available.</li>';
        }

        modalQuoteButton.onclick = () => {
            quoteProductInput.value = cardData.name;
            closeModal();
            document.getElementById('quote').scrollIntoView({ behavior: 'smooth' });
        };

        productModal.classList.add('open');
        productModalBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        productModal.classList.remove('open');
        productModalBackdrop.classList.remove('open');
        document.body.style.overflow = '';
    };

    productCards.forEach(card => card.addEventListener('click', () => openModal(card)));
    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeModal);
    }
    if (productModalBackdrop) {
        productModalBackdrop.addEventListener('click', closeModal);
    }

    
   document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. GLOBAL VARIABLES & TRANSLATIONS
    // ==========================================
    let basket = JSON.parse(localStorage.getItem('at_basket')) || [];
    let currentUnit = 'cm'; // Default unit for calculator

    const translations = {
        en: {
            nav_home: "Home", nav_products: "Products", nav_calculator: "Calculator",
            hero_title: "ABRAR TRADERS", hero_btn_explore: "Explore Products",
            calc_title: "Paper Weight Calculator", calc_btn: "Calculate Weight"
        },
        hi: {
            nav_home: "होम", nav_products: "उत्पाद", nav_calculator: "कैलकुलेटर",
            hero_title: "अब्रार ट्रेडर्स", hero_btn_explore: "उत्पाद देखें",
            calc_title: "कागज वजन कैलकुलेटर", calc_btn: "वजन की गणना करें"
        }
    };

    // ==========================================
    // 2. HELPER FUNCTIONS (Attached to Window)
    // ==========================================

    // --- Language Switcher ---
    const langSelector = document.getElementById('languageSelector');
    if(langSelector) {
        langSelector.addEventListener('change', (e) => {
            const lang = e.target.value;
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if(translations[lang] && translations[lang][key]) {
                    el.textContent = translations[lang][key];
                }
            });
        });
    }

    // --- Tab Switching Logic ---
    window.switchTab = (tabName) => {
        const btnWeight = document.getElementById('tab-weight');
        const btnReel = document.getElementById('tab-reel');
        const contentWeight = document.getElementById('tool-weight');
        const contentReel = document.getElementById('tool-reel');

        // Styles for active/inactive tabs
        const activeClass = "px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-md bg-white text-blue-600";
        const inactiveClass = "px-6 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-blue-600 transition-all";
        const activeReelClass = "px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-md bg-white text-yellow-600";

        if (tabName === 'weight') {
            btnWeight.className = activeClass;
            btnReel.className = inactiveClass;
            contentWeight.classList.remove('hidden');
            contentReel.classList.add('hidden');
        } else {
            btnWeight.className = inactiveClass;
            btnReel.className = activeReelClass;
            contentWeight.classList.add('hidden');
            contentReel.classList.remove('hidden');
        }
    };

    // --- Calculator Unit Toggling ---
    window.setUnit = (unit) => {
        currentUnit = unit;
        
        const btnCm = document.getElementById('btn-cm');
        const btnMm = document.getElementById('btn-mm');
        const btnInch = document.getElementById('btn-inch');
        const labelL = document.getElementById('labelLength');
        const labelW = document.getElementById('labelWidth');

        // Reset Styles
        const baseClass = "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all";
        const activeStyle = `${baseClass} bg-blue-600 text-white shadow-md transform scale-105`;
        const inactiveStyle = `${baseClass} text-gray-500 hover:text-blue-600`;

        // Apply Styles
        if (btnCm) btnCm.className = (unit === 'cm') ? activeStyle : inactiveStyle;
        if (btnMm) btnMm.className = (unit === 'mm') ? activeStyle : inactiveStyle;
        if (btnInch) btnInch.className = (unit === 'inch') ? activeStyle : inactiveStyle;

        // Update Labels
        if (labelL) labelL.textContent = `(${unit})`;
        if (labelW) labelW.textContent = `(${unit})`;

        // Clear Inputs
        ['calcLength', 'calcWidth', 'sizePreset', 'calcGsm', 'calcQty'].forEach(id => {
            const el = document.getElementById(id);
            if(el && (id !== 'calcGsm' && id !== 'calcQty')) el.value = ''; 
        });
        const moqStatus = document.getElementById('moqStatus');
        if(moqStatus) moqStatus.textContent = '';
    };

    // --- Apply Size Presets ---
    window.applyPreset = () => {
        const preset = document.getElementById('sizePreset').value;
        const lInput = document.getElementById('calcLength');
        const wInput = document.getElementById('calcWidth');

        if (!preset) return;

        if (preset === 'A4') {
            window.setUnit('mm');
            wInput.value = 210;
            lInput.value = 297;
        } else if (preset === 'A3') {
            window.setUnit('mm');
            wInput.value = 297;
            lInput.value = 420;
        } else if (['23x36', '25x36', '30x40'].includes(preset)) {
            window.setUnit('inch');
            const [w, h] = preset.split('x');
            wInput.value = w;
            lInput.value = h;
        }
    };

    // --- WEIGHT CALCULATION (Tab 1) ---
    window.calculateWeight = () => {
        const l = parseFloat(document.getElementById('calcLength').value) || 0;
        const w = parseFloat(document.getElementById('calcWidth').value) || 0;
        const gsm = parseFloat(document.getElementById('calcGsm').value) || 0;
        const qty = parseFloat(document.getElementById('calcQty').value) || 0;
        
        let lengthMeters = 0;
        let widthMeters = 0;

        // Convert inputs to Meters based on currentUnit
        if (currentUnit === 'cm') {
            lengthMeters = l / 100;
            widthMeters = w / 100;
        } else if (currentUnit === 'mm') {
            lengthMeters = l / 1000;
            widthMeters = w / 1000;
        } else if (currentUnit === 'inch') {
            lengthMeters = l * 0.0254;
            widthMeters = w * 0.0254;
        }

        const weightPerSheetGrams = (lengthMeters * widthMeters) * gsm;
        const totalWeightKg = (weightPerSheetGrams * qty) / 1000;

        // Display MOQ Status
        const moqStatus = document.getElementById('moqStatus');
        const moqLimit = 1000; // 1 MT
        if(moqStatus) {
            if (totalWeightKg === 0) {
                moqStatus.textContent = "";
            } else if (totalWeightKg < moqLimit) {
                moqStatus.innerHTML = `<span class="text-red-500 font-bold">⚠️ Below MOQ (${(moqLimit - totalWeightKg).toFixed(1)}kg short)</span>`;
            } else {
                moqStatus.innerHTML = `<span class="text-green-600 font-bold">✅ MOQ Met (1 MT+)</span>`;
            }
        }

        // Animate Result
        const resTotal = document.getElementById('resTotal');
        if(resTotal) {
            let start = 0;
            const end = totalWeightKg;
            const duration = 800;
            const startTime = performance.now();

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                
                const currentVal = (ease * end).toFixed(2);
                resTotal.innerHTML = `${currentVal} <span class="text-xl text-blue-600 font-bold">kg</span>`;
                
                if (progress < 1) requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
        }
    };

    // --- REEL TO SHEET CALCULATION (Tab 2) ---
    window.calculateReel = () => {
        const rWeight = parseFloat(document.getElementById('reelWeight').value) || 0;
        const rWidth = parseFloat(document.getElementById('reelWidth').value) || 0;
        const rGsm = parseFloat(document.getElementById('reelGsm').value) || 0;
        const cutLen = parseFloat(document.getElementById('cutLength').value) || 0;

        if (rWeight === 0 || rWidth === 0 || rGsm === 0) {
            alert("Please enter Reel Weight, Width and GSM.");
            return;
        }

        // 1. Total Area (m2) = Weight(kg) * 1000 / GSM
        const totalAreaM2 = (rWeight * 1000) / rGsm;

        // 2. Linear Length (m) = Area / (Width_cm / 100)
        const totalLengthMeters = totalAreaM2 / (rWidth / 100);

        // 3. Sheets = Length(m) / (CutLen_cm / 100)
        let totalSheets = 0;
        if (cutLen > 0) {
            totalSheets = totalLengthMeters / (cutLen / 100);
        }

        // Update UI
        const resLen = document.getElementById('resReelLength');
        const resSheets = document.getElementById('resSheets');

        if(resLen) resLen.innerHTML = `${Math.floor(totalLengthMeters)} <span class="text-sm">meters</span>`;
        if(resSheets) resSheets.innerHTML = `${Math.floor(totalSheets)} <span class="text-xl text-yellow-600">pcs</span>`;
    };

    // ==========================================
    // 3. BASKET & MODAL LOGIC
    // ==========================================

    const updateBasketUI = () => {
        const basketCount = document.getElementById('basketCount');
        const basketBtn = document.getElementById('quoteBasket');
        const quoteInput = document.getElementById('quoteProduct');
        
        if(basketCount) basketCount.textContent = basket.length;
        
        if (basketBtn) {
            if(basket.length > 0) {
                basketBtn.classList.remove('hidden');
                basketBtn.classList.add('flex');
            } else {
                basketBtn.classList.add('hidden');
            }
        }
        
        if(quoteInput && basket.length > 0) {
            quoteInput.value = basket.join(', ');
        }
        localStorage.setItem('at_basket', JSON.stringify(basket));
    };

    window.addToBasket = (productName) => {
        if(!basket.includes(productName)) {
            basket.push(productName);
            updateBasketUI();
        } else {
            alert("Item already in basket.");
        }
    };
    
    // Initial Basket Load
    updateBasketUI();
    const basketBtn = document.getElementById('quoteBasket');
    if(basketBtn) basketBtn.addEventListener('click', () => document.getElementById('quote').scrollIntoView({behavior: 'smooth'}));

    // --- Modal Logic ---
    const productCards = document.querySelectorAll('.product-card');
    const productModal = document.getElementById('productModal');
    const productModalBackdrop = document.getElementById('productModalBackdrop');
    const closeProductModalBtn = document.getElementById('closeProductModal');

    // Modal Elements
    const modalName = document.getElementById('modalProductName');
    const modalImage = document.getElementById('modalProductImage');
    const modalDescription = document.getElementById('modalProductDescription');
    const modalSpecs = document.getElementById('modalProductSpecifications');
    const modalAddBtn = document.getElementById('modalAddToBasket');
    const relatedSection = document.getElementById('relatedProducts');
    const relatedGrid = document.getElementById('relatedProductsGrid');

    const openModal = (card) => {
        const data = card.dataset;
        if(modalName) modalName.textContent = data.name;
        if(modalImage) modalImage.src = data.image;
        if(modalDescription) modalDescription.textContent = data.description;
        
        if(modalSpecs) {
            modalSpecs.innerHTML = '';
            try {
                JSON.parse(data.specifications).forEach(spec => {
                    modalSpecs.innerHTML += `<li class="flex justify-between border-b border-blue-50 py-1"><span>${spec.label}</span><span class="font-bold text-slate-700">${spec.value}</span></li>`;
                });
            } catch(e) {}
        }

        if(modalAddBtn) {
            modalAddBtn.onclick = () => {
                addToBasket(data.name);
                closeModal();
            };
        }

        // Related Products
        if(relatedGrid) {
            relatedGrid.innerHTML = '';
            const currentCategory = data.category;
            const related = Array.from(productCards).filter(c => c.dataset.category === currentCategory && c.dataset.name !== data.name);
            
            if (related.length > 0) {
                relatedSection.classList.remove('hidden');
                related.slice(0, 2).forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'group flex gap-3 items-center p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition';
                    div.innerHTML = `
                        <img src="${item.dataset.image}" class="w-16 h-16 rounded-lg object-cover shadow-sm">
                        <div><span class="text-sm font-bold text-slate-700 group-hover:text-blue-700 block">${item.dataset.name}</span><span class="text-xs text-blue-500">View</span></div>`;
                    div.onclick = () => {
                        closeModal();
                        setTimeout(() => openModal(item), 300);
                    };
                    relatedGrid.appendChild(div);
                });
            } else {
                relatedSection.classList.add('hidden');
            }
        }

        if(productModal) productModal.classList.add('open');
        if(productModalBackdrop) productModalBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        if(productModal) productModal.classList.remove('open');
        if(productModalBackdrop) productModalBackdrop.classList.remove('open');
        document.body.style.overflow = '';
    };

    productCards.forEach(card => card.addEventListener('click', () => openModal(card)));
    if(closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeModal);
    if(productModalBackdrop) productModalBackdrop.addEventListener('click', closeModal);

    // ==========================================
    // 4. INITIALIZATION (Tilt, AOS, Typed, Preloader)
    // ==========================================
    
    // Tilt
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".product-card"), {
            max: 5, speed: 400, glare: true, "max-glare": 0.2,
        });
    }

    // AOS
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });

    // Typed.js
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
            spinner.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => spinner.style.display = 'none', 500);
        });
    }
    
    // Catalogue Download Mock
    window.downloadCatalog = () => {
        const email = prompt("Enter your email to unlock the brochure download:");
        if (email && email.includes('@')) {
            alert("Brochure sent to " + email);
        } else if (email) {
            alert("Please enter a valid email address.");
        }
    };
});

    // --- SPLIDE.JS CAROUSEL FOR REVIEWS ---
    if (document.querySelector('.splide')) {
        new Splide('.splide', {
            type: 'loop', perPage: 3, perMove: 1, gap: '1.5rem',
            pagination: true, arrows: false, autoplay: true, interval: 5000, pauseOnHover: true,
            breakpoints: { 1024: { perPage: 2 }, 768: { perPage: 1 } },
        }).mount();
    }

    // --- SOCIAL SIDEBAR MINIMIZE ON SCROLL ---
    const socialSidebar = document.getElementById('socialSidebar');
    if (socialSidebar) {
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            let st = window.pageYOffset || document.documentElement.scrollTop;
            socialSidebar.classList.toggle('minimized', st > lastScrollTop && st > 200);
            lastScrollTop = st <= 0 ? 0 : st;
        }, false);
    }
    
    // --- TSPARTICLES BACKGROUND ---
    if (typeof tsParticles !== 'undefined' && document.getElementById('tsparticles')) {
        tsParticles.load("tsparticles", {
            fpsLimit: 60,
            particles: {
                number: { value: 30, density: { enable: true, value_area: 800 } },
                color: { value: ["#607afb", "#8e9bfa", "#a78bfa"] },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 5, random: true },
                move: { enable: true, speed: 1, direction: "none", random: true, straight: false, out_mode: "out" },
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "bubble" }, resize: true },
                modes: { bubble: { distance: 200, size: 8, duration: 2, opacity: 0.8 } },
            },
            retina_detect: true,
        });
    }

    // --- QUOTE FORM SUBMISSION HANDLING (AJAX) ---
    const quoteForm = document.getElementById('quoteForm');
    const formStatus = document.getElementById('formStatus');
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const form = e.target;
            const data = new FormData(form);
            
            formStatus.innerHTML = 'Sending...';
            formStatus.style.color = '#333';

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formStatus.innerHTML = "Thank you! Your quote request has been sent.";
                    formStatus.style.color = 'green';
                    form.reset();
                } else {
                    const responseData = await response.json();
                    if (Object.hasOwn(responseData, 'errors')) {
                        formStatus.innerHTML = responseData.errors.map(error => error.message).join(", ");
                    } else {
                        formStatus.innerHTML = "Oops! There was a problem submitting your form.";
                    }
                    formStatus.style.color = 'red';
                }
            } catch (error) {
                formStatus.innerHTML = "Oops! There was a network error.";
                formStatus.style.color = 'red';
            }
        });
    }

    // --- FOOTER CURRENT YEAR ---
    const currentYear = document.getElementById('currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

});


