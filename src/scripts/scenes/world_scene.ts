//import ChatScene from "./chat_scene";
import SimplexNoise from 'simplex-noise';
import * as dat from "dat.gui";
import Phaser from "phaser";

export default class WorldScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'WORLD_SCENE';

    private static readonly LOGIN_FORM_ASSET_KEY = "LOGIN_FORM_ASSET_KEY";

    private ctx !: WorldScene;
    private graphics!: Phaser.GameObjects.Graphics;
    private simplex = new SimplexNoise("exothium");
    private canvasWidth = 1280;
    private canvasHeight = 800;
    private group;
    private worldCenterX = 1280 / 2;
    private worldCenterY = 400;
    private hexRadius = 32;
    private rings = 25;
    private innerCircleRadius = (this.hexRadius / 2) * Math.sqrt(3);
    private TO_RADIANS = Math.PI / 180;
    private mapTexture;
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
    private opts = {
        island_size: this.rings / 17.5, //doesn't snap to edge of map :)
        shape_noise_mod: this.rings * 0.04,
        shape_noise_scale: 0.125, //0.05
        tile_type_noise_mod: this.rings * 0.02,
        tile_type_noise_scale: 0.25,
        // Initial Height Ranges
        desert_height: 0.05,
        plain_height: 0.5,
        forest_height: 0.85,
        snow_height: 0.9,
        mountain_height: 1,
        randomize: () => this.setup(this)
    };

    private getTerrain(n) {
        //n = map_range(n,-1,1,0,1);
        let v = Math.abs(parseFloat(n) * 255); //Math.abs(n * 255.0);
        //let v = 0.9*255;
        //height map
        let assetKey: string[] = [];
        if (v < this.opts.desert_height * 255) {
            assetKey.push('desert');
        } else if (v < this.opts.plain_height * 255) {
            assetKey.push('plain');
        } else if (v < this.opts.forest_height * 255) {
            assetKey.push('plain');
            assetKey.push('forest');
        } else if (v < this.opts.snow_height * 255) {
            assetKey.push('snow');
        }  else {
            assetKey.push('mountain');
        }

        return assetKey;
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

    private getNoise(x, y, type) {
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

    private drawHex(x, y, decay) {
        let value2d = this.getNoise(x, y, 'height');

        let terrainHeight = this.getTerrainHeight(value2d);

        let terrainKeys;
        if(terrainHeight === 'land') {
            value2d = this.getNoise(x, y, 'terrainType');
            terrainKeys = this.getTerrain(value2d);
        } else {
            terrainKeys = [terrainHeight];
        }



        for (let i = 0; i < terrainKeys.length; i++) {
            var brush = this.add.image(x, y, terrainKeys[i]);
            brush.setDisplaySize(Math.sqrt(3) * this.hexRadius, 2 * this.hexRadius);
            this.mapTexture.batchDraw(brush, x, y);
        }
    }

    private drawHexCircle(x, y) {
        this.mapTexture = this.add.renderTexture(0, 0);
        let rc = this.innerCircleRadius;
        this.mapTexture.beginDraw();
        this.drawHex(this.worldCenterX, this.worldCenterY, 1); //center
        let countHex = 0;
        for (let i = 1; i <= this.rings; i++) {
            for (let j = 0; j < 6; j++) {
                let currentX = x + Math.cos(j * 60 * this.TO_RADIANS) * rc * 2 * i;
                let currentY = y + Math.sin(j * 60 * this.TO_RADIANS) * rc * 2 * i;
                this.drawHex(currentX, currentY, 1 - (i - 5) / this.rings);
                countHex++;
                for (let k = 1; k < i; k++) {
                    let newX =
                        currentX + Math.cos((j * 60 + 120) * this.TO_RADIANS) * rc * 2 * k;
                    let newY =
                        currentY + Math.sin((j * 60 + 120) * this.TO_RADIANS) * rc * 2 * k;
                    this.drawHex(newX, newY, 1 - (i - 5) / this.rings);
                    countHex++;
                }
            }
        }
        this.mapTexture.endDraw();
        console.log("rendered " + countHex + " hexs");
    }

    private mapInteractiveScene() {
        /*let text = this.add.text(0, 0, '').setStyle({
            fontSize: '19px'
        });*/

        let circleMapArea = this.add.circle(this.worldCenterX, this.worldCenterY, ((this.hexRadius * this.rings) * Math.sqrt(3) + (this.hexRadius / 2 * Math.sqrt(3))), 0x6666ff0).setAlpha(0.5).setInteractive();

        circleMapArea.on('pointermove', (pointer, localX, localY) => {
            let selectedHex = {
                q: 0,
                r: 0,
            };
            let circleMapX = pointer.x;
            let spaceX = Math.round(localX - (circleMapArea.width/2));
            let spaceY = Math.round(localY - (circleMapArea.height/2));
            selectedHex.q = Math.round((Math.sqrt(3) / 3 * spaceX - spaceY / 3) / this.hexRadius);
            selectedHex.r = Math.round((spaceY * 2 / 3) / this.hexRadius);

            //text.setText('Q: ' + selectedHex.q + ', R: ' + selectedHex.r);
            console.log('Q: ' + selectedHex.q + ', R: ' + selectedHex.r);
        });
    }

    private setup(ctx) {
        //this.graphics.clear();
        ctx.simplex = new SimplexNoise("exothium"); //+ Date.now()
        ctx.drawHexCircle(this.worldCenterX, this.worldCenterY, 50);
        ctx.mapInteractiveScene();


        this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {

            if (deltaY > 0) {
                var newZoom = this.cameras.main.zoom * 0.9;
                if (newZoom > 0.0) {
                    this.cameras.main.zoom = newZoom;
                }
            }

            if (deltaY < 0) {
                var newZoom = this.cameras.main.zoom * 1.1;
                if (newZoom < 10000000) {
                    this.cameras.main.zoom = newZoom;
                }
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown) return;

            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        });
    }

    constructor() {
        super(WorldScene.SCENE_KEY);
        this.ctx = this;
    }

    preload() {
        this.graphics = this.add.graphics();
    }

    create() {

        var gui = new dat.GUI();

        // gui.remember(opts)
        var general = gui.addFolder("Generation Details");
        general.open();

        general.add(this.opts, "island_size", 0, this.opts.island_size * 2).onChange(() => this.setup(this));
        general.add(this.opts, "shape_noise_mod", 0, this.opts.shape_noise_mod * 2).onChange(() => this.setup(this));
        general.add(this.opts, "shape_noise_scale", 0, this.opts.shape_noise_scale * 2).onChange(() => this.setup(this));
        general.add(this.opts, "tile_type_noise_mod", 0, this.opts.tile_type_noise_mod * 2).onChange(() => this.setup(this));
        general.add(this.opts, "tile_type_noise_scale", 0, this.opts.tile_type_noise_scale * 2).onChange(() => this.setup(this));

        gui.add(this.opts, "randomize").name("Randomize");
        // //this.container = this.add.container(0, 0);

        // this.group = this.make.group({
        //     key: 'bobs'
        // });

        this.setup(this.ctx);

    }


}
