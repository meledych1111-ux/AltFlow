// js/main.js  (строго последовательная загрузка)
window.BrushLibrary = { brushes: {} };

async function loadModule(path) {
  await import(path);   // ждём, пока модуль выполнится
}

(async () => {
  try {
    // 1. ЯДРО (важно до кистей!)
    await loadModule('./core/EventManager.js');
    await loadModule('./core/BrushBase.js');
    await loadModule('./core/ToolManager.js');
    await loadModule('./core/LayerManager.js');
    await loadModule('./core/FilterManager.js');
    await loadModule('./core/CanvasManager.js');
    await loadModule('./core/App.js');

    // 2. КИСТИ (теперь BrushBase уже доступен)
    await loadModule('./brushes/ArtistBrushes.js');
    await loadModule('./brushes/MetalBrush.js');
    await loadModule('./brushes/GlowBrush.js');
    await loadModule('./brushes/Sphere3DBrush.js');
    await loadModule('./brushes/GlassBrush.js');
    await loadModule('./brushes/CeramicBrush.js');
    await loadModule('./brushes/TextureBrush.js');
    await loadModule('./brushes/AnimeBrushes.js');
    await loadModule('./brushes/DrawingBrushes.js');

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

    // 4. Запускаем приложение
    if (window.App) {
      window.app = new App();
      window.app.init();
    }

    console.log('AltFlow загружен и проверен');
    console.log('Brushes:', Object.keys(BrushLibrary.brushes));

  } catch (err) {
    console.error('Ошибка загрузки модулей:', err);
  }
})();
