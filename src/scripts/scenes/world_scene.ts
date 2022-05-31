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
    private worldCenterX = 1280/2;
    private worldCenterY = 400;
    private hexRadius = 17;
    private innerCircleRadius = (this.hexRadius / 2) * Math.sqrt(3);
    private TO_RADIANS = Math.PI / 180;
    private opts = {
        noise_mod: 1,
        noise_scale: (0.05*(this.hexRadius/3)), //0.05
        island_size: (0.5*(this.hexRadius/3)), //0.5
        //Initial Colors
        // dark_water: [120, 120, 225], // RGB array
        // light_water: [150, 150, 255],
        // sand: [237, 201, 175],
        // grass: [207, 241, 135],
        // forest: [167, 201, 135],
        // rocks: [170, 170, 170],
        // snow: [255, 255, 255],
        dark_water: "hexset_grid_wdeep_flat_01", // RGB array
        light_water: "hexset_grid_wshallow_flat_01",
        sand: "hexset_grid_desert_flat_01",
        grass: "hexset_grid_boreal_flat_01",
        forest: "hexset_grid_temperate_O_flat_01",
        rocks: "hexset_grid_stone1_flat_01",
        snow_high: "hexset_grid_snow_mont_01",
        snow_medium: "hexset_grid_snow_hill_01",
        snow_low: "hexset_grid_snow_flat_01",
        // Initial Height Ranges
        snow_height_high: 0.9,
        snow_height_medium: 0.8,
        snow_height_low: 0.7,
        rocks_height: 0.6,
        forest_height: 0.49,
        grass_height: 0.36,
        sand_height: 0.26,
        light_water_height: 0.23,
        dark_water_height: 0.13,

        randomize: () => this.setup(this)
    };
    private getcolor(n) {
        //n = map_range(n,-1,1,0,1);
        let v = Math.abs(parseFloat(n) * 255); //Math.abs(n * 255.0);
        //let v = 0.9*255;
        //height map
        let color;
        if (v < this.opts.dark_water_height * 255) {
            color = this.opts.dark_water;
        } else if (v < this.opts.light_water_height * 255) {
            color = this.opts.light_water;
        } else if (v < this.opts.sand_height * 255) {
            color = this.opts.sand;
        } else if (v < this.opts.grass_height * 255) {
            color = this.opts.grass;
        } else if (v < this.opts.forest_height * 255) {
            color = this.opts.forest;
        } else if (v < this.opts.rocks_height * 255) {
            color = this.opts.rocks;
        }else if (v < this.opts.snow_height_low * 255) {
            color = this.opts.snow_low;
        }else if (v < this.opts.snow_height_medium * 255) {
            color = this.opts.snow_medium;
        } else {
            color = this.opts.snow_high;
        }

        let rgbColor = Phaser.Display.Color.GetColor(color[0], color[1], color[2]);
        return rgbColor;

    }
    private getTerrain(n) {
        //n = map_range(n,-1,1,0,1);
        let v = Math.abs(parseFloat(n) * 255); //Math.abs(n * 255.0);
        //let v = 0.9*255;
        //height map
        let assetKey;
        if (v < this.opts.dark_water_height * 255) {
            assetKey = this.opts.dark_water;
        } else if (v < this.opts.light_water_height * 255) {
            assetKey = this.opts.light_water;
        } else if (v < this.opts.sand_height * 255) {
            assetKey = this.opts.sand;
        } else if (v < this.opts.grass_height * 255) {
            assetKey = this.opts.grass;
        } else if (v < this.opts.forest_height * 255) {
            assetKey = this.opts.forest;
        } else if (v < this.opts.rocks_height * 255) {
            assetKey = this.opts.rocks;
        } else if (v < this.opts.snow_height_low * 255) {
            assetKey = this.opts.snow_low;
        }else if (v < this.opts.snow_height_medium * 255) {
            assetKey = this.opts.snow_medium;
        } else {
            assetKey = this.opts.snow_high;
        }

        let randomSubTerrain = Math.ceil(Math.random()*3);
        assetKey = assetKey.replace("01","0"+randomSubTerrain);
        return assetKey;

    }
    private map_function(value, in_min, in_max, out_min, out_max) {
        return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    };
    private drawHex(x, y, decay) {
        let r = this.hexRadius;
        this.graphics.beginPath();
        this.graphics.moveTo(x, y - r);
        //let value2d = simplex.noise2D(x,y-r);

        //simplex.noise2D
        //noise

        let matrixXvalue = Math.ceil(x / (this.hexRadius * 2));
        let matrixYvalue = Math.ceil((y - r) / (this.hexRadius * 2));
        let matrixWidth = Math.ceil((this.canvasWidth) / (this.hexRadius * 2));
        let matrixHeight = Math.ceil(this.canvasHeight / (this.hexRadius * 2));


        let simplexNoiseValue = this.simplex.noise2D(
            Number((matrixXvalue / this.opts.noise_mod) * this.opts.noise_scale),
            Number((matrixYvalue / this.opts.noise_mod) * this.opts.noise_scale)
        );
        //let value2d = parseFloat(simplexNoiseValue);

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

        // let hexColorValue = this.getcolor(value2d);
        //
        // for (var i = 0; i <= 6; i++) {
        //     this.graphics.lineTo(
        //         x + Math.cos((i * 60 - 90) * this.TO_RADIANS) * r,
        //         y + Math.sin((i * 60 - 90) * this.TO_RADIANS) * r
        //     );
        // }
        //
        // let thickness = 1;
        // let color = 0x000000;
        // let alpha = 1;
        //
        // this.graphics.lineStyle(thickness, color, alpha);
        // this.graphics.fillStyle(hexColorValue,1);
        // this.graphics.closePath();
        // this.graphics.strokePath();
        // this.graphics.fillPath();

        let terrainKey = this.getTerrain(value2d);
        let terrainTile = this.add.image(x, y - r, terrainKey).setInteractive();
        terrainTile.setDepth(y);
        terrainTile.setOrigin(0.5,0.583);
        //this.group.add(terrainTile);
        //this.container.add(terrainTile);

        terrainTile.on('pointerover', function (event) {
            terrainTile.setTint(0xff0000);
        });

        terrainTile.on('pointerout', function (event) {

            terrainTile.clearTint();

        });


    }
    private drawHexCircle(x, y, circles) {
        let rc = this.innerCircleRadius;
        this.drawHex(this.worldCenterX, this.worldCenterY, 1); //center
        let countHex = 0;
        for (let i = 1; i <= circles; i++) {
            for (let j = 0; j < 6; j++) {
                let currentX = x + Math.cos(j * 60 * this.TO_RADIANS) * rc * 2 * i;
                let currentY = y + Math.sin(j * 60 * this.TO_RADIANS) * rc * 2 * i;
                this.drawHex(currentX, currentY, 1 - (i - 5) / circles);
                countHex++;
                for (let k = 1; k < i; k++) {
                    let newX =
                        currentX + Math.cos((j * 60 + 120) * this.TO_RADIANS) * rc * 2 * k;
                    let newY =
                        currentY + Math.sin((j * 60 + 120) * this.TO_RADIANS) * rc * 2 * k;
                    this.drawHex(newX, newY, 1 - (i - 5) / circles);
                    countHex++;
                }
            }
        }
        console.log("rendered " + countHex + " hexs");
    }
    private setup(ctx) {
        //this.graphics.clear();
        ctx.simplex = new SimplexNoise("exothium"); //+ Date.now()
        ctx.drawHexCircle(this.worldCenterX, this.worldCenterY, 30);

        this.input.on("wheel",  (pointer, gameObjects, deltaX, deltaY, deltaZ) => {

            if (deltaY > 0) {
                var newZoom = this.cameras.main.zoom -.1;
                if (newZoom > 0.0) {
                    this.cameras.main.zoom = newZoom;
                }
            }

            if (deltaY < 0) {
                var newZoom = this.cameras.main.zoom +.1;
                if (newZoom < 50.3) {
                    this.cameras.main.zoom = newZoom;
                }
            }

            // this.camera.centerOn(pointer.worldX, pointer.worldY);
            // this.camera.pan(pointer.worldX, pointer.worldY, 2000, "Power2");

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

        general.add(this.opts, "island_size", 0.01, 3).onChange(() => this.setup(this));
        general.add(this.opts, "noise_scale", 0.01, 0.14).onChange(() => this.setup(this));
        general.add(this.opts, "noise_mod", 1, 3).onChange(() => this.setup(this));

        gui.add(this.opts, "randomize").name("Randomize");
        // //this.container = this.add.container(0, 0);

        // this.group = this.make.group({
        //     key: 'bobs'
        // });

         this.setup(this.ctx);

    }






}
