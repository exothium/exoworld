import {TileType} from "../../../types/worldTypes";
import Text = Phaser.GameObjects.Text;
import {Entity} from "../../../classes/entity";
import {Tile} from "../../../classes/tile";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import TileWindowScene from "./sub_scenes/tile_window_scene";
import WorldScene from "../world_scene";
import TileActionWindowScene from "./sub_scenes/tile_action_window_scene";


export default class HudScene extends Phaser.Scene {
    rexUI: RexUIPlugin;
    static readonly SCENE_KEY = 'HUD_SCENE';
    private playerStatsText: Phaser.GameObjects.Text;
    public tileWindowScene: TileWindowScene;
    public tileActionWindowScene : TileActionWindowScene;

    constructor() {
        super(HudScene.SCENE_KEY);
    }

    create() {
        this.playerStatsText = this.add.text(0, 15, "", {fontSize: '12px'});
        this.createTileInfoScene();
    }

    createTileInfoScene() {
        this.game.scene.start(TileWindowScene.SCENE_KEY);
        this.tileWindowScene = <TileWindowScene>this.scene.get(TileWindowScene.SCENE_KEY);
        this.tileActionWindowScene = <TileActionWindowScene>this.scene.get(TileActionWindowScene.SCENE_KEY);
    }

    public updatePlayerStats(entity: Entity) {
        this.playerStatsText.setText(JSON.stringify(entity.name));
    }

    public stopScenes() {
        this.scene.stop();
        this.game.scene.stop(TileWindowScene.SCENE_KEY);
        this.game.scene.stop(TileActionWindowScene.SCENE_KEY);
    }
}