// blog.js
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

    // --- STICKY NAVIGATION & ACTIVE LINK HIGHLIGHTING ---
    const nav = document.querySelector('.sticky-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
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

    // --- FOOTER CURRENT YEAR ---
    const currentYear = document.getElementById('currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
});
