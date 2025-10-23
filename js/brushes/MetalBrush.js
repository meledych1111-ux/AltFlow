/**
 * MetalBrush - кисть для создания эффекта полированного металла
 * Имитирует металлическую поверхность с бликами и микро-штрихами
 */
class MetalBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Металл (шлифованный)';
        this.description = 'Создает эффект полированного металла с бликами и микро-штрихами';
        this.category = 'materials';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '⚙️';
        
        // Металлические параметры
        this.metalType = 'steel';
        this.polishLevel = 0.8;
        this.scratchIntensity = 0.3;
        this.scratchDirection = 'random';
        this.reflectionStrength = 0.6;
        
        // Внутренние параметры для генерации текстур
        this.noiseOffset = Math.random() * 1000;
    }

    /**
     * Основной метод рисования металлической кисти
     */
    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createMetalSurface(ctx, x, y, radius, color, pressure);
    }

    /**
     * Создание металлической поверхности
     */
    createMetalSurface(ctx, x, y, radius, color, pressure) {
        ctx.save();
        
        // Базовый металлический градиент
        this.drawBaseMetal(ctx, x, y, radius, color);
        
        // Добавляем блики
        this.addMetallicHighlight(ctx, x, y, radius, color);
        
        // Добавлям микро-царапины для реалистичности
        this.addMicroScratches(ctx, x, y, radius, color);
        
        // Эффект полировки
        this.addPolishEffect(ctx, x, y, radius, color);
        
        ctx.restore();
    }

    /**
     * Базовый металлический градиент
     */
    drawBaseMetal(ctx, x, y, radius, color) {
        // Определяем базовый металлический цвет
        let baseColor, midColor, edgeColor;
        
        switch (this.metalType) {
            case 'steel':
                baseColor = this.blendColors(color, '#c0c0c0', 0.5);
                midColor = this.blendColors(color, '#a0a0a0', 0.3);
                edgeColor = this.darkenColor(color, 30);
                break;
            case 'gold':
                baseColor = this.blendColors(color, '#ffd700', 0.6);
                midColor = this.blendColors(color, '#ffb347', 0.4);
                edgeColor = this.darkenColor(color, 20);
                break;
            case 'copper':
                baseColor = this.blendColors(color, '#b87333', 0.6);
                midColor = this.blendColors(color, '#cd7f32', 0.4);
                edgeColor = this.darkenColor(color, 25);
                break;
            case 'silver':
                baseColor = this.blendColors(color, '#e5e4e2', 0.6);
                midColor = this.blendColors(color, '#c0c0c0', 0.4);
                edgeColor = this.darkenColor(color, 35);
                break;
            default:
                baseColor = color;
                midColor = this.darkenColor(color, 15);
                edgeColor = this.darkenColor(color, 30);
        }
        
        // Создаем металлический градиент
        const gradient = ctx.createRadialGradient(
            x - radius * 0.2, y - radius * 0.2, 0,
            x, y, radius
        );
        
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.6, midColor);
        gradient.addColorStop(1, edgeColor);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Добавление металлических бликов
     */
    addMetallicHighlight(ctx, x, y, radius, color) {
        // Основной блик
        const mainHighlightX = x - radius * 0.3;
        const mainHighlightY = y - radius * 0.3;
        const mainHighlightSize = radius * 0.25 * this.reflectionStrength;
        
        const mainGradient = ctx.createRadialGradient(
            mainHighlightX, mainHighlightY, 0,
            mainHighlightX, mainHighlightY, mainHighlightSize
        );
        
        mainGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        mainGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        mainGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = mainGradient;
        ctx.beginPath();
        ctx.arc(mainHighlightX, mainHighlightY, mainHighlightSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Вторичные блики для эффекта металла
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI / 4) + (i * Math.PI / 6);
            const highlightX = x + Math.cos(angle) * radius * 0.4;
            const highlightY = y + Math.sin(angle) * radius * 0.4;
            const highlightSize = radius * 0.1 * this.reflectionStrength * (0.5 + Math.random() * 0.5);
            
            const secondaryGradient = ctx.createRadialGradient(
                highlightX, highlightY, 0,
                highlightX, highlightY, highlightSize
            );
            
            secondaryGradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 * this.polishLevel})`);
            secondaryGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = secondaryGradient;
            ctx.beginPath();
            ctx.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Добавление микро-царапин
     */
    addMicroScratches(ctx, x, y, radius, color) {
        if (this.scratchIntensity <= 0) return;
        
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        
        const scratchCount = Math.floor(radius * 2 * this.scratchIntensity);
        
        for (let i = 0; i < scratchCount; i++) {
            const angle = this.scratchDirection === 'random' 
                ? Math.random() * Math.PI * 2
                : (parseFloat(this.scratchDirection) * Math.PI / 180) + (Math.random() - 0.5) * 0.3;
            
            const distance = Math.random() * radius;
            const startX = x + Math.cos(angle) * distance;
            const startY = y + Math.sin(angle) * distance;
            const endX = startX + Math.cos(angle) * (2 + Math.random() * 4);
            const endY = startY + Math.sin(angle) * (2 + Math.random() * 4);
            
            const scratchOpacity = 0.1 + Math.random() * 0.2 * this.scratchIntensity;
            
            ctx.strokeStyle = `rgba(0, 0, 0, ${scratchOpacity})`;
            ctx.lineWidth = 0.5 + Math.random() * 0.5;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    /**
     * Эффект полировки
     */
    addPolishEffect(ctx, x, y, radius, color) {
        if (this.polishLevel <= 0) return;
        
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light';
        
        // Создаем эффект полировки с помощью шума
        const polishGradient = ctx.createRadialGradient(
            x, y, radius * 0.8,
            x, y, radius
        );
        
        const polishColor = this.lightenColor(color, 20 * this.polishLevel);
        polishGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        polishGradient.addColorStop(0.8, `rgba(255, 255, 255, ${0.3 * this.polishLevel})`);
        polishGradient.addColorStop(1, `rgba(${parseInt(polishColor.slice(1, 3), 16)}, ${parseInt(polishColor.slice(3, 5), 16)}, ${parseInt(polishColor.slice(5, 7), 16)}, ${0.2 * this.polishLevel})`);
        
        ctx.fillStyle = polishGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Переопределяем getParameters для металлических параметров
     */
    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            metalType: {
                type: 'select',
                options: [
                    { value: 'steel', label: 'Сталь' },
                    { value: 'gold', label: 'Золото' },
                    { value: 'copper', label: 'Медь' },
                    { value: 'silver', label: 'Серебро' }
                ],
                default: this.metalType,
                name: 'Тип металла'
            },
            polishLevel: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.polishLevel,
                name: 'Уровень полировки',
                type: 'range'
            },
            scratchIntensity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.scratchIntensity,
                name: 'Интенсивность царапин',
                type: 'range'
            },
            scratchDirection: {
                type: 'select',
                options: [
                    { value: 'random', label: 'Случайное' },
                    { value: '0', label: 'Горизонтальное' },
                    { value: '90', label: 'Вертикальное' },
                    { value: '45', label: 'Диагональное (45°)' },
                    { value: '135', label: 'Диагональное (135°)' }
                ],
                default: this.scratchDirection,
                name: 'Направление царапин'
            },
            reflectionStrength: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.reflectionStrength,
                name: 'Сила отражения',
                type: 'range'
            }
        };
    }

    /**
     * Переопределяем serialize для металлических параметров
     */
    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            metalType: this.metalType,
            polishLevel: this.polishLevel,
            scratchIntensity: this.scratchIntensity,
            scratchDirection: this.scratchDirection,
            reflectionStrength: this.reflectionStrength
        };
    }

    /**
     * Переопределяем deserialize для металлических параметров
     */
    deserialize(data) {
        super.deserialize(data);
        this.metalType = data.metalType || 'steel';
        this.polishLevel = data.polishLevel || 0.8;
        this.scratchIntensity = data.scratchIntensity || 0.3;
        this.scratchDirection = data.scratchDirection || 'random';
        this.reflectionStrength = data.reflectionStrength || 0.6;
    }
}
