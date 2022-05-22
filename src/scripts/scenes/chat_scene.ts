import ChatListener from "../chat/chat_listener";
import ChatMessageEvent from "../chat/chat_message_event";
import ChatService from "../chat/chat_service";

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
    }

    create() {
        this.createAndAnimateLog();
        this.createChatElements();

        this.addChatActivationListener();
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
        const logo = this.add.image(200, 70, ChatScene.PHASER_3_LOGO_ASSET_KEY);
        this.tweens.add({
            targets: logo,
            x: 1080,
            duration: 2500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }

    private createChatElements() {
        this.chatInputForm = this.add.dom(10, 670).createFromCache(ChatScene.CHAT_FORM_ASSET_KEY).setOrigin(0);
        this.chatTextArea = this.add.dom(10, 360).createFromCache(ChatScene.CHAT_DISPLAY_ASSET_KEY).setOrigin(0);
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
