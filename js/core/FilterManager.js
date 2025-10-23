/**
 * FilterManager - менеджер фильтров и корректировок
 * Управляет применением фильтров к слоям и выделениям
 */
class FilterManager {
    constructor(eventManager, layerManager) {
        this.eventManager = eventManager;
        this.layerManager = layerManager;
        
        // Доступные фильтры
        this.filters = new Map();
        this.registerDefaultFilters();
        
        // История фильтров для отмены
        this.filterHistory = [];
        this.maxHistorySize = 50;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    /**
     * Регистрация стандартных фильтров
     */
    registerDefaultFilters() {
        const filters = [
            {
                id: 'blur',
                name: 'Размытие',
                description: 'Гауссово размытие изображения',
                icon: '🌫️',
                apply: this.applyBlur.bind(this),
                parameters: {
                    radius: { min: 0, max: 20, default: 5, name: 'Радиус' }
                }
            },
            {
                id: 'sharpen',
                name: 'Резкость',
                description: 'Увеличение резкости изображения',
                icon: '🔍',
                apply: this.applySharpen.bind(this),
                parameters: {
                    amount: { min: 0, max: 5, default: 1, name: 'Сила' }
                }
            },
            {
                id: 'brightness',
                name: 'Яркость',
                description: 'Настройка яркости изображения',
                icon: '☀️',
                apply: this.applyBrightness.bind(this),
                parameters: {
                    brightness: { min: -100, max: 100, default: 0, name: 'Яркость' }
                }
            },
            {
                id: 'contrast',
                name: 'Контраст',
                description: 'Настройка контрастности изображения',
                icon: '⚫',
                apply: this.applyContrast.bind(this),
                parameters: {
                    contrast: { min: -100, max: 100, default: 0, name: 'Контраст' }
                }
            },
            {
                id: 'hue',
                name: 'Оттенок',
                description: 'Изменение оттенка изображения',
                icon: '🌈',
                apply: this.applyHueShift.bind(this),
                parameters: {
                    hue: { min: -180, max: 180, default: 0, name: 'Оттенок' }
                }
            },
            {
                id: 'saturation',
                name: 'Насыщенность',
                description: 'Настройка насыщенности цветов',
                icon: '🎨',
                apply: this.applySaturation.bind(this),
                parameters: {
                    saturation: { min: -100, max: 100, default: 0, name: 'Насыщенность' }
                }
            },
            {
                id: 'invert',
                name: 'Инверсия',
                description: 'Инвертирование цветов',
                icon: '🔀',
                apply: this.applyInvert.bind(this),
                parameters: {}
            },
            {
                id: 'grayscale',
                name: 'Оттенки серого',
                description: 'Преобразование в черно-белое',
                icon: '⚪',
                apply: this.applyGrayscale.bind(this),
                parameters: {}
            },
            {
                id: 'sepia',
                name: 'Сепия',
                description: 'Сепия эффект',
                icon: '📜',
                apply: this.applySepia.bind(this),
                parameters: {
                    amount: { min: 0, max: 100, default: 50, name: 'Сила' }
                }
            },
            {
                id: 'vintage',
                name: 'Винтаж',
                description: 'Винтажный эффект',
                icon: '📷',
                apply: this.applyVintage.bind(this),
                parameters: {
                    amount: { min: 0, max: 100, default: 70, name: 'Сила' }
                }
            }
        ];

        filters.forEach(filter => {
            this.filters.set(filter.id, filter);
        });
    }

    /**
     * Применение фильтра к активному слою
     */
    applyFilter(filterId, parameters = {}) {
        const filter = this.filters.get(filterId);
        if (!filter) {
            console.error(`Фильтр ${filterId} не найден`);
            return false;
        }

        const activeLayer = this.layerManager.getActiveLayer();
        if (!activeLayer || activeLayer.locked) {
            console.error('Нет активного слоя или слой заблокирован');
            return false;
        }

        try {
            // Сохраняем состояние для отмены
            this.saveLayerState(activeLayer);
            
            // Применяем фильтр
            const result = filter.apply(activeLayer, parameters);
            
            if (result) {
                // Обновляем миниатюру слоя
                this.layerManager.updateLayerThumbnail(activeLayer);
                
                // Обновляем UI
                this.layerManager.updateLayersUI();
                
                // Уведомляем подписчиков
                this.eventManager.emit('filterApplied', {
                    filter: filterId,
                    layer: activeLayer,
                    parameters: parameters
                });
                
                // Перерисовываем canvas
                this.eventManager.emit('requestRender');
            }
            
            return result;
        } catch (error) {
            console.error('Ошибка применения фильтра:', error);
            return false;
        }
    }

    /**
     * Применение размытия
     */
    applyBlur(layer, parameters) {
        const radius = parameters.radius || 5;
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        // Применяем гауссово размытие
        const blurredData = this.gaussianBlur(imageData, radius);
        ctx.putImageData(blurredData, 0, 0);
        
        return true;
    }

    /**
     * Применение резкости
     */
    applySharpen(layer, parameters) {
        const amount = parameters.amount || 1;
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        // Применяем фильтр резкости
        const sharpenedData = this.convolutionFilter(imageData, [
            0, -1 * amount, 0,
            -1 * amount, 1 + 4 * amount, -1 * amount,
            0, -1 * amount, 0
        ]);
        
        ctx.putImageData(sharpenedData, 0, 0);
        return true;
    }

    /**
     * Настройка яркости
     */
    applyBrightness(layer, parameters) {
        const brightness = parameters.brightness || 0;
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        this.adjustBrightness(imageData, brightness);
        ctx.putImageData(imageData, 0, 0);
        return true;
    }

    /**
     * Настройка контрастности
     */
    applyContrast(layer, parameters) {
        const contrast = parameters.contrast || 0;
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        this.adjustContrast(imageData, contrast);
        ctx.putImageData(imageData, 0, 0);
        return true;
    }

    /**
     * Изменение оттенка
     */
    applyHueShift(layer, parameters) {
        const hue = parameters.hue || 0;
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        this.adjustHue(imageData, hue);
        ctx.putImageData(imageData, 0, 0);
        return true;
    }

    /**
     * Настройка насыщенности
     */
    applySaturation(layer, parameters) {
        const saturation = parameters.saturation || 0;
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        this.adjustSaturation(imageData, saturation);
        ctx.putImageData(imageData, 0, 0);
        return true;
    }

    /**
     * Инвертирование цветов
     */
    applyInvert(layer, parameters) {
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        this.invertColors(imageData);
        ctx.putImageData(imageData, 0, 0);
        return true;
    }

    /**
     * Преобразование в оттенки серого
     */
    applyGrayscale(layer, parameters) {
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        this.grayscale(imageData);
        ctx.putImageData(imageData, 0, 0);
        return true;
    }

    /**
     * Эффект сепии
     */
    applySepia(layer, parameters) {
        const amount = (parameters.amount || 50) / 100;
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        this.sepia(imageData, amount);
        ctx.putImageData(imageData, 0, 0);
        return true;
    }

    /**
     * Винтажный эффект
     */
    applyVintage(layer, parameters) {
        const amount = (parameters.amount || 70) / 100;
        const ctx = layer.context;
        const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        
        // Применяем комбинацию эффектов
        this.sepia(imageData, amount * 0.8);
        this.adjustContrast(imageData, amount * 30);
        this.adjustBrightness(imageData, amount * 20);
        this.addNoise(imageData, amount * 10);
        
        ctx.putImageData(imageData, 0, 0);
        return true;
    }

    /**
     * Вспомогательные методы для обработки изображений
     */

    // Гауссово размытие
    gaussianBlur(imageData, radius) {
        const result = new ImageData(imageData.width, imageData.height);
        const kernel = this.generateGaussianKernel(radius);
        
        return this.convolve(imageData, kernel, radius);
    }

    // Генерация ядра Гаусса
    generateGaussianKernel(radius) {
        const size = radius * 2 + 1;
        const kernel = new Float32Array(size * size);
        const sigma = radius / 3;
        let sum = 0;
        
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                kernel[(y + radius) * size + (x + radius)] = value;
                sum += value;
            }
        }
        
        // Нормализуем ядро
        for (let i = 0; i < kernel.length; i++) {
            kernel[i] /= sum;
        }
        
        return { kernel, size };
    }

    // Свертка изображения
    convolve(imageData, kernelInfo, radius) {
        const { kernel, size } = kernelInfo;
        const result = new ImageData(imageData.width, imageData.height);
        const src = imageData.data;
        const dst = result.data;
        
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const px = Math.min(Math.max(x + kx, 0), imageData.width - 1);
                        const py = Math.min(Math.max(y + ky, 0), imageData.height - 1);
                        const srcIndex = (py * imageData.width + px) * 4;
                        const kernelValue = kernel[(ky + radius) * size + (kx + radius)];
                        
                        r += src[srcIndex] * kernelValue;
                        g += src[srcIndex + 1] * kernelValue;
                        b += src[srcIndex + 2] * kernelValue;
                        a += src[srcIndex + 3] * kernelValue;
                    }
                }
                
                const dstIndex = (y * imageData.width + x) * 4;
                dst[dstIndex] = r;
                dst[dstIndex + 1] = g;
                dst[dstIndex + 2] = b;
                dst[dstIndex + 3] = a;
            }
        }
        
        return result;
    }

    // Фильтр свертки
    convolutionFilter(imageData, kernel) {
        const result = new ImageData(imageData.width, imageData.height);
        const src = imageData.data;
        const dst = result.data;
        const kernelSize = Math.sqrt(kernel.length);
        const radius = Math.floor(kernelSize / 2);
        
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                let r = 0, g = 0, b = 0;
                
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const px = Math.min(Math.max(x + kx, 0), imageData.width - 1);
                        const py = Math.min(Math.max(y + ky, 0), imageData.height - 1);
                        const srcIndex = (py * imageData.width + px) * 4;
                        const kernelValue = kernel[(ky + radius) * kernelSize + (kx + radius)];
                        
                        r += src[srcIndex] * kernelValue;
                        g += src[srcIndex + 1] * kernelValue;
                        b += src[srcIndex + 2] * kernelValue;
                    }
                }
                
                const dstIndex = (y * imageData.width + x) * 4;
                dst[dstIndex] = Math.min(Math.max(r, 0), 255);
                dst[dstIndex + 1] = Math.min(Math.max(g, 0), 255);
                dst[dstIndex + 2] = Math.min(Math.max(b, 0), 255);
                dst[dstIndex + 3] = src[dstIndex + 3];
            }
        }
        
        return result;
    }

    // Настройка яркости
    adjustBrightness(imageData, brightness) {
        const data = imageData.data;
        const factor = 1 + brightness / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(Math.max(data[i] * factor, 0), 255);
            data[i + 1] = Math.min(Math.max(data[i + 1] * factor, 0), 255);
            data[i + 2] = Math.min(Math.max(data[i + 2] * factor, 0), 255);
        }
    }

    // Настройка контрастности
    adjustContrast(imageData, contrast) {
        const data = imageData.data;
        const factor = (1 + contrast / 100);
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = this.applyContrastToChannel(data[i], factor);
            data[i + 1] = this.applyContrastToChannel(data[i + 1], factor);
            data[i + 2] = this.applyContrastToChannel(data[i + 2], factor);
        }
    }

    applyContrastToChannel(value, factor) {
        return Math.min(Math.max(((value - 128) * factor) + 128, 0), 255);
    }

    // Изменение оттенка
    adjustHue(imageData, hue) {
        const data = imageData.data;
        const hueRad = hue * Math.PI / 180;
        
        for (let i = 0; i < data.length; i += 4) {
            const hsl = this.rgbToHsl(data[i], data[i + 1], data[i + 2]);
            hsl[0] = (hsl[0] + hueRad) % (2 * Math.PI);
            const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
            
            data[i] = rgb[0];
            data[i + 1] = rgb[1];
            data[i + 2] = rgb[2];
        }
    }

    // Настройка насыщенности
    adjustSaturation(imageData, saturation) {
        const data = imageData.data;
        const factor = 1 + saturation / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            const hsl = this.rgbToHsl(data[i], data[i + 1], data[i + 2]);
            hsl[1] = Math.min(Math.max(hsl[1] * factor, 0), 1);
            const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
            
            data[i] = rgb[0];
            data[i + 1] = rgb[1];
            data[i + 2] = rgb[2];
        }
    }

    // Инвертирование цветов
    invertColors(imageData) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }

    // Преобразование в оттенки серого
    grayscale(imageData) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }

    // Эффект сепии
    sepia(imageData, amount) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const sepiaR = Math.min(Math.max((r * 0.393 + g * 0.769 + b * 0.189), 0), 255);
            const sepiaG = Math.min(Math.max((r * 0.349 + g * 0.686 + b * 0.168), 0), 255);
            const sepiaB = Math.min(Math.max((r * 0.272 + g * 0.534 + b * 0.131), 0), 255);
            
            data[i] = r * (1 - amount) + sepiaR * amount;
            data[i + 1] = g * (1 - amount) + sepiaG * amount;
            data[i + 2] = b * (1 - amount) + sepiaB * amount;
        }
    }

    // Добавление шума
    addNoise(imageData, amount) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * amount;
            data[i] = Math.min(Math.max(data[i] + noise, 0), 255);
            data[i + 1] = Math.min(Math.max(data[i + 1] + noise, 0), 255);
            data[i + 2] = Math.min(Math.max(data[i + 2] + noise, 0), 255);
        }
    }

    // Вспомогательные методы преобразования цветов
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return [h * 2 * Math.PI, s, l];
    }

    hslToRgb(h, s, l) {
        h /= 2 * Math.PI;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * Сохранение состояния слоя для отмены
     */
    saveLayerState(layer) {
        const state = {
            layerId: layer.id,
            imageData: layer.context.getImageData(0, 0, layer.canvas.width, layer.canvas.height),
            timestamp: Date.now()
        };
        
        this.filterHistory.push(state);
        
        // Ограничиваем размер истории
        if (this.filterHistory.length > this.maxHistorySize) {
            this.filterHistory.shift();
        }
    }

    /**
     * Отмена последнего фильтра
     */
    undoLastFilter() {
        if (this.filterHistory.length === 0) {
            console.warn('Нет фильтров для отмены');
            return false;
        }
        
        const lastState = this.filterHistory.pop();
        const layer = this.layerManager.getLayerById(lastState.layerId);
        
        if (!layer) {
            console.error('Слой для отмены не найден');
            return false;
        }
        
        // Восстанавливаем состояние
        layer.context.putImageData(lastState.imageData, 0, 0);
        
        // Обновляем UI
        this.layerManager.updateLayerThumbnail(layer);
        this.layerManager.updateLayersUI();
        
        // Перерисовываем
        this.eventManager.emit('requestRender');
        
        // Уведомляем подписчиков
        this.eventManager.emit('filterUndone', {
            layer: layer
        });
        
        return true;
    }

    /**
     * Получение всех доступных фильтров
     */
    getAllFilters() {
        return Array.from(this.filters.values());
    }

    /**
     * Получение фильтра по ID
     */
    getFilter(id) {
        return this.filters.get(id);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработка кнопок фильтров
        document.addEventListener('click', (event) => {
            const filterBtn = event.target.closest('.filter-btn');
            if (filterBtn) {
                const filterId = filterBtn.dataset.filter;
                
                // Показываем диалог параметров фильтра
                this.showFilterDialog(filterId);
            }
        });
    }

    /**
     * Показ диалога параметров фильтра
     */
    showFilterDialog(filterId) {
        const filter = this.getFilter(filterId);
        if (!filter) return;
        
        // Создаем простой диалог (в реальном приложении используйте более сложный UI)
        const parameters = {};
        
        Object.entries(filter.parameters).forEach(([paramId, paramInfo]) => {
            const value = prompt(`${paramInfo.name} (${paramInfo.min}-${paramInfo.max}):`, paramInfo.default);
            if (value !== null) {
                parameters[paramId] = parseFloat(value);
            }
        });
        
        // Применяем фильтр
        this.applyFilter(filterId, parameters);
    }

    /**
     * Сохранение состояния менеджера фильтров
     */
    serialize() {
        return {
            filterHistory: this.filterHistory.map(state => ({
                layerId: state.layerId,
                timestamp: state.timestamp
                // imageData не сериализуем для экономии памяти
            }))
        };
    }

    /**
     * Восстановление состояния менеджера фильтров
     */
    deserialize(data) {
        // История фильтров не восстанавливается для экономии памяти
        this.filterHistory = [];
    }

    /**
     * Получение статистики
     */
    getStats() {
        return {
            totalFilters: this.filters.size,
            availableFilters: this.getAllFilters().map(f => f.id),
            historySize: this.filterHistory.length
        };
    }
}
