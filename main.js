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