import 'phaser'
import ChatScene from './scenes/chat_scene'
import MainMenuScene from './scenes/main_menu_scene'
import SplashScene from './scenes/splash_scene'
import WorldScene from "./scenes/world_scene";
import HudScene from "./scenes/hud_scene/hud_scene";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import TileInfoScene from "./scenes/hud_scene/sub_scenes/tile_info_scene";


const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    dom: {
        createContainer: true
    },
    pixelArt: true,
    scale: {
        // Fit to window
        mode: Phaser.Scale.FIT,
        // Center vertically and horizontally
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#484848',
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI'
        },
            // ...
        ]
    },
    scene: [
        SplashScene,
        MainMenuScene,
        ChatScene,
        WorldScene,
        HudScene,
        TileInfoScene
    ],
    fontFamily: 'MondwestPixel'
}

window.addEventListener('load', () => {
    const game = new Phaser.Game(config)
});
