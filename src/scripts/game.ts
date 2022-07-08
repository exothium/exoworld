import 'phaser'
import ChatScene from './scenes/chat_scene'
import MainMenuScene from './scenes/main_menu_scene'
import SplashScene from './scenes/splash_scene'
import WorldScene from "./scenes/world_scene";
import HudScene from "./scenes/hud_scene";

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
    // render: {
    //   //  A custom batch size of 1024 quads
    //   batchSize: 256
    // },
    scene: [
        SplashScene,
        MainMenuScene,
        ChatScene,
        WorldScene,
        HudScene
    ],
    /* physics: {
       default: 'arcade',
       arcade: {
         debug: false,
         gravity: { y: 400 }
       }
     }*/
}

window.addEventListener('load', () => {
    const game = new Phaser.Game(config)
})
