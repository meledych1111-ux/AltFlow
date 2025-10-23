/**
 * GlowBrush - кисть для создания свечения
 * Создает эффекты свечения, неоновых огней, световых следов и мягких бликов
 */
class GlowBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Свечение';
        this.description = 'Создает эффекты свечения, неоновых огней, световых следов и мягких бликов';
        this.category = 'effects';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '✨';
        
        // Параметры свечения
        this.glowIntensity = 0.8;
        this.glowRadius = 2.0;
        this.glowColor = '#ffffff';
        this.innerGlow = true;
        this.outerGlow = true;
        this.glowStyle = 'soft';
        this.pulseEffect = false;
        this.pulseSpeed = 1.0;
        
        // Цветовые параметры
        this.colorShift = 0;
        this.rainbowMode = false;
        
        // Внутренние переменные для анимации
        this.animationTime = 0;
        this.pulsePhase = 0;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createGlowEffect(ctx, x, y, radius, color, pressure);
    }

    createGlowEffect(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Обновляем время анимации для пульсирующего эффекта
        if (this.pulseEffect) {
            this.animationTime += 0.016; // Предполагаем 60 FPS
            this.pulsePhase = Math.sin(this.animationTime * this.pulseSpeed * 2 * Math.PI);
        }
        
        // Создаем основное свечение
        if (this.innerGlow) {
            this.addInnerGlow(ctx, x, y, radius, color, pressure);
        }
        
        if (this.outerGlow) {
            this.addOuterGlow(ctx, x, y, radius, color, pressure);
        }
        
        // Добавляем дополнительные эффекты
        this.addGlowEffects(ctx, x, y, radius, color, pressure);
        
        ctx.restore();
    }

    addInnerGlow(ctx, x, y, radius, color, pressure) {
        // Внутреннее свечение - мягкое свечение внутри формы
        const innerRadius = radius * 0.8;
        const intensity = this.glowIntensity * (this.pulseEffect ? (1 + this.pulsePhase * 0.3) : 1);
        
        // Основное внутреннее свечение
        const innerGradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, innerRadius
        );
        
        // Определяем цвет свечения
        const glowColor = this.rainbowMode ? this.getRainbowColor(x, y) : 
                         (this.glowColor !== '#ffffff' ? this.glowColor : color);
        
        innerGradient.addColorStop(0, this.applyGlowOpacity(glowColor, intensity));
        innerGradient.addColorStop(0.7, this.applyGlowOpacity(glowColor, intensity * 0.5));
        innerGradient.addColorStop(1, this.applyGlowOpacity(glowColor, 0));
        
        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    addOuterGlow(ctx, x, y, radius, color, pressure) {
        // Внешнее свечение - свечение за пределами формы
        const glowSize = radius * this.glowRadius;
        const intensity = this.glowIntensity * (this.pulseEffect ? (1 + this.pulsePhase * 0.3) : 1);
        
        // Создаем несколько слоев для более реалистичного эффекта
        const layers = this.glowStyle === 'intense' ? 3 : 2;
        
        for (let layer = 0; layer < layers; layer++) {
            const layerSize = glowSize * (1 - layer * 0.3);
            const layerIntensity = intensity * Math.pow(0.6, layer);
            
            const outerGradient = ctx.createRadialGradient(
                x, y, radius,
                x, y, radius + layerSize
            );
            
            const glowColor = this.rainbowMode ? this.getRainbowColor(x, y) : 
                             (this.glowColor !== '#ffffff' ? this.glowColor : color);
            
            outerGradient.addColorStop(0, this.applyGlowOpacity(glowColor, layerIntensity));
            outerGradient.addColorStop(0.5, this.applyGlowOpacity(glowColor, layerIntensity * 0.5));
            outerGradient.addColorStop(1, this.applyGlowOpacity(glowColor, 0));
            
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius + layerSize, 0, Math.PI * 2);
            ctx.arc(x, y, radius, Math.PI * 2, 0, true);
            ctx.fill();
        }
    }

    addGlowEffects(ctx, x, y, radius, color, pressure) {
        // Дополнительные эффекты в зависимости от стиля
        switch (this.glowStyle) {
            case 'neon':
                this.addNeonEffect(ctx, x, y, radius, color, pressure);
                break;
            case 'plasma':
                this.addPlasmaEffect(ctx, x, y, radius, color, pressure);
                break;
            case 'crystalline':
                this.addCrystallineEffect(ctx, x, y, radius, color, pressure);
                break;
            case 'soft':
            default:
                this.addSoftGlowEffects(ctx, x, y, radius, color, pressure);
                break;
        }
    }

    addNeonEffect(ctx, x, y, radius, color, pressure) {
        // Неоновый эффект с яркими линиями
        const neonIntensity = this.glowIntensity * 1.5;
        const glowColor = this.rainbowMode ? this.getRainbowColor(x, y) : 
                         (this.glowColor !== '#ffffff' ? this.glowColor : color);
        
        // Внешняя неоновая подсветка
        ctx.strokeStyle = this.applyGlowOpacity(glowColor, neonIntensity);
        ctx.lineWidth = 2;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Внутренние неоновые линии
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 3; i++) {
            const innerRadius = radius * (0.3 + i * 0.2);
            ctx.beginPath();
            ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
    }

    addPlasmaEffect(ctx, x, y, radius, color, pressure) {
        // Плазменный эффект с движущимися частицами
        const particleCount = Math.floor(radius * 0.5);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + this.animationTime;
            const distance = radius * (0.5 + Math.sin(this.animationTime * 2 + i) * 0.3);
            
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            const particleSize = 1 + Math.random() * 3;
            const plasmaColor = this.rainbowMode ? this.getRainbowColor(particleX, particleY) : color;
            
            ctx.fillStyle = this.applyGlowOpacity(plasmaColor, this.glowIntensity);
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    addCrystallineEffect(ctx, x, y, radius, color, pressure) {
        // Кристаллический эффект с гранями
        const facetCount = 8;
        const glowColor = this.rainbowMode ? this.getRainbowColor(x, y) : 
                         (this.glowColor !== '#ffffff' ? this.glowColor : color);
        
        for (let i = 0; i < facetCount; i++) {
            const angle1 = (i / facetCount) * Math.PI * 2;
            const angle2 = ((i + 1) / facetCount) * Math.PI * 2;
            
            const innerRadius = radius * 0.3;
            const outerRadius = radius * (0.8 + Math.sin(this.animationTime + i) * 0.1);
            
            const x1 = x + Math.cos(angle1) * innerRadius;
            const y1 = y + Math.sin(angle1) * innerRadius;
            const x2 = x + Math.cos(angle1) * outerRadius;
            const y2 = y + Math.sin(angle1) * outerRadius;
            const x3 = x + Math.cos(angle2) * outerRadius;
            const y3 = y + Math.sin(angle2) * outerRadius;
            
            const facetGradient = ctx.createLinearGradient(x1, y1, x2, y2);
            facetGradient.addColorStop(0, this.applyGlowOpacity(glowColor, this.glowIntensity * 0.3));
            facetGradient.addColorStop(1, this.applyGlowOpacity(glowColor, this.glowIntensity));
            
            ctx.fillStyle = facetGradient;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.fill();
        }
    }

    addSoftGlowEffects(ctx, x, y, radius, color, pressure) {
        // Мягкие дополнительные эффекты
        const glowColor = this.rainbowMode ? this.getRainbowColor(x, y) : 
                         (this.glowColor !== '#ffffff' ? this.glowColor : color);
        
        // Легкие искры
        const sparkCount = Math.floor(radius * 0.3);
        
        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (0.5 + Math.random() * 0.8);
            
            const sparkX = x + Math.cos(angle) * distance;
            const sparkY = y + Math.sin(angle) * distance;
            
            const sparkSize = 0.5 + Math.random() * 1.5;
            const sparkOpacity = this.glowIntensity * (0.3 + Math.random() * 0.4);
            
            ctx.fillStyle = this.applyGlowOpacity(glowColor, sparkOpacity);
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Вспомогательные методы
     */
    applyGlowOpacity(color, opacity) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    }

    getRainbowColor(x, y) {
        const hue = (this.animationTime * 50 + x * 0.01 + y * 0.01) % 360;
        return `hsl(${hue}, 100%, 50%)`;
    }

    /**
     * Переопределяем getParameters для параметров свечения
     */
    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            glowIntensity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.glowIntensity,
                name: 'Интенсивность свечения',
                type: 'range'
            },
            glowRadius: {
                min: 0.5,
                max: 5,
                step: 0.1,
                default: this.glowRadius,
                name: 'Радиус свечения',
                type: 'range'
            },
            glowColor: {
                type: 'color',
                default: this.glowColor,
                name: 'Цвет свечения'
            },
            glowStyle: {
                type: 'select',
                options: [
                    { value: 'soft', label: 'Мягкое' },
                    { value: 'neon', label: 'Неоновое' },
                    { value: 'plasma', label: 'Плазменное' },
                    { value: 'crystalline', label: 'Кристаллическое' }
                ],
                default: this.glowStyle,
                name: 'Стиль свечения'
            },
            innerGlow: {
                type: 'checkbox',
                default: this.innerGlow,
                name: 'Внутреннее свечение'
            },
            outerGlow: {
                type: 'checkbox',
                default: this.outerGlow,
                name: 'Внешнее свечение'
            },
            pulseEffect: {
                type: 'checkbox',
                default: this.pulseEffect,
                name: 'Пульсирующий эффект'
            },
            pulseSpeed: {
                min: 0.1,
                max: 5,
                step: 0.1,
                default: this.pulseSpeed,
                name: 'Скорость пульсации',
                type: 'range'
            },
            rainbowMode: {
                type: 'checkbox',
                default: this.rainbowMode,
                name: 'Радужный режим'
            },
            colorShift: {
                min: 0,
                max: 360,
                step: 1,
                default: this.colorShift,
                name: 'Сдвиг цвета',
                type: 'range'
            }
        };
    }

    /**
     * Переопределяем serialize для параметров свечения
     */
    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            glowIntensity: this.glowIntensity,
            glowRadius: this.glowRadius,
            glowColor: this.glowColor,
            glowStyle: this.glowStyle,
            innerGlow: this.innerGlow,
            outerGlow: this.outerGlow,
            pulseEffect: this.pulseEffect,
            pulseSpeed: this.pulseSpeed,
            rainbowMode: this.rainbowMode,
            colorShift: this.colorShift
        };
    }

    /**
     * Переопределяем deserialize для параметров свечения
     */
    deserialize(data) {
        super.deserialize(data);
        this.glowIntensity = data.glowIntensity || 0.8;
        this.glowRadius = data.glowRadius || 2.0;
        this.glowColor = data.glowColor || '#ffffff';
        this.glowStyle = data.glowStyle || 'soft';
        this.innerGlow = data.innerGlow !== undefined ? data.innerGlow : true;
        this.outerGlow = data.outerGlow !== undefined ? data.outerGlow : true;
        this.pulseEffect = data.pulseEffect || false;
        this.pulseSpeed = data.pulseSpeed || 1.0;
        this.rainbowMode = data.rainbowMode || false;
        this.colorShift = data.colorShift || 0;
    }

    /**
     * Обновление анимации (должен вызываться каждый кадр)
     */
    updateAnimation() {
        if (this.pulseEffect || this.rainbowMode) {
            this.animationTime += 0.016; // Предполагаем 60 FPS
        }
    }
}