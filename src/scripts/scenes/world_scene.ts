//import ChatScene from "./chat_scene";
import SimplexNoise from 'simplex-noise';
import * as dat from "dat.gui";
import Phaser from "phaser";

export default class WorldScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'WORLD_SCENE';

    private static readonly LOGIN_FORM_ASSET_KEY = "LOGIN_FORM_ASSET_KEY";


    // gui.remember(opts)
    private generationDetails = new dat.GUI().addFolder("Generation Details");

    private ctx !: WorldScene;
    private graphics!: Phaser.GameObjects.Graphics;
    private simplex = new SimplexNoise("exothium");
    private canvasWidth = 1280;
    private canvasHeight = 800;
    private group;
    private worldCenterX = 1280 / 2;
    private worldCenterY = 400;
    public qrHex = {};
    private hexRadius = 16;
    private ringsAux = 50; //dont use this. use opts.rings
    private innerCircleRadius = (this.hexRadius / 2) * Math.sqrt(3);
    private TO_RADIANS = Math.PI / 180;
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
        island_size: this.ringsAux / 35, //doesn't snap to edge of map :)
        shape_noise_mod: this.ringsAux * 0.04,
        shape_noise_scale: 0.125, //0.05
        tile_type_noise_mod: this.ringsAux * 0.02,
        tile_type_noise_scale: 0.25,
        clouds_type_noise_mod: this.ringsAux * 0.1,
        clouds_type_noise_scale: 0.25,
        // Initial Height Ranges
        desert_height: 0.05,
        plain_height: 0.5,
        forest_height: 0.85,
        snow_height: 0.9,
        mountain_height: 1,
        rings: this.ringsAux,
        day: 1,
        randomize: () => this.setup(this)
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
        let r = this.hexRadius;
        let matrixXvalue = Math.ceil(x / (this.hexRadius * 2));
        let matrixYvalue = Math.ceil((y - r) / (this.hexRadius * 2));
        let matrixWidth = Math.ceil((this.canvasWidth) / (this.hexRadius * 2));
        let matrixHeight = Math.ceil(this.canvasHeight / (this.hexRadius * 2));

        let scale: number = 0;
        let noiseMod: number = 0;
        if (type === 'height') {
            scale = this.opts.shape_noise_scale;
            noiseMod = this.opts.shape_noise_mod;
        } else if (type === 'terrainType') {
            scale = this.opts.tile_type_noise_scale;
            noiseMod = this.opts.tile_type_noise_mod;
        }
        let simplexNoiseValue = this.simplex.noise2D(
            Number((matrixXvalue / noiseMod) * scale),
            Number((matrixYvalue / noiseMod) * scale)
        );

        let value2d = this.map_function(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0);

        // Adjust for distance if desired

        let dist = Math.sqrt(
            Math.pow(matrixXvalue - matrixWidth / 2, 2) +
            Math.pow(matrixYvalue - matrixHeight / 2, 2)
        );

        let grad = dist / (this.opts.island_size * Math.min(matrixWidth, matrixHeight));

        //console.log(grad);
        value2d -= Math.pow(grad, 3);
        value2d = Math.max(value2d, 0);

        return value2d;
    }

    private getCloudsNoise(x, y, type) {
        let day = this.opts.day;
        let r = this.hexRadius;
        let matrixXvalue = Math.ceil((x - day) / (this.hexRadius * 2));
        let matrixYvalue = Math.ceil((y - day) / (this.hexRadius * 2));
        let matrixWidth = Math.ceil((this.canvasWidth) / (this.hexRadius * 2));
        let matrixHeight = Math.ceil(this.canvasHeight / (this.hexRadius * 2));

        let scale = this.opts.clouds_type_noise_scale;
        let noiseMod = this.opts.clouds_type_noise_mod;

        let simplexNoiseValue = this.simplex.noise2D(
            Number((matrixXvalue / noiseMod) * scale),
            Number((matrixYvalue / noiseMod) * scale)
        );

        let value2d = this.map_function(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0);

        return value2d;
    }

    private pointToHexAxialCoordinates(x_, y_, sceneWidth, sceneHeight) {
        //console.log("Global x:" + x_ + " y:" + y_);

        let selectedHex = {
            q: 0,
            r: 0,
        };

        let spaceX = Math.round(x_ - (sceneWidth / 2));
        let spaceY = Math.round(y_ - (sceneHeight / 2));
        selectedHex.q = Math.round((Math.sqrt(3) / 3 * spaceX - spaceY / 3) / (this.hexRadius));
        selectedHex.r = Math.round((spaceY * 2 / 3) / (this.hexRadius));
        //selectedHex = cube_round(selectedHex.q, selectedHex.r, -selectedHex.q - selectedHex.r);


        function cube_round(frac_q, frac_r, frac_s) {
            var q = Math.round(frac_q);
            var r = Math.round(frac_r);
            var s = Math.round(frac_s);

            var q_diff = Math.abs(q - frac_q);
            var r_diff = Math.abs(r - frac_r);
            var s_diff = Math.abs(s - frac_s);

            if (q_diff > r_diff && q_diff > s_diff) {
                q = -r - s;
            } else if (r_diff > s_diff) {
                r = -q - s;
            } else {
                s = -q - r;
            }

            return {
                q,
                r,
            };
        }

        return selectedHex;
    }

    private setTileCoordinates() {
        let x = this.worldCenterX;
        let y = this.worldCenterY;
        this.qrHex = {};

        //center tile coordinates
        let currenthexQR = this.pointToHexAxialCoordinates(x, y, this.canvasWidth, this.canvasHeight);
        this.qrHex[currenthexQR.q + '_' + currenthexQR.r] = {x: x, y: y};

        let countHex = 0;
        for (let i = 1; i <= this.opts.rings; i++) {
            for (let j = 0; j < 6; j++) {
                let diagonalX = x + Math.cos(j * 60 * this.TO_RADIANS) * this.innerCircleRadius * 2 * i;
                let diagonalY = y + Math.sin(j * 60 * this.TO_RADIANS) * this.innerCircleRadius * 2 * i;
                currenthexQR = this.pointToHexAxialCoordinates(diagonalX, diagonalY, this.canvasWidth, this.canvasHeight);
                this.qrHex[currenthexQR.q + '_' + currenthexQR.r] = {x: diagonalX, y: diagonalY};
                countHex++;
                for (let k = 1; k < i; k++) {
                    let fillX = diagonalX + Math.cos((j * 60 + 120) * this.TO_RADIANS) * this.innerCircleRadius * 2 * k;
                    let fillY = diagonalY + Math.sin((j * 60 + 120) * this.TO_RADIANS) * this.innerCircleRadius * 2 * k;
                    currenthexQR = this.pointToHexAxialCoordinates(fillX, fillY, this.canvasWidth, this.canvasHeight);
                    this.qrHex[currenthexQR.q + '_' + currenthexQR.r] = {x: fillX, y: fillY};
                    countHex++;
                }
            }
        }

        console.log("A total of " + countHex + " hexs will be rendered :)");
    }

    private drawTileMap() {
        let allCoordinates = this.qrHex;

        this.mapTexture && this.mapTexture.destroy();
        this.mapTexture = this.add.blitter(0, 0, 'atlas_tiles');

        for (let key in allCoordinates) {
            this.drawHexTile(allCoordinates[key].x, allCoordinates[key].y);
        }

        this.mapInteractiveScene();
    }

    private drawCloudMap() {
        let allCoordinates = this.qrHex;

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
        this.mapTexture.create(x - (Math.sqrt(3) * this.hexRadius / 2), y - this.hexRadius, frameAtari);
    }

    private drawHexCloud(x, y) {
        let value2d = this.getCloudsNoise(x, y, 'clouds');
        let isCloud = this.getClouds(value2d);
        if (isCloud) {
            const frameAtari2 = this.textures.getFrame('atlas_clouds', 'clouds');
            this.cloudTexture.create(x - (Math.sqrt(3) * this.hexRadius / 2), y - this.hexRadius, frameAtari2);
        }
    }

    private mapInteractiveScene() {

        let text = this.add.text(this.worldCenterX, this.worldCenterY, 'asdfasdfasdf').setStyle({
            fontSize: '19px'
        });

        this.circleMapArea = this.add.circle(this.worldCenterX, this.worldCenterY, ((this.hexRadius * this.opts.rings) * Math.sqrt(3) + (this.hexRadius / 2 * Math.sqrt(3)))).setInteractive();

        this.circleMapArea.on('pointermove', (pointer, localX, localY) => {
            let selectedHex = this.pointToHexAxialCoordinates(localX, localY, this.circleMapArea.width, this.circleMapArea.height);

            if (this.qrHex[selectedHex.q + '_' + selectedHex.r]) {
                text.setText('Q: ' + selectedHex.q + ', R: ' + selectedHex.r);
            } else {
                text.setText('No tile selected');
            }
            console.log('Q: ' + selectedHex.q + ', R: ' + selectedHex.r);
        });
    }

    private setup(ctx) {
        //this.graphics.clear();
        ctx.simplex = new SimplexNoise("exothium"); //+ Date.now()
        ctx.setTileCoordinates();
        ctx.drawTileMap();
        ctx.drawCloudMap();
    }

    constructor() {
        super(WorldScene.SCENE_KEY);
        this.ctx = this;
    }

    preload() {
        this.graphics = this.add.graphics();
    }

    create() {
        this.generationDetails.open();

        this.generationDetails.add(this.opts, "island_size", 0, 5).onChange(() => this.setup(this));
        this.generationDetails.add(this.opts, "shape_noise_mod", 0, 5).onChange(() => this.setup(this));
        this.generationDetails.add(this.opts, "shape_noise_scale", 0, 1).onChange(() => this.setup(this));
        this.generationDetails.add(this.opts, "tile_type_noise_mod", 0, 35).onChange(() => this.setup(this));
        this.generationDetails.add(this.opts, "tile_type_noise_scale", 0, 5).onChange(() => this.setup(this));
        this.generationDetails.add(this.opts, "clouds_type_noise_mod", 0, 35).onChange(() => this.setup(this));
        this.generationDetails.add(this.opts, "clouds_type_noise_scale", 0, 5).onChange(() => this.setup(this));
        this.generationDetails.add(this.opts, "rings", 0, 200).onChange(() => this.setup(this));
        this.generationDetails.add(this.opts, "day", 1, 1000, 1).onChange(() => this.setup(this));

        this.generationDetails.add(this.opts, "randomize").name("Randomize");

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

        this.setup(this.ctx);

    }

    update(time, delta){
        this.timerAux += delta;
        while (this.timerAux > 1) {
            this.opts.day += 1;
            this.timerAux = 0;
            this.generationDetails.updateDisplay();
            this.drawCloudMap();
        }


        /*this.opts.clouds_type_noise_mod += 0.0001;
        this.opts.clouds_type_noise_scale -= 0.0001;
        this.drawHexCircle(this.worldCenterX, this.worldCenterY);*/
    }


}
