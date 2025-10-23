/**
 * GlassBrush - кисть для создания эффекта стекла
 * Имитирует стеклянную поверхность с прозрачностью, бликами и преломлением
 */
class GlassBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Стекло';
        this.description = 'Имитация стеклянной поверхности с бликами, прозрачностью и эффектами преломления';
        this.category = 'materials';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '💎';
        
        // Стеклянные параметры
        this.transparency = 0.7;
        this.refractiveIndex = 1.5;
        this.thickness = 0.3;
        this.edgeSoftness = 0.8;
        this.innerReflection = 0.6;
        this.distortion = 0.4;
        
        // Эффекты
        this.addBubbles = true;
        this.bubbleDensity = 0.3;
        this.bubbleSize = 0.2;
    }

    /**
     * Основной метод рисования стеклянной кисти
     */
    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createGlassSurface(ctx, x, y, radius, color);
    }

    /**
     * Создание стеклянной поверхности
     */
    createGlassSurface(ctx, x, y, radius, color) {
        ctx.save();
        
        // Базовая прозрачная основа
        this.drawGlassBase(ctx, x, y, radius);
        
        // Внутренние отражения
        this.addInnerReflections(ctx, x, y, radius);
        
        // Внешние блики
        this.addGlassHighlights(ctx, x, y, radius);
        
        // Эффект преломления
        this.addRefractionEffect(ctx, x, y, radius, color);
        
        // Края стекла
        this.addGlassEdges(ctx, x, y, radius);
        
        // Пузырьки (опционально)
        if (this.addBubbles) {
            this.addBubblesEffect(ctx, x, y, radius);
        }
        
        ctx.restore();
    }

    /**
     * Базовая прозрачная основа стекла
     */
    drawGlassBase(ctx, x, y, radius) {
        // Основной градиент прозрачности
        const baseGradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, radius
        );
        
        baseGradient.addColorStop(0, `rgba(255, 255, 255, ${this.transparency * 0.3})`);
        baseGradient.addColorStop(0.7, `rgba(255, 255, 255, ${this.transparency * 0.1})`);
        baseGradient.addColorStop(1, `rgba(255, 255, 255, ${this.transparency * 0.8})`);
        
        ctx.fillStyle = baseGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Дополнительный слой для глубины
        const depthGradient = ctx.createRadialGradient(
            x + radius * 0.1, y + radius * 0.1, 0,
            x, y, radius
        );
        
        depthGradient.addColorStop(0, 'rgba(200, 200, 255, 0.1)');
        depthGradient.addColorStop(1, 'rgba(100, 100, 150, 0.2)');
        
        ctx.fillStyle = depthGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Внутренние отражения
     */
    addInnerReflections(ctx, x, y, radius) {
        // Основное внутреннее отражение
        const innerReflectionX = x - radius * 0.3;
        const innerReflectionY = y - radius * 0.3;
        const innerReflectionSize = radius * 0.4 * this.innerReflection;
        
        const innerGradient = ctx.createRadialGradient(
            innerReflectionX, innerReflectionY, 0,
            innerReflectionX, innerReflectionY, innerReflectionSize
        );
        
        innerGradient.addColorStop(0, `rgba(255, 255, 255, ${this.innerReflection * 0.8})`);
        innerGradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.innerReflection * 0.3})`);
        innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(innerReflectionX, innerReflectionY, innerReflectionSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Дополнительные мелкие отражения
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 6) + (i * Math.PI / 4) + (Math.random() - 0.5) * 0.3;
            const reflectionX = x + Math.cos(angle) * radius * 0.5;
            const reflectionY = y + Math.sin(angle) * radius * 0.5;
            const reflectionSize = radius * 0.1 * this.innerReflection * (0.5 + Math.random() * 0.5);
            
            const smallGradient = ctx.createRadialGradient(
                reflectionX, reflectionY, 0,
                reflectionX, reflectionY, reflectionSize
            );
            
            smallGradient.addColorStop(0, `rgba(255, 255, 255, ${this.innerReflection * 0.4})`);
            smallGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = smallGradient;
            ctx.beginPath();
            ctx.arc(reflectionX, reflectionY, reflectionSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Внешние блики
     */
    addGlassHighlights(ctx, x, y, radius) {
        // Основной блик
        const mainHighlightX = x - radius * 0.25;
        const mainHighlightY = y - radius * 0.25;
        const mainHighlightSize = radius * 0.15;
        
        const mainGradient = ctx.createRadialGradient(
            mainHighlightX, mainHighlightY, 0,
            mainHighlightX, mainHighlightY, mainHighlightSize
        );
        
        mainGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        mainGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
        mainGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = mainGradient;
        ctx.beginPath();
        ctx.arc(mainHighlightX, mainHighlightY, mainHighlightSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Вторичные блики
        const secondaryHighlightX = x + radius * 0.2;
        const secondaryHighlightY = y - radius * 0.3;
        const secondaryHighlightSize = radius * 0.08;
        
        const secondaryGradient = ctx.createRadialGradient(
            secondaryHighlightX, secondaryHighlightY, 0,
            secondaryHighlightX, secondaryHighlightY, secondaryHighlightSize
        );
        
        secondaryGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        secondaryGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = secondaryGradient;
        ctx.beginPath();
        ctx.arc(secondaryHighlightX, secondaryHighlightY, secondaryHighlightSize, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Эффект преломления
     */
    addRefractionEffect(ctx, x, y, radius, color) {
        if (this.distortion <= 0) return;
        
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        
        // Создаем эффект преломления с помощью искажения
        const refractionGradient = ctx.createRadialGradient(
            x + radius * 0.1, y + radius * 0.1, 0,
            x, y, radius
        );
        
        const refractedColor = this.blendColors(color, '#ffffff', 0.3);
        refractionGradient.addColorStop(0, `rgba(${parseInt(refractedColor.slice(1, 3), 16)}, ${parseInt(refractedColor.slice(3, 5), 16)}, ${parseInt(refractedColor.slice(5, 7), 16)}, ${this.distortion * 0.3})`);
        refractionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = refractionGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Края стекла
     */
    addGlassEdges(ctx, x, y, radius) {
        // Внутренний край
        const innerEdgeGradient = ctx.createRadialGradient(
            x, y, radius * (1 - this.thickness),
            x, y, radius
        );
        
        innerEdgeGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        innerEdgeGradient.addColorStop(0.7, `rgba(255, 255, 255, ${this.edgeSoftness * 0.3})`);
        innerEdgeGradient.addColorStop(1, `rgba(200, 200, 255, ${this.edgeSoftness * 0.5})`);
        
        ctx.fillStyle = innerEdgeGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.arc(x, y, radius * (1 - this.thickness), Math.PI * 2, 0, true);
        ctx.fill();
        
        // Внешний край
        const outerEdgeGradient = ctx.createRadialGradient(
            x, y, radius * 0.9,
            x, y, radius
        );
        
        outerEdgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        outerEdgeGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
        outerEdgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.fillStyle = outerEdgeGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Эффект пузырьков
     */
    addBubblesEffect(ctx, x, y, radius) {
        if (!this.addBubbles || this.bubbleDensity <= 0) return;
        
        const bubbleCount = Math.floor(radius * this.bubbleDensity);
        
        for (let i = 0; i < bubbleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.8;
            const bubbleX = x + Math.cos(angle) * distance;
            const bubbleY = y + Math.sin(angle) * distance;
            const bubbleRadius = radius * this.bubbleSize * (0.5 + Math.random() * 0.5);
            
            // Градиент для пузырька
            const bubbleGradient = ctx.createRadialGradient(
                bubbleX - bubbleRadius * 0.3, bubbleY - bubbleRadius * 0.3, 0,
                bubbleX, bubbleY, bubbleRadius
            );
            
            bubbleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            bubbleGradient.addColorStop(0.7, 'rgba(200, 200, 255, 0.4)');
            bubbleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = bubbleGradient;
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Переопределяем getParameters для стеклянных параметров
     */
    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            transparency: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.transparency,
                name: 'Прозрачность',
                type: 'range'
            },
            refractiveIndex: {
                min: 1,
                max: 3,
                step: 0.1,
                default: this.refractiveIndex,
                name: 'Показатель преломления',
                type: 'range'
            },
            thickness: {
                min: 0.1,
                max: 0.8,
                step: 0.01,
                default: this.thickness,
                name: 'Толщина',
                type: 'range'
            },
            edgeSoftness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.edgeSoftness,
                name: 'Мягкость краев',
                type: 'range'
            },
            innerReflection: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.innerReflection,
                name: 'Внутреннее отражение',
                type: 'range'
            },
            distortion: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.distortion,
                name: 'Искажение',
                type: 'range'
            },
            addBubbles: {
                type: 'checkbox',
                default: this.addBubbles,
                name: 'Добавить пузырьки'
            },
            bubbleDensity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.bubbleDensity,
                name: 'Плотность пузырьков',
                type: 'range'
            },
            bubbleSize: {
                min: 0.05,
                max: 0.5,
                step: 0.01,
                default: this.bubbleSize,
                name: 'Размер пузырьков',
                type: 'range'
            }
        };
    }

    /**
     * Переопределяем serialize для стеклянных параметров
     */
    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            transparency: this.transparency,
            refractiveIndex: this.refractiveIndex,
            thickness: this.thickness,
            edgeSoftness: this.edgeSoftness,
            innerReflection: this.innerReflection,
            distortion: this.distortion,
            addBubbles: this.addBubbles,
            bubbleDensity: this.bubbleDensity,
            bubbleSize: this.bubbleSize
        };
    }

    /**
     * Переопределяем deserialize для стеклянных параметров
     */
    deserialize(data) {
        super.deserialize(data);
        this.transparency = data.transparency || 0.7;
        this.refractiveIndex = data.refractiveIndex || 1.5;
        this.thickness = data.thickness || 0.3;
        this.edgeSoftness = data.edgeSoftness || 0.8;
        this.innerReflection = data.innerReflection || 0.6;
        this.distortion = data.distortion || 0.4;
        this.addBubbles = data.addBubbles !== undefined ? data.addBubbles : true;
        this.bubbleDensity = data.bubbleDensity || 0.3;
        this.bubbleSize = data.bubbleSize || 0.2;
    }
}
