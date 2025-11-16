    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu-container');
    const icon = hamburger.querySelector('span');

    hamburger.addEventListener('click', () => {
    const active = menu.classList.toggle('active');
    hamburger.classList.toggle('active');
    icon.textContent = active ? 'close' : 'menu';
    });

    document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
        menu.classList.remove('active');
        hamburger.classList.remove('active');
        icon.textContent = 'menu';
    }
    });