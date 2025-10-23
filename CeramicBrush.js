/**
 * CeramicBrush - кисть для создания эффекта керамики
 * Имитирует керамическую поверхность с матовым финишем и мягкими тенями
 */
class CeramicBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Керамика';
        this.description = 'Текстура керамической поверхности с мягкими градиентами и матовым финишем';
        this.category = 'materials';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '🏺';
        
        // Керамические параметры
        this.ceramicType = 'porcelain';
        this.surfaceSmoothness = 0.8;
        this.glazeLevel = 0.3;
        this.warmth = 0.6;
        this.textureScale = 1.0;
        this.edgeSoftness = 0.9;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createCeramicSurface(ctx, x, y, radius, color);
    }

    createCeramicSurface(ctx, x, y, radius, color) {
        ctx.save();
        
        // Базовая керамическая текстура
        this.drawBaseCeramic(ctx, x, y, radius, color);
        
        // Матовый финиш
        this.addMatteFinish(ctx, x, y, radius, color);
        
        // Тонкая глазурь
        if (this.glazeLevel > 0) {
            this.addCeramicGlaze(ctx, x, y, radius, color);
        }
        
        // Микротекстура
        this.addMicroTexture(ctx, x, y, radius, color);
        
        ctx.restore();
    }

    drawBaseCeramic(ctx, x, y, radius, color) {
        let baseColor, midColor, shadowColor;
        
        switch (this.ceramicType) {
            case 'porcelain':
                baseColor = this.blendColors(color, '#f8f8ff', 0.7);
                midColor = this.blendColors(color, '#e6e6fa', 0.5);
                shadowColor = this.darkenColor(color, 25);
                break;
            case 'earthenware':
                baseColor = this.blendColors(color, '#deb887', 0.6);
                midColor = this.blendColors(color, '#d2b48c', 0.4);
                shadowColor = this.darkenColor(color, 35);
                break;
            case 'stoneware':
                baseColor = this.blendColors(color, '#a0a0a0', 0.6);
                midColor = this.blendColors(color, '#909090', 0.4);
                shadowColor = this.darkenColor(color, 40);
                break;
            default:
                baseColor = color;
                midColor = this.darkenColor(color, 15);
                shadowColor = this.darkenColor(color, 30);
        }
        
        // Мягкий градиент для керамики
        const gradient = ctx.createRadialGradient(
            x - radius * 0.1, y - radius * 0.1, 0,
            x, y, radius
        );
        
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.6, midColor);
        gradient.addColorStop(1, shadowColor);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    addMatteFinish(ctx, x, y, radius, color) {
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light';
        
        // Матовый финиш с мягким шумом
        const matteGradient = ctx.createRadialGradient(
            x, y, radius * 0.5,
            x, y, radius
        );
        
        const matteColor = this.lightenColor(color, 10 * this.surfaceSmoothness);
        matteGradient.addColorStop(0, `rgba(255, 255, 255, ${0.2 * (1 - this.surfaceSmoothness)})`);
        matteGradient.addColorStop(0.8, `rgba(${parseInt(matteColor.slice(1, 3), 16)}, ${parseInt(matteColor.slice(3, 5), 16)}, ${parseInt(matteColor.slice(5, 7), 16)}, ${0.3 * (1 - this.surfaceSmoothness)})`);
        matteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = matteGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    addCeramicGlaze(ctx, x, y, radius, color) {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        
        // Тонкий слой глазури
        const glazeGradient = ctx.createRadialGradient(
            x - radius * 0.2, y - radius * 0.2, 0,
            x, y, radius
        );
        
        const glazeColor = this.lightenColor(color, 25 * this.glazeLevel);
        glazeGradient.addColorStop(0, `rgba(255, 255, 255, ${this.glazeLevel * 0.4})`);
        glazeGradient.addColorStop(0.4, `rgba(${parseInt(glazeColor.slice(1, 3), 16)}, ${parseInt(glazeColor.slice(3, 5), 16)}, ${parseInt(glazeColor.slice(5, 7), 16)}, ${this.glazeLevel * 0.2})`);
        glazeGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = glazeGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    addMicroTexture(ctx, x, y, radius, color) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        
        // Микротекстура керамики
        const textureIntensity = (1 - this.surfaceSmoothness) * 0.3;
        const textureScale = this.textureScale;
        
        for (let i = 0; i < radius * 2 * textureScale; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const textureX = x + Math.cos(angle) * distance;
            const textureY = y + Math.sin(angle) * distance;
            
            const noiseValue = this.noise(textureX * 0.1, textureY * 0.1);
            const opacity = noiseValue * textureIntensity * (0.5 + Math.random() * 0.5);
            
            if (opacity > 0.05) {
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                ctx.fillRect(textureX, textureY, 1, 1);
            }
        }
        
        ctx.restore();
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            ceramicType: {
                type: 'select',
                options: [
                    { value: 'porcelain', label: 'Фарфор' },
                    { value: 'earthenware', label: 'Глина' },
                    { value: 'stoneware', label: 'Каменная керамика' }
                ],
                default: this.ceramicType,
                name: 'Тип керамики'
            },
            surfaceSmoothness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.surfaceSmoothness,
                name: 'Гладкость поверхности',
                type: 'range'
            },
            glazeLevel: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.glazeLevel,
                name: 'Уровень глазури',
                type: 'range'
            },
            warmth: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.warmth,
                name: 'Теплота оттенка',
                type: 'range'
            },
            textureScale: {
                min: 0.5,
                max: 3,
                step: 0.1,
                default: this.textureScale,
                name: 'Масштаб текстуры',
                type: 'range'
            },
            edgeSoftness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.edgeSoftness,
                name: 'Мягкость краев',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            ceramicType: this.ceramicType,
            surfaceSmoothness: this.surfaceSmoothness,
            glazeLevel: this.glazeLevel,
            warmth: this.warmth,
            textureScale: this.textureScale,
            edgeSoftness: this.edgeSoftness
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.ceramicType = data.ceramicType || 'porcelain';
        this.surfaceSmoothness = data.surfaceSmoothness || 0.8;
        this.glazeLevel = data.glazeLevel || 0.3;
        this.warmth = data.warmth || 0.6;
        this.textureScale = data.textureScale || 1.0;
        this.edgeSoftness = data.edgeSoftness || 0.9;
    }
}