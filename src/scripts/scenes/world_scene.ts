//import ChatScene from "./chat_scene";
import SimplexNoise from 'simplex-noise';
import * as dat from "dat.gui";
import Phaser from "phaser";
import {WorldInstance} from '../../classes/worldInstance';
import {NoiseHeight, NoiseLand, TerrainHeight, AssetSprite, Tiles, Tile, TerrainSubType} from '../../types/worldTypes';

export default class WorldScene extends Phaser.Scene {

    private noiseHeight : NoiseHeight = {
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

    private noiseLand : NoiseLand = {
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

    private world = new WorldInstance(
        'exothium',
        16,
        50,
        1.5,
        10,
        5,
        this.noiseHeight,
        this.noiseLand,
    );

    private generationDetails = new dat.GUI().addFolder("Generation Details");
    private graphics!: Phaser.GameObjects.Graphics;
    private mapTexture;
    private cloudTexture;
    private circleMapArea;

    private opts = {
        clouds_type_noise_mod: this.world.numberOfRings * 0.1,
        rings: this.world.numberOfRings,
        day: 1,
        timerAux: 0,
    };

    private setup() {
        this.world.reconstruct();
        this.drawTileMap();
        this.drawCloudMap();
    }

    preload() {
        this.graphics = this.add.graphics();
    }

    create() {
        this.generationDetails.open();

        let controllers = {
            worldSeed: this.world.worldSeed,
            landSize: this.world.landSize,
            numberOfRings: this.world.numberOfRings,
            shapeNoiseMod: this.world.shapeNoiseMod,
            tileTypeNoiseMod: this.world.tileTypeNoiseMod,
        };

        this.generationDetails.add(controllers, "worldSeed", "").onChange((value : string) => {
            this.world.worldSeed = value;
            this.setup();
        });

        this.generationDetails.add(controllers, "landSize", 0, 5).onChange((value: number) => {
            this.world.landSize = value;
            this.setup();
        });

        this.generationDetails.add(controllers, "numberOfRings", 0, 200).onChange((value: number) => {
            this.world.numberOfRings = value;
            this.setup();
        });

        this.generationDetails.add(controllers, "shapeNoiseMod", 0, 50).onChange((value: number) => {
            this.world.shapeNoiseMod = value;
            this.setup();
        });

        this.generationDetails.add(controllers, "tileTypeNoiseMod", 0, 50).onChange((value: number) => {
            this.world.tileTypeNoiseMod = value;
            this.setup();
        });


        this.generationDetails.add(this.opts, "clouds_type_noise_mod", 0, 35).onChange(() => this.setup());
        this.generationDetails.add(this.opts, "day", 1, 1000, 1).onChange(() => this.setup());

        this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (deltaY > 0) {
                var newZoom = this.cameras.main.zoom - 0.1;
                if (newZoom > 0) {
                    this.cameras.main.setZoom(newZoom);
                }
            }

            if (deltaY < 0) {
                var newZoom = this.cameras.main.zoom + 0.1;
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

        //sets camera to center of canvas
        this.cameras.main.scrollX = -this.world.canvasCenterX;
        this.cameras.main.scrollY = -this.world.canvasCenterY;

        this.setup();
    }

    update(time, delta) {
        this.opts.timerAux += delta;
        while (this.opts.timerAux > 1) {
            this.opts.day += 1;
            this.opts.timerAux = 0;
            this.generationDetails.updateDisplay();
            this.drawCloudMap();
        }
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
        let matrixXvalue = Math.ceil((x - day) / (this.world.hexRadius * 2));
        let matrixYvalue = Math.ceil((y - day) / (this.world.hexRadius * 2));

        let noiseMod = this.opts.clouds_type_noise_mod;

        let simplexNoiseValue = this.world.simplex.noise2D(
            Number(matrixXvalue / noiseMod),
            Number(matrixYvalue / noiseMod)
        );

        let value2d = this.world.map_function(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0);

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

    private drawHexTile(tile : Tile) {

        let x = tile.x;
        let y = tile.y;

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

    private drawHexCloud(tile : Tile) {
        let x = tile.x;
        let y = tile.y;
        let value2d = this.getCloudsNoise(x, y, 'clouds');
        let isCloud = this.getClouds(value2d);
        if (isCloud) {
            const frameAtari2 = this.textures.getFrame('atlas_clouds', 'clouds');
            this.cloudTexture.create(x - (Math.sqrt(3) * this.world.hexRadius / 2), y - this.world.hexRadius, frameAtari2);
        }
    }

    private mapInteractiveScene() {

        let text = this.add.text(0, 0, '').setStyle({
            fontSize: '19px'
        });


        this.circleMapArea = this.add.circle(0, 0, this.world.worldRadius).setInteractive();

        this.circleMapArea.on('pointermove', (pointer, localX, localY) => {
            let selectedHex = this.world.getAxialCoordinatesFromOffSetCoordinates(localX, localY);
            let tile = this.world.tiles[selectedHex.q + '_' + selectedHex.r];

            if (tile) {
                text.setScale( 1 / this.cameras.main.zoom, 1 / this.cameras.main.zoom );
                text.setText('Q: ' + tile.q + ', R: ' + tile.r + ', Type: ' + tile.terrainType + ', SubType: ' + tile.terrainSubType);
            } else {
                text.setText('No tile selected');
            }
            console.log(tile);
        });
    }
}
