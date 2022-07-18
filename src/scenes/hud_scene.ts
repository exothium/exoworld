import {TileType} from "../types/worldTypes";
import Text = Phaser.GameObjects.Text;
import {Entity} from "../classes/entity";
import {Tile} from "../classes/tile";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';


export default class HudScene extends Phaser.Scene {
    rexUI: RexUIPlugin;
    static readonly SCENE_KEY = 'HUD_SCENE';
    private tileInfoText: Phaser.GameObjects.Text;
    private playerStatsText: Phaser.GameObjects.Text;

    constructor() {
        super(HudScene.SCENE_KEY);
    }

    init() {
        this.tileInfoText = this.add.text(0, 0, "", {fontSize: '12'});
        this.playerStatsText = this.add.text(0, 15, "", {fontSize: '12'});

        /*this.rexUI.add.scrollablePanel({
            x: 400,
            y: 300,
            scrollMode: 0,
            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0x7b5e57),
            panel: {
                child: this.createGrid(this),
                mask: true
            },
        })
            .add(
                this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x7b5e57),
                {
                    proportion: 0,
                    align: 'bottom'
                }
            )
            .add(
                this.rexUI.wrapExpandText(this.add.text(0, 0, 'cenas')),
                {
                    proportion: 1,
                    align: 'center',
                    expand: true
                }
            )
            .add(
                this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x7b5e57),
                {
                    proportion: 0,
                    align: 'bottom'
                }
            )
            .layout()
            .drawBounds(this.add.graphics(), 0xff0000)*/
    }

    private createGrid(scene) {
        // Create table body
        var sizer = scene.rexUI.add.fixWidthSizer({
            space: {
                left: 3,
                right: 3,
                top: 3,
                bottom: 3,
                item: 8,
                line: 8,
            },
        })
            .addBackground(scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, 0x7b5e57))

        for (var i = 0; i < 30; i++) {
            sizer.add(scene.rexUI.add.label({
                width: 60, height: 60,

                background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 14, 0x7b5e57),
                text: scene.add.text(0, 0, `${i}`, {
                    fontSize: 18
                }),

                align: 'center',
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10,
                }
            }));
        }

        return sizer;
    }

    public updateTileInfo(tile: Tile | undefined) {
        if (tile) {
            let QRTile = tile.positionQR;
            let q = QRTile.q;
            let r = QRTile.r;
            this.tileInfoText.setText(
                'Q: ' + q +
                ', R: ' + r +
                ', Type: ' + tile.terrainType +
                ', SubType: ' + tile.terrainSubType +
                ', Explored: ' + tile.isExplored +
                ', EntityCreatures: ' + JSON.stringify(tile.entityCreatures));
        } else {
            this.tileInfoText.setText('No tile selected');
        }
    }

    public updatePlayerStats(entity: Entity) {
        this.playerStatsText.setText(JSON.stringify(entity));
    }
}