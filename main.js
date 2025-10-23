/**
 * ArtFlow - Профессиональный графический редактор
 * Главный файл инициализации
 */

// Глобальная переменная для приложения
let artflowApp = null;

/**
 * Инициализация приложения при загрузке DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузка ArtFlow...');
    
    try {
        // Создаем экземпляр приложения
        artflowApp = new App();
        
        // Настраиваем глобальные обработчики
        setupGlobalEventListeners();
        
        // Проверяем поддержку функций браузера
        checkBrowserSupport();
        
        // Загружаем автосохранение если есть
        loadAutoSave();
        
        console.log('ArtFlow готов к работе');
        
    } catch (error) {
        console.error('Критическая ошибка инициализации:', error);
        showInitializationError(error);
    }
});

/**
 * Настройка глобальных обработчиков событий
 */
function setupGlobalEventListeners() {
    // Обработка изменения размера окна
    window.addEventListener('resize', function() {
        if (artflowApp && artflowApp.canvasManager) {
            artflowApp.canvasManager.updateViewport();
            artflowApp.canvasManager.render();
        }
    });
    
    // Обработка ухода со страницы
    window.addEventListener('beforeunload', function(e) {
        if (artflowApp) {
            // Выполняем автосохранение
            artflowApp.autoSave();
            
            // Предупреждаем о несохраненных изменениях
            if (hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?';
            }
        }
    });
    
    // Обработка ошибок
    window.addEventListener('error', function(e) {
        console.error('Глобальная ошибка:', e.error);
        if (artflowApp) {
            artflowApp.showError('Произошла ошибка: ' + e.message);
        }
    });
    
    // Обработка неперехваченных промисов
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Необработанное отклонение промиса:', e.reason);
        if (artflowApp) {
            artflowApp.showError('Произошла ошибка: ' + e.reason);
        }
    });
}

/**
 * Проверка поддержки функций браузером
 */
function checkBrowserSupport() {
    const features = {
        canvas: !!document.createElement('canvas').getContext,
        canvas2d: !!document.createElement('canvas').getContext('2d'),
        filereader: !!window.FileReader,
        localstorage: !!window.localStorage,
        requestAnimationFrame: !!window.requestAnimationFrame,
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
    
    const unsupported = Object.entries(features)
        .filter(([feature, supported]) => !supported)
        .map(([feature]) => feature);
    
    if (unsupported.length > 0) {
        console.warn('Неподдерживаемые функции:', unsupported);
        showBrowserWarning(unsupported);
    }
    
    console.log('Поддержка функций:', features);
}

/**
 * Загрузка автосохранения
 */
function loadAutoSave() {
    try {
        const autoSaveData = localStorage.getItem('artflow-autosave');
        if (autoSaveData) {
            const projectData = JSON.parse(autoSaveData);
            
            if (confirm('Найдено автосохранение. Восстановить проект?')) {
                artflowApp.loadProject(projectData);
                console.log('Автосохранение восстановлено');
            } else {
                localStorage.removeItem('artflow-autosave');
                console.log('Автосохранение удалено');
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки автосохранения:', error);
        localStorage.removeItem('artflow-autosave');
    }
}

/**
 * Проверка наличия несохраненных изменений
 */
function hasUnsavedChanges() {
    // В реальном приложении здесь должна быть логика проверки изменений
    return true; // Предполагаем, что есть изменения
}

/**
 * Показ предупреждения о браузере
 */
function showBrowserWarning(unsupportedFeatures) {
    const warning = document.createElement('div');
    warning.className = 'browser-warning';
    warning.innerHTML = `
        <div class="warning-content">
            <h3>Внимание!</h3>
            <p>Ваш браузер не поддерживает следующие функции:</p>
            <ul>
                ${unsupportedFeatures.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <p>Для полноценной работы рекомендуется использовать современный браузер.</p>
            <button onclick="this.parentElement.parentElement.remove()">Понятно</button>
        </div>
    `;
    
    warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    warning.querySelector('.warning-content').style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 500px;
        text-align: center;
    `;
    
    document.body.appendChild(warning);
}

/**
 * Показ ошибки инициализации
 */
function showInitializationError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'initialization-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h3>Ошибка инициализации</h3>
            <p>Не удалось запустить ArtFlow.</p>
            <p>Подробности: ${error.message}</p>
            <button onclick="location.reload()">Перезагрузить</button>
        </div>
    `;
    
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    `;
    
    errorDiv.querySelector('.error-content').style.cssText = `
        background: rgba(0, 0, 0, 0.8);
        padding: 20px;
        border-radius: 8px;
        max-width: 500px;
        text-align: center;
    `;
    
    document.body.appendChild(errorDiv);
}

/**
 * Утилиты для работы с приложением
 */
const ArtFlowUtils = {
    /**
     * Получение текущего состояния приложения
     */
    getAppState: function() {
        return artflowApp ? artflowApp.serialize() : null;
    },
    
    /**
     * Загрузка состояния приложения
     */
    setAppState: function(state) {
        if (artflowApp) {
            artflowApp.deserialize(state);
        }
    },
    
    /**
     * Экспорт изображения
     */
    exportImage: function(format, quality) {
        if (artflowApp) {
            artflowApp.exportImage(format, quality);
        }
    },
    
    /**
     * Получение статистики
     */
    getStats: function() {
        return artflowApp ? artflowApp.getStats() : null;
    },
    
    /**
     * Выполнение команды
     */
    executeCommand: function(command, ...args) {
        if (!artflowApp) return null;
        
        switch (command) {
            case 'new':
                artflowApp.newProject();
                break;
            case 'open':
                artflowApp.openProject();
                break;
            case 'save':
                artflowApp.saveProject();
                break;
            case 'export':
                artflowApp.exportImage(args[0] || 'png', args[1] || 0.9);
                break;
            case 'undo':
                artflowApp.undo();
                break;
            case 'redo':
                artflowApp.redo();
                break;
            default:
                console.warn('Неизвестная команда:', command);
        }
    }
};

/**
 * Глобальные горячие клавиши
 */
document.addEventListener('keydown', function(e) {
    // F1 - Справка
    if (e.key === 'F1') {
        e.preventDefault();
        showHelp();
    }
    
    // F11 - Полноэкранный режим
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
    
    // Escape - Выход из полноэкранного режима
    if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
    }
});

/**
 * Показ справки
 */
function showHelp() {
    const help = document.createElement('div');
    help.className = 'help-dialog';
    help.innerHTML = `
        <div class="help-content">
            <h2>ArtFlow - Справка</h2>
            <div class="help-sections">
                <div class="help-section">
                    <h3>Горячие клавиши</h3>
                    <ul>
                        <li><strong>B</strong> - Кисть</li>
                        <li><strong>E</strong> - Ластик</li>
                        <li><strong>S</strong> - Фигуры</li>
                        <li><strong>T</strong> - Текст</li>
                        <li><strong>I</strong> - Пипетка</li>
                        <li><strong>G</strong> - Заливка</li>
                        <li><strong>Ctrl+Z</strong> - Отмена</li>
                        <li><strong>Ctrl+Y</strong> - Повтор</li>
                        <li><strong>Ctrl+S</strong> - Сохранить</li>
                        <li><strong>Ctrl+O</strong> - Открыть</li>
                        <li><strong>Ctrl+N</strong> - Новый</li>
                        <li><strong>Space+Drag</strong> - Панорамирование</li>
                        <li><strong>Ctrl+Wheel</strong> - Масштабирование</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h3>Инструменты</h3>
                    <ul>
                        <li><strong>Кисти</strong> - Различные типы кистей с эффектами</li>
                        <li><strong>Ластик</strong> - Стирает содержимое слоя</li>
                        <li><strong>Фигуры</strong> - Рисование геометрических фигур</li>
                        <li><strong>Текст</strong> - Добавление текстовых элементов</li>
                        <li><strong>Пипетка</strong> - Выбор цвета с холста</li>
                        <li><strong>Заливка</strong> - Заливка областей цветом</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h3>Слои</h3>
                    <ul>
                        <li>Каждый элемент рисуется на отдельном слое</li>
                        <li>Слои можно перемещать, удалять, дублировать</li>
                        <li>Настраивайте непрозрачность и режимы наложения</li>
                        <li>Используйте слои для неразрушающего редактирования</li>
                    </ul>
                </div>
            </div>
            <button onclick="this.closest('.help-dialog').remove()">Закрыть</button>
        </div>
    `;
    
    help.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    help.querySelector('.help-content').style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        text-align: left;
    `;
    
    document.body.appendChild(help);
}

/**
 * Переключение полноэкранного режима
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Ошибка переключения в полноэкранный режим:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Экспорт утилит для глобального использования
window.ArtFlowUtils = ArtFlowUtils;