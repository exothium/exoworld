//import ChatScene from "./chat_scene";

import MainMenuScene from "./main_menu_scene";
//import WorldScene from "./world_scene";
//import ChatScene from "./chat_scene";

export default class SplashScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'SPLASH_SCENE';
    private static readonly EXOWORLD_LOGO_ASSET_KEY = 'EXOWORLD_LOGO_ASSET_KEY';

    private totalFadeinAndOut: number;

    constructor() {
        super(SplashScene.SCENE_KEY);
        this.totalFadeinAndOut = 1000;//3000
    }

    preload() {
        this.load.image(SplashScene.EXOWORLD_LOGO_ASSET_KEY, 'assets/img/exothium_spawned_exothium_world.png');
        var progress = this.add.graphics();

        this.load.on('progress', function (value) {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(0, 270, 1280 * value, 60);
        });

        this.input.setDefaultCursor('url(assets/cursors/cursor.cur), pointer');
        this.load.on('complete', function () {
            progress.destroy();
        });

        //new terrain
        this.load.atlas('atlas_tiles', 'assets/sprites/newTerrain/OpenCiv/AtlasTiles/texture.png', 'assets/sprites/newTerrain/OpenCiv/AtlasTiles/texture.json');
        this.load.atlas('atlas_clouds', 'assets/sprites/newTerrain/OpenCiv/AtlasClouds/texture.png', 'assets/sprites/newTerrain/OpenCiv/AtlasClouds/texture.json');
        //create atlas with json easily with https://free-tex-packer.com/app/
        this.load.image('dark_water', 'assets/sprites/newTerrain/OpenCiv/tile_ocean.png'); //water
        this.load.image('light_water', 'assets/sprites/newTerrain/OpenCiv/tile_shallow_ocean.png'); //water
        this.load.image('desert', 'assets/sprites/newTerrain/OpenCiv/tile_desert.png'); //desert
        this.load.image('plain', 'assets/sprites/newTerrain/OpenCiv/tile_grass.png'); //plain
        this.load.image('forest', 'assets/sprites/newTerrain/OpenCiv/tile_jungle.png'); //forest
        this.load.image('mountain', 'assets/sprites/newTerrain/OpenCiv/tile_mountain.png'); //mountain
        this.load.image('snow', 'assets/sprites/newTerrain/OpenCiv/tile_snow.png'); //snow
        this.load.image('land', 'assets/sprites/newTerrain/OpenCiv/tile_tundra.png');

        //character
        this.load.image('punk', 'assets/sprites/punk.png');

        //creatures
        this.load.setPath('assets/sprites/creatures');
        this.load.image('bear');
        this.load.image('boar');
        this.load.image('deer');
        this.load.image('giant worm');
        this.load.image('hyena');
        this.load.image('rabbit');
        this.load.image('ram');
        this.load.image('snake');
        this.load.image('wolf');

        //resources
        this.load.setPath('assets/sprites/resources');
        this.load.image('bush');
        this.load.image('flint node');
        this.load.image('loose stone');
        this.load.image('stone node');
        this.load.image('tree');

        //ui
        this.load.setPath('assets/sprites/ui');
        this.load.image('moveButton');
        this.load.image('moveButtonDisabled');

        //other
        this.load.setPath('assets/sprites');
        this.load.image('creatureBackground');
        this.load.image('hexUI');


    }

    create() {
        this.createAndSplashScreen();
    }

    private createAndSplashScreen() {
        this.lights.enable();
        this.lights.setAmbientColor(0x555555);

        //this.add.sprite(1280/2, 720/2, SplashScene.EXOWORLD_LOGO_ASSET_KEY).setPipeline('Light2D').setAlpha(0.5);
        let ctx = this;
        var light = this.lights.addLight(1280/2, 720/2, 200).setIntensity(2);

        ctx.add.sprite(1280/2, 720/2, SplashScene.EXOWORLD_LOGO_ASSET_KEY).setPipeline('Light2D').setAlpha(0.5);

        this.cameras.main.once('camerafadeincomplete', function () {


            ctx.input.on('pointermove', function (pointer) {

                light.x = pointer.x;
                light.y = pointer.y;

            });

            ctx.cameras.main.fadeOut(ctx.totalFadeinAndOut);

        }, this);

        this.cameras.main.once('camerafadeoutcomplete', function () {
            ctx.scene.start(MainMenuScene.SCENE_KEY, { bundle:{empyt:'empty'} })
            //ctx.scene.start(ChatScene.SCENE_KEY, { nickname:"hugo" });
        }, this);
        this.cameras.main.fadeIn(ctx.totalFadeinAndOut);




        /*var keys = this.textures.getTextureKeys();

        for (var i = 0; i < keys.length; i++)
        {
            var x = Phaser.Math.Between(0, 1280);
            var y = Phaser.Math.Between(0, 720);

            this.add.image(x, y, keys[i]);
        }*/


    }
}
