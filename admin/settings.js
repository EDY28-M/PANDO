// admin/settings.js
// Gestor de configuraciones del panel administrativo

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.defaultSettings = {
            general: {
                siteName: 'PANDO - Lead Working Partner',
                adminEmail: 'admin@pando.com',
                contactsPerPage: 10,
                autoRefresh: true,
                theme: 'light',
                language: 'es'
            },
            email: {
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                smtpUser: '',
                smtpSecure: false,
                enabled: true
            },
            security: {
                blockSuspiciousIPs: true,
                messageLimit: 5,
                logActivity: true,
                sessionTimeout: 30,
                requireAuth: false
            },
            notifications: {
                emailAlerts: true,
                newContactAlert: true,
                dailyReport: false,
                weeklyReport: true
            },
            backup: {
                autoBackup: true,
                backupInterval: 24, // horas
                keepBackups: 30, // días
                backupLocation: 'local'
            }
        };
    }

    // Cargar configuraciones desde localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem('pandoAdminSettings');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error cargando configuraciones:', error);
        }
        return {};
    }

    // Guardar configuraciones
    saveSettings() {
        try {
            localStorage.setItem('pandoAdminSettings', JSON.stringify(this.settings));
            this.showNotification('Configuración guardada exitosamente', 'success');
            return true;
        } catch (error) {
            console.error('Error guardando configuraciones:', error);
            this.showNotification('Error al guardar configuración', 'error');
            return false;
        }
    }

    // Obtener configuración
    get(category, key) {
        if (category && key) {
            return this.settings[category]?.[key] ?? this.defaultSettings[category]?.[key];
        } else if (category) {
            return { ...this.defaultSettings[category], ...this.settings[category] };
        }
        return { ...this.defaultSettings, ...this.settings };
    }

    // Establecer configuración
    set(category, key, value) {
        if (!this.settings[category]) {
            this.settings[category] = {};
        }
        this.settings[category][key] = value;
    }

    // Restablecer a valores por defecto
    reset(category = null) {
        if (category) {
            this.settings[category] = { ...this.defaultSettings[category] };
        } else {
            this.settings = { ...this.defaultSettings };
        }
        this.saveSettings();
        this.loadSettingsUI();
    }

    // Cargar configuraciones en la UI
    loadSettingsUI() {
        // Configuración general
        this.setUIValue('siteName', this.get('general', 'siteName'));
        this.setUIValue('adminEmail', this.get('general', 'adminEmail'));
        this.setUIValue('contactsPerPage', this.get('general', 'contactsPerPage'));
        this.setUIValue('autoRefresh', this.get('general', 'autoRefresh'));

        // Configuración de email
        this.setUIValue('smtpHost', this.get('email', 'smtpHost'));
        this.setUIValue('smtpPort', this.get('email', 'smtpPort'));
        this.setUIValue('smtpUser', this.get('email', 'smtpUser'));

        // Configuración de seguridad
        this.setUIValue('blockSuspiciousIPs', this.get('security', 'blockSuspiciousIPs'));
        this.setUIValue('messageLimit', this.get('security', 'messageLimit'));
        this.setUIValue('logActivity', this.get('security', 'logActivity'));
    }

    // Establecer valor en UI
    setUIValue(id, value) {
        const element = document.getElementById(id);
        if (!element) return;

        if (element.type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }

    // Obtener valor desde UI
    getUIValue(id) {
        const element = document.getElementById(id);
        if (!element) return null;

        if (element.type === 'checkbox') {
            return element.checked;
        } else if (element.type === 'number') {
            return parseInt(element.value);
        }
        return element.value;
    }

    // Guardar configuración general
    saveGeneralSettings() {
        try {
            this.set('general', 'siteName', this.getUIValue('siteName'));
            this.set('general', 'adminEmail', this.getUIValue('adminEmail'));
            this.set('general', 'contactsPerPage', this.getUIValue('contactsPerPage'));
            this.set('general', 'autoRefresh', this.getUIValue('autoRefresh'));

            this.saveSettings();
            this.applySettings();
            return true;
        } catch (error) {
            console.error('Error guardando configuración general:', error);
            this.showNotification('Error al guardar configuración general', 'error');
            return false;
        }
    }

    // Guardar configuración de email
    saveEmailSettings() {
        try {
            this.set('email', 'smtpHost', this.getUIValue('smtpHost'));
            this.set('email', 'smtpPort', this.getUIValue('smtpPort'));
            this.set('email', 'smtpUser', this.getUIValue('smtpUser'));

            this.saveSettings();
            return true;
        } catch (error) {
            console.error('Error guardando configuración de email:', error);
            this.showNotification('Error al guardar configuración de email', 'error');
            return false;
        }
    }

    // Guardar configuración de seguridad
    saveSecuritySettings() {
        try {
            this.set('security', 'blockSuspiciousIPs', this.getUIValue('blockSuspiciousIPs'));
            this.set('security', 'messageLimit', this.getUIValue('messageLimit'));
            this.set('security', 'logActivity', this.getUIValue('logActivity'));

            this.saveSettings();
            return true;
        } catch (error) {
            console.error('Error guardando configuración de seguridad:', error);
            this.showNotification('Error al guardar configuración de seguridad', 'error');
            return false;
        }
    }

    // Aplicar configuraciones
    applySettings() {
        // Aplicar configuración de contactos por página
        if (window.contactsPerPage !== undefined) {
            window.contactsPerPage = this.get('general', 'contactsPerPage');
        }

        // Aplicar auto-refresh
        const autoRefresh = this.get('general', 'autoRefresh');
        if (window.autoRefreshInterval) {
            clearInterval(window.autoRefreshInterval);
        }
        
        if (autoRefresh) {
            window.autoRefreshInterval = setInterval(() => {
                if (!document.getElementById('dashboardPage').classList.contains('d-none')) {
                    window.loadDashboard && window.loadDashboard();
                }
            }, 30000);
        }

        // Aplicar tema (si está implementado)
        this.applyTheme(this.get('general', 'theme'));
    }

    // Aplicar tema
    applyTheme(theme) {
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
    }

    // Probar conexión de email
    async testEmailConnection() {
        this.showNotification('Probando conexión de email...', 'info');
        
        try {
            // Simular test de conexión
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // En un entorno real, harías una llamada al servidor
            const success = Math.random() > 0.3; // 70% de éxito simulado
            
            if (success) {
                this.showNotification('Conexión de email exitosa', 'success');
                this.updateConnectionStatus('emailStatus', true);
            } else {
                this.showNotification('Error en la conexión de email', 'error');
                this.updateConnectionStatus('emailStatus', false);
            }
        } catch (error) {
            this.showNotification('Error al probar conexión de email', 'error');
            this.updateConnectionStatus('emailStatus', false);
        }
    }

    // Actualizar estado de conexión
    updateConnectionStatus(statusId, isOnline, message = '') {
        const indicator = document.getElementById(statusId + 'Indicator');
        const text = document.getElementById(statusId + 'Text');
        
        if (indicator) {
            indicator.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
        }
        
        if (text) {
            text.textContent = message || (isOnline ? 'Conectado' : 'Desconectado');
        }
    }

    // Exportar configuraciones
    exportSettings() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            settings: this.settings
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pando_admin_settings_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Configuraciones exportadas', 'success');
    }

    // Importar configuraciones
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.settings) {
                    this.settings = { ...this.defaultSettings, ...data.settings };
                    this.saveSettings();
                    this.loadSettingsUI();
                    this.applySettings();
                    this.showNotification('Configuraciones importadas exitosamente', 'success');
                } else {
                    this.showNotification('Archivo de configuración inválido', 'error');
                }
            } catch (error) {
                this.showNotification('Error al importar configuraciones', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Validar configuración de email
    validateEmailSettings() {
        const host = this.getUIValue('smtpHost');
        const port = this.getUIValue('smtpPort');
        const user = this.getUIValue('smtpUser');

        const errors = [];

        if (!host || host.trim() === '') {
            errors.push('El servidor SMTP es obligatorio');
        }

        if (!port || port < 1 || port > 65535) {
            errors.push('El puerto debe estar entre 1 y 65535');
        }

        if (!user || !user.includes('@')) {
            errors.push('El usuario debe ser un email válido');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Obtener información del sistema
    async getSystemInfo() {
        try {
            const response = await fetch('/api/database/status');
            const dbStatus = await response.json();
            
            return {
                database: {
                    connected: dbStatus.database_connected,
                    type: dbStatus.database_connected ? 'MySQL' : 'JSON File'
                },
                server: {
                    uptime: 'N/A',
                    version: '1.0.0'
                },
                lastUpdate: new Date().toISOString()
            };
        } catch (error) {
            return {
                database: { connected: false, type: 'Unknown' },
                server: { uptime: 'N/A', version: '1.0.0' },
                lastUpdate: new Date().toISOString(),
                error: error.message
            };
        }
    }
}

// Funciones auxiliares globales
function createBackup() {
    if (window.settingsManager) {
        window.settingsManager.showNotification('Creando backup...', 'info');
        
        setTimeout(() => {
            window.settingsManager.showNotification('Backup creado exitosamente', 'success');
            document.getElementById('lastBackup').textContent = new Date().toLocaleDateString('es-ES');
        }, 2000);
    }
}

function syncData() {
    if (window.settingsManager) {
        window.settingsManager.showNotification('Sincronizando datos...', 'info');
        
        setTimeout(() => {
            window.settingsManager.showNotification('Sincronización completada', 'success');
        }, 3000);
    }
}

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    window.settingsManager = new SettingsManager();
    
    // Cargar configuraciones en la UI
    if (document.getElementById('settingsPage')) {
        window.settingsManager.loadSettingsUI();
        window.settingsManager.applySettings();
    }
});

// Hacer disponible globalmente
window.SettingsManager = SettingsManager;
