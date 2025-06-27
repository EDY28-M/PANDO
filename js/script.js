// js/script.js

$(document).ready(function() {

    // ──────────────────────────────────────────────────────────────
    // Inicializaciones generales
    // ──────────────────────────────────────────────────────────────
  
    // Inicializar AOS (Animate On Scroll) con configuración mejorada
    AOS.init({
      duration: 1000,
      once: true,
      offset: 50,
      easing: 'ease-out-cubic',
      delay: 100
    });

    // ──────────────────────────────────────────────────────────────
    // Indicador de progreso de scroll
    // ──────────────────────────────────────────────────────────────
    
    function updateScrollProgress() {
      const scrollTop = $(window).scrollTop();
      const docHeight = $(document).height() - $(window).height();
      const scrollPercent = (scrollTop / docHeight) * 100;
      $('.scroll-progress').css('transform', `scaleX(${scrollPercent / 100})`);
    }

    $(window).on('scroll', updateScrollProgress);
    updateScrollProgress(); // Inicializar
  
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
  
    // ──────────────────────────────────────────────────────────────
    // Navegación mejorada y botón "Volver Arriba"
    // ──────────────────────────────────────────────────────────────
    
    const backToTopButton = $('.back-to-top');
    let lastScrollTop = 0;
    
    $(window).on('scroll', function() {
      const nav = $('nav');
      const scrollTop = $(this).scrollTop();
      
      // Efecto de navegación al hacer scroll
      if (scrollTop > 50) {
        nav.addClass('nav-scrolled');
      } else {
        nav.removeClass('nav-scrolled');
      }
      
      // Mostrar/ocultar botón volver arriba con animación mejorada
      if (scrollTop > 300) {
        backToTopButton.addClass('show');
      } else {
        backToTopButton.removeClass('show');
      }
      
      // Actualizar indicador de progreso
      updateScrollProgress();
      
      lastScrollTop = scrollTop;
    });
    
    // Animación mejorada para volver arriba
    backToTopButton.on('click', function(e) {
      e.preventDefault();
      $('html, body').animate({ 
        scrollTop: 0 
      }, {
        duration: 800,
        easing: 'easeInOutCubic'
      });
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
    // Toggle Modo Oscuro Mejorado
    // ──────────────────────────────────────────────────────────────
  
    const darkModeToggle = $('#dark-mode-toggle');
    
    function setDarkMode(on) {
      const body = $('body');
      
      if (on) {
        body.addClass('dark-mode');
        localStorage.setItem('darkMode','on');
        darkModeToggle.find('i').removeClass('fa-moon').addClass('fa-sun');
        
        // Animación suave para el cambio de modo
        body.css('transition', 'background-color 0.3s ease, color 0.3s ease');
      } else {
        body.removeClass('dark-mode');
        localStorage.setItem('darkMode','off');
        darkModeToggle.find('i').removeClass('fa-sun').addClass('fa-moon');
        
        // Animación suave para el cambio de modo
        body.css('transition', 'background-color 0.3s ease, color 0.3s ease');
      }
      
      // Remover la transición después de la animación
      setTimeout(() => {
        body.css('transition', '');
      }, 300);
    }
    
    // Inicializar modo oscuro si está guardado
    if (localStorage.getItem('darkMode') === 'on') setDarkMode(true);
    
    // Mejorar la interacción del toggle
    darkModeToggle.on('click keypress', e => {
      if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setDarkMode(!$('body').hasClass('dark-mode'));
        
        // Efecto de feedback visual
        darkModeToggle.addClass('clicked');
        setTimeout(() => {
          darkModeToggle.removeClass('clicked');
        }, 200);
      }
    });

    // ──────────────────────────────────────────────────────────────
    // Efectos de micro-interacciones mejorados
    // ──────────────────────────────────────────────────────────────
    
    // Efecto ripple para botones
    $('.button').on('click', function(e) {
      const button = $(this);
      const ripple = $('<span class="ripple"></span>');
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.css({
        width: size,
        height: size,
        left: x,
        top: y
      });
      
      button.append(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
    
    // Animaciones de entrada mejoradas para elementos
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $(entry.target).addClass('animate-in');
        }
      });
    }, observerOptions);
    
    // Observar elementos para animaciones
    $('.team-member, .plan-card, .gallery-item').each(function() {
      observer.observe(this);
    });
    
    // ──────────────────────────────────────────────────────────────
    // Mejoras de accesibilidad
    // ──────────────────────────────────────────────────────────────
    
    // Navegación por teclado mejorada
    $('.nav-links a, .button').on('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        $(this).click();
      }
    });
    
    // Indicadores de foco mejorados
    $('a, button, input, textarea').on('focus', function() {
      $(this).addClass('focused');
    }).on('blur', function() {
      $(this).removeClass('focused');
    });
    
    // ──────────────────────────────────────────────────────────────
    // Optimizaciones de rendimiento
    // ──────────────────────────────────────────────────────────────
    
    // Lazy loading para imágenes
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });
    
    // Aplicar lazy loading a imágenes con data-src
    $('img[data-src]').each(function() {
      imageObserver.observe(this);
    });
  
  }); // fin document.ready
  