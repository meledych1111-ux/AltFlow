/**
 * ArtistBrushes - коллекция художественных кистей для профессионального рисования
 * Включает масляные, акварельные, пастельные и другие художественные техники
 */

/**
 * OilPaintBrush - кисть для масляной живописи
 * Создает текстуру масляных красок с мазками и смешиванием
 */
class OilPaintBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Масляная Краска';
        this.description = 'Кисть для создания текстуры масляных красок с мазками и смешиванием';
        this.category = 'oil-paint';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '🎨';
        
        // Параметры для масляной краски
        this.paintViscosity = 0.8;
        this.brushStroke = 'visible';
        this.colorMixing = 0.6;
        this.impastoEffect = 0.4;
        this.dryingLevel = 0.2;
        this.canvasTexture = 'linen';
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createOilPaintEffect(ctx, x, y, radius, color, pressure);
    }

    createOilPaintEffect(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Основной слой краски
        this.drawPaintBase(ctx, x, y, radius, color, pressure);
        
        // Добавляем текстуру мазков
        this.addBrushStrokes(ctx, x, y, radius, color, pressure);
        
        // Эффект импасто (объемные мазки)
        if (this.impastoEffect > 0) {
            this.addImpastoEffect(ctx, x, y, radius, color, pressure);
        }
        
        // Смешивание цветов
        if (this.colorMixing > 0) {
            this.addColorMixing(ctx, x, y, radius, color, pressure);
        }
        
        // Текстура холста
        this.addCanvasTexture(ctx, x, y, radius, color, pressure);
        
        ctx.restore();
    }

    drawPaintBase(ctx, x, y, radius, color, pressure) {
        // Базовый слой с вариацией цвета
        const variation = 20 * (1 - this.dryingLevel);
        const baseColor = this.darkenColor(color, this.paintViscosity * 10);
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, this.lightenColor(baseColor, variation * 0.5));
        gradient.addColorStop(0.7, baseColor);
        gradient.addColorStop(1, this.darkenColor(baseColor, variation));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    addBrushStrokes(ctx, x, y, radius, color, pressure) {
        if (this.brushStroke === 'none') return;
        
        // Создаем текстуру мазков
        const strokeCount = Math.floor(radius * 3 * pressure);
        
        for (let i = 0; i < strokeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.8;
            const strokeX = x + Math.cos(angle) * distance;
            const strokeY = y + Math.sin(angle) * distance;
            
            const strokeLength = radius * 0.3 * (0.5 + Math.random());
            const strokeWidth = radius * 0.1 * (0.3 + Math.random());
            const strokeAngle = angle + (Math.random() - 0.5) * Math.PI * 0.5;
            
            // Цвет мазка с вариацией
            const strokeBrightness = (Math.random() - 0.5) * 30 * (1 - this.dryingLevel);
            const strokeColor = strokeBrightness > 0
                ? this.lightenColor(color, strokeBrightness)
                : this.darkenColor(color, -strokeBrightness);
            
            // Рисуем мазок
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.6;
            
            ctx.beginPath();
            ctx.moveTo(strokeX, strokeY);
            ctx.lineTo(
                strokeX + Math.cos(strokeAngle) * strokeLength,
                strokeY + Math.sin(strokeAngle) * strokeLength
            );
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }

    addImpastoEffect(ctx, x, y, radius, color, pressure) {
        // Объемные мазки импасто
        const impastoIntensity = this.impastoEffect;
        
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
            const distance = radius * 0.6 + Math.random() * radius * 0.3;
            const impastoX = x + Math.cos(angle) * distance;
            const impastoY = y + Math.sin(angle) * distance;
            
            const impastoSize = radius * 0.2 * (0.7 + Math.random() * 0.6);
            
            // Создаем объемный мазок
            const highlightColor = this.lightenColor(color, 25);
            const shadowColor = this.darkenColor(color, 25);
            
            const impastoGradient = ctx.createRadialGradient(
                impastoX - impastoSize * 0.3, impastoY - impastoSize * 0.3, 0,
                impastoX, impastoY, impastoSize
            );
            
            impastoGradient.addColorStop(0, highlightColor);
            impastoGradient.addColorStop(0.5, color);
            impastoGradient.addColorStop(1, shadowColor);
            
            ctx.fillStyle = impastoGradient;
            ctx.beginPath();
            ctx.arc(impastoX, impastoY, impastoSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    addColorMixing(ctx, x, y, radius, color, pressure) {
        // Эффект смешивания цветов
        const mixingRadius = radius * this.colorMixing;
        
        // Добавляем близкие цвета для эффекта смешивания
        const neighborColors = [
            this.blendColors(color, '#FF6B6B', 0.3),
            this.blendColors(color, '#4ECDC4', 0.3),
            this.blendColors(color, '#45B7D1', 0.3)
        ];
        
        neighborColors.forEach((mixColor, index) => {
            const angle = (index / neighborColors.length) * Math.PI * 2;
            const mixX = x + Math.cos(angle) * mixingRadius;
            const mixY = y + Math.sin(angle) * mixingRadius;
            const mixSize = mixingRadius * 0.6;
            
            ctx.fillStyle = mixColor;
            ctx.globalAlpha = 0.3 * this.colorMixing;
            ctx.beginPath();
            ctx.arc(mixX, mixY, mixSize, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
    }

    addCanvasTexture(ctx, x, y, radius, color, pressure) {
        // Текстура холста
        const textureIntensity = 0.1;
        const texturePoints = Math.floor(radius * radius * 0.05);
        
        ctx.globalCompositeOperation = 'multiply';
        
        for (let i = 0; i < texturePoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const textureX = x + Math.cos(angle) * distance;
            const textureY = y + Math.sin(angle) * distance;
            
            const size = 1 + Math.random() * 2;
            const brightness = (Math.random() - 0.5) * 15;
            
            const textureColor = brightness > 0
                ? this.darkenColor(color, brightness)
                : this.lightenColor(color, -brightness);
            
            ctx.fillStyle = textureColor;
            ctx.globalAlpha = textureIntensity;
            ctx.fillRect(textureX, textureY, size, size);
        }
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            paintViscosity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.paintViscosity,
                name: 'Вязкость краски',
                type: 'range'
            },
            brushStroke: {
                type: 'select',
                options: [
                    { value: 'visible', label: 'Видимые мазки' },
                    { value: 'subtle', label: 'Тонкие мазки' },
                    { value: 'none', label: 'Без мазков' }
                ],
                default: this.brushStroke,
                name: 'Стиль мазков'
            },
            colorMixing: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.colorMixing,
                name: 'Смешивание цветов',
                type: 'range'
            },
            impastoEffect: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.impastoEffect,
                name: 'Эффект импасто',
                type: 'range'
            },
            dryingLevel: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.dryingLevel,
                name: 'Уровень высыхания',
                type: 'range'
            },
            canvasTexture: {
                type: 'select',
                options: [
                    { value: 'linen', label: 'Льняной холст' },
                    { value: 'cotton', label: 'Хлопковый холст' },
                    { value: 'smooth', label: 'Гладкий' },
                    { value: 'rough', label: 'Шероховатый' }
                ],
                default: this.canvasTexture,
                name: 'Текстура холста'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            paintViscosity: this.paintViscosity,
            brushStroke: this.brushStroke,
            colorMixing: this.colorMixing,
            impastoEffect: this.impastoEffect,
            dryingLevel: this.dryingLevel,
            canvasTexture: this.canvasTexture
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.paintViscosity = data.paintViscosity || 0.8;
        this.brushStroke = data.brushStroke || 'visible';
        this.colorMixing = data.colorMixing || 0.6;
        this.impastoEffect = data.impastoEffect || 0.4;
        this.dryingLevel = data.dryingLevel || 0.2;
        this.canvasTexture = data.canvasTexture || 'linen';
    }
}

/**
 * WatercolorBrush - кисть для акварельной живописи
 * Создает прозрачные, текучие мазки с эффектом смешивания воды
 */
class WatercolorBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Акварель';
        this.description = 'Кисть для акварельной живописи с прозрачными, текучими мазками';
        this.category = 'watercolor';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '💧';
        
        // Параметры для акварели
        this.waterAmount = 0.7;
        this.colorFlow = 0.6;
        this.pigmentGranulation = 0.4;
        this.backrunEffect = 0.3;
        this.paperTexture = 'cold-pressed';
        this.bleeding = 0.5;
        this.layering = 0.6;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createWatercolorEffect(ctx, x, y, radius, color, pressure);
    }

    createWatercolorEffect(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Прозрачность на основе воды
        ctx.globalAlpha = this.waterAmount * pressure;
        
        // Основной слой акварели
        this.drawWatercolorBase(ctx, x, y, radius, color, pressure);
        
        // Эффект течения воды
        this.addWaterFlow(ctx, x, y, radius, color, pressure);
        
        // Грануляция пигмента
        if (this.pigmentGranulation > 0) {
            this.addPigmentGranulation(ctx, x, y, radius, color, pressure);
        }
        
        // Эффект обратного течения (backrun)
        if (this.backrunEffect > 0) {
            this.addBackrunEffect(ctx, x, y, radius, color, pressure);
        }
        
        // Текстура бумаги
        this.addPaperTexture(ctx, x, y, radius, color, pressure);
        
        // Эффект растекания
        this.addBleedingEffect(ctx, x, y, radius, color, pressure);
        
        ctx.restore();
    }

    drawWatercolorBase(ctx, x, y, radius, color, pressure) {
        // Основной слой с вариацией цвета от воды
        const waterDilution = this.waterAmount * 0.5;
        const baseColor = this.blendColors(color, '#FFFFFF', waterDilution);
        
        // Несколько слоев для создания эффекта акварели
        for (let layer = 0; layer < 3; layer++) {
            const layerRadius = radius * (1 - layer * 0.2);
            const layerOpacity = (1 - layer * 0.3) * this.layering;
            const layerColor = layer === 0 ? baseColor : this.darkenColor(baseColor, layer * 10);
            
            ctx.globalAlpha = layerOpacity * pressure;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
            gradient.addColorStop(0, layerColor);
            gradient.addColorStop(0.7, this.blendColors(layerColor, '#FFFFFF', 0.3));
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, layerRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    addWaterFlow(ctx, x, y, radius, color, pressure) {
        // Эффект течения воды
        const flowStrength = this.colorFlow;
        const flowDirections = 4;
        
        for (let i = 0; i < flowDirections; i++) {
            const angle = (i / flowDirections) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const flowDistance = radius * flowStrength * (0.5 + Math.random() * 0.5);
            
            const flowGradient = ctx.createLinearGradient(
                x, y,
                x + Math.cos(angle) * flowDistance,
                y + Math.sin(angle) * flowDistance
            );
            
            const flowColor = this.blendColors(color, '#FFFFFF', 0.4);
            flowGradient.addColorStop(0, flowColor);
            flowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = flowGradient;
            ctx.globalAlpha = 0.3 * flowStrength;
            
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    addPigmentGranulation(ctx, x, y, radius, color, pressure) {
        // Грануляция пигмента - создает текстуру
        const granuleCount = Math.floor(radius * radius * 0.1 * this.pigmentGranulation);
        
        for (let i = 0; i < granuleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.9;
            const granuleX = x + Math.cos(angle) * distance;
            const granuleY = y + Math.sin(angle) * distance;
            
            const granuleSize = 1 + Math.random() * 3;
            const granuleColor = this.darkenColor(color, 10 + Math.random() * 20);
            
            ctx.fillStyle = granuleColor;
            ctx.globalAlpha = 0.6 * this.pigmentGranulation;
            ctx.fillRect(granuleX, granuleY, granuleSize, granuleSize);
        }
    }

    addBackrunEffect(ctx, x, y, radius, color, pressure) {
        // Эффект обратного течения - создает интересные текстуры
        const backrunCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < backrunCount; i++) {
            const backrunRadius = radius * (0.3 + Math.random() * 0.4);
            const backrunX = x + (Math.random() - 0.5) * radius;
            const backrunY = y + (Math.random() - 0.5) * radius;
            
            const backrunGradient = ctx.createRadialGradient(
                backrunX, backrunY, 0,
                backrunX, backrunY, backrunRadius
            );
            
            backrunGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            backrunGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = backrunGradient;
            ctx.globalAlpha = 0.4 * this.backrunEffect;
            ctx.beginPath();
            ctx.arc(backrunX, backrunY, backrunRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    addPaperTexture(ctx, x, y, radius, color, pressure) {
        // Текстура бумаги
        let textureIntensity;
        switch (this.paperTexture) {
            case 'hot-pressed':
                textureIntensity = 0.1;
                break;
            case 'cold-pressed':
                textureIntensity = 0.3;
                break;
            case 'rough':
                textureIntensity = 0.5;
                break;
            default:
                textureIntensity = 0.2;
        }
        
        const texturePoints = Math.floor(radius * radius * 0.2);
        
        ctx.globalCompositeOperation = 'multiply';
        
        for (let i = 0; i < texturePoints; i++) {
            const textureX = x + (Math.random() - 0.5) * radius * 2;
            const textureY = y + (Math.random() - 0.5) * radius * 2;
            
            const size = 0.5 + Math.random() * 1.5;
            const brightness = (Math.random() - 0.5) * 8;
            
            const textureColor = brightness > 0
                ? this.lightenColor('#FFFFFF', brightness)
                : this.darkenColor('#CCCCCC', -brightness);
            
            ctx.fillStyle = textureColor;
            ctx.globalAlpha = textureIntensity * Math.random();
            ctx.fillRect(textureX, textureY, size, size);
        }
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    addBleedingEffect(ctx, x, y, radius, color, pressure) {
        // Эффект растекания краски по бумаге
        const bleedCount = Math.floor(this.bleeding * 8);
        
        for (let i = 0; i < bleedCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (1 + Math.random() * 0.5);
            
            const bleedX = x + Math.cos(angle) * distance;
            const bleedY = y + Math.sin(angle) * distance;
            
            const bleedSize = radius * 0.3 * (0.3 + Math.random() * 0.4);
            const bleedOpacity = this.bleeding * (0.2 + Math.random() * 0.3);
            
            const bleedGradient = ctx.createRadialGradient(
                bleedX, bleedY, 0,
                bleedX, bleedY, bleedSize
            );
            
            bleedGradient.addColorStop(0, this.blendColors(color, '#FFFFFF', 0.7));
            bleedGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = bleedGradient;
            ctx.globalAlpha = bleedOpacity;
            ctx.beginPath();
            ctx.arc(bleedX, bleedY, bleedSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            waterAmount: {
                min: 0.2,
                max: 1,
                step: 0.01,
                default: this.waterAmount,
                name: 'Количество воды',
                type: 'range'
            },
            colorFlow: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.colorFlow,
                name: 'Течение цвета',
                type: 'range'
            },
            pigmentGranulation: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.pigmentGranulation,
                name: 'Грануляция пигмента',
                type: 'range'
            },
            backrunEffect: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.backrunEffect,
                name: 'Эффект обратного течения',
                type: 'range'
            },
            paperTexture: {
                type: 'select',
                options: [
                    { value: 'hot-pressed', label: 'Гладкая (hot-pressed)' },
                    { value: 'cold-pressed', label: 'Средняя (cold-pressed)' },
                    { value: 'rough', label: 'Шероховатая (rough)' }
                ],
                default: this.paperTexture,
                name: 'Текстура бумаги'
            },
            bleeding: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.bleeding,
                name: 'Растекание',
                type: 'range'
            },
            layering: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.layering,
                name: 'Наложение слоев',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            waterAmount: this.waterAmount,
            colorFlow: this.colorFlow,
            pigmentGranulation: this.pigmentGranulation,
            backrunEffect: this.backrunEffect,
            paperTexture: this.paperTexture,
            bleeding: this.bleeding,
            layering: this.layering
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.waterAmount = data.waterAmount || 0.7;
        this.colorFlow = data.colorFlow || 0.6;
        this.pigmentGranulation = data.pigmentGranulation || 0.4;
        this.backrunEffect = data.backrunEffect || 0.3;
        this.paperTexture = data.paperTexture || 'cold-pressed';
        this.bleeding = data.bleeding || 0.5;
        this.layering = data.layering || 0.6;
    }
}

/**
 * PastelBrush - кисть для пастельной живописи
 * Создает мягкую, бархатистую текстуру пастели
 */
class PastelBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Пастель';
        this.description = 'Кисть для пастельной живописи с мягкой, бархатистой текстурой';
        this.category = 'pastel';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '🖍️';
        
        // Параметры для пастели
        this.softness = 0.8;
        this.dustAmount = 0.6;
        this.paperTooth = 0.4;
        this.blending = 0.7;
        this.pastelType = 'soft';
        this.paperColor = '#F5F5DC';
        this.textureScale = 1.0;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createPastelEffect(ctx, x, y, radius, color, pressure);
    }

    createPastelEffect(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Основной слой пастели
        this.drawPastelBase(ctx, x, y, radius, color, pressure);
        
        // Эффект мягкости пастели
        this.addSoftnessEffect(ctx, x, y, radius, color, pressure);
        
        // Пастельная пыль
        if (this.dustAmount > 0) {
            this.addPastelDust(ctx, x, y, radius, color, pressure);
        }
        
        // Зубчатость бумаги
        if (this.paperTooth > 0) {
            this.addPaperTooth(ctx, x, y, radius, color, pressure);
        }
        
        // Смешивание
        if (this.blending > 0) {
            this.addBlendingEffect(ctx, x, y, radius, color, pressure);
        }
        
        ctx.restore();
    }

    drawPastelBase(ctx, x, y, radius, color, pressure) {
        // Базовый слой пастели с мягким градиентом
        const softnessFactor = this.softness;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, this.lightenColor(color, 15 * softnessFactor));
        gradient.addColorStop(0.6, color);
        gradient.addColorStop(1, this.darkenColor(color, 25 * softnessFactor));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    addSoftnessEffect(ctx, x, y, radius, color, pressure) {
        // Мягкие края пастели
        const softness = this.softness;
        
        for (let i = 0; i < 5; i++) {
            const offset = (Math.random() - 0.5) * radius * 0.3;
            const softX = x + offset;
            const softY = y + offset;
            const softRadius = radius * (0.8 + Math.random() * 0.4);
            
            const softColor = this.blendColors(color, '#FFFFFF', 0.3 * softness);
            
            const gradient = ctx.createRadialGradient(softX, softY, 0, softX, softY, softRadius);
            gradient.addColorStop(0, softColor);
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.2 * softness;
            ctx.beginPath();
            ctx.arc(softX, softY, softRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }

    addPastelDust(ctx, x, y, radius, color, pressure) {
        // Пастельная пыль вокруг мазка
        const dustCount = Math.floor(radius * 2 * this.dustAmount);
        
        for (let i = 0; i < dustCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (1 + Math.random() * 0.5);
            
            const dustX = x + Math.cos(angle) * distance;
            const dustY = y + Math.sin(angle) * distance;
            
            const dustSize = 0.5 + Math.random() * 2;
            const dustOpacity = this.dustAmount * (0.1 + Math.random() * 0.3);
            
            ctx.fillStyle = color;
            ctx.globalAlpha = dustOpacity;
            ctx.fillRect(dustX, dustY, dustSize, dustSize);
        }
        
        ctx.globalAlpha = 1;
    }

    addPaperTooth(ctx, x, y, radius, color, pressure) {
        // Зубчатость бумаги - создает характерную текстуру пастели
        const toothSize = 2 / this.textureScale;
        const toothCount = Math.floor(radius * radius * 0.5 * this.paperTooth);
        
        ctx.globalCompositeOperation = 'multiply';
        
        for (let i = 0; i < toothCount; i++) {
            const toothX = x + (Math.random() - 0.5) * radius * 2;
            const toothY = y + (Math.random() - 0.5) * radius * 2;
            
            const brightness = (Math.random() - 0.5) * 20;
            const toothColor = brightness > 0
                ? this.lightenColor(this.paperColor, brightness)
                : this.darkenColor(this.paperColor, -brightness);
            
            ctx.fillStyle = toothColor;
            ctx.globalAlpha = 0.3 * this.paperTooth;
            ctx.fillRect(toothX, toothY, toothSize, toothSize);
        }
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    addBlendingEffect(ctx, x, y, radius, color, pressure) {
        // Эффект смешивания пастели
        const blendRadius = radius * this.blending;
        
        // Добавляем смешанные цвета
        const blendColors = [
            this.blendColors(color, '#FFFFFF', 0.4),
            this.blendColors(color, '#F5F5DC', 0.3),
            this.blendColors(color, '#FFE4E1', 0.2)
        ];
        
        blendColors.forEach((blendColor, index) => {
            const angle = (index / blendColors.length) * Math.PI * 2;
            const blendX = x + Math.cos(angle) * blendRadius * 0.5;
            const blendY = y + Math.sin(angle) * blendRadius * 0.5;
            
            const blendSize = blendRadius * (0.3 + Math.random() * 0.4);
            
            ctx.fillStyle = blendColor;
            ctx.globalAlpha = 0.3 * this.blending;
            ctx.beginPath();
            ctx.arc(blendX, blendY, blendSize, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            softness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.softness,
                name: 'Мягкость',
                type: 'range'
            },
            dustAmount: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.dustAmount,
                name: 'Количество пыли',
                type: 'range'
            },
            paperTooth: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.paperTooth,
                name: 'Зубчатость бумаги',
                type: 'range'
            },
            blending: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.blending,
                name: 'Смешивание',
                type: 'range'
            },
            pastelType: {
                type: 'select',
                options: [
                    { value: 'soft', label: 'Мягкая пастель' },
                    { value: 'hard', label: 'Твердая пастель' },
                    { value: 'oil', label: 'Масляная пастель' }
                ],
                default: this.pastelType,
                name: 'Тип пастели'
            },
            paperColor: {
                type: 'color',
                default: this.paperColor,
                name: 'Цвет бумаги'
            },
            textureScale: {
                min: 0.5,
                max: 3,
                step: 0.1,
                default: this.textureScale,
                name: 'Масштаб текстуры',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            softness: this.softness,
            dustAmount: this.dustAmount,
            paperTooth: this.paperTooth,
            blending: this.blending,
            pastelType: this.pastelType,
            paperColor: this.paperColor,
            textureScale: this.textureScale
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.softness = data.softness || 0.8;
        this.dustAmount = data.dustAmount || 0.6;
        this.paperTooth = data.paperTooth || 0.4;
        this.blending = data.blending || 0.7;
        this.pastelType = data.pastelType || 'soft';
        this.paperColor = data.paperColor || '#F5F5DC';
        this.textureScale = data.textureScale || 1.0;
    }
}

/**
 * CharcoalBrush - кисть для угольной живописи
 * Создает графичную, контрастную текстуру угля
 */
class CharcoalBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Уголь';
        this.description = 'Кисть для угольной живописи с графичной, контрастной текстурой';
        this.category = 'charcoal';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '🖤';
        
        // Параметры для угля
        this.charcoalHardness = 0.3;
        this.smudgeAmount = 0.6;
        this.paperGrain = 0.7;
        this.contrast = 0.8;
        this.dustLevel = 0.4;
        this.fixativeLevel = 0.2;
        this.strokeDirection = 'random';
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createCharcoalEffect(ctx, x, y, radius, color, pressure);
    }

    createCharcoalEffect(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Основной слой угля
        this.drawCharcoalBase(ctx, x, y, radius, color, pressure);
        
        // Текстура бумаги
        this.addPaperGrain(ctx, x, y, radius, color, pressure);
        
        // Эффект размазывания
        if (this.smudgeAmount > 0) {
            this.addSmudgeEffect(ctx, x, y, radius, color, pressure);
        }
        
        // Угольная пыль
        if (this.dustLevel > 0) {
            this.addCharcoalDust(ctx, x, y, radius, color, pressure);
        }
        
        // Контраст и направление штрихов
        this.addStrokeDirection(ctx, x, y, radius, color, pressure);
        
        ctx.restore();
    }

    drawCharcoalBase(ctx, x, y, radius, color, pressure) {
        // Базовый слой угля с вариацией тона
        const hardnessFactor = 1 - this.charcoalHardness;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, this.darkenColor(color, 20 * hardnessFactor));
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, this.lightenColor(color, 30 * hardnessFactor));
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    addPaperGrain(ctx, x, y, radius, color, pressure) {
        // Зубчатость бумаги для угля
        const grainSize = 2;
        const grainCount = Math.floor(radius * radius * 0.3 * this.paperGrain);
        
        ctx.globalCompositeOperation = 'multiply';
        
        for (let i = 0; i < grainCount; i++) {
            const grainX = x + (Math.random() - 0.5) * radius * 2;
            const grainY = y + (Math.random() - 0.5) * radius * 2;
            
            const brightness = (Math.random() - 0.5) * 40 * this.paperGrain;
            const grainColor = brightness > 0
                ? this.lightenColor('#FFFFFF', brightness)
                : this.darkenColor('#000000', -brightness);
            
            ctx.fillStyle = grainColor;
            ctx.globalAlpha = 0.4 * this.paperGrain;
            ctx.fillRect(grainX, grainY, grainSize, grainSize);
        }
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    addSmudgeEffect(ctx, x, y, radius, color, pressure) {
        // Эффект размазывания угля
        const smudgeCount = Math.floor(this.smudgeAmount * 8);
        
        for (let i = 0; i < smudgeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (0.5 + Math.random() * 0.8);
            
            const smudgeX = x + Math.cos(angle) * distance;
            const smudgeY = y + Math.sin(angle) * distance;
            
            const smudgeLength = radius * 0.3 * (0.5 + Math.random());
            const smudgeWidth = radius * 0.05 * (0.3 + Math.random() * 0.7);
            
            // Направление размазывания
            const smudgeAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
            
            ctx.strokeStyle = this.lightenColor(color, 20 + Math.random() * 20);
            ctx.lineWidth = smudgeWidth;
            ctx.globalAlpha = 0.3 * this.smudgeAmount;
            
            ctx.beginPath();
            ctx.moveTo(smudgeX, smudgeY);
            ctx.lineTo(
                smudgeX + Math.cos(smudgeAngle) * smudgeLength,
                smudgeY + Math.sin(smudgeAngle) * smudgeLength
            );
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }

    addCharcoalDust(ctx, x, y, radius, color, pressure) {
        // Угольная пыль
        const dustCount = Math.floor(radius * 3 * this.dustLevel);
        
        for (let i = 0; i < dustCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (1 + Math.random() * 0.6);
            
            const dustX = x + Math.cos(angle) * distance;
            const dustY = y + Math.sin(angle) * distance;
            
            const dustSize = 0.5 + Math.random() * 2;
            const dustOpacity = this.dustLevel * (0.1 + Math.random() * 0.2);
            
            ctx.fillStyle = this.lightenColor(color, Math.random() * 40);
            ctx.globalAlpha = dustOpacity;
            ctx.fillRect(dustX, dustY, dustSize, dustSize);
        }
        
        ctx.globalAlpha = 1;
    }

    addStrokeDirection(ctx, x, y, radius, color, pressure) {
        // Направление штрихов для создания формы
        let baseAngle = 0;
        
        switch (this.strokeDirection) {
            case 'horizontal':
                baseAngle = 0;
                break;
            case 'vertical':
                baseAngle = Math.PI / 2;
                break;
            case 'diagonal':
                baseAngle = Math.PI / 4;
                break;
            case 'circular':
                // Круговые штрихи
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const distance = radius * (0.3 + Math.random() * 0.4);
                    
                    const strokeX = x + Math.cos(angle) * distance;
                    const strokeY = y + Math.sin(angle) * distance;
                    
                    const strokeLength = radius * 0.2;
                    const strokeWidth = radius * 0.03;
                    
                    ctx.strokeStyle = this.darkenColor(color, 10 + Math.random() * 20);
                    ctx.lineWidth = strokeWidth;
                    ctx.globalAlpha = 0.4 * this.contrast;
                    
                    ctx.beginPath();
                    ctx.arc(strokeX, strokeY, strokeLength, angle - Math.PI/4, angle + Math.PI/4);
                    ctx.stroke();
                }
                return;
            case 'random':
            default:
                // Случайные направления
                for (let i = 0; i < 12; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * radius * 0.8;
                    
                    const strokeX = x + Math.cos(angle) * distance;
                    const strokeY = y + Math.sin(angle) * distance;
                    
                    const strokeLength = radius * 0.15 * (0.5 + Math.random());
                    const strokeWidth = radius * 0.02 * (0.5 + Math.random());
                    const strokeAngle = angle + (Math.random() - 0.5) * 0.5;
                    
                    ctx.strokeStyle = this.darkenColor(color, 15 + Math.random() * 25);
                    ctx.lineWidth = strokeWidth;
                    ctx.globalAlpha = 0.3 * this.contrast;
                    
                    ctx.beginPath();
                    ctx.moveTo(strokeX, strokeY);
                    ctx.lineTo(
                        strokeX + Math.cos(strokeAngle) * strokeLength,
                        strokeY + Math.sin(strokeAngle) * strokeLength
                    );
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
                return;
        }
        
        // Линейные штрихи для других направлений
        const strokeCount = Math.floor(radius * 2);
        
        for (let i = 0; i < strokeCount; i++) {
            const offset = (i / strokeCount - 0.5) * radius * 2;
            
            const strokeX = x + Math.cos(baseAngle + Math.PI/2) * offset;
            const strokeY = y + Math.sin(baseAngle + Math.PI/2) * offset;
            
            const strokeLength = radius * 0.3 * (0.7 + Math.random() * 0.6);
            const strokeWidth = radius * 0.01 * (0.5 + Math.random() * 0.5);
            
            ctx.strokeStyle = this.darkenColor(color, 10 + Math.random() * 30);
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = 0.4 * this.contrast;
            
            ctx.beginPath();
            ctx.moveTo(
                strokeX - Math.cos(baseAngle) * strokeLength/2,
                strokeY - Math.sin(baseAngle) * strokeLength/2
            );
            ctx.lineTo(
                strokeX + Math.cos(baseAngle) * strokeLength/2,
                strokeY + Math.sin(baseAngle) * strokeLength/2
            );
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            charcoalHardness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.charcoalHardness,
                name: 'Твердость угля',
                type: 'range'
            },
            smudgeAmount: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.smudgeAmount,
                name: 'Размазывание',
                type: 'range'
            },
            paperGrain: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.paperGrain,
                name: 'Зерно бумаги',
                type: 'range'
            },
            contrast: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.contrast,
                name: 'Контраст',
                type: 'range'
            },
            dustLevel: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.dustLevel,
                name: 'Уровень пыли',
                type: 'range'
            },
            fixativeLevel: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.fixativeLevel,
                name: 'Уровень фиксации',
                type: 'range'
            },
            strokeDirection: {
                type: 'select',
                options: [
                    { value: 'random', label: 'Случайное' },
                    { value: 'horizontal', label: 'Горизонтальное' },
                    { value: 'vertical', label: 'Вертикальное' },
                    { value: 'diagonal', label: 'Диагональное' },
                    { value: 'circular', label: 'Круговое' }
                ],
                default: this.strokeDirection,
                name: 'Направление штрихов'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            charcoalHardness: this.charcoalHardness,
            smudgeAmount: this.smudgeAmount,
            paperGrain: this.paperGrain,
            contrast: this.contrast,
            dustLevel: this.dustLevel,
            fixativeLevel: this.fixativeLevel,
            strokeDirection: this.strokeDirection
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.charcoalHardness = data.charcoalHardness || 0.3;
        this.smudgeAmount = data.smudgeAmount || 0.6;
        this.paperGrain = data.paperGrain || 0.7;
        this.contrast = data.contrast || 0.8;
        this.dustLevel = data.dustLevel || 0.4;
        this.fixativeLevel = data.fixativeLevel || 0.2;
        this.strokeDirection = data.strokeDirection || 'random';
    }
}

/**
 * InkBrush - кисть для тушевой живописи
 * Создает графичные, контрастные мазки с эффектом туши
 */
class InkBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Тушь';
        this.description = 'Кисть для тушевой живописи с графичными, контрастными мазками';
        this.category = 'ink';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '🖋️';
        
        // Параметры для туши
        this.inkFlow = 0.8;
        this.brushSaturation = 0.9;
        this.paperAbsorption = 0.6;
        this.bleeding = 0.3;
        this.lineVariation = 0.7;
        this.dryBrushEffect = 0.4;
        this.inkDensity = 0.95;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createInkEffect(ctx, x, y, radius, color, pressure);
    }

    createInkEffect(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Основной слой туши
        this.drawInkBase(ctx, x, y, radius, color, pressure);
        
        // Вариация линии
        this.addLineVariation(ctx, x, y, radius, color, pressure);
        
        // Эффект впитывания бумагой
        this.addPaperAbsorption(ctx, x, y, radius, color, pressure);
        
        // Эффект сухой кисти
        if (this.dryBrushEffect > 0) {
            this.addDryBrushEffect(ctx, x, y, radius, color, pressure);
        }
        
        // Растекание туши
        if (this.bleeding > 0) {
            this.addInkBleeding(ctx, x, y, radius, color, pressure);
        }
        
        ctx.restore();
    }

    drawInkBase(ctx, x, y, radius, color, pressure) {
        // Основной слой туши с насыщенным цветом
        const inkColor = this.darkenColor(color, (1 - this.inkDensity) * 50);
        
        // Основное пятно
        ctx.fillStyle = inkColor;
        ctx.globalAlpha = this.inkDensity;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    addLineVariation(ctx, x, y, radius, color, pressure) {
        // Вариация толщины линии для создания динамики
        const variationCount = Math.floor(radius * 2 * this.lineVariation);
        
        for (let i = 0; i < variationCount; i++) {
            const angle = (i / variationCount) * Math.PI * 2;
            const baseDistance = radius * 0.7;
            const variationDistance = baseDistance * (0.7 + Math.random() * 0.6);
            
            const lineX = x + Math.cos(angle) * variationDistance;
            const lineY = y + Math.sin(angle) * variationDistance;
            
            const lineLength = radius * 0.2 * (0.5 + Math.random());
            const lineWidth = radius * 0.03 * (0.3 + Math.random() * 0.7);
            const lineAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
            
            ctx.strokeStyle = this.darkenColor(color, 10 + Math.random() * 20);
            ctx.lineWidth = lineWidth;
            ctx.globalAlpha = 0.6 * this.lineVariation;
            
            ctx.beginPath();
            ctx.moveTo(lineX, lineY);
            ctx.lineTo(
                lineX + Math.cos(lineAngle) * lineLength,
                lineY + Math.sin(lineAngle) * lineLength
            );
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }

    addPaperAbsorption(ctx, x, y, radius, color, pressure) {
        // Эффект впитывания туши бумагой
        const absorptionRadius = radius * this.paperAbsorption;
        
        const absorptionGradient = ctx.createRadialGradient(
            x, y, radius * 0.8,
            x, y, radius * 0.8 + absorptionRadius
        );
        
        absorptionGradient.addColorStop(0, this.darkenColor(color, 10));
        absorptionGradient.addColorStop(0.5, this.blendColors(color, '#8B4513', 0.3));
        absorptionGradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
        
        ctx.fillStyle = absorptionGradient;
        ctx.globalAlpha = 0.4 * this.paperAbsorption;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.8 + absorptionRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    addDryBrushEffect(ctx, x, y, radius, color, pressure) {
        // Эффект сухой кисти - прерывистые линии
        const dryCount = Math.floor(radius * 3 * this.dryBrushEffect);
        
        for (let i = 0; i < dryCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (0.4 + Math.random() * 0.6);
            
            const dryX = x + Math.cos(angle) * distance;
            const dryY = y + Math.sin(angle) * distance;
            
            const dryLength = radius * 0.15 * (0.3 + Math.random() * 0.7);
            const dryWidth = radius * 0.02 * (0.2 + Math.random() * 0.8);
            const dryAngle = angle + Math.PI + (Math.random() - 0.5) * 1;
            
            // Прерывистая линия
            const segments = 2 + Math.floor(Math.random() * 3);
            const segmentLength = dryLength / segments;
            
            ctx.strokeStyle = this.darkenColor(color, 15 + Math.random() * 25);
            ctx.lineWidth = dryWidth;
            ctx.globalAlpha = 0.5 * this.dryBrushEffect;
            
            for (let j = 0; j < segments; j++) {
                const startRatio = j / segments;
                const endRatio = (j + 0.7) / segments;
                
                ctx.beginPath();
                ctx.moveTo(
                    dryX + Math.cos(dryAngle) * dryLength * startRatio,
                    dryY + Math.sin(dryAngle) * dryLength * startRatio
                );
                ctx.lineTo(
                    dryX + Math.cos(dryAngle) * dryLength * endRatio,
                    dryY + Math.sin(dryAngle) * dryLength * endRatio
                );
                ctx.stroke();
            }
        }
        
        ctx.globalAlpha = 1;
    }

    addInkBleeding(ctx, x, y, radius, color, pressure) {
        // Растекание туши по бумаге
        const bleedCount = Math.floor(this.bleeding * 6);
        
        for (let i = 0; i < bleedCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (1 + Math.random() * 0.4);
            
            const bleedX = x + Math.cos(angle) * distance;
            const bleedY = y + Math.sin(angle) * distance;
            
            const bleedSize = radius * 0.2 * (0.3 + Math.random() * 0.5);
            const bleedOpacity = this.bleeding * (0.2 + Math.random() * 0.3);
            
            const bleedGradient = ctx.createRadialGradient(
                bleedX, bleedY, 0,
                bleedX, bleedY, bleedSize
            );
            
            bleedGradient.addColorStop(0, this.blendColors(color, '#8B4513', 0.4));
            bleedGradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
            
            ctx.fillStyle = bleedGradient;
            ctx.globalAlpha = bleedOpacity;
            ctx.beginPath();
            ctx.arc(bleedX, bleedY, bleedSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            inkFlow: {
                min: 0.3,
                max: 1,
                step: 0.01,
                default: this.inkFlow,
                name: 'Течение туши',
                type: 'range'
            },
            brushSaturation: {
                min: 0.5,
                max: 1,
                step: 0.01,
                default: this.brushSaturation,
                name: 'Насыщенность кисти',
                type: 'range'
            },
            paperAbsorption: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.paperAbsorption,
                name: 'Впитывание бумагой',
                type: 'range'
            },
            bleeding: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.bleeding,
                name: 'Растекание',
                type: 'range'
            },
            lineVariation: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.lineVariation,
                name: 'Вариация линии',
                type: 'range'
            },
            dryBrushEffect: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.dryBrushEffect,
                name: 'Эффект сухой кисти',
                type: 'range'
            },
            inkDensity: {
                min: 0.7,
                max: 1,
                step: 0.01,
                default: this.inkDensity,
                name: 'Плотность туши',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            inkFlow: this.inkFlow,
            brushSaturation: this.brushSaturation,
            paperAbsorption: this.paperAbsorption,
            bleeding: this.bleeding,
            lineVariation: this.lineVariation,
            dryBrushEffect: this.dryBrushEffect,
            inkDensity: this.inkDensity
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.inkFlow = data.inkFlow || 0.8;
        this.brushSaturation = data.brushSaturation || 0.9;
        this.paperAbsorption = data.paperAbsorption || 0.6;
        this.bleeding = data.bleeding || 0.3;
        this.lineVariation = data.lineVariation || 0.7;
        this.dryBrushEffect = data.dryBrushEffect || 0.4;
        this.inkDensity = data.inkDensity || 0.95;
    }
}

/**
 * DigitalArtBrush - кисть для цифрового арта
 * Создает современные цифровые эффекты и текстуры
 */
class DigitalArtBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Цифровой Арт';
        this.description = 'Кисть для цифрового арта с современными эффектами и текстурами';
        this.category = 'digital';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '💾';
        
        // Параметры для цифрового арта
        this.pixelSize = 2;
        this.glitchIntensity = 0.3;
        this.chromaticAberration = 0.2;
        this.noisePattern = 'digital';
        this.scanlines = 0.4;
        this.colorDepth = 8;
        this.compressionArtifacts = 0.1;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createDigitalEffect(ctx, x, y, radius, color, pressure);
    }

    createDigitalEffect(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Основной цифровой мазок
        this.drawDigitalBase(ctx, x, y, radius, color, pressure);
        
        // Пикселизация
        if (this.pixelSize > 1) {
            this.addPixelation(ctx, x, y, radius, color, pressure);
        }
        
        // Цифровой шум
        this.addDigitalNoise(ctx, x, y, radius, color, pressure);
        
        // Глюч-эффекты
        if (this.glitchIntensity > 0) {
            this.addGlitchEffect(ctx, x, y, radius, color, pressure);
        }
        
        // Хроматическая аберрация
        if (this.chromaticAberration > 0) {
            this.addChromaticAberration(ctx, x, y, radius, color, pressure);
        }
        
        // Сканлайны
        if (this.scanlines > 0) {
            this.addScanlines(ctx, x, y, radius, color, pressure);
        }
        
        ctx.restore();
    }

    drawDigitalBase(ctx, x, y, radius, color, pressure) {
        // Базовый цифровой мазок с четкими краями
        const colorDepthFactor = this.colorDepth / 8;
        
        // Основное пятно
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Цифровой градиент
        const gradient = ctx.createRadialGradient(x, y, radius * 0.7, x, y, radius);
        gradient.addColorStop(0, this.lightenColor(color, 20 * colorDepthFactor));
        gradient.addColorStop(1, this.darkenColor(color, 30 * colorDepthFactor));
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    addPixelation(ctx, x, y, radius, color, pressure) {
        // Пикселизация эффекта
        const pixelSize = this.pixelSize;
        const pixelRadius = radius;
        
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        
        // Создаем пикселизированную версию
        const pixelCount = Math.floor(pixelRadius / pixelSize);
        
        for (let i = -pixelCount; i <= pixelCount; i++) {
            for (let j = -pixelCount; j <= pixelCount; j++) {
                const pixelX = x + i * pixelSize;
                const pixelY = y + j * pixelSize;
                
                const distance = Math.sqrt(i*i + j*j) * pixelSize;
                if (distance > pixelRadius) continue;
                
                // Вариация цвета для пикселей
                const brightness = (Math.random() - 0.5) * 10;
                const pixelColor = brightness > 0
                    ? this.lightenColor(color, brightness)
                    : this.darkenColor(color, -brightness);
                
                ctx.fillStyle = pixelColor;
                ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
            }
        }
        
        ctx.restore();
    }

    addDigitalNoise(ctx, x, y, radius, color, pressure) {
        // Цифровой шум
        const noiseIntensity = 0.3;
        const noiseCount = Math.floor(radius * radius * 0.3);
        
        for (let i = 0; i < noiseCount; i++) {
            const noiseX = x + (Math.random() - 0.5) * radius * 2;
            const noiseY = y + (Math.random() - 0.5) * radius * 2;
            
            const noiseSize = 0.5 + Math.random() * 2;
            let noiseColor;
            
            switch (this.noisePattern) {
                case 'monochrome':
                    noiseColor = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
                    break;
                case 'rgb':
                    const colors = ['#FF0000', '#00FF00', '#0000FF'];
                    noiseColor = colors[Math.floor(Math.random() * colors.length)];
                    break;
                case 'digital':
                default:
                    noiseColor = Math.random() > 0.7 ? '#00FF00' : '#000000';
                    break;
            }
            
            ctx.fillStyle = noiseColor;
            ctx.globalAlpha = noiseIntensity * Math.random();
            ctx.fillRect(noiseX, noiseY, noiseSize, noiseSize);
        }
        
        ctx.globalAlpha = 1;
    }

    addGlitchEffect(ctx, x, y, radius, color, pressure) {
        // Глюч-эффекты
        const glitchCount = Math.floor(this.glitchIntensity * 5);
        
        for (let i = 0; i < glitchCount; i++) {
            const glitchY = y + (Math.random() - 0.5) * radius * 0.5;
            const glitchWidth = radius * (0.2 + Math.random() * 0.8);
            const glitchHeight = 2 + Math.random() * 8;
            
            const glitchOffset = (Math.random() - 0.5) * radius * 0.3;
            
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.8 * this.glitchIntensity;
            ctx.fillRect(x - glitchWidth/2 + glitchOffset, glitchY - glitchHeight/2, glitchWidth, glitchHeight);
        }
        
        ctx.globalAlpha = 1;
    }

    addChromaticAberration(ctx, x, y, radius, color, pressure) {
        // Хроматическая аберрация
        const offset = radius * 0.02 * this.chromaticAberration;
        
        // Красный канал
        ctx.fillStyle = '#FF0000';
        ctx.globalAlpha = 0.3 * this.chromaticAberration;
        ctx.beginPath();
        ctx.arc(x - offset, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Синий канал
        ctx.fillStyle = '#0000FF';
        ctx.beginPath();
        ctx.arc(x + offset, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }

    addScanlines(ctx, x, y, radius, color, pressure) {
        // Сканлайны
        const lineCount = Math.floor(radius * 2 * this.scanlines);
        
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.1 * this.scanlines;
        
        for (let i = 0; i < lineCount; i++) {
            const lineY = y - radius + (i / lineCount) * radius * 2;
            const lineHeight = 1;
            
            ctx.fillRect(x - radius, lineY, radius * 2, lineHeight);
        }
        
        ctx.globalAlpha = 1;
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            pixelSize: {
                min: 1,
                max: 8,
                step: 1,
                default: this.pixelSize,
                name: 'Размер пикселя',
                type: 'range'
            },
            glitchIntensity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.glitchIntensity,
                name: 'Интенсивность глюков',
                type: 'range'
            },
            chromaticAberration: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.chromaticAberration,
                name: 'Хроматическая аберрация',
                type: 'range'
            },
            noisePattern: {
                type: 'select',
                options: [
                    { value: 'digital', label: 'Цифровой' },
                    { value: 'monochrome', label: 'Монохромный' },
                    { value: 'rgb', label: 'RGB' }
                ],
                default: this.noisePattern,
                name: 'Паттерн шума'
            },
            scanlines: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.scanlines,
                name: 'Сканлайны',
                type: 'range'
            },
            colorDepth: {
                min: 1,
                max: 16,
                step: 1,
                default: this.colorDepth,
                name: 'Глубина цвета',
                type: 'range'
            },
            compressionArtifacts: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.compressionArtifacts,
                name: 'Артефакты сжатия',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            pixelSize: this.pixelSize,
            glitchIntensity: this.glitchIntensity,
            chromaticAberration: this.chromaticAberration,
            noisePattern: this.noisePattern,
            scanlines: this.scanlines,
            colorDepth: this.colorDepth,
            compressionArtifacts: this.compressionArtifacts
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.pixelSize = data.pixelSize || 2;
        this.glitchIntensity = data.glitchIntensity || 0.3;
        this.chromaticAberration = data.chromaticAberration || 0.2;
        this.noisePattern = data.noisePattern || 'digital';
        this.scanlines = data.scanlines || 0.4;
        this.colorDepth = data.colorDepth || 8;
        this.compressionArtifacts = data.compressionArtifacts || 0.1;
    }
}