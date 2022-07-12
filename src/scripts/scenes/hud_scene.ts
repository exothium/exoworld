import {TileType} from "../../types/worldTypes";
import Text = Phaser.GameObjects.Text;
import {Entity} from "../../classes/entity";
import {Tile} from "../../classes/tile";

export default class HudScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'HUD_SCENE';
    private tileInfoText: Phaser.GameObjects.Text;
    private playerStatsText: Phaser.GameObjects.Text;

    constructor() {
        super(HudScene.SCENE_KEY);
    }

    init() {
        this.tileInfoText = this.add.text(0, 0, "", {fontSize: '12' });
        this.playerStatsText = this.add.text(0, 15, "", {fontSize: '12'});
    }

    public updateTileInfo(tile: Tile | undefined) {
        if (tile) {
            let QRTile = tile.positionQR;
            let q = QRTile.q;
            let r = QRTile.r;
            this.tileInfoText.setText('Q: ' + q + ', R: ' + r + ', Type: ' + tile.terrainType + ', SubType: ' + tile.terrainSubType + ', Explored: ' + tile.isExplored);
        } else {
            this.tileInfoText.setText('No tile selected');
        }
    }

    public updatePlayerStats(entity: Entity) {
        this.playerStatsText.setText(JSON.stringify(entity));
    }
}