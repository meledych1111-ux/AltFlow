/**
 * Sphere3DBrush - 3D сфера с реалистичным освещением
 * Создает объемные сферы с настраиваемым направлением света
 */
class Sphere3DBrush extends BrushBase {
    constructor() {
        super();
        this.name = '3D Сфера';
        this.description = 'Создает объемные сферы с реалистичным освещением. Поддерживает 4 направления света и настраиваемые материалы';
        this.category = '3d-effects';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '🔴';
        
        // Дополнительные параметры для 3D эффекта
        this.lightDirection = 'top-left';
        this.material = 'matte';
        this.specular = 0.5;
        this.roughness = 0.3;
    }

    /**
     * Основной метод рисования 3D сферы
     */
    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        const lightDirection = options.lightDirection || this.lightDirection;
        const material = options.material || this.material;
        
        this.createSphere(ctx, x, y, radius, color, lightDirection, material);
    }

    /**
     * Создание 3D сферы с освещением
     */
    createSphere(ctx, x, y, radius, color, lightDirection, material) {
        ctx.save();
        
        // Создаем основной градиент для сферы
        const gradient = this.createSphereGradient(ctx, x, y, radius, color, lightDirection);
        
        // Рисуем основную сферу
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавляем блик в зависимости от материала
        if (material !== 'matte') {
            this.addSpecularHighlight(ctx, x, y, radius, color, lightDirection, material);
        }
        
        // Добавляем края для большей реалистичности
        this.addEdgeHighlight(ctx, x, y, radius, color, lightDirection);
        
        ctx.restore();
    }

    /**
     * Создание градиента для 3D сферы
     */
    createSphereGradient(ctx, x, y, radius, color, lightDirection) {
        // Определяем смещение света в зависимости от направления
        let lightOffsetX, lightOffsetY, shadowOffsetX, shadowOffsetY;
        
        switch (lightDirection) {
            case 'top-left':
                lightOffsetX = -radius * 0.3;
                lightOffsetY = -radius * 0.3;
                shadowOffsetX = radius * 0.2;
                shadowOffsetY = radius * 0.2;
                break;
            case 'top-right':
                lightOffsetX = radius * 0.3;
                lightOffsetY = -radius * 0.3;
                shadowOffsetX = -radius * 0.2;
                shadowOffsetY = radius * 0.2;
                break;
            case 'bottom-left':
                lightOffsetX = -radius * 0.3;
                lightOffsetY = radius * 0.3;
                shadowOffsetX = radius * 0.2;
                shadowOffsetY = -radius * 0.2;
                break;
            case 'bottom-right':
                lightOffsetX = radius * 0.3;
                lightOffsetY = radius * 0.3;
                shadowOffsetX = -radius * 0.2;
                shadowOffsetY = -radius * 0.2;
                break;
            default:
                lightOffsetX = -radius * 0.3;
                lightOffsetY = -radius * 0.3;
                shadowOffsetX = radius * 0.2;
                shadowOffsetY = radius * 0.2;
        }
        
        // Создаем градиент с учетом освещения
        const gradient = ctx.createRadialGradient(
            x + lightOffsetX, y + lightOffsetY, 0,
            x + shadowOffsetX, y + shadowOffsetY, radius
        );
        
        // Осветленный цвет для блика
        const highlightColor = this.lightenColor(color, 60);
        // Темный цвет для тени
        const shadowColor = this.darkenColor(color, 40);
        
        gradient.addColorStop(0, highlightColor);
        gradient.addColorStop(0.3, this.lightenColor(color, 20));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, shadowColor);
        
        return gradient;
    }

    /**
     * Добавление блика в зависимости от материала
     */
    addSpecularHighlight(ctx, x, y, radius, color, lightDirection, material) {
        let highlightX, highlightY, highlightSize, highlightOpacity;
        
        // Определяем позицию блика
        switch (lightDirection) {
            case 'top-left':
                highlightX = x - radius * 0.25;
                highlightY = y - radius * 0.25;
                break;
            case 'top-right':
                highlightX = x + radius * 0.25;
                highlightY = y - radius * 0.25;
                break;
            case 'bottom-left':
                highlightX = x - radius * 0.25;
                highlightY = y + radius * 0.25;
                break;
            case 'bottom-right':
                highlightX = x + radius * 0.25;
                highlightY = y + radius * 0.25;
                break;
        }
        
        // Настраиваем блик в зависимости от материала
        switch (material) {
            case 'glossy':
                highlightSize = radius * 0.15;
                highlightOpacity = 0.8;
                break;
            case 'metallic':
                highlightSize = radius * 0.2;
                highlightOpacity = 0.6;
                break;
            case 'plastic':
                highlightSize = radius * 0.12;
                highlightOpacity = 0.7;
                break;
            default:
                highlightSize = radius * 0.1;
                highlightOpacity = 0.5;
        }
        
        // Создаем градиент для блика
        const highlightGradient = ctx.createRadialGradient(
            highlightX, highlightY, 0,
            highlightX, highlightY, highlightSize
        );
        
        highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${highlightOpacity})`);
        highlightGradient.addColorStop(0.5, `rgba(255, 255, 255, ${highlightOpacity * 0.5})`);
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Добавление подсветки краев
     */
    addEdgeHighlight(ctx, x, y, radius, color, lightDirection) {
        // Создаем тонкую подсветку края с противоположной стороны от света
        let edgeX, edgeY;
        
        switch (lightDirection) {
            case 'top-left':
                edgeX = x + radius * 0.8;
                edgeY = y + radius * 0.8;
                break;
            case 'top-right':
                edgeX = x - radius * 0.8;
                edgeY = y + radius * 0.8;
                break;
            case 'bottom-left':
                edgeX = x + radius * 0.8;
                edgeY = y - radius * 0.8;
                break;
            case 'bottom-right':
                edgeX = x - radius * 0.8;
                edgeY = y - radius * 0.8;
                break;
        }
        
        const edgeGradient = ctx.createRadialGradient(
            edgeX, edgeY, radius * 0.9,
            edgeX, edgeY, radius
        );
        
        edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.fillStyle = edgeGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Переопределяем методы рисования для использования 3D эффекта
     */
    drawLine(ctx, x1, y1, x2, y2, pressure1 = 1, pressure2 = 1) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const step = this.size * this.spacing;
        const steps = Math.max(1, Math.ceil(distance / step));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + dx * t;
            const y = y1 + dy * t;
            const pressure = pressure1 + (pressure2 - pressure1) * t;
            
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
     * Переопределяем getParameters для добавления 3D-специфичных параметров
     */
    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            lightDirection: {
                type: 'select',
                options: [
                    { value: 'top-left', label: 'Сверху-слева' },
                    { value: 'top-right', label: 'Сверху-справа' },
                    { value: 'bottom-left', label: 'Снизу-слева' },
                    { value: 'bottom-right', label: 'Снизу-справа' }
                ],
                default: this.lightDirection,
                name: 'Направление света'
            },
            material: {
                type: 'select',
                options: [
                    { value: 'matte', label: 'Матовый' },
                    { value: 'glossy', label: 'Глянцевый' },
                    { value: 'metallic', label: 'Металлический' },
                    { value: 'plastic', label: 'Пластик' }
                ],
                default: this.material,
                name: 'Материал'
            },
            specular: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.specular,
                name: 'Блеск',
                type: 'range'
            },
            roughness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.roughness,
                name: 'Шероховатость',
                type: 'range'
            }
        };
    }

    /**
     * Переопределяем serialize для сохранения 3D-специфичных параметров
     */
    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            lightDirection: this.lightDirection,
            material: this.material,
            specular: this.specular,
            roughness: this.roughness
        };
    }

    /**
     * Переопределяем deserialize для восстановления 3D-специфичных параметров
     */
    deserialize(data) {
        super.deserialize(data);
        this.lightDirection = data.lightDirection || 'top-left';
        this.material = data.material || 'matte';
        this.specular = data.specular || 0.5;
        this.roughness = data.roughness || 0.3;
    }
}