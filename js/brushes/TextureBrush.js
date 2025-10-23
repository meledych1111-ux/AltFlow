/**
 * TextureBrush - текстурированная кисть с паттернами
 * Создает различные текстурные эффекты: древесина, камень, ткань и другие
 */
class TextureBrush extends BrushBase {
    constructor() {
        super();
        this.name = 'Текстурированная';
        this.description = 'Кисть с различными текстурами: древесина, камень, ткань, кожа и другие';
        this.category = 'textures';
        this.version = '1.0.0';
        this.author = 'ArtFlow Team';
        this.icon = '🌲';
        
        // Текстурные параметры
        this.textureType = 'wood';
        this.textureScale = 1.0;
        this.textureIntensity = 0.7;
        this.textureContrast = 0.5;
        this.textureRotation = 0;
        this.randomSeed = Math.random() * 1000;
        
        // Параметры для разных текстур
        this.woodGrain = 0.6;
        this.stoneRoughness = 0.4;
        this.fabricWeave = 0.5;
        this.leatherAging = 0.3;
    }

    draw(ctx, x, y, pressure = 1, options = {}) {
        const radius = (options.size || this.size) * pressure;
        const color = options.color || this.primaryColor;
        
        this.createTexturedSurface(ctx, x, y, radius, color);
    }

    createTexturedSurface(ctx, x, y, radius, color) {
        ctx.save();
        
        // Рисуем базовую форму
        this.drawBaseShape(ctx, x, y, radius, color);
        
        // Применяем выбранную текстуру
        switch (this.textureType) {
            case 'wood':
                this.applyWoodTexture(ctx, x, y, radius, color);
                break;
            case 'stone':
                this.applyStoneTexture(ctx, x, y, radius, color);
                break;
            case 'fabric':
                this.applyFabricTexture(ctx, x, y, radius, color);
                break;
            case 'leather':
                this.applyLeatherTexture(ctx, x, y, radius, color);
                break;
            case 'paper':
                this.applyPaperTexture(ctx, x, y, radius, color);
                break;
            case 'metal_rough':
                this.applyRoughMetalTexture(ctx, x, y, radius, color);
                break;
        }
        
        // Добавляем дополнительные детали
        this.addTextureDetails(ctx, x, y, radius, color);
        
        ctx.restore();
    }

    drawBaseShape(ctx, x, y, radius, color) {
        // Базовый градиент для формы
        const gradient = ctx.createRadialGradient(
            x - radius * 0.1, y - radius * 0.1, 0,
            x, y, radius
        );
        
        gradient.addColorStop(0, this.lightenColor(color, 20));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, this.darkenColor(color, 30));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    applyWoodTexture(ctx, x, y, radius, color) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        
        // Древесные годовые кольца
        const ringCount = Math.floor(radius / 3 * this.textureScale);
        
        for (let i = 0; i < ringCount; i++) {
            const ringRadius = (i / ringCount) * radius;
            const ringThickness = 1 + Math.random() * 2;
            
            // Цвет кольца
            const ringColor = this.blendColors(
                this.darkenColor(color, 20 + Math.random() * 20),
                this.lightenColor(color, 10 + Math.random() * 15),
                Math.random()
            );
            
            ctx.strokeStyle = ringColor;
            ctx.lineWidth = ringThickness * this.textureIntensity;
            ctx.globalAlpha = this.textureIntensity * 0.7;
            
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Древесные прожилки
        const grainCount = Math.floor(radius * 2 * this.woodGrain * this.textureScale);
        
        for (let i = 0; i < grainCount; i++) {
            const angle = (i / grainCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const startDist = Math.random() * radius * 0.3;
            const endDist = radius * (0.7 + Math.random() * 0.3);
            
            const startX = x + Math.cos(angle) * startDist;
            const startY = y + Math.sin(angle) * startDist;
            const endX = x + Math.cos(angle) * endDist;
            const endY = y + Math.sin(angle) * endDist;
            
            const grainColor = this.darkenColor(color, 15 + Math.random() * 25);
            ctx.strokeStyle = grainColor;
            ctx.lineWidth = (0.5 + Math.random()) * this.textureIntensity;
            ctx.globalAlpha = this.textureIntensity * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    applyStoneTexture(ctx, x, y, radius, color) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        
        // Каменная текстура с помощью шума
        const stonePoints = Math.floor(radius * radius * 0.1 * this.textureScale);
        
        for (let i = 0; i < stonePoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const stoneX = x + Math.cos(angle) * distance;
            const stoneY = y + Math.sin(angle) * distance;
            
            // Используем шум для создания текстуры
            const noiseValue = this.noise(stoneX * 0.1, stoneY * 0.1, this.randomSeed);
            const brightness = noiseValue * 40 - 20; // ±20 яркости
            
            const stoneColor = brightness > 0 
                ? this.lightenColor(color, brightness)
                : this.darkenColor(color, -brightness);
            
            const size = (1 + Math.random() * 3) * this.textureScale;
            const opacity = (0.3 + Math.random() * 0.4) * this.textureIntensity;
            
            ctx.fillStyle = stoneColor;
            ctx.globalAlpha = opacity;
            ctx.fillRect(stoneX - size/2, stoneY - size/2, size, size);
        }
        
        // Добавляем трещины
        const crackCount = Math.floor(this.stoneRoughness * 5 * this.textureScale);
        
        for (let i = 0; i < crackCount; i++) {
            const startAngle = Math.random() * Math.PI * 2;
            const endAngle = startAngle + (Math.random() - 0.5) * Math.PI;
            const startRadius = Math.random() * radius * 0.8;
            const endRadius = startRadius + Math.random() * radius * 0.4;
            
            const startX = x + Math.cos(startAngle) * startRadius;
            const startY = y + Math.sin(startAngle) * startRadius;
            const endX = x + Math.cos(endAngle) * endRadius;
            const endY = y + Math.sin(endAngle) * endRadius;
            
            ctx.strokeStyle = this.darkenColor(color, 40);
            ctx.lineWidth = (0.5 + Math.random() * 1.5) * this.textureIntensity;
            ctx.globalAlpha = this.textureIntensity * 0.6;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    applyFabricTexture(ctx, x, y, radius, color) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        
        // Тканый узор
        const weaveSize = 3 * this.textureScale;
        const weaveCount = Math.ceil(radius * 2 / weaveSize);
        
        for (let i = -weaveCount; i <= weaveCount; i++) {
            for (let j = -weaveCount; j <= weaveCount; j++) {
                const weaveX = x + i * weaveSize;
                const weaveY = y + j * weaveSize;
                
                const distance = Math.sqrt((weaveX - x) ** 2 + (weaveY - y) ** 2);
                if (distance > radius) continue;
                
                // Вертикальные нити
                const vThreadColor = (i + j) % 2 === 0
                    ? this.darkenColor(color, 15)
                    : this.lightenColor(color, 10);
                
                ctx.fillStyle = vThreadColor;
                ctx.globalAlpha = this.textureIntensity * 0.7;
                ctx.fillRect(weaveX - 0.5, weaveY - weaveSize/2, 1, weaveSize);
                
                // Горизонтальные нити
                const hThreadColor = (i + j) % 2 === 0
                    ? this.lightenColor(color, 10)
                    : this.darkenColor(color, 15);
                
                ctx.fillStyle = hThreadColor;
                ctx.fillRect(weaveX - weaveSize/2, weaveY - 0.5, weaveSize, 1);
            }
        }
        
        // Добавляем неровности ткани
        const irregularityCount = Math.floor(radius * this.fabricWeave * this.textureScale);
        
        for (let i = 0; i < irregularityCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const irregularityX = x + Math.cos(angle) * distance;
            const irregularityY = y + Math.sin(angle) * distance;
            
            const irregularityColor = Math.random() > 0.5
                ? this.lightenColor(color, 5 + Math.random() * 10)
                : this.darkenColor(color, 5 + Math.random() * 10);
            
            const size = (0.5 + Math.random() * 2) * this.textureScale;
            const opacity = (0.2 + Math.random() * 0.3) * this.textureIntensity;
            
            ctx.fillStyle = irregularityColor;
            ctx.globalAlpha = opacity;
            ctx.fillRect(irregularityX - size/2, irregularityY - size/2, size, size);
        }
        
        ctx.restore();
    }

    applyLeatherTexture(ctx, x, y, radius, color) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        
        // Основная кожаная текстура
        const leatherPoints = Math.floor(radius * radius * 0.05 * this.textureScale);
        
        for (let i = 0; i < leatherPoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const leatherX = x + Math.cos(angle) * distance;
            const leatherY = y + Math.sin(angle) * distance;
            
            // Создаем пятна кожи
            const spotSize = (2 + Math.random() * 4) * this.textureScale;
            const brightness = (Math.random() - 0.5) * 30;
            
            const leatherColor = brightness > 0
                ? this.lightenColor(color, brightness)
                : this.darkenColor(color, -brightness);
            
            const opacity = (0.3 + Math.random() * 0.4) * this.textureIntensity;
            
            ctx.fillStyle = leatherColor;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(leatherX, leatherY, spotSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Добавляем складки кожи
        const foldCount = Math.floor(this.leatherAging * 8 * this.textureScale);
        
        for (let i = 0; i < foldCount; i++) {
            const startAngle = Math.random() * Math.PI * 2;
            const foldLength = radius * (0.3 + Math.random() * 0.4);
            const curvature = (Math.random() - 0.5) * 0.5;
            
            ctx.strokeStyle = this.darkenColor(color, 20 + Math.random() * 20);
            ctx.lineWidth = (0.5 + Math.random() * 1.5) * this.textureIntensity;
            ctx.globalAlpha = this.textureIntensity * 0.5;
            
            ctx.beginPath();
            for (let j = 0; j < 20; j++) {
                const t = j / 19;
                const currentAngle = startAngle + curvature * t;
                const currentRadius = radius * 0.2 + foldLength * t;
                const pointX = x + Math.cos(currentAngle) * currentRadius;
                const pointY = y + Math.sin(currentAngle) * currentRadius;
                
                if (j === 0) {
                    ctx.moveTo(pointX, pointY);
                } else {
                    ctx.lineTo(pointX, pointY);
                }
            }
            ctx.stroke();
        }
        
        ctx.restore();
    }

    applyPaperTexture(ctx, x, y, radius, color) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        
        // Бумажная текстура с волокнами
        const fiberCount = Math.floor(radius * 3 * this.textureScale);
        
        for (let i = 0; i < fiberCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const fiberX = x + Math.cos(angle) * distance;
            const fiberY = y + Math.sin(angle) * distance;
            
            // Создаем волокна бумаги
            const fiberLength = 2 + Math.random() * 8;
            const fiberAngle = angle + (Math.random() - 0.5) * 0.3;
            
            const brightness = (Math.random() - 0.5) * 20;
            const fiberColor = brightness > 0
                ? this.lightenColor(color, brightness)
                : this.darkenColor(color, -brightness);
            
            const endX = fiberX + Math.cos(fiberAngle) * fiberLength;
            const endY = fiberY + Math.sin(fiberAngle) * fiberLength;
            
            ctx.strokeStyle = fiberColor;
            ctx.lineWidth = (0.2 + Math.random() * 0.8) * this.textureIntensity;
            ctx.globalAlpha = (0.1 + Math.random() * 0.2) * this.textureIntensity;
            
            ctx.beginPath();
            ctx.moveTo(fiberX, fiberY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    applyRoughMetalTexture(ctx, x, y, radius, color) {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        
        // Шероховатая металлическая поверхность
        const metalPoints = Math.floor(radius * radius * 0.02 * this.textureScale);
        
        for (let i = 0; i < metalPoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const metalX = x + Math.cos(angle) * distance;
            const metalY = y + Math.sin(angle) * distance;
            
            // Создаем металлические блики и тени
            const isHighlight = Math.random() > 0.5;
            const brightness = isHighlight 
                ? Math.random() * 40
                : -Math.random() * 30;
            
            const metalColor = isHighlight
                ? this.lightenColor(color, brightness)
                : this.darkenColor(color, -brightness);
            
            const size = (0.5 + Math.random() * 2) * this.textureScale;
            const opacity = (0.2 + Math.random() * 0.4) * this.textureIntensity;
            
            ctx.fillStyle = metalColor;
            ctx.globalAlpha = opacity;
            ctx.fillRect(metalX - size/2, metalY - size/2, size, size);
        }
        
        ctx.restore();
    }

    addTextureDetails(ctx, x, y, radius, color) {
        // Общие детали для всех текстур
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light';
        
        // Добавляем общий шум
        const noisePoints = Math.floor(radius * 0.5 * this.textureScale);
        
        for (let i = 0; i < noisePoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const noiseX = x + Math.cos(angle) * distance;
            const noiseY = y + Math.sin(angle) * distance;
            
            const noiseValue = this.noise(noiseX * 0.2, noiseY * 0.2, this.randomSeed);
            if (noiseValue > 0.6) {
                const brightness = (noiseValue - 0.6) * 100;
                const noiseColor = brightness > 0
                    ? this.lightenColor(color, brightness)
                    : this.darkenColor(color, -brightness);
                
                ctx.fillStyle = noiseColor;
                ctx.globalAlpha = this.textureIntensity * 0.3;
                ctx.fillRect(noiseX, noiseY, 1, 1);
            }
        }
        
        ctx.restore();
    }

    getParameters() {
        const baseParams = super.getParameters();
        
        return {
            ...baseParams,
            textureType: {
                type: 'select',
                options: [
                    { value: 'wood', label: 'Древесина' },
                    { value: 'stone', label: 'Камень' },
                    { value: 'fabric', label: 'Ткань' },
                    { value: 'leather', label: 'Кожа' },
                    { value: 'paper', label: 'Бумага' },
                    { value: 'metal_rough', label: 'Шероховатый металл' }
                ],
                default: this.textureType,
                name: 'Тип текстуры'
            },
            textureScale: {
                min: 0.5,
                max: 3,
                step: 0.1,
                default: this.textureScale,
                name: 'Масштаб текстуры',
                type: 'range'
            },
            textureIntensity: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.textureIntensity,
                name: 'Интенсивность текстуры',
                type: 'range'
            },
            textureContrast: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.textureContrast,
                name: 'Контраст текстуры',
                type: 'range'
            },
            textureRotation: {
                min: 0,
                max: 360,
                step: 1,
                default: this.textureRotation,
                name: 'Поворот текстуры',
                type: 'range'
            },
            woodGrain: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.woodGrain,
                name: 'Выраженность древесных прожилок',
                type: 'range'
            },
            stoneRoughness: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.stoneRoughness,
                name: 'Шероховатость камня',
                type: 'range'
            },
            fabricWeave: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.fabricWeave,
                name: 'Плотность тканевого переплетения',
                type: 'range'
            },
            leatherAging: {
                min: 0,
                max: 1,
                step: 0.01,
                default: this.leatherAging,
                name: 'Состаренность кожи',
                type: 'range'
            }
        };
    }

    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            textureType: this.textureType,
            textureScale: this.textureScale,
            textureIntensity: this.textureIntensity,
            textureContrast: this.textureContrast,
            textureRotation: this.textureRotation,
            randomSeed: this.randomSeed,
            woodGrain: this.woodGrain,
            stoneRoughness: this.stoneRoughness,
            fabricWeave: this.fabricWeave,
            leatherAging: this.leatherAging
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.textureType = data.textureType || 'wood';
        this.textureScale = data.textureScale || 1.0;
        this.textureIntensity = data.textureIntensity || 0.7;
        this.textureContrast = data.textureContrast || 0.5;
        this.textureRotation = data.textureRotation || 0;
        this.randomSeed = data.randomSeed || Math.random() * 1000;
        this.woodGrain = data.woodGrain || 0.6;
        this.stoneRoughness = data.stoneRoughness || 0.4;
        this.fabricWeave = data.fabricWeave || 0.5;
        this.leatherAging = data.leatherAging || 0.3;
    }
}
