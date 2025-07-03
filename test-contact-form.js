// test-contact-form.js
// Script para probar el formulario de contacto

const testData = {
    name: "Test User",
    email: "test@example.com",
    subject: "Prueba del formulario",
    message: "Este es un mensaje de prueba para verificar que el formulario funciona correctamente."
};

console.log('🧪 Probando el formulario de contacto...');

fetch('http://localhost:3000/send-email', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
    console.log('✅ Respuesta del servidor:', data);
    if (data.success) {
        console.log('🎉 ¡Formulario funcionando correctamente!');
    } else {
        console.log('❌ Error en el formulario:', data.message);
    }
})
.catch(error => {
    console.error('❌ Error de conexión:', error);
});
