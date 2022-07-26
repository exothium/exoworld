import Phaser from 'phaser';
import Scene = Phaser.Scene;
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import {Tile} from "../../classes/tile";
import Container = Phaser.GameObjects.Container;
import Graphics = Phaser.GameObjects.Graphics;
import {QrStruct} from "../../types/worldTypes";


export default class TileInfoOld extends Container {
    rexUI: RexUIPlugin;
    graphics: Graphics;
    private _tile: Tile;
    private _containerWidth: number = 250;
    private _containerHeight: number = 500;
    private _containerPadding: number = 15;
    private _currentY: number;


    private _background;
    private _tileNameContainer;
    private _tileCoordinatesContainer;
    private _tileResourcesContainer;


    constructor(
        scene: Scene,
        rexUIPlugin: RexUIPlugin
    ) {
        super(scene, 15, 15);
        this.rexUI = rexUIPlugin;
        this.graphics = scene.add.graphics();
        this.setSize(this._containerWidth, this._containerHeight);
        this.setVisible(false);
        this.scene.add.existing(this);
        this.create();

        //draws bounds of the container
        this.graphics.lineStyle(2, 0xD0BBB6);
        this.graphics.strokeRectShape(this.getBounds());

    }

    create() {
        this._currentY = this._containerPadding;
        if (this._tile) {
            this.background();
            this.tileName();
            this.tileCoordinates();
        }
    }

    private background() {
        //background for container
        this._background = this.add(
            this.rexUI.add.roundRectangle(
                (this._containerWidth / 2) + this.x,
                (this._containerHeight / 2) + this.y,
                this._containerWidth,
                this._containerHeight,
                5,
                0x436F7F
            )
        );
    }

    private tileName() {
        this._tileNameContainer = this.scene.add.text(
            this.x + this._containerPadding,
            this.y + this._currentY,
            'Name: ' + this._tile.terrainType + ' - ' + this._tile.terrainSubType,
            {
                fontSize: '16px',
                color: 'white',
                wordWrap: {width: this._containerWidth - 2 * this._containerPadding}
            },
        );
        this.add(this._tileNameContainer);
        this._currentY += this._tileNameContainer.getBounds().height;
    }

    private tileCoordinates() {
        let qr: QrStruct = this._tile.positionQR;
        let xy = this._tile.positionXY;


        this._tileCoordinatesContainer = this.scene.add.text(
            this.x + this._containerPadding,
            this.y + this._currentY + this._containerPadding,
            'Coordinates: ' + 'QR (' + qr.q + ',' + qr.r + '), XY (' + xy.x.toFixed(2) + ',' + xy.y.toFixed(2) + ')',
            {
                fontSize: '16px',
                color: 'white',
                wordWrap: {width: this._containerWidth - (2 * this._containerPadding)}
            },
        );
        this.add(this._tileCoordinatesContainer);
        this._currentY += this._tileCoordinatesContainer.getBounds().height;
    }


    public updateTileInfo(tile: Tile | undefined) {
        if (tile) {
            this._tile = tile;
            this.setVisible(true);
            this.create();
        } else {
            this.setVisible(false);
            this.removeAll(true);
        }
    }
}