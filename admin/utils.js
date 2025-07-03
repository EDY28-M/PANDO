// admin/utils.js
// Utilidades auxiliares para el panel administrativo

class AdminUtils {
    // Formatear fechas
    static formatDate(date, options = {}) {
        const d = new Date(date);
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return d.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
    }

    // Formatear tamaños de archivo
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Validar email
    static isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Generar ID único
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Escapar HTML
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Truncar texto
    static truncateText(text, length = 100) {
        if (text.length <= length) return text;
        return text.substr(0, length) + '...';
    }

    // Debounce función
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Copiar al portapapeles
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    // Descargar archivo
    static downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Cargar archivo
    static loadFile(accept = '*/*') {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error('No file selected'));
                }
            };
            
            input.click();
        });
    }

    // Obtener información del navegador
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        return {
            browser,
            userAgent: ua,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    // Validar configuración
    static validateConfig(config, schema) {
        const errors = [];
        
        for (const [key, rules] of Object.entries(schema)) {
            const value = config[key];
            
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${key} es obligatorio`);
                continue;
            }
            
            if (value !== undefined && value !== null && value !== '') {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${key} debe ser de tipo ${rules.type}`);
                }
                
                if (rules.min && value < rules.min) {
                    errors.push(`${key} debe ser mayor a ${rules.min}`);
                }
                
                if (rules.max && value > rules.max) {
                    errors.push(`${key} debe ser menor a ${rules.max}`);
                }
                
                if (rules.pattern && !rules.pattern.test(value)) {
                    errors.push(`${key} no tiene el formato correcto`);
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Parsear CSV
    static parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            data.push(row);
        }
        
        return { headers, data };
    }

    // Generar CSV
    static generateCSV(data, headers = null) {
        if (!data || data.length === 0) return '';
        
        const csvHeaders = headers || Object.keys(data[0]);
        const csvRows = data.map(row => 
            csvHeaders.map(header => {
                const value = row[header] || '';
                // Escapar comillas y envolver en comillas si contiene comas
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            }).join(',')
        );
        
        return [csvHeaders.join(','), ...csvRows].join('\n');
    }

    // Cache simple
    static createCache(ttl = 300000) { // 5 minutos por defecto
        const cache = new Map();
        
        return {
            get(key) {
                const item = cache.get(key);
                if (!item) return null;
                
                if (Date.now() > item.expiry) {
                    cache.delete(key);
                    return null;
                }
                
                return item.value;
            },
            
            set(key, value) {
                cache.set(key, {
                    value,
                    expiry: Date.now() + ttl
                });
            },
            
            delete(key) {
                cache.delete(key);
            },
            
            clear() {
                cache.clear();
            },
            
            size() {
                return cache.size;
            }
        };
    }

    // Throttle función
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Obtener estadísticas de texto
    static getTextStats(text) {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        return {
            characters: text.length,
            charactersNoSpaces: text.replace(/\s/g, '').length,
            words: words.length,
            sentences: sentences.length,
            paragraphs: paragraphs.length,
            avgWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0
        };
    }

    // Formatear números
    static formatNumber(num, options = {}) {
        const defaults = {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };
        
        return new Intl.NumberFormat('es-ES', { ...defaults, ...options }).format(num);
    }

    // Detectar dispositivo móvil
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Generar colores aleatorios
    static generateColor(seed = null) {
        if (seed) {
            // Generar color determinista basado en seed
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                hash = seed.charCodeAt(i) + ((hash << 5) - hash);
            }
            
            const hue = hash % 360;
            return `hsl(${hue}, 70%, 50%)`;
        } else {
            // Color aleatorio
            const hue = Math.floor(Math.random() * 360);
            return `hsl(${hue}, 70%, 50%)`;
        }
    }

    // Procesar datos en lotes
    static async processBatch(items, processor, batchSize = 10, delay = 100) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);
            
            // Pausa entre lotes para no bloquear el hilo principal
            if (delay > 0 && i + batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return results;
    }
}

// Hacer disponible globalmente
window.AdminUtils = AdminUtils;

// Cache global para el panel
window.adminCache = AdminUtils.createCache();

// Event listeners útiles
document.addEventListener('DOMContentLoaded', function() {
    // Detectar si es móvil y agregar clase
    if (AdminUtils.isMobile()) {
        document.body.classList.add('mobile-device');
    }
    
    // Agregar información del navegador como atributos
    const browserInfo = AdminUtils.getBrowserInfo();
    document.documentElement.setAttribute('data-browser', browserInfo.browser.toLowerCase());
    document.documentElement.setAttribute('data-platform', browserInfo.platform.toLowerCase());
});

// Exportar funciones comunes
window.formatDate = AdminUtils.formatDate;
window.formatFileSize = AdminUtils.formatFileSize;
window.copyToClipboard = AdminUtils.copyToClipboard;
window.downloadFile = AdminUtils.downloadFile;
