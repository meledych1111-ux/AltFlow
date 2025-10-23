/**
 * EventManager - централизованная обработка событий
 * Управляет событиями мыши, клавиатуры, тача и другими
 */
class EventManager {
    constructor() {
        this.events = new Map();
        this.listeners = new Map();
        this.touchStartTime = 0;
        this.lastTouchEndTime = 0;
        this.preventClickTimeout = null;
        
        this.init();
    }

    init() {
        // Привязка контекста
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseWheel = this.handleMouseWheel.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
    }

    /**
     * Подписка на событие
     */
    on(event, callback, context = null) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ callback, context });
    }

    /**
     * Отписка от события
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const eventListeners = this.listeners.get(event);
        const index = eventListeners.findIndex(listener => listener.callback === callback);
        if (index > -1) {
            eventListeners.splice(index, 1);
        }
    }

    /**
     * Вызов события
     */
    emit(event, data = {}) {
        if (!this.listeners.has(event)) return;
        
        const eventListeners = this.listeners.get(event);
        eventListeners.forEach(listener => {
            try {
                listener.callback.call(listener.context, data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    /**
     * Инициализация обработчиков событий для элемента
     */
    attachToElement(element) {
        // Mouse events
        element.addEventListener('mousedown', this.handleMouseDown);
        element.addEventListener('mousemove', this.handleMouseMove);
        element.addEventListener('mouseup', this.handleMouseUp);
        element.addEventListener('mouseleave', this.handleMouseUp);
        element.addEventListener('wheel', this.handleMouseWheel);
        element.addEventListener('contextmenu', this.handleContextMenu);

        // Touch events
        element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        element.addEventListener('touchend', this.handleTouchEnd, { passive: false });

        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);

        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    /**
     * Удаление обработчиков событий
     */
    detachFromElement(element) {
        // Mouse events
        element.removeEventListener('mousedown', this.handleMouseDown);
        element.removeEventListener('mousemove', this.handleMouseMove);
        element.removeEventListener('mouseup', this.handleMouseUp);
        element.removeEventListener('mouseleave', this.handleMouseUp);
        element.removeEventListener('wheel', this.handleMouseWheel);
        element.removeEventListener('contextmenu', this.handleContextMenu);

        // Touch events
        element.removeEventListener('touchstart', this.handleTouchStart);
        element.removeEventListener('touchmove', this.handleTouchMove);
        element.removeEventListener('touchend', this.handleTouchEnd);

        // Keyboard events
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);

        // Window events
        window.removeEventListener('resize', this.handleResize.bind(this));
        window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    /**
     * Обработка событий мыши
     */
    handleMouseDown(event) {
        const rect = event.target.getBoundingClientRect();
        const data = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            clientX: event.clientX,
            clientY: event.clientY,
            pressure: event.pressure || 1,
            button: event.button,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            target: event.target,
            originalEvent: event
        };

        this.emit('mousedown', data);
    }

    handleMouseMove(event) {
        const rect = event.target.getBoundingClientRect();
        const data = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            clientX: event.clientX,
            clientY: event.clientY,
            pressure: event.pressure || 1,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            target: event.target,
            originalEvent: event
        };

        this.emit('mousemove', data);
    }

    handleMouseUp(event) {
        const rect = event.target.getBoundingClientRect();
        const data = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            clientX: event.clientX,
            clientY: event.clientY,
            pressure: event.pressure || 1,
            button: event.button,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            target: event.target,
            originalEvent: event
        };

        this.emit('mouseup', data);
    }

    handleMouseWheel(event) {
        event.preventDefault();
        
        const data = {
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaZ: event.deltaZ,
            deltaMode: event.deltaMode,
            clientX: event.clientX,
            clientY: event.clientY,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            target: event.target,
            originalEvent: event
        };

        this.emit('wheel', data);
    }

    handleContextMenu(event) {
        event.preventDefault();
        
        const rect = event.target.getBoundingClientRect();
        const data = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            clientX: event.clientX,
            clientY: event.clientY,
            target: event.target,
            originalEvent: event
        };

        this.emit('contextmenu', data);
    }

    /**
     * Обработка событий клавиатуры
     */
    handleKeyDown(event) {
        const data = {
            key: event.key,
            code: event.code,
            keyCode: event.keyCode,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            repeat: event.repeat,
            target: event.target,
            originalEvent: event
        };

        this.emit('keydown', data);
    }

    handleKeyUp(event) {
        const data = {
            key: event.key,
            code: event.code,
            keyCode: event.keyCode,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            target: event.target,
            originalEvent: event
        };

        this.emit('keyup', data);
    }

    /**
     * Обработка событий тача
     */
    handleTouchStart(event) {
        event.preventDefault();
        this.touchStartTime = Date.now();
        
        const touches = Array.from(event.touches).map(touch => {
            const rect = event.target.getBoundingClientRect();
            return {
                id: touch.identifier,
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pressure: touch.force || 1,
                target: event.target
            };
        });

        const data = {
            touches,
            changedTouches: Array.from(event.changedTouches).map(touch => ({
                id: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pressure: touch.force || 1
            })),
            target: event.target,
            originalEvent: event
        };

        this.emit('touchstart', data);
    }

    handleTouchMove(event) {
        event.preventDefault();
        
        const touches = Array.from(event.touches).map(touch => {
            const rect = event.target.getBoundingClientRect();
            return {
                id: touch.identifier,
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pressure: touch.force || 1,
                target: event.target
            };
        });

        const data = {
            touches,
            changedTouches: Array.from(event.changedTouches).map(touch => ({
                id: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pressure: touch.force || 1
            })),
            target: event.target,
            originalEvent: event
        };

        this.emit('touchmove', data);
    }

    handleTouchEnd(event) {
        event.preventDefault();
        
        this.lastTouchEndTime = Date.now();
        
        const touches = Array.from(event.touches).map(touch => {
            const rect = event.target.getBoundingClientRect();
            return {
                id: touch.identifier,
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pressure: touch.force || 1,
                target: event.target
            };
        });

        const data = {
            touches,
            changedTouches: Array.from(event.changedTouches).map(touch => ({
                id: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pressure: touch.force || 1
            })),
            target: event.target,
            originalEvent: event
        };

        this.emit('touchend', data);
    }

    /**
     * Обработка изменения размера окна
     */
    handleResize(event) {
        this.emit('resize', {
            width: window.innerWidth,
            height: window.innerHeight,
            originalEvent: event
        });
    }

    /**
     * Обработка закрытия страницы
     */
    handleBeforeUnload(event) {
        this.emit('beforeunload', { originalEvent: event });
    }

    /**
     * Получение состояния модификаторов клавиш
     */
    getModifierState(event) {
        return {
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            alt: event.altKey,
            meta: event.metaKey
        };
    }

    /**
     * Проверка, является ли событие двойным кликом на тач-устройстве
     */
    isDoubleClick() {
        const timeSinceLastTouch = Date.now() - this.lastTouchEndTime;
        return timeSinceLastTouch < 300 && timeSinceLastTouch > 0;
    }

    /**
     * Очистка всех подписок
     */
    clear() {
        this.listeners.clear();
        this.events.clear();
    }

    /**
     * Получение информации о событиях (для отладки)
     */
    getStats() {
        return {
            totalEvents: this.events.size,
            totalListeners: Array.from(this.listeners.values()).reduce((sum, listeners) => sum + listeners.length, 0),
            events: Array.from(this.listeners.keys())
        };
    }
}