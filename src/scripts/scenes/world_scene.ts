//import ChatScene from "./chat_scene";
import SimplexNoise from 'simplex-noise';
import * as dat from "dat.gui";
import Phaser from "phaser";

export default class WorldScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'WORLD_SCENE';

    private static readonly LOGIN_FORM_ASSET_KEY = "LOGIN_FORM_ASSET_KEY";
    private qrHex = {};
    private ctx !: WorldScene;
    private graphics!: Phaser.GameObjects.Graphics;
    private simplex = new SimplexNoise("exothium");
    private canvasWidth = 1280;
    private canvasHeight = 800;
    private mapTexture;
    private container;
    private blitter;
    private worldCenterX = 1280/2;
    private worldCenterY = 800/2;
    private hexRadius = 17;
    private innerCircleRadius = (this.hexRadius / 2) * Math.sqrt(3);
    private TO_RADIANS = Math.PI / 180;
    private opts_terrain = {
        //Initial Terrains
        dark_water: "dark_water", // RGB array
        light_water: "light_water",
        sand: "sand",
        grass: "grass",
        forest: "forest",
        rocks: "rocks",
        snow_high: "snow",
        snow_medium: "snow",
        snow_low: "snow",
    }
    private opts = {
        noise_mod: 1,
        noise_scale: (0.05*(this.hexRadius/3)), //0.05
        island_size: (0.5*(this.hexRadius/3)), //0.5
        //Initial Colors
        dark_water: [120, 120, 225], // RGB array
        light_water: [150, 150, 255],
        sand: [237, 201, 175],
        grass: [207, 241, 135],
        forest: [167, 201, 135],
        rocks: [170, 170, 170],
        snow: [255, 255, 255],

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
        }else {
            color = this.opts.snow;
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
            assetKey = this.opts_terrain.dark_water;
        } else if (v < this.opts.light_water_height * 255) {
            assetKey = this.opts_terrain.light_water;
        } else if (v < this.opts.sand_height * 255) {
            assetKey = this.opts_terrain.sand;
        } else if (v < this.opts.grass_height * 255) {
            assetKey = this.opts_terrain.grass;
        } else if (v < this.opts.forest_height * 255) {
            assetKey = this.opts_terrain.forest;
        } else if (v < this.opts.rocks_height * 255) {
            assetKey = this.opts_terrain.rocks;
        } else if (v < this.opts.snow_height_low * 255) {
            assetKey = this.opts_terrain.snow_low;
        }else if (v < this.opts.snow_height_medium * 255) {
            assetKey = this.opts_terrain.snow_medium;
        } else {
            assetKey = this.opts_terrain.snow_high;
        }

        let randomSubTerrain = Math.ceil(Math.random()*3);
        assetKey = assetKey.replace("01","0"+randomSubTerrain);
        return assetKey;

    }
    private map_function(value, in_min, in_max, out_min, out_max) {
        return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    };
    private drawHex(x, y, tint) {
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

         let hexColorValue = this.getcolor(value2d);
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
        // tint ? this.graphics.fillStyle(0xff0000,1) : this.graphics.fillStyle(hexColorValue,0.4);
        // this.graphics.lineStyle(thickness, color, alpha);
        // this.graphics.closePath();
        // this.graphics.strokePath();
        // this.graphics.fillPath();

        //blitter
        let terrainKey = this.getTerrain(value2d);
        //let terrain = this.add.image(x, y - r, terrainKey);
        //this.blitter.create(x * 32, y * 32, Phaser.Math.Between(0, 399));
        const frameAtari = this.textures.getFrame('atlas', terrainKey);
        this.blitter.create(x, y - r, frameAtari);

        //terrainBlitter.create(x, y - r).setAlpha(1);
        this.qrHex = Object.assign(this.qrHex,{[this.pointToHexAxiaCoordinates(x, y )]:[x,y]});
        //blitter\\

        //let terrainKey = this.getTerrain(value2d);
        //let terrain = this.add.image(x, y - r, terrainKey);
        //tint ? terrain.setTint(0xff0000): terrain;
        //terrain.setDepth(y);
        //terrain.setOrigin(0.5,0.583);
        // this.container.add(this.add.image(x, y - r, terrainKey).setOrigin(0.5,0.583));

          //let terrain = this.add.image(0,0, terrainKey);
         // tint ? terrain.setTint(0xff0000): terrain;
         // //this.mapTexture.batchDraw(terrain, x, y - r);
         // tint ? this.mapTexture.draw(terrain, x, y - r):this.mapTexture.batchDraw(terrain, x, y - r);
         // this.qrHex = Object.assign(this.qrHex,{[this.pointToHexAxiaCoordinates(x, y )]:[x,y]});

        //tint ? this.add.image(x, y - r, terrainKey).setInteractive(new Phaser.Geom.Circle(16, 28, 10), Phaser.Geom.Circle.Contains);

        //terrain.setDepth(y);
        //terrain.setOrigin(0.5,0.583);
        //terrain.setInteractive();

        //Object.assign(this.qrHex,{[this.pointToHexAxiaCoordinates(x, y - r)]:terrainTile});
        //this.qrHex = Object.assign(this.qrHex,{[this.pointToHexAxiaCoordinates(x, y )]:[x,y]});
        //console.log(Object.keys(this.qrHex).length);

        // this.container.add(terrainTile);
        // this.container.add(terrainTile);

        // let ctx = this
        // terrain.on('pointermove', function (point) {
        //     terrain.setTint(0xff0000);
        //
        //
        //     //ctx.pointToHexAxiaCoordinates(ctx.input.mousePointer.x,ctx.input.mousePointer.y);
        //
        //
        //
        // });
        //
        // terrain.on('pointerout', function (event) {
        //
        //     terrain.clearTint();
        //
        // });


    }
    private drawHexCircle(x, y, circles) {
        let rc = this.innerCircleRadius;
        this.drawHex(this.worldCenterX, this.worldCenterY, false); //center
        let apple = this.add.image(x,y,"apple")
        apple.setDepth(999999999);
        let countHex = 0;
        for (let i = 1; i <= circles; i++) {
            for (let j = 0; j < 6; j++) {
                let currentX = x + Math.cos(j * 60 * this.TO_RADIANS) * rc * 2 * i;
                let currentY = y + Math.sin(j * 60 * this.TO_RADIANS) * rc * 2 * i;
                this.drawHex(currentX, currentY, false);
                countHex++;
                for (let k = 1; k < i; k++) {
                    let newX =
                        currentX + Math.cos((j * 60 + 120) * this.TO_RADIANS) * rc * 2 * k;
                    let newY =
                        currentY + Math.sin((j * 60 + 120) * this.TO_RADIANS) * rc * 2 * k;
                    this.drawHex(newX, newY, false);
                    countHex++;
                }
            }
        }
        console.log("rendered " + countHex + " hexs");
    }
    private setup(ctx) {
        //this.graphics.clear();
        ctx.simplex = new SimplexNoise("exothium"); //+ Date.now()

        //this.blitter = this.add.blitter(0, 0, 'bobs');
        //this.mapTexture.beginDraw();
        ctx.drawHexCircle(this.worldCenterX, this.worldCenterY, 200);
        //this.mapTexture.endDraw();
        //this.mapTexture.draw(this.container);

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
        // this.mapTexture = this.add.renderTexture(0, 0, this.canvasWidth, this.canvasHeight);
        // this.container = this.add.container(0,0);

        this.blitter = this.add.blitter(0, 0, 'atlas');
         this.setup(this.ctx);

        this.input.on("wheel",  (pointer, gameObjects, deltaX, deltaY, deltaZ) => {

            if (deltaY > 0) {
                var newZoom = this.cameras.main.zoom -.1;
                if (newZoom > 0.0) {
                    this.cameras.main.zoom = newZoom;

                    console.log(newZoom);
                }
            }

            if (deltaY < 0) {
                var newZoom = this.cameras.main.zoom +.1;
                if (newZoom < 50.3) {
                    this.cameras.main.zoom = newZoom;
                    console.log(newZoom);
                }
            }

            //this.cameras.centerOn(pointer.worldX, pointer.worldY);
            // this.camera.pan(pointer.worldX, pointer.worldY, 2000, "Power2");

        });

        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown) return;

            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        });

    }

    pointToHexAxiaCoordinates(x_,y_){
        //console.log("Global x:" + x_ + " y:" + y_);

        let x = x_ - this.canvasWidth/2;
        let y = y_ - this.canvasHeight/2;
        //console.log("x:" + x + " y:" + y);
        let hexRadius = this.hexRadius*this.cameras.main.zoom;
        let q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / hexRadius;
        let r = ((2 / 3) * y) / hexRadius;
        //console.log(q + "-" + r);
        let qr = cube_round(q, r, -q - r);
        let q_ = ""+qr[0];
        let r_ = ""+qr[1];
        let qrString = q_ + "_" + r_;
        //console.log(qrString);
        return qrString;

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

            return [q, r];
        }
    }


    update(){
        let x = this.input.mousePointer.x;
        let y = this.input.mousePointer.y;
        //this.pointToHexAxiaCoordinates(x,y);
        console.log(x +"-" + y);
        let qr = this.pointToHexAxiaCoordinates(x,y);
        try {
            //this.qrHex[qr].setTint(0xff0000);
            let xyArr = this.qrHex[qr];
            console.log("QRVALUES : " + qr);
            this.drawHex(xyArr[0],xyArr[1],true);
        } catch (e) {
        }
    }



}
