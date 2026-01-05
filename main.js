document.addEventListener('DOMContentLoaded', () => {
    let currentUnit = 'cm';

    // 1. Dynamic Island & Scroll
    const island = document.getElementById('dynamicIsland');
    const scrollBtn = document.getElementById('scrollTopBtn');
    const sidebar = document.getElementById('socialSidebar');

    if(island && scrollBtn) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y > 50) island.classList.add('scrolled'); else island.classList.remove('scrolled');
            if (y > 400) {
                if(sidebar) { sidebar.style.opacity = '1'; sidebar.style.transform = 'translateY(0)'; }
                scrollBtn.classList.add('visible');
            } else {
                if(sidebar) { sidebar.style.opacity = '0'; sidebar.style.transform = 'translateY(80px)'; }
                scrollBtn.classList.remove('visible');
            }
        }, { passive: true });
        scrollBtn.onclick = () => window.scrollTo({top:0, behavior:'smooth'});
    }

    // 2. Mobile Menu
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuLinks = document.querySelectorAll('.menu-item');

    function toggleMenu(show) {
        if(!mobileMenu) return;
        if(show) { mobileMenu.classList.add('open'); document.body.style.overflow = 'hidden'; }
        else { mobileMenu.classList.remove('open'); document.body.style.overflow = ''; }
    }

    if(menuBtn) menuBtn.onclick = () => toggleMenu(true);
    if(closeMenuBtn) closeMenuBtn.onclick = () => toggleMenu(false);
    menuLinks.forEach(l => l.onclick = () => toggleMenu(false));

    // 3. Product Modal & Quote Logic
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
        
        // Handle Additional Info safely
        const infoEl = document.getElementById('modalProductAdditionalInfo');
        if(infoEl) {
            // Find the span inside the p tag if it exists, or just set text
            const span = infoEl.querySelector('span');
            if(span) span.textContent = data.additionalInfo;
            else infoEl.textContent = data.additionalInfo;
        }

        const specs = document.getElementById('modalProductSpecifications');
        if(specs) {
            specs.innerHTML = '';
            try {
                JSON.parse(data.specifications).forEach(s => {
                    specs.innerHTML += `<li class="flex justify-between border-b border-gray-100 py-2 last:border-0">
                        <span class="text-gray-500">${s.label}</span>
                        <span class="font-bold text-gray-900">${s.value}</span>
                    </li>`;
                });
            } catch(e) {}
        }
        
        // Pre-fill Quote Form
        if(quoteBtn) {
            quoteBtn.onclick = () => {
                closeModal();
                const quoteSection = document.getElementById('quote');
                if(quoteSection) quoteSection.scrollIntoView({behavior: 'smooth'});
                const quoteInput = document.getElementById('quoteProduct');
                if(quoteInput) quoteInput.value = data.name;
            };
        }

        modal.classList.add('open'); backdrop.classList.add('open'); document.body.style.overflow = 'hidden';
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
                name: this.dataset.name, image: this.dataset.image,
                description: this.dataset.description, specifications: this.dataset.specifications,
                additionalInfo: this.dataset.additionalInfo
            });
        });
    });

    // 4. Calculator Logic
    window.setUnit = function(unit) {
        currentUnit = unit;
        ['cm', 'mm', 'inch'].forEach(u => {
            const btn = document.getElementById(`btn-${u}`);
            if(btn) btn.className = (u === unit) ? "px-4 py-2 rounded-md text-xs font-bold bg-white shadow-sm text-blue-600 transition" : "px-4 py-2 rounded-md text-xs font-bold text-gray-500 hover:bg-white transition";
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

    // Tab Logic
    window.switchTab = function(tabName) {
        document.querySelectorAll('.tool-content').forEach(el => el.classList.add('hidden'));
        document.getElementById('tool-' + tabName)?.classList.remove('hidden');
        document.querySelectorAll('.segment').forEach(btn => btn.classList.remove('active'));
        if(event && event.currentTarget) event.currentTarget.classList.add('active');
    };

    // Add listeners for auto-calc
    ['calcLength', 'calcWidth', 'calcGsm', 'calcQty'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calculateWeight);
    });

    // 5. Init Utils
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-black','text-white'); b.classList.add('text-gray-500');
            });
            btn.classList.remove('text-gray-500'); btn.classList.add('bg-black','text-white');
            const filter = btn.dataset.filter;
            document.querySelectorAll('.product-item').forEach(item => {
                if(filter === 'all' || item.dataset.category.includes(filter)) item.style.display = 'flex';
                else item.style.display = 'none';
            });
        });
    });

    if(typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    if(document.getElementById('typed')) {
        new Typed('#typed', { strings: ['Sustainable Packaging.', 'Industrial Grade Paper.'], typeSpeed: 40, backSpeed: 20, loop: true });
    }
    if(typeof Splide !== 'undefined' && document.querySelector('.splide')) new Splide('.splide', { type: 'loop', perPage: 1, gap: '1rem', arrows: false }).mount();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});
