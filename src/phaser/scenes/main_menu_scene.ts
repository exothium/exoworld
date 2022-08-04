import ChatScene from './chat_scene'
import * as dat from 'dat.gui'
import WorldScene from './world_scene'
import HudScene from './hud_scene/hud_scene'

export default class MainMenuScene extends Phaser.Scene {
  static readonly SCENE_KEY = 'MENU_SCENE'

  private static readonly LOGIN_FORM_ASSET_KEY = 'LOGIN_FORM_ASSET_KEY'

    private loginForm: Phaser.GameObjects.DOMElement;
    private textSong: Phaser.GameObjects.Text;
    private menuGUI;
    private _worldSeed = <string>'Exothium';
    private _landSize: number = 1.5;
    private _numberOfRings: number = 50;
    private _shapeNoiseMod: number = 10;
    private _tileTypeNoiseMod: number = 5;
    private _dimensionNumber = 0;
    private _music;
    private _characterType : number = 1;
    private _selectedCharacter : string;
    private _characterAsset;
    private _dogs;
    private _apes;
    private _punks : object = {};

  constructor() {
    super(MainMenuScene.SCENE_KEY)
  }

  preload() {
    const ctx = this
    this.load.html('mainMenu', 'assets/html/main-menu-form.html')
    this.textSong = this.add.text(10, 10, 'Loading audio ...', { font: '25px MondwestPixel', color: '#FFFFFF' })
    this.textSong.setInteractive({ cursor: 'url(assets/cursors/cursor_action.cur), pointer' })
    this.textSong.on('pointerover', function (event, gameObjects) {
      ctx.textSong.setStyle({ color: '#ff2429' })
    })
    this.textSong.on('pointerout', function (event, gameObjects) {
      ctx.textSong.setStyle({ color: '#f4fffc' })
    })

        this.load.audio('tunetank', [
            'assets/audio/tunetank.com_3935_the-time_by_musicarea.mp3'
        ]);

        this.load.json('punks1', 'assets/nfts/characters/punks/1/texture.json');
        this.load.json('punks2', 'assets/nfts/characters/punks/2/texture.json');
        this.load.json('punks3', 'assets/nfts/characters/punks/3/texture.json');

    }

    create() {
        this._punks['1'] = this.cache.json.get('punks1').textures[0].frames;
        this._punks['2'] = this.cache.json.get('punks2').textures[0].frames;
        this._punks['3'] = this.cache.json.get('punks2').textures[0].frames;

        this._selectedCharacter = this._punks['1'][this.random(0, this._punks['1'].length)].filename;
        this._characterAsset = this.add.image(400, 150, 'punks1', this._selectedCharacter );
        this.createUiElements();
    }

    private random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private createUiElements() {
        this.add.text(643, 303, "gm ΣΧΘTHIAN! Use the controls on the right side to interact", {
            color: "#262626",
            fontSize: '30px',
            fontStyle: "bold",
            fontFamily: "MondwestPixel"
        }).setOrigin(0.5);
        this.add.text(640, 300, "gm ΣΧΘTHIAN! Use the controls on the right side to interact", {
            color: "#e6992d",
            fontSize: '30px',
            fontStyle: "bold",
            fontFamily: "MondwestPixel"
        }).setOrigin(0.5);

    this.sound.pauseOnBlur = false
    if (!this._music) {
      this._music = this.sound.add('tunetank')
      this._music.play()
    }

    this.textSong.setText('♬ Playing  Ivan Shpilevsky - The Time ‣')
    this.textSong.on('pointerdown', pointer => {
      if (this._music.isPaused) {
        this.textSong.setText('♬ Playing  Ivan Shpilevsky - The Time •')
        this._music.resume()
      } else {
        this.textSong.setText('♬ Paused  Ivan Shpilevsky - The Time ‣')
        this._music.pause()
      }
    })

    this.createControls()
  }

  private instanceParameters() {
    const instanceParameters: object = {
      dimensionNumber: this._dimensionNumber,
      worldSeed: this._worldSeed,
      landSize: this._landSize,
      numberOfRings: this._numberOfRings,
      shapeNoiseMod: this._shapeNoiseMod,
      tileTypeNoiseMod: this._tileTypeNoiseMod
    }
    return instanceParameters
  }

  private createControls() {
    this.menuGUI = new dat.GUI()
    const instanceCreateFolder = this.menuGUI.addFolder('Create new instance')
    instanceCreateFolder.open()

        let controllers = {
            worldSeed: this._worldSeed,
            landSize: this._landSize,
            numberOfRings: this._numberOfRings,
            shapeNoiseMod: this._shapeNoiseMod,
            tileTypeNoiseMod: this._tileTypeNoiseMod,
            characterType: this._characterType,
        };

    instanceCreateFolder
      .add(controllers, 'worldSeed')
      .name('world seed')
      .onChange((value: string) => {
        this._worldSeed = value
      })

    instanceCreateFolder
      .add(controllers, 'landSize', 0, 5)
      .name('land size')
      .onChange((value: number) => {
        this._landSize = value
      })

    instanceCreateFolder
      .add(controllers, 'numberOfRings', 0, 125)
      .name('number of rings')
      .onChange((value: number) => {
        this._numberOfRings = value
      })

    instanceCreateFolder
      .add(controllers, 'shapeNoiseMod', 0, 100)
      .name('shape noise')
      .onChange((value: number) => {
        this._shapeNoiseMod = value
      })

    instanceCreateFolder
      .add(controllers, 'tileTypeNoiseMod', 0, 100)
      .name('tile noise')
      .onChange((value: number) => {
        this._tileTypeNoiseMod = value
      })

        instanceCreateFolder.add(controllers, "characterType", 1, 3, 1).name("character type (random)").onChange((value: number) => {
            this._characterType = value;
        });

        instanceCreateFolder.add({
            createWorld: () => {
                console.log(this._worldSeed);
                this.menuGUI.destroy();
                this.scene.stop();
                this.game.scene.start(
                    HudScene.SCENE_KEY,
                );
                this.game.scene.start(
                    WorldScene.SCENE_KEY,
                    this.instanceParameters(),
                );
            }
        }, 'createWorld');

    const instanceLoadDimensionFolder = this.menuGUI.addFolder('instanceLoadDimensionFolder')
    instanceLoadDimensionFolder.open()

    const loadDimension = {
      dimensionNumber: this._dimensionNumber
    }

    instanceLoadDimensionFolder
      .add(loadDimension, 'dimensionNumber')
      .name('Dimension Number')
      .onChange((value: number) => {
        this._dimensionNumber = value
      })

    instanceLoadDimensionFolder.add(
      {
        loadDimension: () => {
          this.menuGUI.destroy()
          this.scene.launch(HudScene.SCENE_KEY)
          this.scene.start(WorldScene.SCENE_KEY, this.instanceParameters())
        }
      },
      'loadDimension'
    )

    //this.loginForm = this.add.dom(10, 670).createFromCache('mainMenu').setOrigin(0);
  }
}
