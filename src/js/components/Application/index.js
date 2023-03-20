/* eslint-disable no-magic-numbers */

const { TileMap2D, Example } = exports;
const { Browser } = DuskSDK;

// Configure viewport

Browser();

let width = window.innerWidth;
let height = width / 1.77;
let tileCount = 17;
let tileSize = (width / tileCount);
let zoom = 1;
let selectedLayer = 'terrain';
let selectedTile;

const getTileXY = ({ screenX, screenY }) => {
  const x = screenX + getTileMap().scrollLeft - (tileSize / 2);
  const y = screenY + getTileMap().scrollTop + (tileSize / 4);

  const tileX = (x / tileSize) << 0;
  const tileY = (y / tileSize) << 0;

  return {
    x: tileX,
    y: tileY - 2
  };
};

// Configure palette (tile source images)

const TileImage = {
  terrain: {},
  canopy: {},
  light: {}
};

const Palette = {
  Terrain: [...Array(2).keys()],
  Canopy: [],
  Light: [...Array(10).keys()]
};

const loadImage = (id, tileSet) => {
  const img = new Image();

  img.src = `src/img/spr/${tileSet}/${id}.png`;

  TileImage[tileSet][id] = img.src;

  return img;
};

const createTileSet = namespace => {
  Palette[namespace] = (
    Palette[namespace]
      .map(tileId => (
        loadImage(tileId, namespace.toLowerCase())
      ))
  );
};

// Configure canvas

const getTileMap = () => document.getElementById('TileMap');

const terrainCanvas = document.createElement('canvas');
const canopyCanvas = document.createElement('canvas');
const lightCanvas = document.createElement('canvas');

const canvasWidth = '10000px';
const canvasHeight = '10000px';
const canvasPosition = 0;

terrainCanvas.setAttribute('id', 'Scene-terrain');
terrainCanvas.setAttribute('width', canvasWidth);
terrainCanvas.setAttribute('height', canvasHeight);
terrainCanvas.setAttribute('style', `left: ${canvasPosition}; top: ${canvasPosition};`);

canopyCanvas.setAttribute('id', 'Scene-canopy');
canopyCanvas.setAttribute('width', canvasWidth);
canopyCanvas.setAttribute('height', canvasHeight);
canopyCanvas.setAttribute('style', `left: ${canvasPosition}; top: ${canvasPosition};`);

lightCanvas.setAttribute('id', 'Scene-light');
lightCanvas.setAttribute('width', canvasWidth);
lightCanvas.setAttribute('height', canvasHeight);
lightCanvas.setAttribute('style', `left: ${canvasPosition}; top: ${canvasPosition};`);

getTileMap().appendChild(terrainCanvas);
getTileMap().appendChild(canopyCanvas);
getTileMap().appendChild(lightCanvas);

const terrainContext = terrainCanvas.getContext('2d', { alpha: false });
const canopyContext = canopyCanvas.getContext('2d', { alpha: true });
const lightContext = lightCanvas.getContext('2d', { alpha: true });

terrainContext.imageSmoothingQuality = 'high';
canopyContext.imageSmoothingQuality = 'high';
lightContext.imageSmoothingQuality = 'high';

// Application

const renderTerrain = () => TileMap2D({
  Palette: Palette.Terrain,
  startsAt: -1,
  zone: {
    tiles: Example.terrain,
    attributes: {
      tileSize,
      context: terrainContext
    }
  }
});

const renderCanopy = () => TileMap2D({
  Palette: Palette.Canopy,
  startsAt: 0,
  zone: {
    tiles: Example.canopy,
    attributes: {
      tileSize,
      context: canopyContext
    }
  }
});

const renderLight = () => TileMap2D({
  Palette: Palette.Light,
  startsAt: -1,
  zone: {
    tiles: Example.light,
    attributes: {
      tileSize,
      context: lightContext
    }
  }
});

const hideTerrain = () => (
  document.getElementById('Scene-terrain').setAttribute('class', 'hide')
);

const hideCanopy = () => (
  document.getElementById('Scene-canopy').setAttribute('class', 'hide')
);

const hideLight = () => (
  document.getElementById('Scene-light').setAttribute('class', 'hide')
);

const showTerrain = () => (
  document.getElementById('Scene-terrain').removeAttribute('class')
);

const showCanopy = () => (
  document.getElementById('Scene-canopy').removeAttribute('class')
);

const showLight = () => (
  document.getElementById('Scene-light').removeAttribute('class')
);

const showLayer = () => {
  document.getElementById('palette').innerHTML = '';

  Object.keys(TileImage[selectedLayer]).forEach(id => {
    document.getElementById('palette').innerHTML += (
      `<div class="tile" id="palette-tile-${id}">
        <img src=${TileImage[selectedLayer][id]} data-id=${id} width="100%" height="100%" />
      </div>`
    );

    requestAnimationFrame(() => {
      document.getElementById('layer-select').value = selectedLayer;
      document.getElementById(`palette-tile-${id}`).onclick = () => {
        selectedTile = id;
      };
    });
  });
};

const onLoad = () => {
  const buttons = document.getElementById('editor-buttons').children;

  buttons[0].onclick = () => {
    const element = document.getElementById('Scene-terrain');

    return element.className.match(/hide/) ? showTerrain() : hideTerrain();
  };

  buttons[1].onclick = () => {
    const element = document.getElementById('Scene-canopy');

    return element.className.match(/hide/) ? showCanopy() : hideCanopy();
  };

  buttons[2].onclick = () => {
    const element = document.getElementById('Scene-light');

    return element.className.match(/hide/) ? showLight() : hideLight();
  };

  getTileMap().onclick = ({ screenX, screenY }) => {
    const { x, y } = getTileXY({ screenX, screenY });

    if (selectedTile) {
      Example[selectedLayer][y][x] = selectedTile;
      selectedTile = null;

      renderTerrain();
    }
  };

  getTileMap().oncontextmenu = event => {
    event.preventDefault();

    const { screenX, screenY } = event;
    const { x, y } = getTileXY({ screenX, screenY });

    Example[selectedLayer][y][x] = 0;
  };

  document.getElementById('export').onclick = () => {
    console.log(Example[selectedLayer]);
  };

  document.getElementById('layer-select').onchange = event => {
    selectedLayer = event.target.value;

    showLayer();
  };

  requestAnimationFrame(() => {
    getTileMap().scrollTo(0, 0);
    createTileSet('Terrain');
    createTileSet('Canopy');
    createTileSet('Light');
    renderTerrain();
    renderCanopy();
    renderLight();
    showLayer();
  });
};

onLoad();
