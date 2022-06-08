import 'phaser'
import ChatScene from './scenes/chat_scene'
import MenuScene from './scenes/menu_scene'
import SplashScene from './scenes/splash_scene'
import WorldScene from './scenes/world_scene'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 800

const config = {
  type: Phaser.AUTO,
  // dom: {
  //     createContainer: true
  // },
  backgroundColor: '#484848',
  scale: {
    parent: 'phaser-game',
    // mode: Phaser.Scale.FIT,
    // autoCenter: Phaser.Scale.CENTER_BOTH,
    // width: DEFAULT_WIDTH,
    // height: DEFAULT_HEIGHT,
    batchSize: 5000,
  },
  // render: {
  //   //  A custom batch size of 1024 quads
  //   batchSize: 256
  // },
  scene: [SplashScene,MenuScene,ChatScene ],
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
