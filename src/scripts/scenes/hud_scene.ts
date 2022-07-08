import { Tile } from "../../types/worldTypes";
import Text = Phaser.GameObjects.Text;
import {Entity} from "../../classes/entity";

export default class HudScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'HUD_SCENE';
    private tileInfoText: Phaser.GameObjects.Text;
    private playerStatsText: Phaser.GameObjects.Text;

    constructor() {
        super(HudScene.SCENE_KEY);
    }

    init() {
        this.tileInfoText = this.add.text(0, 0, "");
        this.playerStatsText = this.add.text(0, 15, "");
    }

    public updateTileInfo(tile : Tile | undefined) {
        if (tile) {
            this.tileInfoText.setText('Q: ' + tile.q + ', R: ' + tile.r + ', Type: ' + tile.terrainType + ', SubType: ' + tile.terrainSubType);
        } else {
            this.tileInfoText.setText('No tile selected');
        }
    }

    public updatePlayerStats(entity : Entity) {
        this.playerStatsText.setText(JSON.stringify(entity));
    }
}