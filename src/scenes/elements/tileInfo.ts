import Phaser from 'phaser';
import Scene = Phaser.Scene;
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import {Tile} from "../../classes/tile";
import ScrollablePanel from "phaser3-rex-plugins/templates/ui/scrollablepanel/ScrollablePanel";
import Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import FixWidthSizer from "phaser3-rex-plugins/templates/ui/fixwidthsizer/FixWidthSizer";
import {EntityCreature} from "../../classes/entityCreature";


export default class TileInfo {
    private rexUI: RexUIPlugin;
    private _scene: Scene;
    private _scrollablePanel: ScrollablePanel;

    private _elementWidth: number = 200;

    private _tileTitleText: Phaser.GameObjects.Text;
    private _tileExploredText: Phaser.GameObjects.Text;

    private _tileCreaturesPanel : FixWidthSizer;
    private _tileCreatures : EntityCreature[] = [];


    constructor(
        scene: Scene,
        rexUi: RexUIPlugin,
    ) {
        this._scene = scene;
        this.rexUI = rexUi;
        this.initialize();
    }

    private initialize() {
        this._tileTitleText = this._scene.add.text(0, 0, "", {fontSize: '12', color: 'white'});
        this._tileExploredText = this._scene.add.text(0, 0, "", {fontSize: '12', color: 'white'});
        this.createGrid();
        this.initializePanel()
    }

    private initializePanel() {

        this._scrollablePanel = this.rexUI.add.scrollablePanel({
            x: 0,
            y: 0,
            anchor: {
                left: '5%',
                top: '5%',
            },
            width: this._elementWidth,
            height: 400,
            scrollMode: 0,
            panel: {
                child: this._tileCreaturesPanel,
                mask: true
            },
            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0xff0000),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xff0000),
            },
            header: this.createHeader(),
        })
            .layout()
            .drawBounds(this._scene.add.graphics(), 0xff0000)
    }

    private createHeader() {
        let element = this.rexUI.add.sizer({
            orientation: 'y',
            width: this._elementWidth,
        })
            .add(this._tileTitleText, {align: "left"})
            .add(this._tileExploredText, {align: "left"});
        return element;
    }

    private createGrid() {
        // Create table body
        this._tileCreaturesPanel = this.rexUI.add.fixWidthSizer({
            space: {
                left: 3,
                right: 3,
                top: 20,
                bottom: 3,
                item: 8,
                line: 8,
            },
        })
            .addBackground(this.rexUI.add.roundRectangle(0, 0, 10, 10, 0, 0x7b5e57))

        for (var i = 0; i < this._tileCreatures.length; i++) {
            this._tileCreaturesPanel.add(this.rexUI.add.label({
                width: 20, height: 20,

                background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 14, 0x7b5e57),
                text: this._scene.add.text(0, 0, `${i}`, {
                    fontSize: '18'
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
        this._tileCreaturesPanel.layout();
    }

    public updateTileInfo(tile: Tile | undefined) {
        if (tile) {
            this._tileTitleText.setText('Name ' + tile.terrainType + ' - ' + tile.terrainSubType);
            this._tileExploredText.setText('Explored: ' + tile.isExplored);

            this._tileCreatures = tile.entityCreatures;

            this._scrollablePanel.layout();


            let QRTile = tile.positionQR;
            let q = QRTile.q;
            let r = QRTile.r;
            /*this._tileInfoText.setText(
                'Q: ' + q +
                ', R: ' + r +
                ', Type: ' + tile.terrainType +
                ', SubType: ' + tile.terrainSubType +
                ', Explored: ' + tile.isExplored +
                ', EntityCreatures: ' + JSON.stringify(tile.entityCreatures));*/
        } else {
            this._tileTitleText.setText('No tile selected');
        }
    }


}