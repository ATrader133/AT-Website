/* common.js - Shared logic for all pages */
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. MOBILE MENU TOGGLE
    const menuButton = document.getElementById('menuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const closeMenuButton = document.getElementById('closeMenuButton');

    // Helper to open/close menu
    const toggleMenu = (forceClose = false) => {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen || forceClose) {
            menuButton?.classList.remove('menu-open');
            mobileMenu?.classList.remove('open');
            menuBackdrop?.classList.remove('open');
            document.body.classList.remove('menu-opened');
        } else {
            menuButton?.classList.add('menu-open');
            mobileMenu?.classList.add('open');
            menuBackdrop?.classList.add('open');
            document.body.classList.add('menu-opened');
        }
    };

    // Event Listeners for Menu
    if (menuButton) menuButton.addEventListener('click', () => toggleMenu());
    if (closeMenuButton) closeMenuButton.addEventListener('click', () => toggleMenu(true));
    if (menuBackdrop) menuBackdrop.addEventListener('click', () => toggleMenu(true));
    
    // Close menu when clicking a link
    mobileMenu?.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    // 2. PRELOADER (The spinning logo)
    const spinner = document.getElementById('spinner');
    if (spinner) {
        window.addEventListener('load', () => {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.style.display = 'none', 500);
        });
    }

    // 3. CURRENT YEAR (Footer)
    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // 4. SCROLL PROGRESS BAR
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTop / height) * 100;
            progressBar.style.width = scrolled + "%";
        });
    }
});
