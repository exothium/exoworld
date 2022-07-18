//import ChatScene from "./chat_scene";
import * as dat from "dat.gui";
import Phaser from "phaser";
import {WorldInstance} from '../classes/worldInstance';
import {
    AssetSprite,
    MoveTypes,
    NoiseHeight,
    NoiseLand,
    QrStruct,
    TerrainHeight,
    TerrainSubType
} from '../types/worldTypes';
import MainMenuScene from "./main_menu_scene";
import HudScene from "./hud_scene";
import {EntityPlayer} from "../classes/entityPlayer";
import {LivingStats, LivingType, PlayerStats} from "../types/entityTypes";
import {Tile} from "../classes/tile";
import {EntityTileSpawner} from "../classes/helperClasses/entityTileSpawner";
import {EntityObject} from "../classes/entityObject";
import {EntityCreature} from "../classes/entityCreature";

export default class WorldScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'WORLD_SCENE';

    private player_go!: Phaser.GameObjects.Image;
    private menuGUI;
    private graphics!: Phaser.GameObjects.Graphics;
    private mapTexture;
    private cloudTexture;
    private circleMapArea;
    private hudScene: HudScene;

    private noiseHeight: NoiseHeight = {
        [TerrainHeight.DEEPWATER]: {
            height: 0.1
        },
        [TerrainHeight.SHALLOWWATER]: {
            height: 0.2
        },
        [TerrainHeight.BEACH]: {
            height: 0.25
        },
        [TerrainHeight.LAND]: {
            height: 0.9
        },
        [TerrainHeight.MOUNTAIN]: {
            height: 1
        }
    };

    private noiseLand: NoiseLand = {
        desert: {
            height: 0.05
        },
        plain: {
            height: 0.5,
        },
        forest: {
            height: 0.85,
        },
        snow: {
            height: 0.9,
        },
        mountain: {
            height: 1,
        },
    };

    private world: WorldInstance;

    private opts = {
        clouds_type_noise_mod: 0,
        rings: 0,
        day: 1,
        timerAux: 0,
    };

    private player: EntityPlayer;

    constructor() {
        super(WorldScene.SCENE_KEY);
    }

    private setup() {
        this.world.reconstruct();
        this.drawTileMap();
        this.drawCloudMap();
    }

    preload() {
        this.graphics = this.add.graphics();
    }

    create(data) {

        this.world = new WorldInstance(
            data.worldSeed,
            16,
            data.numberOfRings,
            data.landSize,
            data.shapeNoiseMod,
            data.tileTypeNoiseMod,
            this.noiseHeight,
            this.noiseLand,
        );
        this.opts.clouds_type_noise_mod = this.world.numberOfRings * 0.1;
        this.opts.rings = this.world.numberOfRings * 0.1;

        //sets camera to center of canvas
        this.cameras.main.scrollX = -this.world.canvasCenterX;
        this.cameras.main.scrollY = -this.world.canvasCenterY;

        this.createHUD();
        this.createCameraInteraction();
        this.setup();
        this.createControls();

        this.spawnPlayer();
    }

    update(time, delta) {
        this.opts.timerAux += delta;
        while (this.opts.timerAux > 1000) {
            this.opts.day += 1;
            this.opts.timerAux = 0;
            this.menuGUI.updateDisplay();
            this.drawCloudMap();
        }
    }

    private createHUD() {
        this.hudScene = <HudScene>this.scene.get(HudScene.SCENE_KEY);
    }

    private createCameraInteraction() {
        this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (deltaY > 0) {
                let newZoom = this.cameras.main.zoom - 0.1;
                if (newZoom > 0) {
                    this.cameras.main.setZoom(newZoom);
                }
            }

            if (deltaY < 0) {
                let newZoom = this.cameras.main.zoom + 0.1;
                if (newZoom < 5) {
                    this.cameras.main.setZoom(newZoom);
                }
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown) return;

            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        });
    }

    private createControls() {
        this.menuGUI = new dat.GUI();

        let other = this.menuGUI.addFolder("Other");
        other.add({
            mainMenu: () => {
                this.menuGUI.destroy();
                this.scene.start(
                    MainMenuScene.SCENE_KEY,
                );
            }
        }, 'mainMenu');
        other.open();

        let generationDetails = this.menuGUI.addFolder("Other Generation Details");
        generationDetails.open();

        generationDetails.add(this.opts, "clouds_type_noise_mod", 0, 100).name("cloud noise").onChange(() => this.setup());
        generationDetails.add(this.opts, "day", 1, 365, 1).name("day").onChange(() => this.setup());

        // export enum MoveTypes {
        //     NO,
        //     O,
        //     SO,
        //     SW,
        //     W,
        //     NW
        // }

        let move = this.menuGUI.addFolder("Move");
        move.add({
            "↗": () => {
                this.movePlayer(MoveTypes.NO);
                console.log("Selected movement: ↗ ");
            }
        }, '↗');
        move.add({
            "→": () => {
                this.movePlayer(MoveTypes.O);
                console.log("Selected movement: → ");
            }
        }, '→');
        move.add({
            "↘": () => {
                this.movePlayer(MoveTypes.SO);
                console.log("Selected movement: ↘ ");
            }
        }, '↘');
        move.add({
            "↙": () => {
                this.movePlayer(MoveTypes.SW);
                console.log("Selected movement: ↙ ");
            }
        }, '↙');
        move.add({
            "←": () => {
                this.movePlayer(MoveTypes.W);
                console.log("Selected movement: ← ");
            }
        }, '←');
        move.add({
            "↖": () => {
                this.movePlayer(MoveTypes.NW);
                console.log("Selected movement: ↖ ");
            }
        }, '↖');
        move.open();

    }

    private movePlayer(direction: MoveTypes){
        const aux_player_location = this.player.location;
        this.world.movePlayer(this.player, direction);
        console.log("Move player from " + JSON.stringify(aux_player_location) + " to:" + JSON.stringify(this.player.location));

        this.hudScene.updatePlayerStats(this.player);
        this.renderPlayerOnScene();
    }

    private getClouds(n) {
        //n = map_range(n,-1,1,0,1);
        let v = Math.abs(parseFloat(n) * 255); //Math.abs(n * 255.0);
        //let v = 0.9*255;
        //height map
        let assetKey: string = '';
        if (v < 0.25 * 255) {
            return true
        } else {
            return false;
        }
    }

    private getCloudsNoise(x, y, type) {
        let day = this.opts.day;
        let matrixXvalue = Math.ceil((x - day * 50) / (this.world.hexRadius * 2));
        let matrixYvalue = Math.ceil((y - day * 50) / (this.world.hexRadius * 2));

        let noiseMod = this.opts.clouds_type_noise_mod;

        let simplexNoiseValue = this.world.simplex.noise2D(
            Number(matrixXvalue / noiseMod),
            Number(matrixYvalue / noiseMod)
        );

        let value2d = this.world.mapFunction(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0);

        return value2d;
    }

    private drawTileMap() {
        let tiles = this.world.tiles;

        this.mapTexture && this.mapTexture.destroy();
        this.mapTexture = this.add.blitter(0, 0, 'atlas_tiles');

        for (let key in tiles) {
            this.drawHexTile(tiles[key]);
        }

        this.mapInteractiveScene();
    }

    private drawCloudMap() {
        let tiles = this.world.tiles;

        this.cloudTexture && this.cloudTexture.destroy();
        this.cloudTexture = this.add.blitter(0, 0, 'atlas_clouds').setAlpha(0.4);

        for (let key in tiles) {
            this.drawHexCloud(tiles[key]);
        }
    }

    private drawHexTile(tile: Tile) {
        let XYTile = tile.positionXY;
        let x = XYTile.x;
        let y = XYTile.y;

        let terrainKey;
        switch (tile.terrainSubType) {
            case TerrainSubType.DEEPWATER:
                terrainKey = AssetSprite.DARKWATER;
                break;
            case TerrainSubType.SHALLOWWATER:
                terrainKey = AssetSprite.LIGHTWATER;
                break;
            case TerrainSubType.BEACH:
                terrainKey = AssetSprite.DESERT;
                break;
            case TerrainSubType.DESERT:
                terrainKey = AssetSprite.DESERT;
                break;
            case TerrainSubType.PLAIN:
                terrainKey = AssetSprite.PLAIN;
                break;
            case TerrainSubType.FOREST:
                terrainKey = AssetSprite.FOREST;
                break;
            case TerrainSubType.SNOW:
                terrainKey = AssetSprite.SNOW;
                break;
            case TerrainSubType.MOUNTAIN:
                terrainKey = AssetSprite.MOUNTAIN;
                break;
            default:
                console.log(tile.terrainSubType + ' has no asset to display.')
        }

        const frameAtari = this.textures.getFrame('atlas_tiles', terrainKey);
        this.mapTexture.create(x - (Math.sqrt(3) * this.world.hexRadius / 2), y - this.world.hexRadius, frameAtari);
    }

    private drawHexCloud(tile: Tile) {
        let XYTile = tile.positionXY;
        let x = XYTile.x;
        let y = XYTile.y;
        let value2d = this.getCloudsNoise(x, y, 'clouds');
        let isCloud = this.getClouds(value2d);
        if (isCloud) {
            const frameAtari2 = this.textures.getFrame('atlas_clouds', 'clouds');
            this.cloudTexture.create(x - (Math.sqrt(3) * this.world.hexRadius / 2), y - this.world.hexRadius, frameAtari2);
        }
    }

    private mapInteractiveScene() {
        this.circleMapArea = this.add.circle(0, 0, this.world.worldRadius).setInteractive();
        this.circleMapArea.on('pointermove', (pointer, localX, localY) => {
            let selectedHex = this.world.getAxialCoordinatesFromOffSetCoordinates(localX, localY);
            let tile = this.world.tiles[selectedHex.q + '_' + selectedHex.r];
            this.hudScene.updateTileInfo(tile);
        });
    }

    private spawnPlayer() {
        let livingStats: LivingStats = {hp: 100, stamina: 100};
        let name: string = "Angelo";
        let location: QrStruct = {q: 0, r: 0};
        let isInGame = true;
        let playerStats: PlayerStats = {hunger: 0};
        this.player = new EntityPlayer(
            livingStats,
            name,
            location,
            isInGame,
            playerStats
        );

        this.hudScene.updatePlayerStats(this.player);

        //create game object and send it to position
        let tile : Tile = this.world.getTile(this.player.location);
        tile.isExplored = true;
        let tileEntities : { entityObjects: EntityObject [], entityCreatures: EntityCreature[] } = EntityTileSpawner.entitiesOnTile(tile.terrainType);
        tile.entityObjects = tileEntities.entityObjects;
        tile.entityCreatures = tileEntities.entityCreatures;
        this.player_go = this.add.image(tile.positionXY.x, tile.positionXY.y,"punk");
    }

    private renderPlayerOnScene() {
        let tile = this.world.getTile(this.player.location);
        this.player_go.x = tile.positionXY.x;
        this.player_go.y = tile.positionXY.y;
    }
}
