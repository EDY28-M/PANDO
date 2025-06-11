// js/script.js

$(document).ready(function() {

    // Inicializar AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        once: true,
        offset: 50 // Inicia la animación un poco antes
    });

    // Inicializar Fancybox para la galería
    $(".fancybox").fancybox({
        openEffect: "elastic",
        closeEffect: "elastic",
        helpers: {
            title: {
                type: 'inside'
            }
        }
    });

    // Filtro del Portafolio
    $('.filter').on('click', function() {
        // Activar el botón del filtro
        $('.filter').removeClass('active');
        $(this).addClass('active');
        
        const filter = $(this).attr('data-rel');
        
        if (filter == 'all') {
            $('.gallery-item').show(400);
        } else {
            $('.gallery-item').hide(200);
            $('.gallery-item[data-filter="' + filter + '"]').show(400);
        }
    });

    // Desplazamiento Suave (Smooth Scrolling)
    $('a[href*="#"]').on('click', function(e) {
        e.preventDefault();
        
        const target = $(this).attr('href');
        
        $('html, body').animate({
            scrollTop: $(target).offset().top - 70 // Ajuste por la altura del nav
        }, 500, 'swing');
    });

    // Botón de "Volver Arriba" (Back to Top)
    const backToTopButton = $('.back-to-top');

    const mainNav = $('nav');
    $(window).on('scroll', function() {
        const scroll = $(this).scrollTop();
        if (scroll > 300) {
            backToTopButton.addClass('show');
        } else {
            backToTopButton.removeClass('show');
        }
        if (scroll > 50) {
            mainNav.addClass('scrolled');
        } else {
            mainNav.removeClass('scrolled');
        }
    });

    backToTopButton.on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 500, 'swing');
    });

    // Menú hamburguesa para móviles
    const hamburger = $('#hamburger-menu');
    const navLinks = $('.nav-links');

    hamburger.on('click', function() {
        navLinks.toggleClass('active');
    });
    
    // Cerrar menú móvil al hacer clic en un enlace
    navLinks.find('a').on('click', function() {
        if (navLinks.hasClass('active')) {
            navLinks.removeClass('active');
        }
    });

    // Envío del formulario de contacto
    $('.contact-form').on('submit', function(e) {
        e.preventDefault();
        // Aquí puedes agregar una integración con un servicio de email
        // o simplemente mostrar una alerta como antes.
        
        // Simulación de envío
        const submitButton = $(this).find('button[type="submit"]');
        submitButton.text('Enviando...');
        
        setTimeout(() => {
            alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
            this.reset(); // Limpia el formulario
            submitButton.text('Enviar Mensaje');
        }, 1500);
    });

});