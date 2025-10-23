/**
 * App - главный класс приложения ArtFlow
 * Управляет всеми компонентами и координирует их работу
 */
class App {
    constructor() {
        // Основные компоненты
        this.eventManager = null;
        this.toolManager = null;
        this.layerManager = null;
        this.canvasManager = null;
        this.filterManager = null;
        
        // Состояние приложения
        this.isInitialized = false;
        this.isDrawing = false;
        this.lastDrawPoint = null;
        
        // Настройки
        this.settings = {
            autoSaveInterval: 300000, // 5 минут
            maxUndoSteps: 50,
            showTooltips: true,
            enablePressureSensitivity: true
        };
        
        // Таймеры
        this.autoSaveTimer = null;
        
        this.init();
    }

    /**
     * Инициализация приложения
     */
    init() {
        try {
            console.log('Инициализация ArtFlow...');
            
            // Создаем компоненты
            this.eventManager = new EventManager();
            this.toolManager = new ToolManager(this.eventManager);
            this.layerManager = new LayerManager(this.eventManager);
            this.canvasManager = new CanvasManager(this.eventManager, this.layerManager);
            this.filterManager = new FilterManager(this.eventManager, this.layerManager);
            
            // Настраиваем обработчики событий
            this.setupEventListeners();
            
            // Инициализируем UI
            this.initializeUI();
            
            // Запускаем автосохранение
            this.startAutoSave();
            
            // Отмечаем как инициализированное
            this.isInitialized = true;
            
            console.log('ArtFlow инициализирован успешно');
            
            // Уведомляем подписчиков
            this.eventManager.emit('appInitialized');
            
        } catch (error) {
            console.error('Ошибка инициализации приложения:', error);
            this.showError('Не удалось инициализировать приложение: ' + error.message);
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработка событий рисования
        this.eventManager.on('mousedown', (data) => {
            if (this.isDrawingTool()) {
                this.startDrawing(data);
            }
        });

        this.eventManager.on('mousemove', (data) => {
            if (this.isDrawing) {
                this.continueDrawing(data);
            }
        });

        this.eventManager.on('mouseup', (data) => {
            if (this.isDrawing) {
                this.stopDrawing(data);
            }
        });

        // Обработка событий инструментов
        this.eventManager.on('toolChanged', (data) => {
            this.onToolChanged(data);
        });

        this.eventManager.on('brushChanged', (data) => {
            this.onBrushChanged(data);
        });

        // Обработка событий слоев
        this.eventManager.on('activeLayerChanged', (data) => {
            this.onActiveLayerChanged(data);
        });

        // Обработка событий canvas
        this.eventManager.on('canvasResized', (data) => {
            this.onCanvasResized(data);
        });

        // Обработка событий фильтров
        this.eventManager.on('filterApplied', (data) => {
            this.onFilterApplied(data);
        });

        // Обработка горячих клавиш
        this.eventManager.on('keydown', (data) => {
            this.handleKeyboardShortcuts(data);
        });

        // Обработка запросов на перерисовку
        this.eventManager.on('requestRender', () => {
            this.canvasManager.render();
        });
    }

    /**
     * Инициализация UI
     */
    initializeUI() {
        // Обновляем UI инструментов
        this.toolManager.updateToolUI();
        this.toolManager.updateBrushUI();
        
        // Обновляем UI слоев
        this.layerManager.updateLayersUI();
        
        // Обновляем UI масштаба
        this.canvasManager.updateZoomUI();
        
        // Инициализируем панель свойств
        this.updatePropertiesPanel();
    }

    /**
     * Проверка, является ли активный инструмент инструментом рисования
     */
    isDrawingTool() {
        const activeTool = this.toolManager.getActiveTool();
        return ['brush', 'eraser'].includes(activeTool);
    }

    /**
     * Начало рисования
     */
    startDrawing(data) {
        const activeLayer = this.layerManager.getActiveLayer();
        if (!activeLayer || activeLayer.locked) return;

        const canvasCoords = this.canvasManager.screenToCanvas(data.clientX, data.clientY);
        
        this.isDrawing = true;
        this.lastDrawPoint = canvasCoords;
        
        // Получаем активную кисть
        const brush = this.toolManager.getActiveBrushInstance();
        if (brush) {
            brush.startDrawing(canvasCoords.x, canvasCoords.y, data.pressure);
            
            // Рисуем первую точку
            brush.draw(activeLayer.context, canvasCoords.x, canvasCoords.y, data.pressure);
            
            // Обновляем миниатюру слоя
            this.layerManager.updateLayerThumbnail(activeLayer);
            
            // Перерисовываем
            this.eventManager.emit('requestRender');
        }
    }

    /**
     * Продолжение рисования
     */
    continueDrawing(data) {
        if (!this.isDrawing || !this.lastDrawPoint) return;

        const activeLayer = this.layerManager.getActiveLayer();
        if (!activeLayer || activeLayer.locked) return;

        const canvasCoords = this.canvasManager.screenToCanvas(data.clientX, data.clientY);
        
        // Получаем активную кисть
        const brush = this.toolManager.getActiveBrushInstance();
        if (brush) {
            // Рисуем линию от последней точки до текущей
            brush.drawLine(
                activeLayer.context,
                this.lastDrawPoint.x,
                this.lastDrawPoint.y,
                canvasCoords.x,
                canvasCoords.y,
                data.pressure
            );
            
            this.lastDrawPoint = canvasCoords;
            
            // Обновляем миниатюру слоя
            this.layerManager.updateLayerThumbnail(activeLayer);
            
            // Перерисовываем
            this.eventManager.emit('requestRender');
        }
    }

    /**
     * Завершение рисования
     */
    stopDrawing(data) {
        if (!this.isDrawing) return;

        const activeLayer = this.layerManager.getActiveLayer();
        if (activeLayer) {
            // Получаем активную кисть
            const brush = this.toolManager.getActiveBrushInstance();
            if (brush) {
                brush.stopDrawing();
            }
            
            // Сохраняем состояние для отмены
            this.saveState();
        }
        
        this.isDrawing = false;
        this.lastDrawPoint = null;
    }

    /**
     * Обработка изменения инструмента
     */
    onToolChanged(data) {
        console.log('Инструмент изменен:', data.tool);
        
        // Обновляем курсор
        this.updateCursor(data.toolInfo.cursor);
        
        // Обновляем панель свойств
        this.updatePropertiesPanel();
    }

    /**
     * Обработка изменения кисти
     */
    onBrushChanged(data) {
        console.log('Кисть изменена:', data.brush);
        
        // Обновляем панель свойств
        this.updatePropertiesPanel();
    }

    /**
     * Обработка изменения активного слоя
     */
    onActiveLayerChanged(data) {
        console.log('Активный слой изменен:', data.layer.name);
        
        // Обновляем UI
        this.layerManager.updateLayersUI();
    }

    /**
     * Обработка изменения размеров canvas
     */
    onCanvasResized(data) {
        console.log('Canvas изменен:', data.width, 'x', data.height);
        
        // Обновляем информацию в статус-баре
        this.updateCanvasInfo(data.width, data.height);
    }

    /**
     * Обработка применения фильтра
     */
    onFilterApplied(data) {
        console.log('Фильтр применен:', data.filter);
        
        // Сохраняем состояние для отмены
        this.saveState();
    }

    /**
     * Обработка горячих клавиш
     */
    handleKeyboardShortcuts(data) {
        // Ctrl+Z - Отмена
        if (data.ctrlKey && data.key === 'z') {
            this.undo();
            return;
        }
        
        // Ctrl+Y или Ctrl+Shift+Z - Повтор
        if ((data.ctrlKey && data.key === 'y') || 
            (data.ctrlKey && data.shiftKey && data.key === 'Z')) {
            this.redo();
            return;
        }
        
        // Ctrl+S - Сохранить
        if (data.ctrlKey && data.key === 's') {
            data.originalEvent.preventDefault();
            this.saveProject();
            return;
        }
        
        // Ctrl+O - Открыть
        if (data.ctrlKey && data.key === 'o') {
            data.originalEvent.preventDefault();
            this.openProject();
            return;
        }
        
        // Ctrl+N - Новый
        if (data.ctrlKey && data.key === 'n') {
            data.originalEvent.preventDefault();
            this.newProject();
            return;
        }
        
        // Space - Панорамирование (уже обрабатывается в CanvasManager)
        if (data.key === ' ') {
            data.originalEvent.preventDefault();
        }
    }

    /**
     * Обновление курсора
     */
    updateCursor(cursorType) {
        const canvas = this.canvasManager.mainCanvas;
        if (canvas) {
            canvas.style.cursor = cursorType;
        }
    }

    /**
     * Обновление панели свойств
     */
    updatePropertiesPanel() {
        const propertiesPanel = document.getElementById('toolProperties');
        if (!propertiesPanel) return;
        
        // Очищаем панель
        propertiesPanel.innerHTML = '';
        
        // Получаем параметры активной кисти
        const brush = this.toolManager.getActiveBrushInstance();
        if (brush) {
            const parameters = brush.getParameters();
            
            Object.entries(parameters).forEach(([paramId, paramInfo]) => {
                const propertyGroup = this.createPropertyControl(paramId, paramInfo, brush);
                propertiesPanel.appendChild(propertyGroup);
            });
        }
    }

    /**
     * Создание элемента управления свойством
     */
    createPropertyControl(paramId, paramInfo, brush) {
        const propertyGroup = document.createElement('div');
        propertyGroup.className = 'property-group';
        
        const label = document.createElement('label');
        label.className = 'property-label';
        label.textContent = paramInfo.name;
        propertyGroup.appendChild(label);
        
        let control;
        
        if (paramInfo.type === 'range') {
            control = document.createElement('input');
            control.type = 'range';
            control.className = 'property-slider';
            control.min = paramInfo.min;
            control.max = paramInfo.max;
            control.step = paramInfo.step || 1;
            control.value = brush.getParameter(paramId) || paramInfo.default;
            
            // Добавляем отображение значения
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'property-value';
            valueDisplay.textContent = control.value;
            
            control.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                brush.setParameter(paramId, value);
                valueDisplay.textContent = value;
                
                // Обновляем предпросмотр кисти
                this.updateBrushPreview();
            });
            
            propertyGroup.appendChild(control);
            propertyGroup.appendChild(valueDisplay);
            
        } else if (paramInfo.type === 'select') {
            control = document.createElement('select');
            control.className = 'property-select';
            
            paramInfo.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                if (option.value === (brush.getParameter(paramId) || paramInfo.default)) {
                    optionElement.selected = true;
                }
                control.appendChild(optionElement);
            });
            
            control.addEventListener('change', (e) => {
                brush.setParameter(paramId, e.target.value);
            });
            
            propertyGroup.appendChild(control);
            
        } else if (paramInfo.type === 'color') {
            control = document.createElement('input');
            control.type = 'color';
            control.className = 'property-color';
            control.value = brush.getParameter(paramId) || paramInfo.default;
            
            control.addEventListener('change', (e) => {
                brush.setParameter(paramId, e.target.value);
            });
            
            propertyGroup.appendChild(control);
            
        } else if (paramInfo.type === 'checkbox') {
            control = document.createElement('input');
            control.type = 'checkbox';
            control.className = 'property-checkbox';
            control.checked = brush.getParameter(paramId) || paramInfo.default;
            
            control.addEventListener('change', (e) => {
                brush.setParameter(paramId, e.target.checked);
            });
            
            propertyGroup.appendChild(control);
        }
        
        return propertyGroup;
    }

    /**
     * Обновление предпросмотра кисти
     */
    updateBrushPreview() {
        // В реальном приложении здесь можно показать предпросмотр кисти
        // Например, небольшой canvas с примером рисования
    }

    /**
     * Обновление информации о canvas в статус-баре
     */
    updateCanvasInfo(width, height) {
        const canvasInfo = document.getElementById('canvasInfo');
        if (canvasInfo) {
            canvasInfo.textContent = `${width}x${height} | 72 DPI`;
        }
    }

    /**
     * Сохранение состояния для отмены
     */
    saveState() {
        // В реальном приложении здесь должна быть система отмены/повтора
        // Сейчас просто логируем действие
        console.log('Состояние сохранено для отмены');
    }

    /**
     * Отмена действия
     */
    undo() {
        console.log('Отмена последнего действия');
        // Реализация отмены
    }

    /**
     * Повтор действия
     */
    redo() {
        console.log('Повтор отмененного действия');
        // Реализация повтора
    }

    /**
     * Создание нового проекта
     */
    newProject() {
        if (confirm('Создать новый проект? Текущий проект будет потерян.')) {
            // Сбрасываем состояние
            this.layerManager = new LayerManager(this.eventManager);
            this.canvasManager = new CanvasManager(this.eventManager, this.layerManager);
            
            // Обновляем UI
            this.initializeUI();
            
            console.log('Новый проект создан');
        }
    }

    /**
     * Открытие проекта
     */
    openProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const projectData = JSON.parse(e.target.result);
                        this.loadProject(projectData);
                    } catch (error) {
                        this.showError('Ошибка загрузки проекта: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    /**
     * Сохранение проекта
     */
    saveProject() {
        const projectData = this.serialize();
        const blob = new Blob([JSON.stringify(projectData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'artflow-project.json';
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('Проект сохранен');
    }

    /**
     * Загрузка проекта
     */
    loadProject(projectData) {
        try {
            this.deserialize(projectData);
            console.log('Проект загружен успешно');
        } catch (error) {
            this.showError('Ошибка загрузки проекта: ' + error.message);
        }
    }

    /**
     * Экспорт изображения
     */
    exportImage(format = 'png', quality = 0.9) {
        // Создаем canvas для экспорта
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvasManager.canvasWidth;
        exportCanvas.height = this.canvasManager.canvasHeight;
        const exportCtx = exportCanvas.getContext('2d');
        
        // Рендерим все слои
        this.layerManager.renderAllLayers(exportCtx);
        
        // Экспортируем в нужном формате
        let mimeType;
        switch (format.toLowerCase()) {
            case 'jpg':
            case 'jpeg':
                mimeType = 'image/jpeg';
                break;
            case 'webp':
                mimeType = 'image/webp';
                break;
            default:
                mimeType = 'image/png';
        }
        
        const dataURL = exportCanvas.toDataURL(mimeType, quality);
        
        // Скачиваем файл
        const link = document.createElement('a');
        link.download = `artflow-image.${format}`;
        link.href = dataURL;
        link.click();
        
        console.log(`Изображение экспортировано в формате ${format}`);
    }

    /**
     * Запуск автосохранения
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, this.settings.autoSaveInterval);
    }

    /**
     * Автосохранение
     */
    autoSave() {
        try {
            const projectData = this.serialize();
            localStorage.setItem('artflow-autosave', JSON.stringify(projectData));
            console.log('Автосохранение выполнено');
        } catch (error) {
            console.error('Ошибка автосохранения:', error);
        }
    }

    /**
     * Показ сообщения об ошибке
     */
    showError(message) {
        // В реальном приложении используйте более красивый способ показа ошибок
        alert(message);
    }

    /**
     * Сериализация состояния приложения
     */
    serialize() {
        return {
            version: '1.0',
            timestamp: Date.now(),
            canvas: this.canvasManager.serialize(),
            layers: this.layerManager.serialize(),
            tools: this.toolManager.serialize(),
            filters: this.filterManager.serialize(),
            settings: this.settings
        };
    }

    /**
     * Десериализация состояния приложения
     */
    deserialize(data) {
        if (data.canvas) {
            this.canvasManager.deserialize(data.canvas);
        }
        
        if (data.layers) {
            this.layerManager.deserialize(data.layers);
        }
        
        if (data.tools) {
            this.toolManager.deserialize(data.tools);
        }
        
        if (data.filters) {
            this.filterManager.deserialize(data.filters);
        }
        
        if (data.settings) {
            this.settings = { ...this.settings, ...data.settings };
        }
        
        // Обновляем UI
        this.initializeUI();
    }

    /**
     * Получение статистики приложения
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            canvas: this.canvasManager.getStats(),
            layers: this.layerManager.getStats(),
            tools: this.toolManager.getStats(),
            filters: this.filterManager.getStats()
        };
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        if (this.eventManager) {
            this.eventManager.clear();
        }
        
        console.log('ArtFlow завершен');
    }
}
