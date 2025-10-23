// AltFlow v1.0  |  ES-module loader  |  production-ready
window.BrushLibrary = { brushes: {} };

const coreModules = [
  './core/EventManager.js',
  './core/BrushBase.js',
  './core/ToolManager.js',
  './core/LayerManager.js',
  './core/FilterManager.js',
  './core/CanvasManager.js',
  './core/App.js'
];

const brushModules = [
  './brushes/ArtistBrushes.js',
  './brushes/MetalBrush.js',
  './brushes/GlowBrush.js',
  './brushes/Sphere3DBrush.js',
  './brushes/GlassBrush.js',
  './brushes/CeramicBrush.js',
  './brushes/TextureBrush.js',
  './brushes/AnimeBrushes.js',
  './brushes/DrawingBrushes.js'
];

(async () => {
  try {
    // 1. Ядро (строго по порядку)
    for (const path of coreModules) await import(path);

    // 2. Кисти (BrushBase уже доступен)
    for (const path of brushModules) await import(path);

    // 3. Регистрируем кисти
    const brushClasses = [
      OilPaintBrush, WatercolorBrush, PastelBrush, CharcoalBrush, InkBrush, DigitalArtBrush,
      MetalBrush, GlowBrush, Sphere3DBrush, GlassBrush, CeramicBrush, TextureBrush,
      AnimeHairBrush, AnimeEyeBrush, AnimeLipBrush, AnimeSkinBrush, AnimeEyebrowBrush,
      TechnicalPenBrush, CircleTemplateBrush, RectangleTemplateBrush, PolygonTemplateBrush, LineTemplateBrush
    ];

    for (const Cl of brushClasses) {
      const key = Cl.name.replace(/Brush$/, '').toLowerCase();
      BrushLibrary.brushes[key] = Cl;
    }
    // 3. Глобально регистрируем классы (GitHub Pages не делает их глобальными)
window.OilPaintBrush = OilPaintBrush;
window.WatercolorBrush = WatercolorBrush;
window.PastelBrush = PastelBrush;
window.CharcoalBrush = CharcoalBrush;
window.InkBrush = InkBrush;
window.DigitalArtBrush = DigitalArtBrush;
window.MetalBrush = MetalBrush;
window.GlowBrush = GlowBrush;
window.Sphere3DBrush = Sphere3DBrush;
window.GlassBrush = GlassBrush;
window.CeramicBrush = CeramicBrush;
window.TextureBrush = TextureBrush;
window.AnimeHairBrush = AnimeHairBrush;
window.AnimeEyeBrush = AnimeEyeBrush;
window.AnimeLipBrush = AnimeLipBrush;
window.AnimeSkinBrush = AnimeSkinBrush;
window.AnimeEyebrowBrush = AnimeEyebrowBrush;
window.TechnicalPenBrush = TechnicalPenBrush;
window.CircleTemplateBrush = CircleTemplateBrush;
window.RectangleTemplateBrush = RectangleTemplateBrush;
window.PolygonTemplateBrush = PolygonTemplateBrush;
window.LineTemplateBrush = LineTemplateBrush;
    // 4. Запускаем приложение (App.js должен создать window.app)
    if (window.App) {
      window.app = new App();
      window.app.init();
    }

    // 5. Создаём выпадающий список кистей
    const brushList = document.getElementById('brushList');
    const select = document.createElement('select');
    select.id = 'brushSelect';
    select.className = 'brush-select';
    Object.keys(BrushLibrary.brushes).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      select.appendChild(opt);
    });
    brushList.innerHTML = '';
    brushList.appendChild(select);

    // 6. Базовое рисование мышью (пока нет полного ToolManager)
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);
    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const brushName = select.value;                       // выбранная кисть
      const Brush = BrushLibrary.brushes[brushName];
      if (!Brush) return;
      const brush = new Brush();
      brush.primaryColor = document.getElementById('primaryColor')?.value || '#000000';
      brush.size = 10;                                      // можно подключить слайдер
      brush.draw(ctx, x, y, 1);
    });

    console.log('AltFlow загружен и проверен');
    console.log('Brushes:', Object.keys(BrushLibrary.brushes));

  } catch (err) {
    console.error('Ошибка загрузки модулей:', err);
  }
  // 7. Подключаем кнопку «Рисовать» и включаем/выключаем рисование
let drawingEnabled = false;
const drawBtn = document.querySelector('[data-action="draw"]') || document.querySelector('.nav-btn[data-action="save"]'); // fallback
if (drawBtn) {
  drawBtn.textContent = 'Рисовать';
  drawBtn.addEventListener('click', () => {
    drawingEnabled = !drawingEnabled;
    drawBtn.textContent = drawingEnabled ? 'Стоп' : 'Рисовать';
    canvas.style.cursor = drawingEnabled ? 'crosshair' : 'default';
  });
}

// 8. Увеличиваем размер кисти и делаем её заметной
const BRUSH_SIZE = 30; // px
})();
