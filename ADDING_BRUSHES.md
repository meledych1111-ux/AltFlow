# Руководство по добавлению новых кистей в ArtFlow

## Обзор

ArtFlow использует модульную архитектуру для кистей. Каждая кисть - это отдельный класс, наследующийся от `BrushBase`.

## Быстрое добавление новой кисти

### 1. Создание файла кисти

Создайте новый файл в папке `js/brushes/`, например `MyCustomBrush.js`:

```javascript
/**
 * MyCustomBrush - пример пользовательской кисти
 */
class MyCustomBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Моя кисть';
        this.icon = '🎨';
        this.description = 'Описание кисти';
        
        // Настройки по умолчанию
        this.defaultSize = 10;
        this.defaultOpacity = 1.0;
        this.defaultColor = '#000000';
    }
    
    /**
     * Основной метод рисования
     * @param {CanvasRenderingContext2D} ctx - контекст canvas
     * @param {number} x - координата X
     * @param {number} y - координата Y
     * @param {number} pressure - давление (0-1)
     * @param {string} color - цвет
     * @param {number} size - размер кисти
     */
    draw(ctx, x, y, pressure, color, size) {
        // Настройка контекста
        ctx.globalAlpha = this.brushOpacity * pressure;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Реализация рисования
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Возвращает свойства кисти для UI
     */
    getProperties() {
        return {
            size: {
                min: 1,
                max: 100,
                value: this.defaultSize,
                step: 1,
                label: 'Размер'
            },
            opacity: {
                min: 0,
                max: 1,
                value: this.defaultOpacity,
                step: 0.1,
                label: 'Непрозрачность'
            },
            spacing: {
                min: 1,
                max: 50,
                value: 10,
                step: 1,
                label: 'Расстояние'
            }
        };
    }
    
    /**
     * Обработка изменения свойств
     */
    setProperty(name, value) {
        switch (name) {
            case 'size':
                this.brushSize = value;
                break;
            case 'opacity':
                this.brushOpacity = value;
                break;
            case 'spacing':
                this.spacing = value;
                break;
        }
    }
    
    /**
     * Специфическая логика для начала рисования
     */
    startStroke(x, y, pressure, color, size) {
        // Инициализация для нового штриха
        this.lastX = x;
        this.lastY = y;
        this.strokeColor = color;
        this.strokeSize = size;
    }
    
    /**
     * Специфическая логика для конца рисования
     */
    endStroke() {
        // Очистка состояния
        this.lastX = null;
        this.lastY = null;
    }
}
```

### 2. Регистрация кисти в системе

Добавьте кисть в `ToolManager.js` в метод `registerDefaultBrushes()`:

```javascript
registerDefaultBrushes() {
    // ... существующие кисти ...
    
    // Добавляем новую кисть
    this.registerBrush('my-custom-brush', new MyCustomBrush());
    
    // ... другие кисти ...
}
```

### 3. Подключение в HTML

Добавьте скрипт в `index.html`:

```html
<script src="js/brushes/MyCustomBrush.js"></script>
```

## Примеры реализаций различных типов кистей

### 1. Простая кисть с текстурой

```javascript
draw(ctx, x, y, pressure, color, size) {
    // Создание текстуры
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const textureCtx = canvas.getContext('2d');
    
    // Генерация шума для текстуры
    const imageData = textureCtx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 50;
        imageData.data[i] = noise;     // R
        imageData.data[i + 1] = noise; // G
        imageData.data[i + 2] = noise; // B
        imageData.data[i + 3] = 255;   // A
    }
    textureCtx.putImageData(imageData, 0, 0);
    
    // Использование текстуры
    ctx.globalAlpha = this.brushOpacity * pressure;
    ctx.drawImage(canvas, x - size/2, y - size/2);
}
```

### 2. Кисть с градиентом

```javascript
draw(ctx, x, y, pressure, color, size) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size/2);
    gradient.addColorStop(0, this.lightenColor(color, 0.3));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.darkenColor(color, 0.3));
    
    ctx.globalAlpha = this.brushOpacity * pressure;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.fill();
}

lightenColor(color, factor) {
    // Реализация осветления цвета
}

darkenColor(color, factor) {
    // Реализация затемнения цвета
}
```

### 3. Кисть с динамическим размером

```javascript
draw(ctx, x, y, pressure, color, size) {
    const dynamicSize = size * (0.5 + pressure * 0.5);
    
    ctx.globalAlpha = this.brushOpacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, dynamicSize/2, 0, Math.PI * 2);
    ctx.fill();
}
```

### 4. Кисть с эффектом размытия

```javascript
draw(ctx, x, y, pressure, color, size) {
    ctx.filter = 'blur(2px)';
    ctx.globalAlpha = this.brushOpacity * pressure;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
}
```

## Утилиты для работы с цветом

Добавьте вспомогательные методы в базовый класс:

```javascript
// В BrushBase.js
hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

lightenColor(color, factor) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const newR = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * factor));
    const newG = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * factor));
    const newB = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * factor));
    
    return this.rgbToHex(newR, newG, newB);
}

darkenColor(color, factor) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const newR = Math.floor(rgb.r * (1 - factor));
    const newG = Math.floor(rgb.g * (1 - factor));
    const newB = Math.floor(rgb.b * (1 - factor));
    
    return this.rgbToHex(newR, newG, newB);
}
```

## Тестирование новой кисти

1. **Проверка загрузки**: Убедитесь, что кисть появляется в списке кистей
2. **Тестирование рисования**: Проверьте работу на разных размерах и прозрачности
3. **Проверка свойств**: Убедитесь, что все свойства корректно отображаются и работают
4. **Тестирование производительности**: Проверьте работу при быстром рисовании

## Рекомендации по оптимизации

1. **Кэширование**: Кэшируйте вычисления, которые не меняются между вызовами
2. **Оптимизация циклов**: Минимизируйте количество операций в циклах рисования
3. **Использование requestAnimationFrame**: Для анимированных эффектов
4. **Ограничение размера**: Не рисуйте слишком большие области за один раз

## Примеры готовых кистей

Смотрите существующие кисти в папке `js/brushes/` для примеров реализации:
- `AnimeBrushes.js` - кисти для аниме
- `ArtistBrushes.js` - художественные кисти
- `DrawingBrushes.js` - технические кисти

## Поддержка

Если у вас возникли вопросы по добавлению кистей, пожалуйста:
1. Проверьте существующие примеры
2. Убедитесь, что все файлы подключены в HTML
3. Проверьте консоль браузера на наличие ошибок