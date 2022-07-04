//import ChatScene from "./chat_scene";
import SimplexNoise from 'simplex-noise';
import * as dat from "dat.gui";
import Phaser from "phaser";
import { World } from '../../classes/world';

export default class WorldScene extends Phaser.Scene {

    private world = new World(
        'exothium',
        16,
        50,
        1.5,
        10,
        5,
    );

    private generationDetails = new dat.GUI().addFolder("Generation Details");
    private graphics!: Phaser.GameObjects.Graphics;
    private simplex;
    private mapTexture;
    private cloudTexture;
    private circleMapArea;
    private terrainHeights = {
        deepWater: {
            height: 0.1
        },
        shallowWater: {
            height: 0.2
        },
        beach: { //treated as desert
            height: 0.25
        },
        land: {
            height: 0.9
        },
        mountain: {
            height: 1
        }
    };

    private timerAux = 0;

    private opts = {
        clouds_type_noise_mod: this.world.numberOfRings * 0.1,
        // Initial Height Ranges
        desert_height: 0.05,
        plain_height: 0.5,
        forest_height: 0.85,
        snow_height: 0.9,
        mountain_height: 1,
        rings: this.world.numberOfRings,
        day: 1,
    };

    private getTerrain(n) {
        //n = map_range(n,-1,1,0,1);
        let v = Math.abs(parseFloat(n) * 255); //Math.abs(n * 255.0);
        //let v = 0.9*255;
        //height map
        let assetKey: string = '';
        if (v < this.opts.desert_height * 255) {
            assetKey = 'desert';
        } else if (v < this.opts.plain_height * 255) {
            assetKey = 'plain';
        } else if (v < this.opts.forest_height * 255) {
            assetKey = 'forest';
        } else if (v < this.opts.snow_height * 255) {
            assetKey = 'snow';
        } else {
            assetKey = 'mountain';
        }

        return assetKey;
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

    private getTerrainHeight(n) {
        //n = map_range(n,-1,1,0,1);
        let v = Math.abs(parseFloat(n) * 255); //Math.abs(n * 255.0);
        //let v = 0.9*255;
        //height map
        let assetKey: string = '';
        if (v < this.terrainHeights.deepWater.height * 255) {
            assetKey = 'dark_water';
        } else if (v < this.terrainHeights.shallowWater.height * 255) {
            assetKey = 'light_water';
        } else if (v < this.terrainHeights.beach.height * 255) {
            assetKey = 'desert';
        } else if (v < this.terrainHeights.land.height * 255) {
            assetKey = 'land';
        } else {
            assetKey = 'mountain';
        }

        return assetKey;
    }

    private map_function(value, in_min, in_max, out_min, out_max) {
        return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    };

    private getTileMapNoise(x, y, type) {
        let r = this.world.hexRadius;
        let matrixXvalue = Math.ceil((x + this.world.canvasCenterX) / (this.world.hexRadius * 2));
        let matrixYvalue = Math.ceil((y - r + this.world.canvasCenterY) / (this.world.hexRadius * 2));
        let matrixWidth = Math.ceil((this.world.canvasWidth) / (this.world.hexRadius * 2));
        let matrixHeight = Math.ceil(this.world.canvasHeight / (this.world.hexRadius * 2));

        let noiseMod: number = 0;
        if (type === 'height') {
            noiseMod = this.world.shapeNoiseMod;
        } else if (type === 'terrainType') {
            noiseMod = this.world.tileTypeNoiseMod;
        }
        let simplexNoiseValue = this.simplex.noise2D(
            Number(matrixXvalue / noiseMod),
            Number(matrixYvalue / noiseMod)
        );

        let value2d = this.map_function(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0);

        let dist = Math.sqrt(
            Math.pow(matrixXvalue - matrixWidth / 2, 2) +
            Math.pow(matrixYvalue - matrixHeight / 2, 2)
        );

        let grad = dist / (this.world.landSize * Math.min(matrixWidth, matrixHeight));

        //console.log(grad);
        value2d -= Math.pow(grad, 3);
        value2d = Math.max(value2d, 0);

        return value2d;
    }

    private getCloudsNoise(x, y, type) {
        let day = this.opts.day;
        let matrixXvalue = Math.ceil((x - day) / (this.world.hexRadius * 2));
        let matrixYvalue = Math.ceil((y - day) / (this.world.hexRadius * 2));

        let noiseMod = this.opts.clouds_type_noise_mod;

        let simplexNoiseValue = this.simplex.noise2D(
            Number(matrixXvalue / noiseMod),
            Number(matrixYvalue / noiseMod)
        );

        let value2d = this.map_function(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0);

        return value2d;
    }

    private drawTileMap() {
        let tiles = this.world.tiles;

        this.mapTexture && this.mapTexture.destroy();
        this.mapTexture = this.add.blitter(0, 0, 'atlas_tiles');

        for (let key in tiles) {
            this.drawHexTile(tiles[key].x, tiles[key].y);
        }

        this.mapInteractiveScene();
    }

    private drawCloudMap() {
        let allCoordinates = this.world.tiles;

        this.cloudTexture && this.cloudTexture.destroy();
        this.cloudTexture = this.add.blitter(0, 0, 'atlas_clouds').setAlpha(0.4);

        for (let key in allCoordinates) {
            this.drawHexCloud(allCoordinates[key].x, allCoordinates[key].y);
        }
    }

    private drawHexTile(x, y) {
        let value2d = this.getTileMapNoise(x, y, 'height');

        let terrainHeight = this.getTerrainHeight(value2d);

        let terrainKey;
        if (terrainHeight === 'land') {
            value2d = this.getTileMapNoise(x, y, 'terrainType');
            terrainKey = this.getTerrain(value2d);
        } else {
            terrainKey = terrainHeight;
        }

        const frameAtari = this.textures.getFrame('atlas_tiles', terrainKey);
        this.mapTexture.create(x - (Math.sqrt(3) * this.world.hexRadius / 2), y - this.world.hexRadius, frameAtari);
    }

    private drawHexCloud(x, y) {
        let value2d = this.getCloudsNoise(x, y, 'clouds');
        let isCloud = this.getClouds(value2d);
        if (isCloud) {
            const frameAtari2 = this.textures.getFrame('atlas_clouds', 'clouds');
            this.cloudTexture.create(x - (Math.sqrt(3) * this.world.hexRadius / 2), y - this.world.hexRadius, frameAtari2);
        }
    }

    private mapInteractiveScene() {

        let text = this.add.text(0,0, '').setStyle({
            fontSize: '19px'
        });

        this.circleMapArea = this.add.circle(0, 0, this.world.worldRadius).setInteractive();

        this.circleMapArea.on('pointermove', (pointer, localX, localY) => {
            let selectedHex = this.world.getAxialCoordinatesFromOffSetCoordinates(localX, localY);
            let tile = this.world.tiles[selectedHex.q + '_' + selectedHex.r];

            if (tile) {
                text.setText('Q: ' + tile.q + ', R: ' + tile.r + ', X: ' + tile.x + ', Y: ' + tile.y);
            } else {
                text.setText('No tile selected');
            }
            console.log(tile);
        });
    }

    private setup() {
        //this.graphics.clear();
        this.cameras.main.scrollX = -this.world.canvasCenterX;
        this.cameras.main.scrollY = -this.world.canvasCenterY;

        this.simplex = new SimplexNoise(this.world.worldSeed);
        this.world.setTileCoordinates();
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

        this.generationDetails.add(controllers, "landSize", 0, 5).onChange((value : number) => {
            this.world.landSize = value;
            this.setup();
        });

        this.generationDetails.add(controllers, "numberOfRings", 0, 200).onChange((value : number) => {
            this.world.numberOfRings = value;
            this.setup();
        });

        this.generationDetails.add(controllers, "shapeNoiseMod", 0, 50).onChange((value : number)  => {
            this.world.shapeNoiseMod = value;
            this.setup();
        });

        this.generationDetails.add(controllers, "tileTypeNoiseMod", 0, 50).onChange((value : number)  => {
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

        this.setup();

    }

    update(time, delta){
        this.timerAux += delta;
        while (this.timerAux > 1) {
            this.opts.day += 1;
            this.timerAux = 0;
            this.generationDetails.updateDisplay();
            this.drawCloudMap();
        }
    }
}
