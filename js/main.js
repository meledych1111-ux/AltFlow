// AltFlow entry point (ES-module edition)
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
  // 1. загружаем ядро
  for (const path of coreModules) await import(path);

  // 2. загружаем кисти (глобальные классы)
  for (const path of brushModules) await import(path);

  // 3. собираем классы кистей в библиотеку
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

  // 4. запускаем приложение (App.js должен создать window.app)
  if (window.App) {
    window.app = new App();
    window.app.init();
  }

  console.log('AltFlow загружен и проверен');
  console.log('Brushes:', Object.keys(BrushLibrary.brushes));
})();
