// js/script.js

$(document).ready(function() {

    // ──────────────────────────────────────────────────────────────
    // Inicializaciones generales
    // ──────────────────────────────────────────────────────────────
  
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
        title: { type: 'inside' }
      }
    });
  
    // Filtro del Portafolio
    $('.filter').on('click', function() {
      $('.filter').removeClass('active');
      $(this).addClass('active');
      
      const filter = $(this).attr('data-rel');
      if (filter === 'all') {
        $('.gallery-item').show(400);
      } else {
        $('.gallery-item').hide(200);
        $(`.gallery-item[data-filter="${filter}"]`).show(400);
      }
    });
  
    // Desplazamiento Suave (Smooth Scrolling)
    $('a[href*="#"]').not('.back-to-top').on('click', function(e) {
      e.preventDefault();
      const target = $(this).attr('href');
      $('html, body').animate({
        scrollTop: $(target).offset().top - 70
      }, 500, 'swing');
    });
  
    // Botón "Volver Arriba"
    const backToTopButton = $('.back-to-top');
    $(window).on('scroll', function() {
      const nav = $('nav');
      $(this).scrollTop() > 50 ? nav.addClass('nav-scrolled') : nav.removeClass('nav-scrolled');
      $(this).scrollTop() > 300 ? backToTopButton.addClass('show') : backToTopButton.removeClass('show');
    });
    backToTopButton.on('click', function(e) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: 0 }, 800, 'swing');
    });
  
    // Menú hamburguesa móvil
    const hamburger   = $('#hamburger-menu');
    const navLinks    = $('.nav-links');
    const navOverlay  = $('#nav-overlay');
  
    hamburger.on('click', () => {
      navLinks.toggleClass('active');
      navOverlay.toggleClass('active');
    });
    navLinks.find('a').on('click', () => {
      if (navLinks.hasClass('active')) {
        navLinks.removeClass('active');
        navOverlay.removeClass('active');
      }
    });
    navOverlay.on('click', () => {
      navLinks.removeClass('active');
      navOverlay.removeClass('active');
    });
  
    // ──────────────────────────────────────────────────────────────
    // Configuración de EmailJS
    // ──────────────────────────────────────────────────────────────
  
    emailjs.init("YOUR_USER_ID"); // ← Reemplaza con tu User ID de EmailJS
  
    // IDs de servicio y plantillas
    const SERVICE_ID         = 'service_wxb3uzc';           // ← Tu Service ID
    const ADMIN_TEMPLATE_ID  = 'template_admin_id';         // ← Tu Template ID para admin
    const CLIENT_TEMPLATE_ID = 'template_client_id';        // ← Tu Template ID para cliente
  
    // Email del administrador (destino)
    const ADMIN_EMAIL = 'keraaigpt.plus@gmail.com';        // ← Reemplaza si es otro
  
    // Attachment estático del logo (para CID)
    const logoAttachment = {
      name: 'logo.png',
      // Puedes usar una URL pública o un base64:
      path: 'https://tu-dominio.com/path/to/logo.png'
      // o: path: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
    };
  
    // ──────────────────────────────────────────────────────────────
    // Envío del formulario de contacto optimizado
    // ──────────────────────────────────────────────────────────────
  
    $('.contact-form').on('submit', function(e) {
        e.preventDefault();
        
        const $form = $(this);
        const $btn = $form.find('#submit-btn');
        const $btnText = $btn.find('.btn-text');
        const $btnLoading = $btn.find('.btn-loading');
        const $formMessage = $form.find('#form-message');
        
        // Mostrar estado de carga
        $btnText.hide();
        $btnLoading.show();
        $btn.prop('disabled', true);
        $formMessage.removeClass('success error').text('');

        // Recoger datos del formulario
        const formData = {
            name: $form.find('#name').val().trim(),
            email: $form.find('#email').val().trim(),
            subject: $form.find('#subject').val().trim(),
            message: $form.find('#message').val().trim()
        };

        // Validación del lado del cliente
        const requiredFields = ['name', 'email', 'subject', 'message'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            showMessage('Por favor, completa todos los campos del formulario.', 'error');
            resetButton();
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showMessage('Por favor, ingresa un formato de email válido.', 'error');
            resetButton();
            return;
        }

        // Enviar datos al servidor Node.js
        fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showMessage('¡Mensaje enviado exitosamente! Te hemos enviado un correo de confirmación y nos pondremos en contacto contigo pronto.', 'success');
                $form[0].reset();
                
                // Scroll suave al mensaje de éxito
                $('html, body').animate({
                    scrollTop: $formMessage.offset().top - 100
                }, 500);
            } else {
                showMessage('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Hubo un error al enviar el mensaje. Por favor, verifica tu conexión a internet e intenta nuevamente.', 'error');
        })
        .finally(() => {
            resetButton();
        });

        function showMessage(message, type) {
            $formMessage.removeClass('success error').addClass(type).text(message);
        }

        function resetButton() {
            $btnText.show();
            $btnLoading.hide();
            $btn.prop('disabled', false);
        }
    });
  
    // ──────────────────────────────────────────────────────────────
    // Toggle Modo Oscuro
    // ──────────────────────────────────────────────────────────────
  
    const darkModeToggle = $('#dark-mode-toggle');
    function setDarkMode(on) {
      if (on) {
        $('body').addClass('dark-mode');
        localStorage.setItem('darkMode','on');
        darkModeToggle.find('i').removeClass('fa-moon').addClass('fa-sun');
      } else {
        $('body').removeClass('dark-mode');
        localStorage.setItem('darkMode','off');
        darkModeToggle.find('i').removeClass('fa-sun').addClass('fa-moon');
      }
    }
    if (localStorage.getItem('darkMode') === 'on') setDarkMode(true);
    darkModeToggle.on('click keypress', e => {
      if (e.type==='click' || e.key==='Enter' || e.key===' ') {
        setDarkMode(!$('body').hasClass('dark-mode'));
      }
    });
  
  }); // fin document.ready
  