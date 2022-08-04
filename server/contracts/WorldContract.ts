import SimplexNoise from 'simplex-noise'
import { AssetSprite, QrStruct, TerrainHeight, TerrainSubType, TerrainType, Tiles } from '../../src/types/worldTypes'
import { Tile } from '../../src/classes/tile'
import { CanvasSettings, NoiseHeightDefaults, NoiseLandDefaults } from '../../src/types/gameConstants'

export class WorldContract {
  private readonly _canvasCenterX: number = CanvasSettings.width / 2
  private readonly _canvasCenterY: number = CanvasSettings.height / 2
  private _hexRadius: number
  private _tiles: { [key: string]: Tile }

  private _simplex
  private _worldSeed: string
  private _worldRadius: number
  private _numberOfRings: number
  private _landSize: number
  private _shapeNoiseMod: number
  private _tileTypeNoiseMod: number

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor() {}

  //Create a world based on parameters
  public create(
    worldSeed: string,
    hexRadius: number,
    numberOfRings: number,
    landSize: number,
    shapeNoiseMod: number,
    tileTypeNoiseMod: number
  ) {
    //todo is valid?
    this._worldSeed = worldSeed
    this._hexRadius = hexRadius
    this._numberOfRings = numberOfRings
    this._landSize = landSize
    this._shapeNoiseMod = shapeNoiseMod
    this._tileTypeNoiseMod = tileTypeNoiseMod
    this._worldRadius = hexRadius * numberOfRings * Math.sqrt(3) + (hexRadius / 2) * Math.sqrt(3)

    this._simplex = new SimplexNoise(this._worldSeed)
    this.setTileCoordinates() //spawns tiles and entities
  }

  public getWorldData() {
    return {
      worldSeed: this._worldSeed,
      hexRadius: this._hexRadius,
      numberOfRings: this._numberOfRings,
      landSize: this._landSize,
      shapeNoiseMod: this._shapeNoiseMod,
      tileTypeNoiseMod: this._tileTypeNoiseMod,
      worldRadius: this._worldRadius
    }
  }

  get canvasCenterX(): number {
    return this._canvasCenterX
  }

  get canvasCenterY(): number {
    return this._canvasCenterY
  }

  get tiles(): Tiles {
    return this._tiles
  }

  set tiles(tiles: Tiles) {
    this._tiles = tiles
  }

  public setTileCoordinates() {
    const x = 0
    const y = 0
    const tiles: object = {}

    //center tile coordinates
    let currenthexQR = this.getInitialHexAxialCoordinates(x, y)
    tiles[currenthexQR.q + '_' + currenthexQR.r] = { x: x, y: y, q: currenthexQR.q, r: currenthexQR.r }

    const centerToCloseBorder = this._hexRadius * Math.sqrt(3)
    const radians = Math.PI / 180

    let countHex = 0
    for (let i = 1; i <= this._numberOfRings; i++) {
      for (let j = 0; j < 6; j++) {
        const diagonalX = x + Math.cos(j * 60 * radians) * centerToCloseBorder * i
        const diagonalY = y + Math.sin(j * 60 * radians) * centerToCloseBorder * i
        currenthexQR = this.getInitialHexAxialCoordinates(diagonalX, diagonalY)
        tiles[currenthexQR.q + '_' + currenthexQR.r] = {
          x: diagonalX,
          y: diagonalY,
          q: currenthexQR.q,
          r: currenthexQR.r
        }
        countHex++
        for (let k = 1; k < i; k++) {
          const fillX = diagonalX + Math.cos((j * 60 + 120) * radians) * centerToCloseBorder * k
          const fillY = diagonalY + Math.sin((j * 60 + 120) * radians) * centerToCloseBorder * k
          currenthexQR = this.getInitialHexAxialCoordinates(fillX, fillY)
          tiles[currenthexQR.q + '_' + currenthexQR.r] = {
            x: fillX,
            y: fillY,
            q: currenthexQR.q,
            r: currenthexQR.r
          }
          countHex++
        }
      }
    }
    this.populateTileTerrainType(tiles)
  }

  public getTile(qr: QrStruct): Tile {
    return this._tiles[qr.q + '_' + qr.r]
  }

  private populateTileTerrainType(tiles) {
    for (const key in tiles) {
      let value2d = this.getTileMapNoise(tiles[key].x, tiles[key].y, 'height')
      const terrainHeight = this.terrainHeight(value2d)

      let terrainType
      let terrainSubType
      let terrainAssetKey

      switch (terrainHeight) {
        case TerrainHeight.DEEPWATER:
          terrainType = TerrainType.WATER
          terrainSubType = TerrainSubType.DEEPWATER
          terrainAssetKey = AssetSprite.DARKWATER
          break
        case TerrainHeight.SHALLOWWATER:
          terrainType = TerrainType.WATER
          terrainSubType = TerrainSubType.SHALLOWWATER
          terrainAssetKey = AssetSprite.LIGHTWATER
          break
        case TerrainHeight.BEACH:
          terrainType = TerrainType.DESERT
          terrainSubType = TerrainSubType.BEACH
          terrainAssetKey = AssetSprite.DESERT
          break
        case TerrainHeight.LAND:
          //if Land we use a new noise for creating more caotic tiles on land
          value2d = this.getTileMapNoise(tiles[key].x, tiles[key].y, 'terrainType')
          terrainType = this.terrainTypeOnLand(value2d)
          terrainSubType = terrainType
          break
        case TerrainHeight.MOUNTAIN:
          terrainType = TerrainType.MOUNTAIN
          terrainSubType = TerrainSubType.MOUNTAIN
          terrainAssetKey = AssetSprite.MOUNTAIN
          break
        default:
          console.log(terrainHeight + ' has no asset to display.')
      }

      tiles[key] = new Tile(
        tiles[key].q,
        tiles[key].r,
        tiles[key].x,
        tiles[key].y,
        terrainType,
        terrainSubType,
        false,
        [],
        []
      )
    }
    this._tiles = tiles
  }

  private calculateQR(x, y): QrStruct {
    const qr: QrStruct = {
      q: 0,
      r: 0
    }

    qr.q = Math.round(((Math.sqrt(3) / 3) * x - y / 3) / this._hexRadius)
    qr.r = Math.round((y * 2) / 3 / this._hexRadius)

    return qr
  }

  private getInitialHexAxialCoordinates(x_, y_): QrStruct {
    const spaceX = Math.round(x_)
    const spaceY = Math.round(y_)
    return this.calculateQR(spaceX, spaceY)
  }

  private terrainHeight(n): string {
    const v = Math.abs(parseFloat(n) * 255)
    let assetKey = ''
    if (v < NoiseHeightDefaults[TerrainHeight.DEEPWATER].height * 255) {
      assetKey = TerrainHeight.DEEPWATER
    } else if (v < NoiseHeightDefaults[TerrainHeight.SHALLOWWATER].height * 255) {
      assetKey = TerrainHeight.SHALLOWWATER
    } else if (v < NoiseHeightDefaults[TerrainHeight.BEACH].height * 255) {
      assetKey = TerrainHeight.BEACH
    } else if (v < NoiseHeightDefaults[TerrainHeight.LAND].height * 255) {
      assetKey = TerrainHeight.LAND
    } else {
      assetKey = TerrainHeight.MOUNTAIN
    }

    return assetKey
  }

  private terrainTypeOnLand(n): TerrainType {
    const v = Math.abs(parseFloat(n) * 255)
    let terrainType: TerrainType

    if (v < NoiseLandDefaults[TerrainType.DESERT].height * 255) {
      terrainType = TerrainType.DESERT
    } else if (v < NoiseLandDefaults[TerrainType.PLAIN].height * 255) {
      terrainType = TerrainType.PLAIN
    } else if (v < NoiseLandDefaults[TerrainType.FOREST].height * 255) {
      terrainType = TerrainType.FOREST
    } else if (v < NoiseLandDefaults[TerrainType.SNOW].height * 255) {
      terrainType = TerrainType.SNOW
    } else {
      terrainType = TerrainType.MOUNTAIN
    }

    return terrainType
  }

  private getTileMapNoise(x, y, type): number {
    const r = this._hexRadius
    const matrixXvalue = Math.ceil((x + this.canvasCenterX) / (this._hexRadius * 2))
    const matrixYvalue = Math.ceil((y - r + this.canvasCenterY) / (this._hexRadius * 2))
    const matrixWidth = Math.ceil(CanvasSettings.width / (this._hexRadius * 2))
    const matrixHeight = Math.ceil(CanvasSettings.height / (this._hexRadius * 2))

    let noiseMod = 0
    if (type === 'height') {
      noiseMod = this._shapeNoiseMod
    } else if (type === 'terrainType') {
      noiseMod = this._tileTypeNoiseMod
    }

    const simplexNoiseValue = this._simplex.noise2D(Number(matrixXvalue / noiseMod), Number(matrixYvalue / noiseMod))

    let value2d = this.mapFunction(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0)

    const dist = Math.sqrt(Math.pow(matrixXvalue - matrixWidth / 2, 2) + Math.pow(matrixYvalue - matrixHeight / 2, 2))

    const grad = dist / (this._landSize * Math.min(matrixWidth, matrixHeight))

    value2d -= Math.pow(grad, 3)
    value2d = Math.max(value2d, 0)

    return value2d
  }

  private mapFunction(value, in_min, in_max, out_min, out_max): number {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  }
}
