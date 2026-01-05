document.addEventListener('DOMContentLoaded', () => {
    console.log("ABRAR TRADERS: System Loaded");
    
    let currentUnit = 'cm';

    // ==========================================
    // 1. DYNAMIC ISLAND & SCROLL LOGIC
    // ==========================================
    const island = document.getElementById('dynamicIsland');
    const scrollBtn = document.getElementById('scrollTopBtn');
    const sidebar = document.getElementById('socialSidebar');

    if(island && scrollBtn) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            
            // Shrink Island
            if (y > 50) island.classList.add('scrolled'); 
            else island.classList.remove('scrolled');
            
            // Show Sidebar & Scroll Top
            if (y > 400) {
                if(sidebar) { 
                    sidebar.style.opacity = '1'; 
                    sidebar.style.transform = 'translateY(0)'; 
                }
                scrollBtn.classList.add('visible');
            } else {
                if(sidebar) { 
                    sidebar.style.opacity = '0'; 
                    sidebar.style.transform = 'translateY(80px)'; 
                }
                scrollBtn.classList.remove('visible');
            }
        }, { passive: true });

        scrollBtn.onclick = () => window.scrollTo({top:0, behavior:'smooth'});
    }

    // ==========================================
    // 2. MOBILE MENU LOGIC
    // ==========================================
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuLinks = document.querySelectorAll('.menu-item');

    function toggleMenu(show) {
        if(!mobileMenu) return;
        if(show) { 
            mobileMenu.classList.add('open'); 
            document.body.style.overflow = 'hidden'; 
        } else { 
            mobileMenu.classList.remove('open'); 
            document.body.style.overflow = ''; 
        }
    }

    if(menuBtn) menuBtn.onclick = () => toggleMenu(true);
    if(closeMenuBtn) closeMenuBtn.onclick = () => toggleMenu(false);
    menuLinks.forEach(l => l.onclick = () => toggleMenu(false));

    // ==========================================
    // 3. PRODUCT MODAL & QUOTE LOGIC
    // ==========================================
    const modal = document.getElementById('productModal');
    const backdrop = document.getElementById('productModalBackdrop');
    const closeProductBtn = document.getElementById('closeProductModal');
    const grabber = document.getElementById('closeProductGrabber');
    const quoteBtn = document.getElementById('modalAddToBasket');

    window.openModal = function(data) {
        if(!modal) return;
        document.getElementById('modalProductName').textContent = data.name;
        document.getElementById('modalProductImage').src = data.image;
        document.getElementById('modalProductDescription').textContent = data.description;
        document.getElementById('modalProductAdditionalInfo').textContent = data.additionalInfo;
        
        const specs = document.getElementById('modalProductSpecifications');
        if(specs) {
            specs.innerHTML = '';
            try {
                JSON.parse(data.specifications).forEach(s => {
                    specs.innerHTML += `<li class="flex justify-between border-b border-gray-100 py-2"><span>${s.label}</span><span class="font-bold text-gray-900">${s.value}</span></li>`;
                });
            } catch(e) {}
        }
        
        // Smart Quote Button: Scrolls to form and fills it
        if(quoteBtn) {
            // Remove old listener to prevent duplicates
            const newBtn = quoteBtn.cloneNode(true);
            quoteBtn.parentNode.replaceChild(newBtn, quoteBtn);
            
            newBtn.onclick = () => {
                triggerConfetti(); // Trigger confetti when adding!
                closeModal();
                const quoteSection = document.getElementById('quote');
                if(quoteSection) quoteSection.scrollIntoView({behavior: 'smooth'});
                const quoteInput = document.getElementById('quoteProduct');
                if(quoteInput) quoteInput.value = data.name;
            };
        }

        modal.classList.add('open'); 
        backdrop.classList.add('open'); 
        document.body.style.overflow = 'hidden';
    };

    function closeModal() {
        if(modal) modal.classList.remove('open');
        if(backdrop) backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    if(closeProductBtn) closeProductBtn.onclick = closeModal;
    if(grabber) grabber.onclick = closeModal;
    if(backdrop) backdrop.onclick = closeModal;

    document.querySelectorAll('.product-item').forEach(card => {
        card.addEventListener('click', function() {
            window.openModal({
                name: this.dataset.name, 
                image: this.dataset.image,
                description: this.dataset.description, 
                specifications: this.dataset.specifications,
                additionalInfo: this.dataset.additionalInfo
            });
        });
    });

    // ==========================================
    // 4. CALCULATOR LOGIC
    // ==========================================
    window.setUnit = function(unit) {
        currentUnit = unit;
        ['cm', 'mm', 'inch'].forEach(u => {
            const btn = document.getElementById(`btn-${u}`);
            if(btn) btn.className = (u === unit) 
                ? "px-4 py-2 rounded-md text-xs font-bold bg-white shadow-sm text-blue-600 transition" 
                : "px-4 py-2 rounded-md text-xs font-bold text-gray-500 hover:bg-white transition";
        });
        calculateWeight();
    };

    window.applyPreset = function() {
        const preset = document.getElementById('sizePreset').value;
        const l = document.getElementById('calcLength');
        const w = document.getElementById('calcWidth');
        if(!preset) return;
        
        if(preset === 'A4') { window.setUnit('mm'); l.value=297; w.value=210; }
        else if(preset === 'A3') { window.setUnit('mm'); l.value=420; w.value=297; }
        else if(preset.includes('x')) { window.setUnit('inch'); const [wi, hi] = preset.split('x'); w.value=wi; l.value=hi; }
        calculateWeight();
    };

    function calculateWeight() {
        const l = parseFloat(document.getElementById('calcLength').value) || 0;
        const w = parseFloat(document.getElementById('calcWidth').value) || 0;
        const g = parseFloat(document.getElementById('calcGsm').value) || 0;
        const q = parseFloat(document.getElementById('calcQty').value) || 0;
        
        let m_l = l, m_w = w;
        if (currentUnit === 'mm') { m_l /= 1000; m_w /= 1000; }
        else if (currentUnit === 'cm') { m_l /= 100; m_w /= 100; }
        else if (currentUnit === 'inch') { m_l *= 0.0254; m_w *= 0.0254; }

        const res = (m_l * m_w * g * q) / 1000;
        const resEl = document.getElementById('resTotal');
        if(resEl) resEl.innerHTML = `${res.toFixed(2)} <span class="text-lg">kg</span>`;
    }

    // Tab Switching
    window.switchTab = function(tabName) {
        document.querySelectorAll('.tool-content').forEach(el => el.classList.add('hidden'));
        document.getElementById('tool-' + tabName)?.classList.remove('hidden');
        document.querySelectorAll('.segment').forEach(btn => btn.classList.remove('active'));
        if(event && event.currentTarget) event.currentTarget.classList.add('active');
    };

    // Auto-Calc Listeners
    ['calcLength', 'calcWidth', 'calcGsm', 'calcQty'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calculateWeight);
    });

    // ==========================================
    // 5. FILTER & LIBRARIES INIT
    // ==========================================
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-black','text-white'); 
                b.classList.add('text-gray-500');
            });
            btn.classList.remove('text-gray-500'); 
            btn.classList.add('bg-black','text-white');
            
            const filter = btn.dataset.filter;
            document.querySelectorAll('.product-item').forEach(item => {
                if(filter === 'all' || item.dataset.category.includes(filter)) item.style.display = 'flex';
                else item.style.display = 'none';
            });
        });
    });

    if(typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    
    if(document.getElementById('typed')) {
        new Typed('#typed', { 
            strings: ['Sustainable Packaging.', 'Industrial Grade Paper.', 'Custom Board Solutions.'], 
            typeSpeed: 40, backSpeed: 20, loop: true 
        });
    }
    
    if(typeof Splide !== 'undefined' && document.querySelector('.splide')) {
        new Splide('.splide', { type: 'loop', perPage: 1, gap: '1rem', arrows: false }).mount();
    }
    
    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // ==========================================
    // 6. ENGAGEMENT FEATURES
    // ==========================================

    // --- A. 3D Holographic Tilt ---
    const cards = document.querySelectorAll('.glass-card, .product-item');
    cards.forEach(card => {
        // Add shine element if not present
        if(!card.querySelector('.shine')) {
            const shine = document.createElement('div');
            shine.className = 'shine';
            // Simple inline style for shine
            shine.style.cssText = "position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0; pointer-events: none; transition: opacity 0.3s; mix-blend-mode: overlay; z-index: 10; border-radius: inherit; background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);";
            card.appendChild(shine);
        }

        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation (Max 5 degrees for subtlety)
            const xRotation = -((y - rect.height/2) / rect.height * 5);
            const yRotation = ((x - rect.width/2) / rect.width * 5);
            
            card.style.transform = `perspective(1000px) scale(1.02) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
            
            const shine = card.querySelector('.shine');
            if(shine) {
                shine.style.opacity = '1';
                shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.4), transparent 80%)`;
            }
        });

        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
            card.style.transition = 'transform 0.5s ease';
            const shine = card.querySelector('.shine');
            if(shine) shine.style.opacity = '0';
            setTimeout(() => { card.style.transition = 'none'; }, 500);
        });
    });

    // --- B. Confetti Celebration ---
    window.triggerConfetti = function() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#607afb', '#8e9bfa', '#ffffff']
            });
        } else {
            console.log("Confetti library not loaded");
        }
    };

    const quoteSubmitBtn = document.querySelector('#quoteForm button');
    if(quoteSubmitBtn) {
        quoteSubmitBtn.addEventListener('click', () => {
            // Optional: check form validity first if desired
            triggerConfetti();
        });
    }

    // --- C. Magnetic Buttons ---
    const magnets = document.querySelectorAll('.action-button, .btn-glow, .filter-btn, .social-btn');
    magnets.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x/4}px, ${y/4}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

});
