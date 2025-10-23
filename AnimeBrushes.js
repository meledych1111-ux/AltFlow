/**
 * AnimeBrushes - коллекция кистей для создания аниме персонажей
 * Включает кисти для волос, глаз, губ и других деталей аниме стиля
 */

/**
 * AnimeHairBrush - кисть для рисования аниме волос
 * Создает характерные для аниме пряди волос с направлением и текстурой
 */
class AnimeHairBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Аниме Волосы';
        this.description = 'Кисть для создания характерных аниме волос с направлением и текстурой';
        this.category = 'anime';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '💇‍♀️';
        
        // Параметры для волос
        this.hairDirection = 'flow-down';
        this.strandDensity = 0.7;
        this.hairTexture = 'smooth';
        this.highlightIntensity = 0.6;
        this.rootThickness = 1.0;
        this.tipSharpness = 0.8;
        this.flowDirection = 0; // угол направления в радианах
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createAnimeHair(ctx, x, y, radius, color, pressure);
    }

    createAnimeHair(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Определяем направление потока волос
        let flowAngle = this.flowDirection;
        if (this.hairDirection === 'flow-left') flowAngle = Math.PI;
        else if (this.hairDirection === 'flow-right') flowAngle = 0;
        else if (this.hairDirection === 'flow-up') flowAngle = -Math.PI / 2;
        else if (this.hairDirection === 'flow-down') flowAngle = Math.PI / 2;
        
        // Создаем основную прядь волос
        this.drawHairStrand(ctx, x, y, radius, color, flowAngle, pressure);
        
        // Добавляем дополнительные пряди вокруг основной
        const strandCount = Math.floor(radius * this.strandDensity * 0.5);
        
        for (let i = 0; i < strandCount; i++) {
            const angleOffset = (Math.random() - 0.5) * Math.PI * 0.5;
            const distance = (Math.random() * radius * 0.8);
            
            const strandX = x + Math.cos(flowAngle + Math.PI/2) * distance;
            const strandY = y + Math.sin(flowAngle + Math.PI/2) * distance;
            const strandRadius = radius * (0.3 + Math.random() * 0.4);
            
            this.drawHairStrand(ctx, strandX, strandY, strandRadius, color, flowAngle + angleOffset, pressure * 0.7);
        }
        
        // Добавляем блики для объема
        if (this.highlightIntensity > 0) {
            this.addHairHighlights(ctx, x, y, radius, color, flowAngle);
        }
        
        ctx.restore();
    }

    drawHairStrand(ctx, x, y, radius, color, angle, pressure) {
        const length = radius * 2;
        const width = radius * this.rootThickness * pressure;
        const endWidth = width * (1 - this.tipSharpness);
        
        // Создаем градиент для пряди
        const gradient = ctx.createLinearGradient(
            x - Math.cos(angle) * width,
            y - Math.sin(angle) * width,
            x + Math.cos(angle) * length,
            y + Math.sin(angle) * length
        );
        
        const baseColor = this.darkenColor(color, 10);
        const tipColor = this.lightenColor(color, 20);
        
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(1, tipColor);
        
        // Рисуем прядь как треугольник/овал
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Корень волоса
        ctx.moveTo(x - Math.cos(angle + Math.PI/2) * width/2, y - Math.sin(angle + Math.PI/2) * width/2);
        ctx.lineTo(x + Math.cos(angle + Math.PI/2) * width/2, y + Math.sin(angle + Math.PI/2) * width/2);
        
        // Кончик волоса
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        ctx.lineTo(endX + Math.cos(angle + Math.PI/2) * endWidth/2, endY + Math.sin(angle + Math.PI/2) * endWidth/2);
        ctx.lineTo(endX - Math.cos(angle + Math.PI/2) * endWidth/2, endY - Math.sin(angle + Math.PI/2) * endWidth/2);
        
        ctx.closePath();
        ctx.fill();
    }

    addHairHighlights(ctx, x, y, radius, color, angle) {
        // Блик для создания объема
        const highlightX = x + Math.cos(angle) * radius * 0.3;
        const highlightY = y + Math.sin(angle) * radius * 0.3;
        const highlightSize = radius * 0.3 * this.highlightIntensity;
        
        const highlightGradient = ctx.createRadialGradient(
            highlightX, highlightY, 0,
            highlightX, highlightY, highlightSize
        );
        
        const highlightColor = this.lightenColor(color, 40);
        highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${this.highlightIntensity * 0.8})`);
        highlightGradient.addColorStop(0.5, `rgba(${parseInt(highlightColor.slice(1, 3), 16)}, ${parseInt(highlightColor.slice(3, 5), 16)}, ${parseInt(highlightColor.slice(5, 7), 16)}, ${this.highlightIntensity * 0.4})`);
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2);
        ctx.fill();
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            hairDirection: {
                type: 'select',
                options: [
                    { value: 'flow-down', label: 'Вниз' },
                    { value: 'flow-up', label: 'Вверх' },
                    { value: 'flow-left', label: 'Влево' },
                    { value: 'flow-right', label: 'Вправо' },
                    { value: 'custom-angle', label: 'Пользовательский угол' }
                ],
                default: this.hairDirection,
                name: 'Направление волос'
            },
            strandDensity: {
                min: 0.1,
                max: 2,
                step: 0.1,
                default: this.strandDensity,
                name: 'Плотность прядей',
                type: 'range'
            },
            hairTexture: {
                type: 'select',
                options: [
                    { value: 'smooth', label: 'Гладкие' },
                    { value: 'wavy', label: 'Волнистые' },
                    { value: 'spiky', label: 'Колючие' },
                    { value: 'curly', label: 'Кудрявые' }
                ],
                default: this.hairTexture,
                name: 'Текстура волос'
            },
            highlightIntensity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.highlightIntensity,
                name: 'Интенсивность бликов',
                type: 'range'
            },
            rootThickness: {
                min: 0.5,
                max: 3,
                step: 0.1,
                default: this.rootThickness,
                name: 'Толщина у корней',
                type: 'range'
            },
            tipSharpness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.tipSharpness,
                name: 'Острость кончиков',
                type: 'range'
            },
            flowDirection: {
                min: 0,
                max: 360,
                step: 1,
                default: this.flowDirection * 180 / Math.PI,
                name: 'Угол направления',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            hairDirection: this.hairDirection,
            strandDensity: this.strandDensity,
            hairTexture: this.hairTexture,
            highlightIntensity: this.highlightIntensity,
            rootThickness: this.rootThickness,
            tipSharpness: this.tipSharpness,
            flowDirection: this.flowDirection
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.hairDirection = data.hairDirection || 'flow-down';
        this.strandDensity = data.strandDensity || 0.7;
        this.hairTexture = data.hairTexture || 'smooth';
        this.highlightIntensity = data.highlightIntensity || 0.6;
        this.rootThickness = data.rootThickness || 1.0;
        this.tipSharpness = data.tipSharpness || 0.8;
        this.flowDirection = data.flowDirection || 0;
    }
}

/**
 * AnimeEyeBrush - кисть для рисования аниме глаз
 * Создает характерные большие аниме глаза с зрачками и бликами
 */
class AnimeEyeBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Аниме Глаз';
        this.description = 'Кисть для создания характерных аниме глаз с зрачками и бликами';
        this.category = 'anime';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '👁️';
        
        // Параметры для глаз
        this.eyeShape = 'large-round';
        this.irisSize = 0.6;
        this.pupilSize = 0.3;
        this.highlightCount = 2;
        this.eyeColor = '#4169E1';
        this.scleraColor = '#FFFFFF';
        this.outlineThickness = 2;
        this.shineIntensity = 0.8;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        
        this.createAnimeEye(ctx, x, y, radius, pressure);
    }

    createAnimeEye(ctx, x, y, radius, pressure) {
        ctx.save();
        
        // Рисуем белок глаза (склеру)
        this.drawSclera(ctx, x, y, radius, pressure);
        
        // Рисуем радужку
        this.drawIris(ctx, x, y, radius, pressure);
        
        // Рисуем зрачок
        this.drawPupil(ctx, x, y, radius, pressure);
        
        // Добавляем блики
        this.addEyeHighlights(ctx, x, y, radius, pressure);
        
        // Рисуем контур глаза
        this.drawEyeOutline(ctx, x, y, radius, pressure);
        
        ctx.restore();
    }

    drawSclera(ctx, x, y, radius, pressure) {
        const scleraGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        scleraGradient.addColorStop(0, this.scleraColor);
        scleraGradient.addColorStop(1, '#F0F0F0');
        
        ctx.fillStyle = scleraGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawIris(ctx, x, y, radius, pressure) {
        const irisRadius = radius * this.irisSize;
        
        // Градиент для радужки
        const irisGradient = ctx.createRadialGradient(x, y, 0, x, y, irisRadius);
        irisGradient.addColorStop(0, this.lightenColor(this.eyeColor, 20));
        irisGradient.addColorStop(0.7, this.eyeColor);
        irisGradient.addColorStop(1, this.darkenColor(this.eyeColor, 20));
        
        ctx.fillStyle = irisGradient;
        ctx.beginPath();
        ctx.arc(x, y, irisRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавляем текстуру радужки
        this.addIrisTexture(ctx, x, y, irisRadius);
    }

    addIrisTexture(ctx, x, y, irisRadius) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        
        // Радиальные линии радужки
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const innerRadius = irisRadius * 0.3;
            const outerRadius = irisRadius * 0.9;
            
            ctx.strokeStyle = `rgba(0, 0, 0, 0.3)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * innerRadius, y + Math.sin(angle) * innerRadius);
            ctx.lineTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawPupil(ctx, x, y, radius, pressure) {
        const pupilRadius = radius * this.pupilSize;
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    addEyeHighlights(ctx, x, y, radius, pressure) {
        // Основной блик
        const mainHighlightX = x - radius * 0.3;
        const mainHighlightY = y - radius * 0.3;
        const mainHighlightSize = radius * 0.2 * this.shineIntensity;
        
        const mainGradient = ctx.createRadialGradient(
            mainHighlightX, mainHighlightY, 0,
            mainHighlightX, mainHighlightY, mainHighlightSize
        );
        
        mainGradient.addColorStop(0, `rgba(255, 255, 255, ${this.shineIntensity})`);
        mainGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = mainGradient;
        ctx.beginPath();
        ctx.arc(mainHighlightX, mainHighlightY, mainHighlightSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Дополнительные маленькие блики
        if (this.highlightCount > 1) {
            for (let i = 1; i < this.highlightCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = radius * 0.4 * Math.random();
                const size = radius * 0.1 * Math.random() * this.shineIntensity;
                
                const highlightX = x + Math.cos(angle) * distance;
                const highlightY = y + Math.sin(angle) * distance;
                
                ctx.fillStyle = `rgba(255, 255, 255, ${this.shineIntensity * 0.5})`;
                ctx.beginPath();
                ctx.arc(highlightX, highlightY, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawEyeOutline(ctx, x, y, radius, pressure) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = this.outlineThickness;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            eyeShape: {
                type: 'select',
                options: [
                    { value: 'large-round', label: 'Большой круглый' },
                    { value: 'almond', label: 'Миндальный' },
                    { value: 'narrow', label: 'Узкий' },
                    { value: 'cat-like', label: 'Кошачий' }
                ],
                default: this.eyeShape,
                name: 'Форма глаза'
            },
            irisSize: {
                min: 0.3,
                max: 0.9,
                step: 0.01,
                default: this.irisSize,
                name: 'Размер радужки',
                type: 'range'
            },
            pupilSize: {
                min: 0.1,
                max: 0.6,
                step: 0.01,
                default: this.pupilSize,
                name: 'Размер зрачка',
                type: 'range'
            },
            highlightCount: {
                min: 1,
                max: 5,
                step: 1,
                default: this.highlightCount,
                name: 'Количество бликов',
                type: 'range'
            },
            eyeColor: {
                type: 'color',
                default: this.eyeColor,
                name: 'Цвет глаза'
            },
            shineIntensity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.shineIntensity,
                name: 'Интенсивность бликов',
                type: 'range'
            },
            outlineThickness: {
                min: 1,
                max: 5,
                step: 0.5,
                default: this.outlineThickness,
                name: 'Толщина контура',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            eyeShape: this.eyeShape,
            irisSize: this.irisSize,
            pupilSize: this.pupilSize,
            highlightCount: this.highlightCount,
            eyeColor: this.eyeColor,
            shineIntensity: this.shineIntensity,
            outlineThickness: this.outlineThickness
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.eyeShape = data.eyeShape || 'large-round';
        this.irisSize = data.irisSize || 0.6;
        this.pupilSize = data.pupilSize || 0.3;
        this.highlightCount = data.highlightCount || 2;
        this.eyeColor = data.eyeColor || '#4169E1';
        this.shineIntensity = data.shineIntensity || 0.8;
        this.outlineThickness = data.outlineThickness || 2;
    }
}

/**
 * AnimeLipBrush - кисть для рисования аниме губ
 * Создает мягкие, выразительные губы в аниме стиле
 */
class AnimeLipBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Аниме Губы';
        this.description = 'Кисть для создания мягких, выразительных губ в аниме стиле';
        this.category = 'anime';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '💋';
        
        // Параметры для губ
        this.lipShape = 'soft-cupid';
        this.lipFullness = 0.7;
        this.upperLipCurve = 0.6;
        this.lowerLipCurve = 0.4;
        this.lipGloss = 0.5;
        this.lipColor = '#FF69B4';
        this.outlineSoftness = 0.8;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.lipColor;
        
        this.createAnimeLips(ctx, x, y, radius, color, pressure);
    }

    createAnimeLips(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Рисуем верхнюю губу
        this.drawUpperLip(ctx, x, y - radius * 0.2, radius * 0.8, color, pressure);
        
        // Рисуем нижнюю губу
        this.drawLowerLip(ctx, x, y + radius * 0.2, radius, color, pressure);
        
        // Добавляем блеск губ
        if (this.lipGloss > 0) {
            this.addLipGloss(ctx, x, y, radius, color, pressure);
        }
        
        // Добавляем мягкий контур
        this.addSoftOutline(ctx, x, y, radius, color, pressure);
        
        ctx.restore();
    }

    drawUpperLip(ctx, x, y, radius, color, pressure) {
        const width = radius * 2 * this.lipFullness;
        const height = radius * this.upperLipCurve;
        
        // Создаем форму верхней губы (форма сердца/купидона)
        ctx.fillStyle = color;
        ctx.beginPath();
        
        // Левая часть верхней губы
        ctx.moveTo(x - width/2, y);
        ctx.quadraticCurveTo(x - width/4, y - height, x, y - height * 0.8);
        
        // Правая часть верхней губы
        ctx.quadraticCurveTo(x + width/4, y - height, x + width/2, y);
        
        // Закрываем форму
        ctx.quadraticCurveTo(x, y + height * 0.2, x - width/2, y);
        ctx.fill();
    }

    drawLowerLip(ctx, x, y, radius, color, pressure) {
        const width = radius * 2.2 * this.lipFullness;
        const height = radius * this.lowerLipCurve;
        
        // Нижняя губа - полукруглая форма
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, this.lightenColor(color, 15));
        gradient.addColorStop(1, color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        ctx.moveTo(x - width/2, y);
        ctx.quadraticCurveTo(x - width/2, y + height, x, y + height);
        ctx.quadraticCurveTo(x + width/2, y + height, x + width/2, y);
        ctx.quadraticCurveTo(x, y - height * 0.1, x - width/2, y);
        
        ctx.fill();
    }

    addLipGloss(ctx, x, y, radius, color, pressure) {
        // Блик на верхней губе
        const upperHighlightX = x;
        const upperHighlightY = y - radius * 0.3;
        const upperHighlightSize = radius * 0.3 * this.lipGloss;
        
        const upperGradient = ctx.createRadialGradient(
            upperHighlightX, upperHighlightY, 0,
            upperHighlightX, upperHighlightY, upperHighlightSize
        );
        
        upperGradient.addColorStop(0, `rgba(255, 255, 255, ${this.lipGloss * 0.8})`);
        upperGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = upperGradient;
        ctx.beginPath();
        ctx.arc(upperHighlightX, upperHighlightY, upperHighlightSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Блик на нижней губе
        const lowerHighlightX = x;
        const lowerHighlightY = y + radius * 0.2;
        const lowerHighlightSize = radius * 0.4 * this.lipGloss;
        
        const lowerGradient = ctx.createRadialGradient(
            lowerHighlightX, lowerHighlightY, 0,
            lowerHighlightX, lowerHighlightY, lowerHighlightSize
        );
        
        lowerGradient.addColorStop(0, `rgba(255, 255, 255, ${this.lipGloss * 0.6})`);
        lowerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = lowerGradient;
        ctx.beginPath();
        ctx.arc(lowerHighlightX, lowerHighlightY, lowerHighlightSize, 0, Math.PI * 2);
        ctx.fill();
    }

    addSoftOutline(ctx, x, y, radius, color, pressure) {
        // Мягкий контур вокруг губ
        const outlineGradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.2);
        outlineGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        outlineGradient.addColorStop(1, `rgba(0, 0, 0, ${this.outlineSoftness * 0.3})`);
        
        ctx.fillStyle = outlineGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            lipShape: {
                type: 'select',
                options: [
                    { value: 'soft-cupid', label: 'Мягкий купидон' },
                    { value: 'full-lips', label: 'Полные губы' },
                    { value: 'thin-lips', label: 'Тонкие губы' },
                    { value: 'heart-shaped', label: 'В форме сердца' }
                ],
                default: this.lipShape,
                name: 'Форма губ'
            },
            lipFullness: {
                min: 0.3,
                max: 1.5,
                step: 0.1,
                default: this.lipFullness,
                name: 'Полнота губ',
                type: 'range'
            },
            upperLipCurve: {
                min: 0.2,
                max: 1,
                step: 0.05,
                default: this.upperLipCurve,
                name: 'Изгиб верхней губы',
                type: 'range'
            },
            lowerLipCurve: {
                min: 0.2,
                max: 0.8,
                step: 0.05,
                default: this.lowerLipCurve,
                name: 'Изгиб нижней губы',
                type: 'range'
            },
            lipGloss: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.lipGloss,
                name: 'Блеск губ',
                type: 'range'
            },
            lipColor: {
                type: 'color',
                default: this.lipColor,
                name: 'Цвет губ'
            },
            outlineSoftness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.outlineSoftness,
                name: 'Мягкость контура',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            lipShape: this.lipShape,
            lipFullness: this.lipFullness,
            upperLipCurve: this.upperLipCurve,
            lowerLipCurve: this.lowerLipCurve,
            lipGloss: this.lipGloss,
            lipColor: this.lipColor,
            outlineSoftness: this.outlineSoftness
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.lipShape = data.lipShape || 'soft-cupid';
        this.lipFullness = data.lipFullness || 0.7;
        this.upperLipCurve = data.upperLipCurve || 0.6;
        this.lowerLipCurve = data.lowerLipCurve || 0.4;
        this.lipGloss = data.lipGloss || 0.5;
        this.lipColor = data.lipColor || '#FF69B4';
        this.outlineSoftness = data.outlineSoftness || 0.8;
    }
}

/**
 * AnimeSkinBrush - кисть для аниме кожи
 * Создает мягкую, гладкую кожу с легким румянцем
 */
class AnimeSkinBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Аниме Кожа';
        this.description = 'Кисть для создания мягкой, гладкой кожи с легким румянцем';
        this.category = 'anime';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '😊';
        
        // Параметры для кожи
        this.skinTone = 'fair';
        this.blushIntensity = 0.3;
        this.skinSmoothness = 0.8;
        this.transparency = 0.7;
        this.skinColor = '#FFE4E1';
        this.blushColor = '#FFB6C1';
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.skinColor;
        
        this.createAnimeSkin(ctx, x, y, radius, color, pressure);
    }

    createAnimeSkin(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Основной слой кожи
        this.drawBaseSkin(ctx, x, y, radius, color, pressure);
        
        // Добавляем румянец если нужно
        if (this.blushIntensity > 0) {
            this.addBlush(ctx, x, y, radius, pressure);
        }
        
        // Добавляем мягкие тени для объема
        this.addSkinShading(ctx, x, y, radius, pressure);
        
        // Добавляем текстуру кожи
        this.addSkinTexture(ctx, x, y, radius, pressure);
        
        ctx.restore();
    }

    drawBaseSkin(ctx, x, y, radius, color, pressure) {
        // Основной цвет кожи с мягким градиентом
        const skinGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        let baseColor, centerColor;
        switch (this.skinTone) {
            case 'fair':
                baseColor = this.blendColors(color, '#FFF8DC', 0.3);
                centerColor = this.lightenColor(color, 10);
                break;
            case 'light':
                baseColor = color;
                centerColor = this.lightenColor(color, 5);
                break;
            case 'medium':
                baseColor = this.darkenColor(color, 5);
                centerColor = color;
                break;
            case 'tan':
                baseColor = this.darkenColor(color, 15);
                centerColor = this.darkenColor(color, 5);
                break;
            default:
                baseColor = color;
                centerColor = this.lightenColor(color, 8);
        }
        
        skinGradient.addColorStop(0, centerColor);
        skinGradient.addColorStop(0.7, baseColor);
        skinGradient.addColorStop(1, this.darkenColor(baseColor, 10));
        
        ctx.globalAlpha = this.transparency;
        ctx.fillStyle = skinGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    addBlush(ctx, x, y, radius, pressure) {
        // Румянец на щеках
        const blushRadius = radius * 0.6;
        const blushOffset = radius * 0.3;
        
        // Левый румянец
        const leftBlushX = x - blushOffset;
        const leftBlushY = y + blushOffset * 0.2;
        
        const blushGradient = ctx.createRadialGradient(
            leftBlushX, leftBlushY, 0,
            leftBlushX, leftBlushY, blushRadius
        );
        
        blushGradient.addColorStop(0, `rgba(${parseInt(this.blushColor.slice(1, 3), 16)}, ${parseInt(this.blushColor.slice(3, 5), 16)}, ${parseInt(this.blushColor.slice(5, 7), 16)}, ${this.blushIntensity * 0.8})`);
        blushGradient.addColorStop(1, `rgba(${parseInt(this.blushColor.slice(1, 3), 16)}, ${parseInt(this.blushColor.slice(3, 5), 16)}, ${parseInt(this.blushColor.slice(5, 7), 16)}, 0)`);
        
        ctx.fillStyle = blushGradient;
        ctx.beginPath();
        ctx.arc(leftBlushX, leftBlushY, blushRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Правый румянец
        const rightBlushX = x + blushOffset;
        const rightBlushY = y + blushOffset * 0.2;
        
        ctx.beginPath();
        ctx.arc(rightBlushX, rightBlushY, blushRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    addSkinShading(ctx, x, y, radius, pressure) {
        // Мягкие тени для объема
        const shadowIntensity = (1 - this.skinSmoothness) * 0.3;
        
        // Тень снизу
        const shadowGradient = ctx.createRadialGradient(
            x + radius * 0.2, y + radius * 0.3, 0,
            x + radius * 0.2, y + radius * 0.3, radius * 0.8
        );
        
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, `rgba(0, 0, 0, ${shadowIntensity})`);
        
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.arc(x + radius * 0.2, y + radius * 0.3, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    addSkinTexture(ctx, x, y, radius, pressure) {
        if (this.skinSmoothness >= 0.9) return; // Очень гладкая кожа
        
        // Добавляем очень тонкую текстуру кожи
        const textureIntensity = (1 - this.skinSmoothness) * 0.2;
        const texturePoints = Math.floor(radius * radius * 0.1);
        
        for (let i = 0; i < texturePoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.9;
            const pointX = x + Math.cos(angle) * distance;
            const pointY = y + Math.sin(angle) * distance;
            
            const size = 0.5 + Math.random() * 1;
            const brightness = (Math.random() - 0.5) * 10;
            
            const textureColor = brightness > 0
                ? this.lightenColor(this.skinColor, brightness)
                : this.darkenColor(this.skinColor, -brightness);
            
            ctx.fillStyle = textureColor;
            ctx.globalAlpha = textureIntensity * Math.random();
            ctx.fillRect(pointX, pointY, size, size);
        }
        
        ctx.globalAlpha = 1;
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            skinTone: {
                type: 'select',
                options: [
                    { value: 'fair', label: 'Светлая' },
                    { value: 'light', label: 'Светлая средняя' },
                    { value: 'medium', label: 'Средняя' },
                    { value: 'tan', label: 'Загорелая' }
                ],
                default: this.skinTone,
                name: 'Тон кожи'
            },
            blushIntensity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.blushIntensity,
                name: 'Интенсивность румянца',
                type: 'range'
            },
            skinSmoothness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.skinSmoothness,
                name: 'Гладкость кожи',
                type: 'range'
            },
            transparency: {
                min: 0.3,
                max: 1,
                step: 0.01,
                default: this.transparency,
                name: 'Прозрачность',
                type: 'range'
            },
            skinColor: {
                type: 'color',
                default: this.skinColor,
                name: 'Цвет кожи'
            },
            blushColor: {
                type: 'color',
                default: this.blushColor,
                name: 'Цвет румянца'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            skinTone: this.skinTone,
            blushIntensity: this.blushIntensity,
            skinSmoothness: this.skinSmoothness,
            transparency: this.transparency,
            skinColor: this.skinColor,
            blushColor: this.blushColor
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.skinTone = data.skinTone || 'fair';
        this.blushIntensity = data.blushIntensity || 0.3;
        this.skinSmoothness = data.skinSmoothness || 0.8;
        this.transparency = data.transparency || 0.7;
        this.skinColor = data.skinColor || '#FFE4E1';
        this.blushColor = data.blushColor || '#FFB6C1';
    }
}

/**
 * AnimeEyebrowBrush - кисть для аниме бровей
 * Создает характерные аниме брови различных форм
 */
class AnimeEyebrowBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Аниме Брови';
        this.description = 'Кисть для создания характерных аниме бровей различных форм';
        this.category = 'anime';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '🎯';
        
        // Параметры для бровей
        this.eyebrowShape = 'gentle-arc';
        this.eyebrowThickness = 0.3;
        this.eyebrowLength = 1.0;
        this.eyebrowAngle = 0;
        this.eyebrowColor = '#8B4513';
        this.eyebrowStyle = 'natural';
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.eyebrowColor;
        
        this.createAnimeEyebrow(ctx, x, y, radius, color, pressure);
    }

    createAnimeEyebrow(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        const length = radius * 2 * this.eyebrowLength;
        const thickness = radius * this.eyebrowThickness * pressure;
        const angle = this.eyebrowAngle * Math.PI / 180;
        
        // Определяем форму брови
        let startY, endY, controlY;
        
        switch (this.eyebrowShape) {
            case 'gentle-arc':
                startY = y - thickness * 0.5;
                endY = y - thickness * 0.5;
                controlY = y - thickness * 1.5;
                break;
            case 'high-arc':
                startY = y;
                endY = y;
                controlY = y - thickness * 2;
                break;
            case 'straight':
                startY = y;
                endY = y;
                controlY = y;
                break;
            case 'sad-arc':
                startY = y + thickness * 0.5;
                endY = y + thickness * 0.5;
                controlY = y + thickness * 1.5;
                break;
            default:
                startY = y;
                endY = y;
                controlY = y - thickness;
        }
        
        // Начало и конец брови с учетом угла
        const startX = x - length/2;
        const endX = x + length/2;
        
        // Рисуем бровь
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        
        if (this.eyebrowStyle === 'natural') {
            // Натуральная бровь с волосками
            this.drawNaturalEyebrow(ctx, startX, startY, endX, endY, controlY, thickness, color);
        } else {
            // Гладкая бровь
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(x, controlY, endX, endY);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawNaturalEyebrow(ctx, startX, startY, endX, endY, controlY, thickness, color) {
        const hairCount = Math.floor((endX - startX) / (thickness * 0.5));
        
        for (let i = 0; i < hairCount; i++) {
            const t = i / (hairCount - 1);
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t + (controlY - startY) * 4 * t * (1 - t);
            
            // Небольшое случайное отклонение для натуральности
            const offsetX = (Math.random() - 0.5) * thickness * 0.3;
            const offsetY = (Math.random() - 0.5) * thickness * 0.2;
            
            ctx.beginPath();
            ctx.moveTo(x - thickness/2 + offsetX, y + offsetY);
            ctx.lineTo(x + thickness/2 + offsetX, y + offsetY);
            ctx.stroke();
        }
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            eyebrowShape: {
                type: 'select',
                options: [
                    { value: 'gentle-arc', label: 'Мягкая дуга' },
                    { value: 'high-arc', label: 'Высокая дуга' },
                    { value: 'straight', label: 'Прямая' },
                    { value: 'sad-arc', label: 'Грустная дуга' }
                ],
                default: this.eyebrowShape,
                name: 'Форма брови'
            },
            eyebrowThickness: {
                min: 0.1,
                max: 1,
                step: 0.05,
                default: this.eyebrowThickness,
                name: 'Толщина брови',
                type: 'range'
            },
            eyebrowLength: {
                min: 0.5,
                max: 2,
                step: 0.1,
                default: this.eyebrowLength,
                name: 'Длина брови',
                type: 'range'
            },
            eyebrowAngle: {
                min: -45,
                max: 45,
                step: 1,
                default: this.eyebrowAngle,
                name: 'Угол наклона',
                type: 'range'
            },
            eyebrowColor: {
                type: 'color',
                default: this.eyebrowColor,
                name: 'Цвет брови'
            },
            eyebrowStyle: {
                type: 'select',
                options: [
                    { value: 'natural', label: 'Натуральная' },
                    { value: 'smooth', label: 'Гладкая' }
                ],
                default: this.eyebrowStyle,
                name: 'Стиль брови'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            eyebrowShape: this.eyebrowShape,
            eyebrowThickness: this.eyebrowThickness,
            eyebrowLength: this.eyebrowLength,
            eyebrowAngle: this.eyebrowAngle,
            eyebrowColor: this.eyebrowColor,
            eyebrowStyle: this.eyebrowStyle
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.eyebrowShape = data.eyebrowShape || 'gentle-arc';
        this.eyebrowThickness = data.eyebrowThickness || 0.3;
        this.eyebrowLength = data.eyebrowLength || 1.0;
        this.eyebrowAngle = data.eyebrowAngle || 0;
        this.eyebrowColor = data.eyebrowColor || '#8B4513';
        this.eyebrowStyle = data.eyebrowStyle || 'natural';
    }
}