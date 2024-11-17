// Activar o desactivar el menú al hacer clic en el botón
const menuIcon = document.getElementById('menu-icon');
const mobileMenu = document.getElementById('mobile-menu');

menuIcon.addEventListener('click', () => {
    menuIcon.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});
