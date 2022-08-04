//import ChatScene from "./chat_scene";
import * as dat from 'dat.gui'
import Phaser from 'phaser'
import { WorldInstance } from '../classes/worldInstance'
import {
  AssetSprite,
  Directions,
  NoiseHeight,
  NoiseLand,
  QrStruct,
  TerrainHeight,
  TerrainSubType
} from '../types/worldTypes'
import MainMenuScene from './main_menu_scene'
import HudScene from './hud_scene/hud_scene'
import { Tile } from '../classes/tile'
import TileWindowScene from './hud_scene/sub_scenes/tile_window_scene'
import { NoiseHeightDefaults, NoiseLandDefaults } from '../types/gameConstants'
import ChatListener from '../scripts/chat/chat_listener'
import ChatService from '../scripts/chat/chat_service'
import ExothiumWorldClient from '../scripts/ExothiumWorldClient'

export default class WorldScene extends Phaser.Scene {
  static readonly SCENE_KEY = 'WORLD_SCENE'

  private playerAsset!: Phaser.GameObjects.Image
  private menuGUI
  private graphics!: Phaser.GameObjects.Graphics
  private mapTexture
  private cloudTexture
  private circleMapArea
  private hudScene: HudScene
  private tileWindowScene: TileWindowScene
  private exothiumWorldClient: ExothiumWorldClient

  public world: WorldInstance

  private opts = {
    clouds_type_noise_mod: 0,
    rings: 0,
    day: 1,
    timerAux: 0
  }

  constructor() {
    super(WorldScene.SCENE_KEY)
  }

  private setup(reconstruct) {
    reconstruct && this.world.reconstruct()
    this.drawTileMap()
    this.drawCloudMap()
    this.renderPlayerOnScene()
  }

  preload() {
    this.graphics = this.add.graphics()
  }

  create(data) {
    alert(data.dimensionNumber)
    if (data.dimensionNumber) {
      alert('lets load this shit')
      this.exothiumWorldClient = new ExothiumWorldClient('192.168.0.64', 1337, () => {
        //im ready

        this.exothiumWorldClient.getWorldParameters(data.dimensionNumber, worldParameters => {
          alert('Loading Dimension:' + data.dimensionNumber + ' seed:' + worldParameters.worldSeed)
          this.world = new WorldInstance(
            worldParameters.worldSeed,
            worldParameters.hexRadius,
            worldParameters.numberOfRings,
            worldParameters.landSize,
            worldParameters.shapeNoiseMod,
            worldParameters.tileTypeNoiseMod
          )

          // continue
          this.opts.clouds_type_noise_mod = this.world.numberOfRings * 0.1
          this.opts.rings = this.world.numberOfRings * 0.1

          //sets camera to center of canvas
          this.cameras.main.scrollX = -this.world.canvasCenterX
          this.cameras.main.scrollY = -this.world.canvasCenterY

          this.createHUD()
          this.createCameraInteraction()
          this.setup(true)
          this.createControls()
        })
      })
    } else {
      this.exothiumWorldClient = new ExothiumWorldClient('192.168.0.64', 1337, () => {
        this.exothiumWorldClient.newDimension('0.0.0', dimensionNumber => {
          this.exothiumWorldClient.createWorld(
            dimensionNumber,
            data.worldSeed,
            16,
            data.numberOfRings,
            data.landSize,
            data.shapeNoiseMod,
            data.tileTypeNoiseMod,
            status => {
              this.world = new WorldInstance(
                data.worldSeed,
                16,
                data.numberOfRings,
                data.landSize,
                data.shapeNoiseMod,
                data.tileTypeNoiseMod
              )

              // continue
              this.opts.clouds_type_noise_mod = this.world.numberOfRings * 0.1
              this.opts.rings = this.world.numberOfRings * 0.1

              //sets camera to center of canvas
              this.cameras.main.scrollX = -this.world.canvasCenterX
              this.cameras.main.scrollY = -this.world.canvasCenterY

              this.createHUD()
              this.createCameraInteraction()
              this.setup(false)
              this.createControls()
            }
          )
        })
      })
    }

    // this.world = new WorldInstance(
    //   data.worldSeed,
    //   16,
    //   data.numberOfRings,
    //   data.landSize,
    //   data.shapeNoiseMod,
    //   data.tileTypeNoiseMod
    // )
    // this.opts.clouds_type_noise_mod = this.world.numberOfRings * 0.1
    // this.opts.rings = this.world.numberOfRings * 0.1
    //
    //sets camera to center of canvas
    //this.cameras.main.scrollX = -this.world.canvasCenterX
    //this.cameras.main.scrollY = -this.world.canvasCenterY
    //
    this.createHUD()
    this.createCameraInteraction()
    //this.setup(false)
    this.createControls()
  }

  update(time, delta) {
    this.opts.timerAux += delta
    while (this.opts.timerAux > 1000) {
      this.opts.day += 1
      this.opts.timerAux = 0
      this.menuGUI.updateDisplay()
      this.drawCloudMap()
    }
  }

  private createHUD() {
    this.hudScene = <HudScene>this.scene.get(HudScene.SCENE_KEY)
    this.tileWindowScene = <TileWindowScene>this.scene.get(TileWindowScene.SCENE_KEY)
  }

  private createCameraInteraction() {
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (deltaY > 0) {
        const newZoom = this.cameras.main.zoom - 0.1
        if (newZoom > 0) {
          this.cameras.main.setZoom(newZoom)
        }
      }

      if (deltaY < 0) {
        const newZoom = this.cameras.main.zoom + 0.1
        if (newZoom < 5) {
          this.cameras.main.setZoom(newZoom)
        }
      }
    })

    this.input.on('pointermove', pointer => {
      if (!pointer.isDown) return

      this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom
      this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom
    })
  }

  private createControls() {
    this.menuGUI = new dat.GUI()

    const other = this.menuGUI.addFolder('Other')
    other.add(
      {
        mainMenu: () => {
          this.menuGUI.destroy()
          this.children.removeAll()
          this.hudScene.children.removeAll()
          this.tileWindowScene.children.removeAll()
          this.scene.start(MainMenuScene.SCENE_KEY)
          console.log(this.children)
        }
      },
      'mainMenu'
    )
    other.open()

    const generationDetails = this.menuGUI.addFolder('Other Generation Details')
    generationDetails.open()

    generationDetails
      .add(this.opts, 'clouds_type_noise_mod', 0, 100)
      .name('cloud noise')
      .onChange(() => this.setup(true))
    generationDetails
      .add(this.opts, 'day', 1, 365, 1)
      .name('day')
      .onChange(() => this.setup(true))
  }

  private getClouds(n) {
    //n = map_range(n,-1,1,0,1);
    const v = Math.abs(parseFloat(n) * 255) //Math.abs(n * 255.0);
    //let v = 0.9*255;
    //height map
    const assetKey = ''
    if (v < 0.15 * 255) {
      return 'cloud1'
    } else if (v < 0.3 * 255) {
      return 'cloud2'
    } else {
      return false
    }
  }

  private getCloudsNoise(x, y, type) {
    const day = this.opts.day
    const matrixXvalue = Math.ceil((x - day * 50) / (this.world.hexRadius * 2))
    const matrixYvalue = Math.ceil((y - day * 50) / (this.world.hexRadius * 2))

    const noiseMod = this.opts.clouds_type_noise_mod

    const simplexNoiseValue = this.world.simplex.noise2D(
      Number(matrixXvalue / noiseMod),
      Number(matrixYvalue / noiseMod)
    )

    const value2d = this.world.mapFunction(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0)

    return value2d
  }

  private drawTileMap() {
    const tiles = this.world.tiles

    this.mapTexture && this.mapTexture.destroy()
    this.mapTexture = this.add.blitter(0, 0, 'atlas_tiles')

    for (const key in tiles) {
      this.drawHexTile(tiles[key])
    }

    this.mapInteractiveScene()
  }

  private drawCloudMap() {
    const tiles = this.world.tiles

    this.cloudTexture && this.cloudTexture.destroy()
    this.cloudTexture = this.add.blitter(0, 0, 'atlas_clouds').setAlpha(0.6)

    for (const key in tiles) {
      this.drawHexCloud(tiles[key])
    }
  }

  private drawHexTile(tile: Tile) {
    const XYTile = tile.positionXY
    const x = XYTile.x
    const y = XYTile.y

    let terrainKey
    switch (tile.terrainSubType) {
      case TerrainSubType.DEEPWATER:
        terrainKey = AssetSprite.DARKWATER
        break
      case TerrainSubType.SHALLOWWATER:
        terrainKey = AssetSprite.LIGHTWATER
        break
      case TerrainSubType.BEACH:
        terrainKey = AssetSprite.DESERT
        break
      case TerrainSubType.DESERT:
        terrainKey = AssetSprite.DESERT
        break
      case TerrainSubType.PLAIN:
        terrainKey = AssetSprite.PLAIN
        break
      case TerrainSubType.FOREST:
        terrainKey = AssetSprite.FOREST
        break
      case TerrainSubType.SNOW:
        terrainKey = AssetSprite.SNOW
        break
      case TerrainSubType.MOUNTAIN:
        terrainKey = AssetSprite.MOUNTAIN
        break
      default:
        console.log(tile.terrainSubType + ' has no asset to display.')
    }

    const frameAtari = this.textures.getFrame('atlas_tiles', terrainKey)
    this.mapTexture.create(x - (Math.sqrt(3) * this.world.hexRadius) / 2, y - this.world.hexRadius, frameAtari)
  }

  private drawHexCloud(tile: Tile) {
    const XYTile = tile.positionXY
    const x = XYTile.x
    const y = XYTile.y
    const value2d = this.getCloudsNoise(x, y, 'clouds')
    const cloud = this.getClouds(value2d)
    if (cloud) {
      const frameAtari2 = this.textures.getFrame('atlas_clouds', cloud)
      this.cloudTexture.create(x - (Math.sqrt(3) * this.world.hexRadius) / 2, y - this.world.hexRadius, frameAtari2)
    }
  }

  private mapInteractiveScene() {
    this.circleMapArea = this.add.circle(0, 0, this.world.worldRadius).setInteractive()
    this.circleMapArea.on('pointerdown', (pointer, localX, localY) => {
      const selectedHex = this.world.getAxialCoordinatesFromOffSetCoordinates(localX, localY)
      const tile = this.world.tiles[selectedHex.q + '_' + selectedHex.r]
      this.hudScene.tileInfoScene.updateTileInfo(tile)
    })
  }

  public renderPlayerOnScene() {
    const player = this.world.player
    this.hudScene.updatePlayerStats(player)
    const tile = this.world.getTile(this.world.player.location)
    if (this.playerAsset) {
      this.playerAsset.removeFromDisplayList()
    }
    this.playerAsset = this.add.image(tile.positionXY.x, tile.positionXY.y, 'punk')
    this.playerAsset.x = tile.positionXY.x
    this.playerAsset.y = tile.positionXY.y
  }
}
