import ChatScene from "./chat_scene";

export default class MenuScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'MENU_SCENE';

    private static readonly LOGIN_FORM_ASSET_KEY = "LOGIN_FORM_ASSET_KEY";

    private loginForm: Phaser.GameObjects.DOMElement;
    private textSong: Phaser.GameObjects.Text;
    constructor() {
        super(MenuScene.SCENE_KEY);
    }

    preload() {
        let ctx = this;
        this.load.html(MenuScene.LOGIN_FORM_ASSET_KEY, 'assets/html/login-form.html');
        this.textSong = this.add.text(10, 10, 'Loading audio ...', { font: '25px MondwestPixel',color: "#FFFFFF" });
        this.textSong.setInteractive({ cursor: 'url(assets/cursors/cursor_action.cur), pointer' });
        this.textSong.on('pointerover', function (event, gameObjects) { ctx.textSong.setStyle({color: "#ff2429"}); });
        this.textSong.on('pointerout', function (event, gameObjects) { ctx.textSong.setStyle({color: "#f4fffc"}); });

        this.load.audio('tunetank', [
            'assets/audio/tunetank.com_3935_the-time_by_musicarea.mp3'
        ]);
    }

    create() {
        this.createUiElements();
        this.addEventListeners();
    }

    private createUiElements() {


        this.add.text(643, 303, "gm ΣΧΘTHIAN", {
            color: "#262626",
            fontSize: '60px',
            fontStyle: "bold",
            fontFamily:"MondwestPixel"
        }).setOrigin(0.5);
        this.add.text(640, 300, "gm ΣΧΘTHIAN", {
            color: "#e6992d",
            fontSize: '60px',
            fontStyle: "bold",
            fontFamily:"MondwestPixel"
        }).setOrigin(0.5);

        this.loginForm = this.add.dom(640, 400).createFromCache(MenuScene.LOGIN_FORM_ASSET_KEY);
        this.sound.pauseOnBlur = false;

        var music = this.sound.add('tunetank');

        music.play();

        this.textSong.setText('♬ • Playing  Ivan Shpilevsky - The Time ‣');


    }

    private addEventListeners() {
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on("down", _event => this.chatAction());
        this.loginForm.getChildByName("chat-button").addEventListener('click', _event => this.chatAction());
    }

    private chatAction() {
        let nickname: string = (<HTMLInputElement>this.loginForm.getChildByName("nickname-input")).value.trim();
        if(nickname && nickname.trim().length > 0) {
            this.scene.start(ChatScene.SCENE_KEY, { nickname })
        }
    }
}
