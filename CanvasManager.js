/**
 * CanvasManager - менеджер холста
 * Управляет основным холстом, масштабированием, навигацией и рендерингом
 */
class CanvasManager {
    constructor(eventManager, layerManager) {
        this.eventManager = eventManager;
        this.layerManager = layerManager;
        
        // Canvas элементы
        this.mainCanvas = null;
        this.mainCtx = null;
        this.overlayCanvas = null;
        this.overlayCtx = null;
        
        // Размеры и позиция
        this.canvasWidth = 1920;
        this.canvasHeight = 1080;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
        
        // Масштаб и позиция
        this.zoom = 1.0;
        this.minZoom = 0.1;
        this.maxZoom = 10.0;
        this.panX = 0;
        this.panY = 0;
        
        // Состояние
        this.isPanning = false;
        this.lastPanX = 0;
        this.lastPanY = 0;
        
        // Настройки
        this.showGrid = false;
        this.showGuides = false;
        this.snapToGrid = false;
        this.gridSize = 20;
        
        // Руководящие линии
        this.guides = [];
        
        this.init();
    }

    init() {
        this.setupCanvases();
        this.setupEventListeners();
        this.updateViewport();
        this.render();
    }

    /**
     * Настройка canvas элементов
     */
    setupCanvases() {
        // Основной canvas
        this.mainCanvas = document.getElementById('mainCanvas');
        if (!this.mainCanvas) {
            console.error('Основной canvas не найден');
            return;
        }
        
        this.mainCtx = this.mainCanvas.getContext('2d', {
            willReadFrequently: true
        });
        
        // Overlay canvas для сетки и направляющих
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.style.position = 'absolute';
        this.overlayCanvas.style.top = '0';
        this.overlayCanvas.style.left = '0';
        this.overlayCanvas.style.pointerEvents = 'none';
        this.overlayCanvas.style.zIndex = '10';
        
        this.overlayCtx = this.overlayCanvas.getContext('2d');
        
        // Добавляем overlay canvas к контейнеру
        const container = document.getElementById('canvasContainer');
        if (container) {
            container.appendChild(this.overlayCanvas);
        }
        
        // Устанавливаем размеры
        this.resizeCanvas(this.canvasWidth, this.canvasHeight);
    }

    /**
     * Изменение размеров canvas
     */
    resizeCanvas(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        
        // Обновляем размеры основного canvas
        this.mainCanvas.width = width;
        this.mainCanvas.height = height;
        
        // Обновляем размеры overlay canvas
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
        
        // Изменяем размеры всех слоев
        this.layerManager.resizeAllLayers(width, height);
        
        // Обновляем отображение
        this.render();
        
        // Уведомляем подписчиков
        this.eventManager.emit('canvasResized', {
            width: width,
            height: height
        });
    }

    /**
     * Обновление размеров viewport
     */
    updateViewport() {
        const container = document.getElementById('canvasContainer');
        if (container) {
            this.viewportWidth = container.clientWidth;
            this.viewportHeight = container.clientHeight;
            
            // Обновляем размеры overlay canvas
            this.overlayCanvas.width = this.viewportWidth;
            this.overlayCanvas.height = this.viewportHeight;
        }
    }

    /**
     * Рендеринг холста
     */
    render() {
        // Очищаем основной canvas
        this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        
        // Сохраняем текущее состояние
        this.mainCtx.save();
        
        // Применяем преобразования
        this.mainCtx.translate(this.panX, this.panY);
        this.mainCtx.scale(this.zoom, this.zoom);
        
        // Рендерим все слои
        this.layerManager.renderAllLayers(this.mainCtx);
        
        // Восстанавливаем состояние
        this.mainCtx.restore();
        
        // Рендерим overlay (сетка, направляющие)
        this.renderOverlay();
    }

    /**
     * Рендеринг overlay (сетка, направляющие)
     */
    renderOverlay() {
        // Очищаем overlay canvas
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        
        // Сохраняем текущее состояние
        this.overlayCtx.save();
        
        // Применяем преобразования
        this.overlayCtx.translate(this.panX, this.panY);
        this.overlayCtx.scale(this.zoom, this.zoom);
        
        // Рисуем сетку
        if (this.showGrid) {
            this.drawGrid();
        }
        
        // Рисуем направляющие
        if (this.showGuides) {
            this.drawGuides();
        }
        
        // Восстанавливаем состояние
        this.overlayCtx.restore();
    }

    /**
     * Рисование сетки
     */
    drawGrid() {
        const gridSize = this.gridSize * this.zoom;
        
        if (gridSize < 2) return; // Слишком маленькая сетка
        
        this.overlayCtx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        this.overlayCtx.lineWidth = 1 / this.zoom;
        
        // Вертикальные линии
        for (let x = 0; x < this.canvasWidth; x += this.gridSize) {
            this.overlayCtx.beginPath();
            this.overlayCtx.moveTo(x, 0);
            this.overlayCtx.lineTo(x, this.canvasHeight);
            this.overlayCtx.stroke();
        }
        
        // Горизонтальные линии
        for (let y = 0; y < this.canvasHeight; y += this.gridSize) {
            this.overlayCtx.beginPath();
            this.overlayCtx.moveTo(0, y);
            this.overlayCtx.lineTo(this.canvasWidth, y);
            this.overlayCtx.stroke();
        }
    }

    /**
     * Рисование направляющих
     */
    drawGuides() {
        this.overlayCtx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        this.overlayCtx.lineWidth = 2 / this.zoom;
        
        this.guides.forEach(guide => {
            this.overlayCtx.beginPath();
            
            if (guide.type === 'horizontal') {
                this.overlayCtx.moveTo(0, guide.position);
                this.overlayCtx.lineTo(this.canvasWidth, guide.position);
            } else if (guide.type === 'vertical') {
                this.overlayCtx.moveTo(guide.position, 0);
                this.overlayCtx.lineTo(guide.position, this.canvasHeight);
            }
            
            this.overlayCtx.stroke();
        });
    }

    /**
     * Преобразование экранных координат в координаты canvas
     */
    screenToCanvas(screenX, screenY) {
        const rect = this.mainCanvas.getBoundingClientRect();
        const canvasX = (screenX - rect.left - this.panX) / this.zoom;
        const canvasY = (screenY - rect.top - this.panY) / this.zoom;
        
        return {
            x: canvasX,
            y: canvasY
        };
    }

    /**
     * Преобразование координат canvas в экранные
     */
    canvasToScreen(canvasX, canvasY) {
        const rect = this.mainCanvas.getBoundingClientRect();
        const screenX = canvasX * this.zoom + this.panX + rect.left;
        const screenY = canvasY * this.zoom + this.panY + rect.top;
        
        return {
            x: screenX,
            y: screenY
        };
    }

    /**
     * Масштабирование
     */
    zoomTo(factor, centerX = null, centerY = null) {
        const oldZoom = this.zoom;
        
        // Ограничиваем масштаб
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, factor));
        
        // Если масштаб не изменился, выходим
        if (this.zoom === oldZoom) return;
        
        // Если задан центр масштабирования, корректируем позицию
        if (centerX !== null && centerY !== null) {
            const canvasCoords = this.screenToCanvas(centerX, centerY);
            
            this.panX = centerX - canvasCoords.x * this.zoom;
            this.panY = centerY - canvasCoords.y * this.zoom;
        }
        
        // Обновляем UI
        this.updateZoomUI();
        
        // Перерисовываем
        this.render();
        
        // Уведомляем подписчиков
        this.eventManager.emit('zoomChanged', {
            zoom: this.zoom,
            oldZoom: oldZoom
        });
    }

    /**
     * Масштабирование относительно текущего масштаба
     */
    zoomBy(factor, centerX = null, centerY = null) {
        this.zoomTo(this.zoom * factor, centerX, centerY);
    }

    /**
     * Панорамирование
     */
    pan(deltaX, deltaY) {
        this.panX += deltaX;
        this.panY += deltaY;
        
        // Ограничиваем панорамирование (опционально)
        // this.constrainPan();
        
        // Перерисовываем
        this.render();
        
        // Уведомляем подписчиков
        this.eventManager.emit('panChanged', {
            panX: this.panX,
            panY: this.panY,
            deltaX: deltaX,
            deltaY: deltaY
        });
    }

    /**
     * Ограничение панорамирования
     */
    constrainPan() {
        const minPanX = Math.min(0, this.viewportWidth - this.canvasWidth * this.zoom);
        const maxPanX = Math.max(0, this.viewportWidth - this.canvasWidth * this.zoom);
        const minPanY = Math.min(0, this.viewportHeight - this.canvasHeight * this.zoom);
        const maxPanY = Math.max(0, this.viewportHeight - this.canvasHeight * this.zoom);
        
        this.panX = Math.max(minPanX, Math.min(maxPanX, this.panX));
        this.panY = Math.max(minPanY, Math.min(maxPanY, this.panY));
    }

    /**
     * Центрирование холста
     */
    centerCanvas() {
        this.panX = (this.viewportWidth - this.canvasWidth * this.zoom) / 2;
        this.panY = (this.viewportHeight - this.canvasHeight * this.zoom) / 2;
        
        this.render();
        
        // Уведомляем подписчиков
        this.eventManager.emit('canvasCentered', {
            panX: this.panX,
            panY: this.panY
        });
    }

    /**
     * Подгонка холста под viewport
     */
    fitCanvasToViewport() {
        const scaleX = this.viewportWidth / this.canvasWidth;
        const scaleY = this.viewportHeight / this.canvasHeight;
        
        this.zoom = Math.min(scaleX, scaleY) * 0.9; // 90% от размера viewport
        this.centerCanvas();
    }

    /**
     * Установка масштаба в 100%
     */
    resetZoom() {
        this.zoom = 1.0;
        this.centerCanvas();
    }

    /**
     * Добавление направляющей
     */
    addGuide(type, position) {
        const guide = {
            id: Date.now(),
            type: type,
            position: position
        };
        
        this.guides.push(guide);
        this.render();
        
        // Уведомляем подписчиков
        this.eventManager.emit('guideAdded', guide);
    }

    /**
     * Удаление направляющей
     */
    removeGuide(id) {
        const index = this.guides.findIndex(guide => guide.id === id);
        if (index !== -1) {
            const guide = this.guides[index];
            this.guides.splice(index, 1);
            this.render();
            
            // Уведомляем подписчиков
            this.eventManager.emit('guideRemoved', guide);
        }
    }

    /**
     * Очистка всех направляющих
     */
    clearGuides() {
        this.guides = [];
        this.render();
        
        // Уведомляем подписчиков
        this.eventManager.emit('guidesCleared');
    }

    /**
     * Установка видимости сетки
     */
    setGridVisible(visible) {
        this.showGrid = visible;
        this.render();
        
        // Уведомляем подписчиков
        this.eventManager.emit('gridVisibilityChanged', visible);
    }

    /**
     * Установка видимости направляющих
     */
    setGuidesVisible(visible) {
        this.showGuides = visible;
        this.render();
        
        // Уведомляем подписчиков
        this.eventManager.emit('guidesVisibilityChanged', visible);
    }

    /**
     * Установка привязки к сетке
     */
    setSnapToGrid(snap) {
        this.snapToGrid = snap;
        
        // Уведомляем подписчиков
        this.eventManager.emit('snapToGridChanged', snap);
    }

    /**
     * Привязка координат к сетке
     */
    snapCoordinates(x, y) {
        if (!this.snapToGrid) {
            return { x, y };
        }
        
        const snappedX = Math.round(x / this.gridSize) * this.gridSize;
        const snappedY = Math.round(y / this.gridSize) * this.gridSize;
        
        return { x: snappedX, y: snappedY };
    }

    /**
     * Обновление UI масштаба
     */
    updateZoomUI() {
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработка колеса мыши для масштабирования
        this.eventManager.on('wheel', (data) => {
            if (data.ctrlKey) {
                // Масштабирование с зажатым Ctrl
                const zoomFactor = data.deltaY > 0 ? 0.9 : 1.1;
                this.zoomBy(zoomFactor, data.clientX, data.clientY);
            } else {
                // Панорамирование
                this.pan(-data.deltaX, -data.deltaY);
            }
        });

        // Обработка панорамирования
        this.eventManager.on('mousedown', (data) => {
            if (data.button === 1 || (data.button === 0 && data.spaceKey)) {
                this.isPanning = true;
                this.lastPanX = data.clientX;
                this.lastPanY = data.clientY;
                data.originalEvent.preventDefault();
            }
        });

        this.eventManager.on('mousemove', (data) => {
            if (this.isPanning) {
                const deltaX = data.clientX - this.lastPanX;
                const deltaY = data.clientY - this.lastPanY;
                this.pan(deltaX, deltaY);
                this.lastPanX = data.clientX;
                this.lastPanY = data.clientY;
            }
        });

        this.eventManager.on('mouseup', (data) => {
            this.isPanning = false;
        });

        // Обработка изменения размера окна
        this.eventManager.on('resize', (data) => {
            this.updateViewport();
            this.render();
        });

        // Обработка кнопок управления
        document.addEventListener('click', (event) => {
            const zoomInBtn = event.target.closest('[data-action="zoom-in"]');
            const zoomOutBtn = event.target.closest('[data-action="zoom-out"]');
            const gridBtn = event.target.closest('[data-action="grid"]');
            const guidesBtn = event.target.closest('[data-action="guides"]');
            const snapBtn = event.target.closest('[data-action="snap"]');
            
            if (zoomInBtn) {
                this.zoomBy(1.2);
            } else if (zoomOutBtn) {
                this.zoomBy(0.8);
            } else if (gridBtn) {
                this.setGridVisible(!this.showGrid);
                event.target.classList.toggle('active');
            } else if (guidesBtn) {
                this.setGuidesVisible(!this.showGuides);
                event.target.classList.toggle('active');
            } else if (snapBtn) {
                this.setSnapToGrid(!this.snapToGrid);
                event.target.classList.toggle('active');
            }
        });
    }

    /**
     * Сохранение состояния canvas
     */
    serialize() {
        return {
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            zoom: this.zoom,
            panX: this.panX,
            panY: this.panY,
            showGrid: this.showGrid,
            showGuides: this.showGuides,
            snapToGrid: this.snapToGrid,
            gridSize: this.gridSize,
            guides: this.guides
        };
    }

    /**
     * Восстановление состояния canvas
     */
    deserialize(data) {
        if (data.canvasWidth && data.canvasHeight) {
            this.resizeCanvas(data.canvasWidth, data.canvasHeight);
        }
        
        this.zoom = data.zoom || 1.0;
        this.panX = data.panX || 0;
        this.panY = data.panY || 0;
        this.showGrid = data.showGrid || false;
        this.showGuides = data.showGuides || false;
        this.snapToGrid = data.snapToGrid || false;
        this.gridSize = data.gridSize || 20;
        this.guides = data.guides || [];
        
        this.render();
        this.updateZoomUI();
    }

    /**
     * Получение статистики
     */
    getStats() {
        return {
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            zoom: this.zoom,
            panX: this.panX,
            panY: this.panY,
            showGrid: this.showGrid,
            showGuides: this.showGuides,
            snapToGrid: this.snapToGrid,
            guideCount: this.guides.length
        };
    }
}