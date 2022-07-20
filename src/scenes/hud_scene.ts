import {TileType} from "../types/worldTypes";
import Text = Phaser.GameObjects.Text;
import {Entity} from "../classes/entity";
import {Tile} from "../classes/tile";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import TileInfo from './elements/tileInfo';


export default class HudScene extends Phaser.Scene {
    rexUI: RexUIPlugin;
    static readonly SCENE_KEY = 'HUD_SCENE';
    private playerStatsText: Phaser.GameObjects.Text;
    public tileInfo : TileInfo;

    constructor() {
        super(HudScene.SCENE_KEY);
    }

    init() {
        this.playerStatsText = this.add.text(0, 15, "", {fontSize: '12'});
        this.tileInfo = new TileInfo(this, this.rexUI);
    }

    public updatePlayerStats(entity: Entity) {
        this.playerStatsText.setText(JSON.stringify(entity));
    }
}