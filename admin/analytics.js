// admin/analytics.js
// Funciones avanzadas de analíticas para el panel administrativo

class AnalyticsManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    // Obtener datos de analíticas con caché
    async getAnalyticsData(period = 30) {
        const cacheKey = `analytics_${period}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`/api/analytics/advanced?period=${period}`);
            const data = await response.json();
            
            if (data.success) {
                this.cache.set(cacheKey, {
                    data: data.analytics,
                    timestamp: Date.now()
                });
                return data.analytics;
            }
        } catch (error) {
            console.error('Error obteniendo analíticas:', error);
        }
        
        return null;
    }

    // Calcular métricas adicionales
    calculateMetrics(contacts) {
        const now = new Date();
        const metrics = {
            responseRate: 0,
            avgResponseTime: '2.4h',
            peakHour: 14,
            trendsData: [],
            hourlyData: new Array(24).fill(0),
            statusDistribution: {
                new: 0,
                read: 0,
                replied: 0,
                archived: 0
            }
        };

        if (!contacts || contacts.length === 0) {
            return metrics;
        }

        // Calcular tasa de respuesta
        const totalContacts = contacts.length;
        const repliedContacts = contacts.filter(c => c.status === 'replied').length;
        metrics.responseRate = totalContacts > 0 ? Math.round((repliedContacts / totalContacts) * 100) : 0;

        // Distribución por estado
        contacts.forEach(contact => {
            if (metrics.statusDistribution.hasOwnProperty(contact.status)) {
                metrics.statusDistribution[contact.status]++;
            }
        });

        // Datos por hora
        contacts.forEach(contact => {
            const hour = new Date(contact.created_at).getHours();
            metrics.hourlyData[hour]++;
        });

        // Encontrar hora pico
        metrics.peakHour = metrics.hourlyData.indexOf(Math.max(...metrics.hourlyData));

        // Datos de tendencia (últimos 7 días)
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayContacts = contacts.filter(c => {
                const contactDate = new Date(c.created_at);
                return contactDate.toDateString() === date.toDateString();
            });
            
            metrics.trendsData.push({
                date: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                count: dayContacts.length
            });
        }

        return metrics;
    }

    // Generar reporte de analíticas
    generateReport(metrics, period) {
        const report = {
            period: period,
            generatedAt: new Date().toISOString(),
            summary: {
                totalContacts: metrics.statusDistribution.new + metrics.statusDistribution.read + 
                              metrics.statusDistribution.replied + metrics.statusDistribution.archived,
                responseRate: `${metrics.responseRate}%`,
                peakHour: `${metrics.peakHour}:00`,
                avgDailyContacts: Math.round(metrics.trendsData.reduce((sum, day) => sum + day.count, 0) / 7)
            },
            trends: metrics.trendsData,
            hourlyDistribution: metrics.hourlyData,
            statusBreakdown: metrics.statusDistribution
        };

        return report;
    }

    // Exportar reporte como JSON
    exportReport(report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Limpiar caché
    clearCache() {
        this.cache.clear();
    }
}

// Instancia global
window.analyticsManager = new AnalyticsManager();

// Funciones auxiliares para gráficos
class ChartRenderer {
    static drawLineChart(canvas, data, options = {}) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const padding = options.padding || 60;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        if (!data || data.length === 0) return;
        
        const maxValue = Math.max(...data.map(d => d.count || d.value || 0), 1);
        
        // Configurar estilos
        ctx.strokeStyle = options.lineColor || '#2E8B57';
        ctx.lineWidth = options.lineWidth || 3;
        ctx.fillStyle = options.pointColor || '#2E8B57';
        
        // Dibujar ejes
        this.drawAxes(ctx, width, height, padding, options.axisColor || '#e9ecef');
        
        // Dibujar línea
        ctx.beginPath();
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - ((point.count || point.value || 0) / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Dibujar puntos
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = height - padding - ((point.count || point.value || 0) / maxValue) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Etiquetas
        if (options.showLabels !== false) {
            this.drawLabels(ctx, data, width, height, padding, chartWidth);
        }
    }
    
    static drawPieChart(canvas, data, options = {}) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - (options.padding || 20);
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        if (!data || Object.keys(data).length === 0) return;
        
        const total = Object.values(data).reduce((sum, value) => sum + value, 0);
        if (total === 0) return;
        
        const colors = options.colors || {
            new: '#17a2b8',
            read: '#28a745',
            replied: '#2E8B57',
            archived: '#6c757d'
        };
        
        let currentAngle = -Math.PI / 2;
        
        Object.entries(data).forEach(([key, value]) => {
            if (value === 0) return;
            
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            ctx.fillStyle = colors[key] || '#ccc';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            currentAngle += sliceAngle;
        });
        
        // Círculo interno para estilo donut
        if (options.donut) {
            ctx.fillStyle = options.backgroundColor || '#ffffff';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Texto central
            if (options.centerText) {
                ctx.fillStyle = options.textColor || '#1a1d29';
                ctx.font = options.centerFont || 'bold 24px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(options.centerText, centerX, centerY);
            }
        }
    }
    
    static drawBarChart(canvas, data, options = {}) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const padding = options.padding || 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        if (!data || data.length === 0) return;
        
        const maxValue = Math.max(...data, 1);
        const barWidth = chartWidth / data.length;
        
        // Configurar estilos
        ctx.fillStyle = options.barColor || '#3CB371';
        
        // Dibujar barras
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * barWidth;
            const y = height - padding - barHeight;
            
            ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
        });
        
        // Etiquetas
        if (options.showLabels !== false) {
            ctx.fillStyle = options.labelColor || '#6c757d';
            ctx.font = options.labelFont || '10px Inter';
            ctx.textAlign = 'center';
            
            data.forEach((value, index) => {
                if (index % (options.labelInterval || 4) === 0) {
                    const x = padding + index * barWidth + barWidth / 2;
                    const label = options.labels ? options.labels[index] : `${index}:00`;
                    ctx.fillText(label, x, height - padding + 15);
                }
            });
        }
    }
    
    static drawAxes(ctx, width, height, padding, color = '#e9ecef') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
    }
    
    static drawLabels(ctx, data, width, height, padding, chartWidth) {
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const label = point.label || point.date || index;
            ctx.fillText(label, x, height - padding + 20);
        });
    }
}

// Hacer disponible globalmente
window.ChartRenderer = ChartRenderer;
