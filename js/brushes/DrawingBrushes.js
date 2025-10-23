/**
 * DrawingBrushes - коллекция кистей для черчения и базовых фигур
 * Включает инструменты для точного рисования геометрических форм и линий
 */

/**
 * TechnicalPenBrush - техническое перо для черчения
 * Создает ровные линии с постоянной толщиной для технического рисования
 */
class TechnicalPenBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Техническое Перо';
        this.description = 'Профессиональное перо для черчения с постоянной толщиной линий';
        this.category = 'technical';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '✏️';
        
        // Параметры для технического пера
        this.penSize = 0.5; // в миллиметрах
        this.lineStyle = 'solid';
        this.lineCap = 'butt';
        this.lineJoin = 'miter';
        this.antiAliasing = false;
        this.pressureSensitive = false;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        // Техническое перо не использует радиус, только толщину
        this.applyTechnicalSettings(ctx, color);
        
        // Рисуем точку для одиночного клика
        ctx.beginPath();
        ctx.arc(x, y, this.penSize, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLine(ctx, x1, y1, x2, y2, pressure1 = 1, pressure2 = 1) {
        this.applyTechnicalSettings(ctx, this.primaryColor);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    applyTechnicalSettings(ctx, color) {
        // Настраиваем контекст для технического рисования
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = this.penSize;
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.imageSmoothingEnabled = this.antiAliasing;
        
        // Добавляем пунктир если нужно
        if (this.lineStyle === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (this.lineStyle === 'dotted') {
            ctx.setLineDash([1, 3]);
        } else {
            ctx.setLineDash([]);
        }
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            penSize: {
                min: 0.1,
                max: 2,
                step: 0.1,
                default: this.penSize,
                name: 'Размер пера (мм)',
                type: 'range'
            },
            lineStyle: {
                type: 'select',
                options: [
                    { value: 'solid', label: 'Сплошная' },
                    { value: 'dashed', label: 'Пунктирная' },
                    { value: 'dotted', label: 'Точечная' }
                ],
                default: this.lineStyle,
                name: 'Стиль линии'
            },
            lineCap: {
                type: 'select',
                options: [
                    { value: 'butt', label: 'Плоский' },
                    { value: 'round', label: 'Круглый' },
                    { value: 'square', label: 'Квадратный' }
                ],
                default: this.lineCap,
                name: 'Тип конца линии'
            },
            antiAliasing: {
                type: 'checkbox',
                default: this.antiAliasing,
                name: 'Сглаживание'
            },
            pressureSensitive: {
                type: 'checkbox',
                default: this.pressureSensitive,
                name: 'Чувствительность к давлению'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            penSize: this.penSize,
            lineStyle: this.lineStyle,
            lineCap: this.lineCap,
            lineJoin: this.lineJoin,
            antiAliasing: this.antiAliasing,
            pressureSensitive: this.pressureSensitive
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.penSize = data.penSize || 0.5;
        this.lineStyle = data.lineStyle || 'solid';
        this.lineCap = data.lineCap || 'butt';
        this.lineJoin = data.lineJoin || 'miter';
        this.antiAliasing = data.antiAliasing || false;
        this.pressureSensitive = data.pressureSensitive || false;
    }
}

/**
 * CircleTemplateBrush - кисть для рисования идеальных кругов
 * Создает точные круги с настраиваемым стилем обводки и заливки
 */
class CircleTemplateBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Шаблон Круга';
        this.description = 'Инструмент для рисования идеальных кругов с настройкой стиля';
        this.category = 'geometric';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '⭕';
        
        // Параметры для круга
        this.fillType = 'none';
        this.fillColor = '#E6E6FA';
        this.strokeType = 'solid';
        this.strokeColor = '#000000';
        this.strokeWidth = 2;
        this.dashPattern = [];
        this.startAngle = 0;
        this.endAngle = 360;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        
        this.drawPerfectCircle(ctx, x, y, radius);
    }

    drawPerfectCircle(ctx, centerX, centerY, radius) {
        ctx.save();
        
        // Конвертируем углы в радианы
        const startAngle = this.startAngle * Math.PI / 180;
        const endAngle = this.endAngle * Math.PI / 180;
        
        // Настраиваем обводку
        if (this.strokeType !== 'none') {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            ctx.setLineDash(this.dashPattern);
        }
        
        // Настраиваем заливку
        if (this.fillType !== 'none') {
            ctx.fillStyle = this.fillColor;
        }
        
        // Рисуем дугу или полный круг
        ctx.beginPath();
        
        if (this.endAngle - this.startAngle >= 360) {
            // Полный круг
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        } else {
            // Дуга
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            if (this.fillType !== 'none') {
                ctx.lineTo(centerX, centerY);
                ctx.closePath();
            }
        }
        
        // Применяем заливку и обводку
        if (this.fillType !== 'none') {
            ctx.fill();
        }
        if (this.strokeType !== 'none') {
            ctx.stroke();
        }
        
        ctx.restore();
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            fillType: {
                type: 'select',
                options: [
                    { value: 'none', label: 'Без заливки' },
                    { value: 'solid', label: 'Сплошная' },
                    { value: 'gradient', label: 'Градиент' }
                ],
                default: this.fillType,
                name: 'Тип заливки'
            },
            fillColor: {
                type: 'color',
                default: this.fillColor,
                name: 'Цвет заливки'
            },
            strokeType: {
                type: 'select',
                options: [
                    { value: 'none', label: 'Без обводки' },
                    { value: 'solid', label: 'Сплошная' },
                    { value: 'dashed', label: 'Пунктир' },
                    { value: 'dotted', label: 'Точки' }
                ],
                default: this.strokeType,
                name: 'Тип обводки'
            },
            strokeColor: {
                type: 'color',
                default: this.strokeColor,
                name: 'Цвет обводки'
            },
            strokeWidth: {
                min: 0.5,
                max: 10,
                step: 0.5,
                default: this.strokeWidth,
                name: 'Толщина обводки',
                type: 'range'
            },
            startAngle: {
                min: 0,
                max: 360,
                step: 1,
                default: this.startAngle,
                name: 'Начальный угол',
                type: 'range'
            },
            endAngle: {
                min: 0,
                max: 360,
                step: 1,
                default: this.endAngle,
                name: 'Конечный угол',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            fillType: this.fillType,
            fillColor: this.fillColor,
            strokeType: this.strokeType,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            dashPattern: this.dashPattern,
            startAngle: this.startAngle,
            endAngle: this.endAngle
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.fillType = data.fillType || 'none';
        this.fillColor = data.fillColor || '#E6E6FA';
        this.strokeType = data.strokeType || 'solid';
        this.strokeColor = data.strokeColor || '#000000';
        this.strokeWidth = data.strokeWidth || 2;
        this.dashPattern = data.dashPattern || [];
        this.startAngle = data.startAngle || 0;
        this.endAngle = data.endAngle || 360;
    }
}

/**
 * RectangleTemplateBrush - кисть для рисования прямоугольников
 * Создает точные прямоугольники с настройкой углов, заливки и обводки
 */
class RectangleTemplateBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Шаблон Прямоугольник';
        this.description = 'Инструмент для рисования прямоугольников с закругленными углами';
        this.category = 'geometric';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '⬜';
        
        // Параметры для прямоугольника
        this.fillType = 'none';
        this.fillColor = '#E6E6FA';
        this.strokeType = 'solid';
        this.strokeColor = '#000000';
        this.strokeWidth = 2;
        this.cornerRadius = 0;
        this.aspectRatio = 'free'; // free, square, golden, custom
        this.customAspectRatio = 1;
        this.dashPattern = [];
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        
        this.drawPerfectRectangle(ctx, x, y, radius);
    }

    drawPerfectRectangle(ctx, centerX, centerY, size) {
        ctx.save();
        
        // Определяем размеры прямоугольника
        let width = size * 2;
        let height = size * 2;
        
        // Применяем соотношение сторон
        switch (this.aspectRatio) {
            case 'square':
                // Квадрат
                height = width;
                break;
            case 'golden':
                // Золотое сечение
                height = width / 1.618;
                break;
            case 'custom':
                // Пользовательское соотношение
                height = width / this.customAspectRatio;
                break;
            case 'free':
            default:
                // Свободное соотношение (используем текущее)
                break;
        }
        
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        
        // Настраиваем обводку
        if (this.strokeType !== 'none') {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            ctx.setLineDash(this.dashPattern);
        }
        
        // Настраиваем заливку
        if (this.fillType !== 'none') {
            ctx.fillStyle = this.fillColor;
        }
        
        // Рисуем прямоугольник с закругленными углами
        this.drawRoundedRectangle(ctx, x, y, width, height, this.cornerRadius);
        
        // Применяем заливку и обводку
        if (this.fillType !== 'none') {
            ctx.fill();
        }
        if (this.strokeType !== 'none') {
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawRoundedRectangle(ctx, x, y, width, height, radius) {
        if (radius === 0) {
            // Обычный прямоугольник
            ctx.rect(x, y, width, height);
        } else {
            // Прямоугольник с закругленными углами
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            fillType: {
                type: 'select',
                options: [
                    { value: 'none', label: 'Без заливки' },
                    { value: 'solid', label: 'Сплошная' }
                ],
                default: this.fillType,
                name: 'Тип заливки'
            },
            fillColor: {
                type: 'color',
                default: this.fillColor,
                name: 'Цвет заливки'
            },
            strokeType: {
                type: 'select',
                options: [
                    { value: 'none', label: 'Без обводки' },
                    { value: 'solid', label: 'Сплошная' },
                    { value: 'dashed', label: 'Пунктир' },
                    { value: 'dotted', label: 'Точки' }
                ],
                default: this.strokeType,
                name: 'Тип обводки'
            },
            strokeColor: {
                type: 'color',
                default: this.strokeColor,
                name: 'Цвет обводки'
            },
            strokeWidth: {
                min: 0.5,
                max: 10,
                step: 0.5,
                default: this.strokeWidth,
                name: 'Толщина обводки',
                type: 'range'
            },
            cornerRadius: {
                min: 0,
                max: 50,
                step: 1,
                default: this.cornerRadius,
                name: 'Радиус углов',
                type: 'range'
            },
            aspectRatio: {
                type: 'select',
                options: [
                    { value: 'free', label: 'Свободное' },
                    { value: 'square', label: 'Квадрат' },
                    { value: 'golden', label: 'Золотое сечение' },
                    { value: 'custom', label: 'Пользовательское' }
                ],
                default: this.aspectRatio,
                name: 'Соотношение сторон'
            },
            customAspectRatio: {
                min: 0.1,
                max: 5,
                step: 0.1,
                default: this.customAspectRatio,
                name: 'Пользовательское соотношение',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            fillType: this.fillType,
            fillColor: this.fillColor,
            strokeType: this.strokeType,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            cornerRadius: this.cornerRadius,
            aspectRatio: this.aspectRatio,
            customAspectRatio: this.customAspectRatio,
            dashPattern: this.dashPattern
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.fillType = data.fillType || 'none';
        this.fillColor = data.fillColor || '#E6E6FA';
        this.strokeType = data.strokeType || 'solid';
        this.strokeColor = data.strokeColor || '#000000';
        this.strokeWidth = data.strokeWidth || 2;
        this.cornerRadius = data.cornerRadius || 0;
        this.aspectRatio = data.aspectRatio || 'free';
        this.customAspectRatio = data.customAspectRatio || 1;
        this.dashPattern = data.dashPattern || [];
    }
}

/**
 * PolygonTemplateBrush - кисть для рисования многоугольников
 * Создает правильные многоугольники с настраиваемым количеством сторон
 */
class PolygonTemplateBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Шаблон Многоугольник';
        this.description = 'Инструмент для рисования правильных многоугольников';
        this.category = 'geometric';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '🔺';
        
        // Параметры для многоугольника
        this.sides = 6;
        this.fillType = 'none';
        this.fillColor = '#E6E6FA';
        this.strokeType = 'solid';
        this.strokeColor = '#000000';
        this.strokeWidth = 2;
        this.rotation = 0;
        this.dashPattern = [];
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        
        this.drawPerfectPolygon(ctx, x, y, radius, this.sides);
    }

    drawPerfectPolygon(ctx, centerX, centerY, radius, sides) {
        ctx.save();
        
        // Настраиваем обводку
        if (this.strokeType !== 'none') {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            ctx.setLineDash(this.dashPattern);
        }
        
        // Настраиваем заливку
        if (this.fillType !== 'none') {
            ctx.fillStyle = this.fillColor;
        }
        
        // Вычисляем угол между вершинами
        const angleStep = (2 * Math.PI) / sides;
        const rotationRad = this.rotation * Math.PI / 180;
        
        // Рисуем многоугольник
        ctx.beginPath();
        
        for (let i = 0; i <= sides; i++) {
            const angle = i * angleStep + rotationRad;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        
        // Применяем заливку и обводку
        if (this.fillType !== 'none') {
            ctx.fill();
        }
        if (this.strokeType !== 'none') {
            ctx.stroke();
        }
        
        ctx.restore();
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            sides: {
                min: 3,
                max: 12,
                step: 1,
                default: this.sides,
                name: 'Количество сторон',
                type: 'range'
            },
            fillType: {
                type: 'select',
                options: [
                    { value: 'none', label: 'Без заливки' },
                    { value: 'solid', label: 'Сплошная' }
                ],
                default: this.fillType,
                name: 'Тип заливки'
            },
            fillColor: {
                type: 'color',
                default: this.fillColor,
                name: 'Цвет заливки'
            },
            strokeType: {
                type: 'select',
                options: [
                    { value: 'none', label: 'Без обводки' },
                    { value: 'solid', label: 'Сплошная' },
                    { value: 'dashed', label: 'Пунктир' },
                    { value: 'dotted', label: 'Точки' }
                ],
                default: this.strokeType,
                name: 'Тип обводки'
            },
            strokeColor: {
                type: 'color',
                default: this.strokeColor,
                name: 'Цвет обводки'
            },
            strokeWidth: {
                min: 0.5,
                max: 10,
                step: 0.5,
                default: this.strokeWidth,
                name: 'Толщина обводки',
                type: 'range'
            },
            rotation: {
                min: 0,
                max: 360,
                step: 1,
                default: this.rotation,
                name: 'Поворот',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            sides: this.sides,
            fillType: this.fillType,
            fillColor: this.fillColor,
            strokeType: this.strokeType,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            rotation: this.rotation,
            dashPattern: this.dashPattern
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.sides = data.sides || 6;
        this.fillType = data.fillType || 'none';
        this.fillColor = data.fillColor || '#E6E6FA';
        this.strokeType = data.strokeType || 'solid';
        this.strokeColor = data.strokeColor || '#000000';
        this.strokeWidth = data.strokeWidth || 2;
        this.rotation = data.rotation || 0;
        this.dashPattern = data.dashPattern || [];
    }
}

/**
 * LineTemplateBrush - кисть для рисования идеальных линий
 * Создает прямые линии с настройкой стиля и стрелок
 */
class LineTemplateBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Шаблон Линия';
        this.description = 'Инструмент для рисования идеальных прямых линий со стрелками';
        this.category = 'geometric';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '📏';
        
        // Параметры для линии
        this.strokeColor = '#000000';
        this.strokeWidth = 2;
        this.lineStyle = 'solid';
        this.dashPattern = [];
        this.startArrow = false;
        this.endArrow = true;
        this.arrowSize = 10;
        this.arrowStyle = 'classic';
        this.constrainAngle = false;
        this.angleConstraint = 15; // градусы
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        // Этот метод не используется для линий
        // Линии рисуются через drawLine
    }

    drawLine(ctx, x1, y1, x2, y2, pressure1 = 1, pressure2 = 1) {
        ctx.save();
        
        // Ограничиваем угол если нужно
        if (this.constrainAngle) {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const constrainedAngle = Math.round(angle / (this.angleConstraint * Math.PI / 180)) * (this.angleConstraint * Math.PI / 180);
            const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            x2 = x1 + Math.cos(constrainedAngle) * distance;
            y2 = y1 + Math.sin(constrainedAngle) * distance;
        }
        
        // Настраиваем стиль линии
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        ctx.setLineDash(this.dashPattern);
        ctx.lineCap = 'round';
        
        // Рисуем основную линию
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Рисуем стрелки
        if (this.startArrow) {
            this.drawArrow(ctx, x2, y2, x1, y1, this.arrowSize, this.arrowStyle);
        }
        if (this.endArrow) {
            this.drawArrow(ctx, x1, y1, x2, y2, this.arrowSize, this.arrowStyle);
        }
        
        ctx.restore();
    }

    drawArrow(ctx, fromX, fromY, toX, toY, size, style) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        ctx.save();
        ctx.translate(toX, toY);
        ctx.rotate(angle);
        
        ctx.fillStyle = this.strokeColor;
        ctx.beginPath();
        
        switch (style) {
            case 'classic':
                // Классическая стрелка
                ctx.moveTo(0, 0);
                ctx.lineTo(-size, -size/2);
                ctx.lineTo(-size, size/2);
                break;
            case 'thin':
                // Тонкая стрелка
                ctx.moveTo(0, 0);
                ctx.lineTo(-size, -size/4);
                ctx.lineTo(-size, size/4);
                break;
            case 'diamond':
                // Ромбовидная стрелка
                ctx.moveTo(0, 0);
                ctx.lineTo(-size, -size/3);
                ctx.lineTo(-size * 1.2, 0);
                ctx.lineTo(-size, size/3);
                break;
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            strokeColor: {
                type: 'color',
                default: this.strokeColor,
                name: 'Цвет линии'
            },
            strokeWidth: {
                min: 0.5,
                max: 10,
                step: 0.5,
                default: this.strokeWidth,
                name: 'Толщина линии',
                type: 'range'
            },
            lineStyle: {
                type: 'select',
                options: [
                    { value: 'solid', label: 'Сплошная' },
                    { value: 'dashed', label: 'Пунктир' },
                    { value: 'dotted', label: 'Точки' }
                ],
                default: this.lineStyle,
                name: 'Стиль линии'
            },
            startArrow: {
                type: 'checkbox',
                default: this.startArrow,
                name: 'Стрелка в начале'
            },
            endArrow: {
                type: 'checkbox',
                default: this.endArrow,
                name: 'Стрелка в конце'
            },
            arrowSize: {
                min: 5,
                max: 30,
                step: 1,
                default: this.arrowSize,
                name: 'Размер стрелки',
                type: 'range'
            },
            arrowStyle: {
                type: 'select',
                options: [
                    { value: 'classic', label: 'Классическая' },
                    { value: 'thin', label: 'Тонкая' },
                    { value: 'diamond', label: 'Ромбовидная' }
                ],
                default: this.arrowStyle,
                name: 'Стиль стрелки'
            },
            constrainAngle: {
                type: 'checkbox',
                default: this.constrainAngle,
                name: 'Ограничить угол'
            },
            angleConstraint: {
                min: 5,
                max: 90,
                step: 1,
                default: this.angleConstraint,
                name: 'Шаг угла',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            lineStyle: this.lineStyle,
            dashPattern: this.dashPattern,
            startArrow: this.startArrow,
            endArrow: this.endArrow,
            arrowSize: this.arrowSize,
            arrowStyle: this.arrowStyle,
            constrainAngle: this.constrainAngle,
            angleConstraint: this.angleConstraint
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.strokeColor = data.strokeColor || '#000000';
        this.strokeWidth = data.strokeWidth || 2;
        this.lineStyle = data.lineStyle || 'solid';
        this.dashPattern = data.dashPattern || [];
        this.startArrow = data.startArrow || false;
        this.endArrow = data.endArrow || true;
        this.arrowSize = data.arrowSize || 10;
        this.arrowStyle = data.arrowStyle || 'classic';
        this.constrainAngle = data.constrainAngle || false;
        this.angleConstraint = data.angleConstraint || 15;
    }
}
