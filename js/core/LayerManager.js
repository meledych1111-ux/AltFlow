/**
 * LayerManager - менеджер слоев
 * Управляет созданием, удалением, организацией и рендерингом слоев
 */
class LayerManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.layers = [];
        this.activeLayerIndex = 0;
        this.layerCounter = 0;
        
        // Настройки слоев
        this.maxLayers = 100;
        this.defaultBlendMode = 'normal';
        this.defaultOpacity = 1.0;
        
        this.init();
    }

    init() {
        // Создаем базовый слой
        this.createLayer('Фон');
        this.setupEventListeners();
    }

    /**
     * Создание нового слоя
     */
    createLayer(name = null, options = {}) {
        if (this.layers.length >= this.maxLayers) {
            console.warn('Достигнуто максимальное количество слоев');
            return null;
        }

        const layerId = `layer_${++this.layerCounter}`;
        const layerName = name || `Слой ${this.layerCounter}`;
        
        const layer = {
            id: layerId,
            name: layerName,
            canvas: document.createElement('canvas'),
            context: null,
            visible: true,
            opacity: options.opacity || this.defaultOpacity,
            blendMode: options.blendMode || this.defaultBlendMode,
            locked: false,
            thumbnail: null,
            ...options
        };

        // Инициализируем canvas
        this.initLayerCanvas(layer);
        
        // Добавляем слой в коллекцию
        this.layers.push(layer);
        
        // Устанавливаем активным новый слой
        this.setActiveLayer(this.layers.length - 1);
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('layerCreated', {
            layer: layer,
            index: this.layers.length - 1
        });
        
        return layer;
    }

    /**
     * Инициализация canvas слоя
     */
    initLayerCanvas(layer, width = null, height = null) {
        const canvas = layer.canvas;
        
        // Устанавливаем размеры
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
        }
        
        // Получаем контекст
        layer.context = canvas.getContext('2d', {
            willReadFrequently: true
        });
        
        // Настраиваем контекст
        layer.context.imageSmoothingEnabled = true;
        layer.context.imageSmoothingQuality = 'high';
        
        // Очищаем canvas
        this.clearLayer(layer);
    }

    /**
     * Удаление слоя
     */
    deleteLayer(index) {
        if (index < 0 || index >= this.layers.length) {
            console.error('Неверный индекс слоя');
            return false;
        }

        if (this.layers.length <= 1) {
            console.warn('Нельзя удалить последний слой');
            return false;
        }

        const deletedLayer = this.layers[index];
        
        // Удаляем слой из коллекции
        this.layers.splice(index, 1);
        
        // Корректируем активный слой
        if (index === this.activeLayerIndex) {
            this.activeLayerIndex = Math.max(0, index - 1);
        } else if (index < this.activeLayerIndex) {
            this.activeLayerIndex--;
        }
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('layerDeleted', {
            layer: deletedLayer,
            index: index
        });
        
        return true;
    }

    /**
     * Дублирование слоя
     */
    duplicateLayer(index) {
        if (index < 0 || index >= this.layers.length) {
            console.error('Неверный индекс слоя');
            return null;
        }

        const sourceLayer = this.layers[index];
        const duplicatedLayer = this.createLayer(
            `${sourceLayer.name} (копия)`,
            {
                opacity: sourceLayer.opacity,
                blendMode: sourceLayer.blendMode,
                visible: sourceLayer.visible
            }
        );

        if (duplicatedLayer) {
            // Копируем содержимое слоя
            duplicatedLayer.context.drawImage(sourceLayer.canvas, 0, 0);
            
            // Обновляем UI
            this.updateLayersUI();
            
            // Уведомляем подписчиков
            this.eventManager.emit('layerDuplicated', {
                sourceLayer: sourceLayer,
                duplicatedLayer: duplicatedLayer,
                index: this.layers.indexOf(duplicatedLayer)
            });
        }

        return duplicatedLayer;
    }

    /**
     * Перемещение слоя
     */
    moveLayer(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.layers.length ||
            toIndex < 0 || toIndex >= this.layers.length) {
            console.error('Неверные индексы слоев');
            return false;
        }

        if (fromIndex === toIndex) return true;

        const layer = this.layers.splice(fromIndex, 1)[0];
        this.layers.splice(toIndex, 0, layer);
        
        // Корректируем активный слой
        if (this.activeLayerIndex === fromIndex) {
            this.activeLayerIndex = toIndex;
        } else if (fromIndex < this.activeLayerIndex && toIndex >= this.activeLayerIndex) {
            this.activeLayerIndex--;
        } else if (fromIndex > this.activeLayerIndex && toIndex <= this.activeLayerIndex) {
            this.activeLayerIndex++;
        }
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('layerMoved', {
            layer: layer,
            fromIndex: fromIndex,
            toIndex: toIndex
        });
        
        return true;
    }

    /**
     * Объединение слоев
     */
    mergeLayers(bottomIndex, topIndex) {
        if (bottomIndex < 0 || bottomIndex >= this.layers.length ||
            topIndex < 0 || topIndex >= this.layers.length) {
            console.error('Неверные индексы слоев');
            return false;
        }

        const bottomLayer = this.layers[bottomIndex];
        const topLayer = this.layers[topIndex];
        
        // Сохраняем текущие настройки контекста
        const prevCompositeOperation = bottomLayer.context.globalCompositeOperation;
        const prevAlpha = bottomLayer.context.globalAlpha;
        
        // Применяем blend mode и opacity верхнего слоя
        bottomLayer.context.globalCompositeOperation = topLayer.blendMode;
        bottomLayer.context.globalAlpha = topLayer.opacity;
        
        // Рисуем верхний слой на нижний
        bottomLayer.context.drawImage(topLayer.canvas, 0, 0);
        
        // Восстанавливаем настройки
        bottomLayer.context.globalCompositeOperation = prevCompositeOperation;
        bottomLayer.context.globalAlpha = prevAlpha;
        
        // Удаляем верхний слой
        this.deleteLayer(topIndex);
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('layersMerged', {
            bottomLayer: bottomLayer,
            topLayer: topLayer,
            bottomIndex: bottomIndex,
            topIndex: topIndex
        });
        
        return true;
    }

    /**
     * Установка активного слоя
     */
    setActiveLayer(index) {
        if (index < 0 || index >= this.layers.length) {
            console.error('Неверный индекс слоя');
            return false;
        }

        this.activeLayerIndex = index;
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('activeLayerChanged', {
            layer: this.getActiveLayer(),
            index: index
        });
        
        return true;
    }

    /**
     * Получение активного слоя
     */
    getActiveLayer() {
        if (this.activeLayerIndex < 0 || this.activeLayerIndex >= this.layers.length) {
            return null;
        }
        return this.layers[this.activeLayerIndex];
    }

    /**
     * Получение слоя по индексу
     */
    getLayer(index) {
        if (index < 0 || index >= this.layers.length) {
            return null;
        }
        return this.layers[index];
    }

    /**
     * Получение слоя по ID
     */
    getLayerById(id) {
        return this.layers.find(layer => layer.id === id);
    }

    /**
     * Получение индекса слоя по ID
     */
    getLayerIndex(id) {
        return this.layers.findIndex(layer => layer.id === id);
    }

    /**
     * Получение всех слоев
     */
    getAllLayers() {
        return this.layers;
    }

    /**
     * Получение видимых слоев
     */
    getVisibleLayers() {
        return this.layers.filter(layer => layer.visible);
    }

    /**
     * Очистка слоя
     */
    clearLayer(layer) {
        if (!layer || !layer.context) return;
        
        layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        
        // Уведомляем подписчиков
        this.eventManager.emit('layerCleared', {
            layer: layer
        });
    }

    /**
     * Установка видимости слоя
     */
    setLayerVisibility(index, visible) {
        const layer = this.getLayer(index);
        if (!layer) return false;

        layer.visible = visible;
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('layerVisibilityChanged', {
            layer: layer,
            index: index,
            visible: visible
        });
        
        return true;
    }

    /**
     * Установка непрозрачности слоя
     */
    setLayerOpacity(index, opacity) {
        const layer = this.getLayer(index);
        if (!layer) return false;

        layer.opacity = Math.max(0, Math.min(1, opacity));
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('layerOpacityChanged', {
            layer: layer,
            index: index,
            opacity: opacity
        });
        
        return true;
    }

    /**
     * Установка режима смешивания слоя
     */
    setLayerBlendMode(index, blendMode) {
        const layer = this.getLayer(index);
        if (!layer) return false;

        layer.blendMode = blendMode;
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('layerBlendModeChanged', {
            layer: layer,
            index: index,
            blendMode: blendMode
        });
        
        return true;
    }

    /**
     * Блокировка/разблокировка слоя
     */
    setLayerLocked(index, locked) {
        const layer = this.getLayer(index);
        if (!layer) return false;

        layer.locked = locked;
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('layerLockedChanged', {
            layer: layer,
            index: index,
            locked: locked
        });
        
        return true;
    }

    /**
     * Переименование слоя
     */
    renameLayer(index, newName) {
        const layer = this.getLayer(index);
        if (!layer) return false;

        layer.name = newName;
        
        // Обновляем UI
        this.updateLayersUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('layerRenamed', {
            layer: layer,
            index: index,
            newName: newName
        });
        
        return true;
    }

    /**
     * Изменение размеров всех слоев
     */
    resizeAllLayers(width, height) {
        this.layers.forEach(layer => {
            const imageData = layer.context.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
            
            // Изменяем размер canvas
            layer.canvas.width = width;
            layer.canvas.height = height;
            
            // Восстанавливаем изображение (масштабируем при необходимости)
            layer.context.putImageData(imageData, 0, 0);
        });
        
        // Уведомляем подписчиков
        this.eventManager.emit('layersResized', {
            width: width,
            height: height
        });
    }

    /**
     * Рендеринг всех слоев на целевой canvas
     */
    renderAllLayers(targetCtx, options = {}) {
        const visibleLayers = this.getVisibleLayers();
        
        visibleLayers.forEach(layer => {
            this.renderLayer(targetCtx, layer, options);
        });
    }

    /**
     * Рендеринг одного слоя
     */
    renderLayer(targetCtx, layer, options = {}) {
        if (!layer.visible) return;
        
        // Сохраняем текущие настройки контекста
        const prevGlobalAlpha = targetCtx.globalAlpha;
        const prevGlobalCompositeOperation = targetCtx.globalCompositeOperation;
        
        // Применяем настройки слоя
        targetCtx.globalAlpha = layer.opacity;
        targetCtx.globalCompositeOperation = layer.blendMode;
        
        // Рисуем слой
        targetCtx.drawImage(layer.canvas, 0, 0);
        
        // Восстанавливаем настройки
        targetCtx.globalAlpha = prevGlobalAlpha;
        targetCtx.globalCompositeOperation = prevGlobalCompositeOperation;
    }

    /**
     * Обновление UI слоев
     */
    updateLayersUI() {
        const layersList = document.getElementById('layersList');
        if (!layersList) return;

        layersList.innerHTML = '';
        
        // Создаем элементы слоев в обратном порядке (верхние слои сверху)
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            const layerItem = this.createLayerItemUI(layer, i);
            layersList.appendChild(layerItem);
        }
    }

    /**
     * Создание UI элемента слоя
     */
    createLayerItemUI(layer, index) {
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item ${index === this.activeLayerIndex ? 'active' : ''}`;
        layerItem.dataset.layerIndex = index;
        
        // Создаем миниатюру слоя
        this.updateLayerThumbnail(layer);
        
        layerItem.innerHTML = `
            <div class="layer-visibility ${layer.visible ? 'visible' : ''}" 
                 data-action="toggle-visibility" data-layer="${index}">
                ${layer.visible ? '👁️' : '👁️‍🗨️'}
            </div>
            <div class="layer-thumbnail">
                <img src="${layer.thumbnail || ''}" alt="${layer.name}">
            </div>
            <div class="layer-info">
                <div class="layer-name">${layer.name}</div>
                <div class="layer-opacity">${Math.round(layer.opacity * 100)}%</div>
            </div>
            <div class="layer-controls">
                <button class="layer-lock ${layer.locked ? 'locked' : ''}" 
                        data-action="toggle-lock" data-layer="${index}">
                    ${layer.locked ? '🔒' : '🔓'}
                </button>
            </div>
        `;
        
        // Добавляем обработчики событий
        layerItem.addEventListener('click', (e) => {
            if (!e.target.closest('.layer-controls') && !e.target.closest('.layer-visibility')) {
                this.setActiveLayer(index);
            }
        });
        
        // Обработчики для кнопок управления
        const visibilityBtn = layerItem.querySelector('.layer-visibility');
        visibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setLayerVisibility(index, !layer.visible);
        });
        
        const lockBtn = layerItem.querySelector('.layer-lock');
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setLayerLocked(index, !layer.locked);
        });
        
        return layerItem;
    }

    /**
     * Обновление миниатюры слоя
     */
    updateLayerThumbnail(layer) {
        try {
            const thumbnailCanvas = document.createElement('canvas');
            thumbnailCanvas.width = 32;
            thumbnailCanvas.height = 32;
            
            const thumbnailCtx = thumbnailCanvas.getContext('2d');
            thumbnailCtx.drawImage(layer.canvas, 0, 0, 32, 32);
            
            layer.thumbnail = thumbnailCanvas.toDataURL('image/png');
        } catch (error) {
            console.warn('Не удалось создать миниатюру слоя:', error);
            layer.thumbnail = null;
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработка кнопок управления слоями
        document.addEventListener('click', (event) => {
            const addBtn = event.target.closest('[data-action="add-layer"]');
            const deleteBtn = event.target.closest('[data-action="delete-layer"]');
            const duplicateBtn = event.target.closest('[data-action="duplicate-layer"]');
            
            if (addBtn) {
                this.createLayer();
            } else if (deleteBtn) {
                this.deleteLayer(this.activeLayerIndex);
            } else if (duplicateBtn) {
                this.duplicateLayer(this.activeLayerIndex);
            }
        });
    }

    /**
     * Сохранение состояния слоев
     */
    serialize() {
        return {
            activeLayerIndex: this.activeLayerIndex,
            layers: this.layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                visible: layer.visible,
                opacity: layer.opacity,
                blendMode: layer.blendMode,
                locked: layer.locked,
                imageData: layer.context.getImageData(0, 0, layer.canvas.width, layer.canvas.height)
            }))
        };
    }

    /**
     * Восстановление состояния слоев
     */
    deserialize(data) {
        // Очищаем текущие слои
        this.layers = [];
        
        // Восстанавливаем слои
        data.layers.forEach(layerData => {
            const layer = this.createLayer(layerData.name, {
                visible: layerData.visible,
                opacity: layerData.opacity,
                blendMode: layerData.blendMode
            });
            
            if (layer && layerData.imageData) {
                layer.context.putImageData(layerData.imageData, 0, 0);
            }
        });
        
        // Восстанавливаем активный слой
        if (data.activeLayerIndex !== undefined) {
            this.setActiveLayer(Math.min(data.activeLayerIndex, this.layers.length - 1));
        }
        
        // Обновляем UI
        this.updateLayersUI();
    }

    /**
     * Получение статистики
     */
    getStats() {
        return {
            totalLayers: this.layers.length,
            activeLayerIndex: this.activeLayerIndex,
            visibleLayers: this.getVisibleLayers().length,
            lockedLayers: this.layers.filter(layer => layer.locked).length
        };
    }
}
