module.exports = {
    theme: "darkSky",
    service: 'gmail',
    user: "keraaigpt.plus@gmail.com",
    pass: "aypn tlbd nnad tzlx",
    from: '"LedWorking" <keraaigpt.plus@gmail.com>',
    to: 'keraaigpt.plus@gmail.com',
    subject: 'Nuevo contacto de ${name} - ${subject}',
    port: 587,
    secure: false,
    requireTLS: true,
    ignoreTLS: false,
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    }
};
