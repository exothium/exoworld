import ChatListener from "../chat/chat_listener";
import ChatMessageEvent from "../chat/chat_message_event";
import ChatService from "../chat/chat_service";
import WorldScene from "./world_scene";

export default class ChatScene extends Phaser.Scene implements ChatListener {
    static readonly SCENE_KEY = 'CHAT_SCENE';

    private static readonly CHAT_FORM_ASSET_KEY = 'CHAT_FORM_ASSET_KEY';
    private static readonly CHAT_DISPLAY_ASSET_KEY = 'CHAT_DISPLAY_ASSET_KEY';
    private static readonly PHASER_3_LOGO_ASSET_KEY = 'CHAT_FORM_ASSET_KEY';

    private nickname: string;
    private chatInputForm: Phaser.GameObjects.DOMElement;
    private chatTextArea: Phaser.GameObjects.DOMElement;
    private chatService: ChatService;

    constructor() {
        super(ChatScene.SCENE_KEY);
        this.chatService = new ChatService();
        this.chatService.registerListener(this);
    }

    init(data: any) {
        this.nickname = data.nickname;
        this.chatService.registerUser(this.nickname);

    }

    preload() {
        this.load.html(ChatScene.CHAT_FORM_ASSET_KEY, 'assets/html/chat-form.html');
        this.load.html(ChatScene.CHAT_DISPLAY_ASSET_KEY, 'assets/html/chat-display.html');
        this.load.image(ChatScene.PHASER_3_LOGO_ASSET_KEY, 'assets/img/phaser3-logo.png');
        this.load.image("WINDOW", 'assets/sprites/demos-window.png');
    }

    create() {
        this.createAndAnimateLog();
        this.createChatElements();

        this.addChatActivationListener();
        //let worldscene = this.scene.get(WorldScene.SCENE_KEY);
        this.scene.add('worldscene', WorldScene, true, { x: 0, y: 0 });
    }

    onMessage(message: ChatMessageEvent): void {
        const newChatEntry = document.createElement("div");
        newChatEntry.style.cssText = "font-family: MondwestPixel";
        newChatEntry.innerHTML = `<span  ${message.username === this.nickname ? 'class=\'self\'' : ''}>${message.username}:</span> ${message.message}`;

        let chatElement = this.chatTextArea.getChildByID('chat-display');
        chatElement!.appendChild(newChatEntry);
        chatElement!.scrollTop = chatElement!.scrollHeight;
    }

    private createAndAnimateLog() {
        // const logo = this.add.image(200, 70, ChatScene.PHASER_3_LOGO_ASSET_KEY);
        // this.tweens.add({
        //     targets: logo,
        //     x: 1080,
        //     duration: 2500,
        //     ease: 'Sine.inOut',
        //     yoyo: true,
        //     repeat: -1
        // });

    }

    private createChatElements() {
        //let demosWindow = this.add.image(10, 0, 'WINDOW').setOrigin(0);
        this.chatInputForm = this.add.dom(10, 670).createFromCache(ChatScene.CHAT_FORM_ASSET_KEY).setOrigin(0);
        this.chatTextArea = this.add.dom(10, 360).createFromCache(ChatScene.CHAT_DISPLAY_ASSET_KEY).setOrigin(0);
        let demosContainer = this.add.container(32, 70, [ this.chatInputForm, this.chatTextArea ]);
        demosContainer.setInteractive(new Phaser.Geom.Rectangle(10, 300, this.chatTextArea.width, this.chatTextArea.height), Phaser.Geom.Rectangle.Contains);
        this.input.setDraggable(demosContainer);

        demosContainer.on('drag', function (pointer, dragX, dragY) {
            demosContainer.x = dragX;
            demosContainer.y = dragY;
            console.log("teste"+ dragX);
        });
    }

    private addChatActivationListener() {
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on("down", _event => {
            let chatInput: HTMLInputElement = <HTMLInputElement>this.chatInputForm.getChildByName("chat-input");
            let message: string = chatInput.value.trim();
            if (message && message.trim().length > 0) {
                this.chatService.sendMesage(message);
                chatInput.value = '';
                this.onMessage({ username: this.nickname, message });
            }
        });
    }
}
