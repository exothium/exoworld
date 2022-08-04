import {
    AssetSprite,
    Directions,
    Neighbors,
    NoiseHeight,
    NoiseLand,
    QrStruct,
    TerrainHeight,
    TerrainSubType,
    TerrainType,
    Tiles
} from '../types/worldTypes';
import { CanvasSettings, NoiseHeightDefaults, NoiseLandDefaults } from '../types/gameConstants'
import {Tile} from './tile';
import SimplexNoise from 'simplex-noise';
import {EntityTileSpawner} from './helperClasses/entityTileSpawner';
import {EntityPlayer} from "./entityPlayer";
import {EntityObject} from "./entityObject";
import {EntityCreature} from "./entityCreature";
import world_scene from "../phaser/scenes/world_scene";
import {LivingStats, PlayerStats} from "../types/entityTypes";

export class WorldInstance {
  private readonly _canvasCenterX: number = CanvasSettings.width / 2
  private readonly _canvasCenterY: number = CanvasSettings.height / 2
  private readonly _hexRadius: number
  private _tiles: { [key: string]: Tile }
  private _player: EntityPlayer
  private _simplex

  private _worldSeed: string
  private _worldRadius: number
  private _numberOfRings: number
  private _landSize: number
  private _shapeNoiseMod: number
  private _tileTypeNoiseMod: number

  public constructor(
    worldSeed: string,
    hexRadius: number,
    numberOfRings: number,
    landSize: number,
    shapeNoiseMod: number,
    tileTypeNoiseMod: number
  ) {
    this._worldSeed = worldSeed
    this._hexRadius = hexRadius
    this._numberOfRings = numberOfRings
    this._landSize = landSize
    this._shapeNoiseMod = shapeNoiseMod
    this._tileTypeNoiseMod = tileTypeNoiseMod
    this._worldRadius = hexRadius * numberOfRings * Math.sqrt(3) + (hexRadius / 2) * Math.sqrt(3)

    //populate tiles
    this._simplex = new SimplexNoise(this.worldSeed)
    this.setTileCoordinates() //spawns tiles and entities
    this.spawnPlayer()
  }

  get canvasCenterX(): number {
    return this._canvasCenterX
  }

  get canvasCenterY(): number {
    return this._canvasCenterY
  }

  get worldSeed(): string {
    return this._worldSeed
  }

  set worldSeed(worldSeed: string) {
    this._worldSeed = worldSeed
    this._simplex = new SimplexNoise(this.worldSeed)
  }

  get worldRadius(): number {
    return this._worldRadius
  }

  get hexRadius(): number {
    return this._hexRadius
  }

  get numberOfRings(): number {
    return this._numberOfRings
  }

  set numberOfRings(numberOfRings: number) {
    this._numberOfRings = numberOfRings
  }

  get landSize(): number {
    return this._landSize
  }

  set landSize(landSize: number) {
    this._landSize = landSize
  }

  get shapeNoiseMod(): number {
    return this._shapeNoiseMod
  }

  set shapeNoiseMod(shapeNoiseMod: number) {
    this._shapeNoiseMod = shapeNoiseMod
  }

  get tileTypeNoiseMod(): number {
    return this._tileTypeNoiseMod
  }

  set tileTypeNoiseMod(tileTypeNoiseMod: number) {
    this._tileTypeNoiseMod = tileTypeNoiseMod
  }

  get tiles(): Tiles {
    return this._tiles
  }

  set tiles(tiles: Tiles) {
    this._tiles = tiles
  }

  get simplex() {
    return this._simplex
  }

  set simplex(simplex) {
    this._simplex = simplex
  }

  public reconstruct() {
    this.setTileCoordinates()
    this.spawnPlayer()
  }

  public setTileCoordinates() {
    const x = 0
    const y = 0
    const tiles: object = {}

    //center tile coordinates
    let currenthexQR = this.getInitialHexAxialCoordinates(x, y)
    tiles[currenthexQR.q + '_' + currenthexQR.r] = { x: x, y: y, q: currenthexQR.q, r: currenthexQR.r }

    const centerToCloseBorder = this.hexRadius * Math.sqrt(3)
    const radians = Math.PI / 180

    let countHex = 0
    for (let i = 1; i <= this.numberOfRings; i++) {
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

  public getTileNeighbors(qr: QrStruct): Neighbors[] {
    const neighborTiles: Neighbors[] = [
      { direction: Directions.NW, tile: this.getTile({ q: qr.q, r: qr.r - 1 }) },
      { direction: Directions.NE, tile: this.getTile({ q: qr.q + 1, r: qr.r - 1 }) },
      { direction: Directions.E, tile: this.getTile({ q: qr.q + 1, r: qr.r }) },
      { direction: Directions.SE, tile: this.getTile({ q: qr.q, r: qr.r + 1 }) },
      { direction: Directions.SW, tile: this.getTile({ q: qr.q - 1, r: qr.r + 1 }) },
      { direction: Directions.W, tile: this.getTile({ q: qr.q - 1, r: qr.r }) }
    ]

    return neighborTiles
  }

  public isPlayerNeighbor(qr: QrStruct) {
    const playerLocation = this.player.location
    const playerNeighbors = this.getTileNeighbors(playerLocation)
    let direction: Directions | null = null

    for (let i = 0; i < playerNeighbors.length; i++) {
      if (qr.q === playerNeighbors[i].tile.positionQR.q && qr.r === playerNeighbors[i].tile.positionQR.r) {
        direction = playerNeighbors[i].direction
      }
    }

    return { result: direction !== null, direction: direction }
  }

  //populate
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

  private spawnPlayer() {
    const livingStats: LivingStats = { hp: 100, stamina: 100 }
    const name = 'Angelo'
    const location: QrStruct = { q: 0, r: 0 }
    const isInGame = true
    const playerStats: PlayerStats = { hunger: 0 }
    this._player = new EntityPlayer(livingStats, name, location, isInGame, playerStats)

    //create game object and send it to position
    const tile: Tile = this.getTile(this._player.location)
    tile.isExplored = true
    const tileEntities: { entityObjects: EntityObject[]; entityCreatures: EntityCreature[] } =
      EntityTileSpawner.entitiesOnTile(tile.terrainType)
    tile.entityObjects = tileEntities.entityObjects
    tile.entityCreatures = tileEntities.entityCreatures
  }

  get player() {
    return this._player
  }

  private calculateQR(x, y): QrStruct {
    const qr: QrStruct = {
      q: 0,
      r: 0
    }

    qr.q = Math.round(((Math.sqrt(3) / 3) * x - y / 3) / this.hexRadius)
    qr.r = Math.round((y * 2) / 3 / this.hexRadius)

    return qr
  }

  private getInitialHexAxialCoordinates(x_, y_): QrStruct {
    const spaceX = Math.round(x_)
    const spaceY = Math.round(y_)
    return this.calculateQR(spaceX, spaceY)
  }

  public getAxialCoordinatesFromOffSetCoordinates(x_, y_): QrStruct {
    const spaceX = Math.round(x_ - this._worldRadius)
    const spaceY = Math.round(y_ - this._worldRadius)
    return this.calculateQR(spaceX, spaceY)
  }

  public terrainHeight(n): string {
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

  public terrainTypeOnLand(n): TerrainType {
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

  public getTileMapNoise(x, y, type): number {
    const r = this.hexRadius
    const matrixXvalue = Math.ceil((x + this.canvasCenterX) / (this.hexRadius * 2))
    const matrixYvalue = Math.ceil((y - r + this.canvasCenterY) / (this.hexRadius * 2))
    const matrixWidth = Math.ceil(CanvasSettings.width / (this.hexRadius * 2))
    const matrixHeight = Math.ceil(CanvasSettings.height / (this.hexRadius * 2))

    let noiseMod = 0
    if (type === 'height') {
      noiseMod = this.shapeNoiseMod
    } else if (type === 'terrainType') {
      noiseMod = this.tileTypeNoiseMod
    }

    const simplexNoiseValue = this._simplex.noise2D(Number(matrixXvalue / noiseMod), Number(matrixYvalue / noiseMod))

    let value2d = this.mapFunction(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0)

    const dist = Math.sqrt(Math.pow(matrixXvalue - matrixWidth / 2, 2) + Math.pow(matrixYvalue - matrixHeight / 2, 2))

    const grad = dist / (this.landSize * Math.min(matrixWidth, matrixHeight))

    value2d -= Math.pow(grad, 3)
    value2d = Math.max(value2d, 0)

    return value2d
  }

  public mapFunction(value, in_min, in_max, out_min, out_max): number {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  }

  public movePlayer(direction: Directions) {
    const location = <QrStruct>this.player.location
    let wantedLocation: QrStruct = {
      q: 0,
      r: 0
    }
    switch (direction) {
      case Directions.NE:
        wantedLocation = {
          q: location.q + 1,
          r: location.r - 1
        }
        break
      case Directions.E:
        wantedLocation = {
          q: location.q + 1,
          r: location.r
        }
        break
      case Directions.SE:
        wantedLocation = {
          q: location.q,
          r: location.r + 1
        }
        break
      case Directions.SW:
        wantedLocation = {
          q: location.q - 1,
          r: location.r + 1
        }
        break
      case Directions.W:
        wantedLocation = {
          q: location.q - 1,
          r: location.r
        }
        break
      case Directions.NW:
        wantedLocation = {
          q: location.q,
          r: location.r - 1
        }
        break
    }
    const targetTile: Tile = this.getTile(wantedLocation)

    if (targetTile.terrainType !== TerrainType.WATER) {
      //can move
      this.player.location = wantedLocation
      if (!targetTile.isExplored) {
        const tileEntities: { entityObjects: EntityObject[]; entityCreatures: EntityCreature[] } =
          EntityTileSpawner.entitiesOnTile(targetTile.terrainType)
        targetTile.entityObjects = tileEntities.entityObjects
        targetTile.entityCreatures = tileEntities.entityCreatures
        targetTile.isExplored = true
      }
    } else {
      //cant move
      this.player.location = location
      console.log('Player cant move to water tile')
    }
  }
}
