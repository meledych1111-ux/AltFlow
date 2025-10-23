/**
 * BrushBase - базовый класс для всех кистей
 * Определяет общий интерфейс и функциональность для всех типов кистей
 */
class BrushBase {
    constructor() {
        // Метаданные кисти
        this.name = 'Base Brush';
        this.description = 'Базовая кисть';
        this.category = 'basic';
        this.version = '1.0.0';
        this.author = 'ArtFlow';
        this.icon = '🖌️';
        
        // Параметры кисти
        this.size = 20;
        this.opacity = 1.0;
        this.hardness = 1.0;
        this.flow = 1.0;
        this.spacing = 0.1;
        this.angle = 0;
        this.roundness = 1.0;
        
        // Цвета
        this.primaryColor = '#000000';
        this.secondaryColor = '#ffffff';
        
        // Состояние
        this.lastX = 0;
        this.lastY = 0;
        this.lastPressure = 0;
        this.distance = 0;
        this.isDrawing = false;
        
        // Кэш для оптимизации
        this.cache = new Map();
        this.cacheSize = 100;
    }

    /**
     * Основной метод рисования
     * Должен быть переопределен в дочерних классах
     */
    draw(ctx, x, y, pressure = 1, options = {}) {
        throw new Error('Метод draw() должен быть переопределен в дочернем классе');
    }

    /**
     * Метод для получения параметров кисти
     * Должен быть переопределен в дочерних классах для добавления специфичных параметров
     */
    getParameters() {
        return {
            size: {
                min: 1,
                max: 100,
                default: this.size,
                name: 'Размер',
                type: 'range'
            },
            opacity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.opacity,
                name: 'Непрозрачность',
                type: 'range'
            },
            hardness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.hardness,
                name: 'Жесткость',
                type: 'range'
            },
            flow: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.flow,
                name: 'Поток',
                type: 'range'
            },
            spacing: {
                min: 0.01,
                max: 2,
                step: 0.01,
                default: this.spacing,
                name: 'Интервал',
                type: 'range'
            }
        };
    }

    /**
     * Установка параметра кисти
     */
    setParameter(name, value) {
        if (this.hasOwnProperty(name)) {
            this[name] = value;
            this.clearCache();
        }
    }

    /**
     * Получение параметра кисти
     */
    getParameter(name) {
        return this[name];
    }

    /**
     * Начало рисования
     */
    startDrawing(x, y, pressure = 1) {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        this.lastPressure = pressure;
        this.distance = 0;
    }

    /**
     * Завершение рисования
     */
    stopDrawing() {
        this.isDrawing = false;
        this.distance = 0;
    }

    /**
     * Рисование линии между двумя точками с интерполяцией
     */
    drawLine(ctx, x1, y1, x2, y2, pressure1 = 1, pressure2 = 1) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Вычисляем шаг интерполяции на основе размера кисти и интервала
        const step = this.size * this.spacing;
        const steps = Math.max(1, Math.ceil(distance / step));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + dx * t;
            const y = y1 + dy * t;
            const pressure = pressure1 + (pressure2 - pressure1) * t;
            
            // Рисуем только если прошло достаточное расстояние
            const pointDistance = Math.sqrt(
                (x - this.lastX) ** 2 + (y - this.lastY) ** 2
            );
            
            if (pointDistance >= step || i === steps) {
                this.draw(ctx, x, y, pressure);
                this.lastX = x;
                this.lastY = y;
                this.lastPressure = pressure;
            }
        }
    }

    /**
     * Создание градиента кисти
     */
    createBrushGradient(ctx, x, y, size, hardness, opacity) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        
        if (hardness >= 1) {
            gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
            gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
        } else {
            const innerSize = size * hardness;
            const outerOpacity = opacity * (1 - hardness);
            
            gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
            gradient.addColorStop(innerSize / size, `rgba(0, 0, 0, ${opacity * hardness})`);
            gradient.addColorStop(1, `rgba(0, 0, 0, ${outerOpacity})`);
        }
        
        return gradient;
    }

    /**
     * Применение настроек контекста canvas
     */
    applyBrushSettings(ctx, options = {}) {
        const globalCompositeOperation = options.globalCompositeOperation || 'source-over';
        const globalAlpha = options.globalAlpha || this.opacity;
        
        ctx.globalCompositeOperation = globalCompositeOperation;
        ctx.globalAlpha = globalAlpha;
    }

    /**
     * Сброс настроек контекста canvas
     */
    resetBrushSettings(ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }

    /**
     * Смешивание цветов
     */
    blendColors(color1, color2, ratio) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Осветление цвета
     */
    lightenColor(color, percent) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.min(255, Math.round(r + (255 - r) * percent / 100));
        const newG = Math.min(255, Math.round(g + (255 - g) * percent / 100));
        const newB = Math.min(255, Math.round(b + (255 - b) * percent / 100));
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * Затемнение цвета
     */
    darkenColor(color, percent) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.max(0, Math.round(r * (100 - percent) / 100));
        const newG = Math.max(0, Math.round(g * (100 - percent) / 100));
        const newB = Math.max(0, Math.round(b * (100 - percent) / 100));
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * Генерация случайного числа в диапазоне
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Генерация случайного целого числа в диапазоне
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Шум Перлина (упрощенная версия)
     */
    noise(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }

    /**
     * Кэширование результата
     */
    setCache(key, value) {
        if (this.cache.size >= this.cacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    /**
     * Получение из кэша
     */
    getCache(key) {
        return this.cache.get(key);
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Клонирование кисти
     */
    clone() {
        const clone = new this.constructor();
        Object.assign(clone, this);
        clone.cache = new Map();
        return clone;
    }

    /**
     * Сериализация состояния кисти
     */
    serialize() {
        return {
            name: this.name,
            size: this.size,
            opacity: this.opacity,
            hardness: this.hardness,
            flow: this.flow,
            spacing: this.spacing,
            angle: this.angle,
            roundness: this.roundness,
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor
        };
    }

    /**
     * Десериализация состояния кисти
     */
    deserialize(data) {
        Object.assign(this, data);
        this.clearCache();
    }

    /**
     * Получение информации о кисти
     */
    getInfo() {
        return {
            name: this.name,
            description: this.description,
            category: this.category,
            version: this.version,
            author: this.author,
            icon: this.icon,
            parameters: this.getParameters()
        };
    }
}