import ChatScene from "./chat_scene";

export default class MenuScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'MENU_SCENE';

    private static readonly LOGIN_FORM_ASSET_KEY = "LOGIN_FORM_ASSET_KEY";

    private loginForm: Phaser.GameObjects.DOMElement;

    constructor() {
        super(MenuScene.SCENE_KEY);
    }

    preload() {
        this.load.html(MenuScene.LOGIN_FORM_ASSET_KEY, 'assets/html/login-form.html');
    }

    create() {
        this.createUiElements();
        this.addEventListeners();
    }

    private createUiElements() {
        this.add.text(640, 300, "Chat Demo", {
            color: "#FFFFFF",
            fontSize: '60px',
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.loginForm = this.add.dom(640, 400).createFromCache(MenuScene.LOGIN_FORM_ASSET_KEY);
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
