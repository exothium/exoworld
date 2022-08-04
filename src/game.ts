import 'phaser'
import ChatScene from './phaser/scenes/chat_scene'
import MainMenuScene from './phaser/scenes/main_menu_scene'
import SplashScene from './phaser/scenes/splash_scene'
import WorldScene from "./phaser/scenes/world_scene";
import HudScene from "./phaser/scenes/hud_scene/hud_scene";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import TileWindowScene from "./phaser/scenes/hud_scene/sub_scenes/tile_window_scene";
import TileActionWindowScene from "./phaser/scenes/hud_scene/sub_scenes/tile_action_window_scene";


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
        TileWindowScene,
        TileActionWindowScene
    ],
    fontFamily: 'MondwestPixel'
}

window.addEventListener('load', () => {
    const game = new Phaser.Game(config)
});
