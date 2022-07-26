import {TileType} from "../../types/worldTypes";
import Text = Phaser.GameObjects.Text;
import {Entity} from "../../classes/entity";
import {Tile} from "../../classes/tile";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import TileInfoScene from "./sub_scenes/tile_window_scene";
import WorldScene from "../world_scene";


export default class HudScene extends Phaser.Scene {
    rexUI: RexUIPlugin;
    static readonly SCENE_KEY = 'HUD_SCENE';
    private playerStatsText: Phaser.GameObjects.Text;
    public tileInfoScene: TileInfoScene;

    constructor() {
        super(HudScene.SCENE_KEY);
    }

    create() {
        this.playerStatsText = this.add.text(0, 15, "", {fontSize: '12px'});
        this.createTileInfoScene();
    }

    createTileInfoScene() {
        this.scene.launch(TileInfoScene.SCENE_KEY);
        this.scene.start(TileInfoScene.SCENE_KEY);
        this.tileInfoScene = <TileInfoScene>this.scene.get(TileInfoScene.SCENE_KEY);
    }

    public updatePlayerStats(entity: Entity) {
        this.playerStatsText.setText(JSON.stringify(entity.name));
    }
}