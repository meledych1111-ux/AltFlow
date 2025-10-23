/**
 * ToolManager - менеджер инструментов
 * Управляет всеми доступными инструментами, их состоянием и переключением
 */
class ToolManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.tools = new Map();
        this.activeTool = null;
        this.brushes = new Map();
        this.activeBrush = null;
        
        this.init();
    }

    init() {
        this.registerDefaultTools();
        this.registerDefaultBrushes();
        this.setupEventListeners();
        
        // Устанавливаем активный инструмент по умолчанию
        this.setActiveTool('brush');
        this.setActiveBrush('Sphere3DBrush');
    }

    /**
     * Регистрация стандартных инструментов
     */
    registerDefaultTools() {
        const tools = [
            {
                id: 'brush',
                name: 'Кисть',
                icon: '🖌️',
                description: 'Инструмент для рисования кистями',
                cursor: 'crosshair',
                keyboardShortcut: 'b'
            },
            {
                id: 'eraser',
                name: 'Ластик',
                icon: '🧽',
                description: 'Инструмент для стирания',
                cursor: 'crosshair',
                keyboardShortcut: 'e'
            },
            {
                id: 'shape',
                name: 'Фигуры',
                icon: '⬜',
                description: 'Инструмент для рисования фигур',
                cursor: 'crosshair',
                keyboardShortcut: 's'
            },
            {
                id: 'text',
                name: 'Текст',
                icon: '📝',
                description: 'Инструмент для добавления текста',
                cursor: 'text',
                keyboardShortcut: 't'
            },
            {
                id: 'eyedropper',
                name: 'Пипетка',
                icon: '💧',
                description: 'Инструмент для выбора цвета',
                cursor: 'crosshair',
                keyboardShortcut: 'i'
            },
            {
                id: 'fill',
                name: 'Заливка',
                icon: '🪣',
                description: 'Инструмент для заливки областей',
                cursor: 'crosshair',
                keyboardShortcut: 'g'
            }
        ];

        tools.forEach(tool => {
            this.registerTool(tool);
        });
    }

    /**
     * Регистрация стандартных кистей
     */
    registerDefaultBrushes() {
        // Кисти уже зарегистрированы в HTML, просто добавляем их в коллекцию
        const brushClasses = [
            Sphere3DBrush,
            MetalBrush,
            GlassBrush,
            CeramicBrush,
            TextureBrush,
            GlowBrush
        ];

        brushClasses.forEach(BrushClass => {
            const brush = new BrushClass();
            this.registerBrush(brush);
        });
    }

    /**
     * Регистрация инструмента
     */
    registerTool(tool) {
        if (this.tools.has(tool.id)) {
            console.warn(`Инструмент с ID ${tool.id} уже существует`);
            return;
        }

        this.tools.set(tool.id, {
            ...tool,
            active: false,
            options: {}
        });
    }

    /**
     * Регистрация кисти
     */
    registerBrush(brush) {
        const info = brush.getInfo();
        this.brushes.set(info.name, {
            instance: brush,
            info: info,
            active: false
        });
    }

    /**
     * Установка активного инструмента
     */
    setActiveTool(toolId) {
        if (!this.tools.has(toolId)) {
            console.error(`Инструмент с ID ${toolId} не найден`);
            return;
        }

        // Деактивируем предыдущий инструмент
        if (this.activeTool) {
            this.tools.get(this.activeTool).active = false;
        }

        // Активируем новый инструмент
        this.activeTool = toolId;
        this.tools.get(toolId).active = true;

        // Обновляем UI
        this.updateToolUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('toolChanged', {
            tool: toolId,
            toolInfo: this.getToolInfo(toolId)
        });
    }

    /**
     * Установка активной кисти
     */
    setActiveBrush(brushName) {
        if (!this.brushes.has(brushName)) {
            console.error(`Кисть с именем ${brushName} не найдена`);
            return;
        }

        // Деактивируем предыдущую кисть
        if (this.activeBrush) {
            this.brushes.get(this.activeBrush).active = false;
        }

        // Активируем новую кисть
        this.activeBrush = brushName;
        this.brushes.get(brushName).active = true;

        // Обновляем UI
        this.updateBrushUI();
        
        // Уведомляем подписчиков
        this.eventManager.emit('brushChanged', {
            brush: brushName,
            brushInfo: this.getBrushInfo(brushName)
        });
    }

    /**
     * Получение информации об инструменте
     */
    getToolInfo(toolId) {
        return this.tools.get(toolId);
    }

    /**
     * Получение информации о кисти
     */
    getBrushInfo(brushName) {
        const brush = this.brushes.get(brushName);
        return brush ? brush.info : null;
    }

    /**
     * Получение активного инструмента
     */
    getActiveTool() {
        return this.activeTool;
    }

    /**
     * Получение активной кисти
     */
    getActiveBrush() {
        return this.activeBrush;
    }

    /**
     * Получение экземпляра активной кисти
     */
    getActiveBrushInstance() {
        if (!this.activeBrush) return null;
        const brush = this.brushes.get(this.activeBrush);
        return brush ? brush.instance : null;
    }

    /**
     * Получение всех инструментов
     */
    getAllTools() {
        return Array.from(this.tools.values());
    }

    /**
     * Получение всех кистей
     */
    getAllBrushes() {
        return Array.from(this.brushes.values());
    }

    /**
     * Получение кистей по категории
     */
    getBrushesByCategory(category) {
        return Array.from(this.brushes.values())
            .filter(brush => brush.info.category === category);
    }

    /**
     * Получение всех категорий кистей
     */
    getBrushCategories() {
        const categories = new Set();
        this.brushes.forEach(brush => {
            categories.add(brush.info.category);
        });
        return Array.from(categories);
    }

    /**
     * Обновление UI инструментов
     */
    updateToolUI() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(button => {
            const toolId = button.dataset.tool;
            button.classList.toggle('active', toolId === this.activeTool);
        });
    }

    /**
     * Обновление UI кистей
     */
    updateBrushUI() {
        // Очищаем список кистей
        const brushList = document.getElementById('brushList');
        if (brushList) {
            brushList.innerHTML = '';
            
            // Добавляем кисти по категориям
            const categories = this.getBrushCategories();
            categories.forEach(category => {
                const brushes = this.getBrushesByCategory(category);
                if (brushes.length > 0) {
                    this.createBrushCategoryUI(category, brushes, brushList);
                }
            });
        }
    }

    /**
     * Создание UI категории кистей
     */
    createBrushCategoryUI(category, brushes, container) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'brush-category';
        
        const categoryTitle = document.createElement('h4');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = this.getCategoryDisplayName(category);
        categoryDiv.appendChild(categoryTitle);
        
        const categoryBrushes = document.createElement('div');
        categoryBrushes.className = 'category-brushes';
        
        brushes.forEach(brush => {
            const brushItem = this.createBrushItemUI(brush);
            categoryBrushes.appendChild(brushItem);
        });
        
        categoryDiv.appendChild(categoryBrushes);
        container.appendChild(categoryDiv);
    }

    /**
     * Создание UI элемента кисти
     */
    createBrushItemUI(brush) {
        const brushItem = document.createElement('div');
        brushItem.className = `brush-item ${brush.active ? 'active' : ''}`;
        brushItem.dataset.brush = brush.info.name;
        
        brushItem.innerHTML = `
            <span class="brush-icon">${brush.info.icon}</span>
            <div class="brush-info">
                <div class="brush-name">${brush.info.name}</div>
                <div class="brush-description">${brush.info.description}</div>
            </div>
        `;
        
        // Добавляем обработчик клика
        brushItem.addEventListener('click', () => {
            this.setActiveBrush(brush.info.name);
        });
        
        return brushItem;
    }

    /**
     * Получение отображаемого имени категории
     */
    getCategoryDisplayName(category) {
        const categoryNames = {
            'basic': 'Базовые',
            '3d-effects': '3D Эффекты',
            'materials': 'Материалы',
            'textures': 'Текстуры',
            'effects': 'Эффекты'
        };
        
        return categoryNames[category] || category;
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработка кликов по кнопкам инструментов
        document.addEventListener('click', (event) => {
            const toolButton = event.target.closest('.tool-btn');
            if (toolButton) {
                const toolId = toolButton.dataset.tool;
                this.setActiveTool(toolId);
            }
        });

        // Обработка горячих клавиш
        this.eventManager.on('keydown', (data) => {
            if (data.ctrlKey || data.altKey || data.metaKey) return;
            
            const key = data.key.toLowerCase();
            
            // Поиск инструмента по горячей клавише
            this.tools.forEach((tool, toolId) => {
                if (tool.keyboardShortcut === key) {
                    this.setActiveTool(toolId);
                }
            });
        });
    }

    /**
     * Установка параметров инструмента
     */
    setToolOptions(toolId, options) {
        if (!this.tools.has(toolId)) return;
        
        const tool = this.tools.get(toolId);
        tool.options = { ...tool.options, ...options };
        
        this.eventManager.emit('toolOptionsChanged', {
            tool: toolId,
            options: tool.options
        });
    }

    /**
     * Получение параметров инструмента
     */
    getToolOptions(toolId) {
        if (!this.tools.has(toolId)) return {};
        return this.tools.get(toolId).options;
    }

    /**
     * Обновление параметров активной кисти
     */
    updateActiveBrushParameter(parameter, value) {
        if (!this.activeBrush) return;
        
        const brush = this.brushes.get(this.activeBrush);
        if (brush && brush.instance) {
            brush.instance.setParameter(parameter, value);
            
            this.eventManager.emit('brushParameterChanged', {
                brush: this.activeBrush,
                parameter: parameter,
                value: value
            });
        }
    }

    /**
     * Получение параметров активной кисти
     */
    getActiveBrushParameters() {
        if (!this.activeBrush) return {};
        
        const brush = this.brushes.get(this.activeBrush);
        return brush && brush.instance ? brush.instance.getParameters() : {};
    }

    /**
     * Проверка, является ли инструмент активным
     */
    isToolActive(toolId) {
        return this.activeTool === toolId;
    }

    /**
     * Проверка, является ли кисть активной
     */
    isBrushActive(brushName) {
        return this.activeBrush === brushName;
    }

    /**
     * Динамическая загрузка новой кисти
     */
    loadBrush(brushClass) {
        try {
            const brush = new brushClass();
            this.registerBrush(brush);
            this.updateBrushUI();
            
            this.eventManager.emit('brushLoaded', {
                brush: brush.getInfo().name,
                info: brush.getInfo()
            });
            
            return true;
        } catch (error) {
            console.error('Ошибка загрузки кисти:', error);
            return false;
        }
    }

    /**
     * Сохранение состояния менеджера инструментов
     */
    serialize() {
        return {
            activeTool: this.activeTool,
            activeBrush: this.activeBrush,
            tools: Array.from(this.tools.entries()).map(([id, tool]) => [id, {
                options: tool.options
            }]),
            brushes: Array.from(this.brushes.entries()).map(([name, brush]) => [name, {
                instance: brush.instance.serialize()
            }])
        };
    }

    /**
     * Восстановление состояния менеджера инструментов
     */
    deserialize(data) {
        if (data.activeTool) {
            this.setActiveTool(data.activeTool);
        }
        
        if (data.activeBrush) {
            this.setActiveBrush(data.activeBrush);
        }
        
        // Восстанавливаем параметры кистей
        if (data.brushes) {
            data.brushes.forEach(([name, brushData]) => {
                if (this.brushes.has(name)) {
                    const brush = this.brushes.get(name);
                    brush.instance.deserialize(brushData.instance);
                }
            });
        }
    }

    /**
     * Получение статистики
     */
    getStats() {
        return {
            totalTools: this.tools.size,
            totalBrushes: this.brushes.size,
            activeTool: this.activeTool,
            activeBrush: this.activeBrush,
            categories: this.getBrushCategories()
        };
    }
}
