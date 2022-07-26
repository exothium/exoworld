import {Tile} from "../../../classes/tile";
import {Directions, QrStruct} from "../../../types/worldTypes";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import RoundRectangle from "phaser3-rex-plugins/plugins/gameobjects/shape/roundrectangle/RoundRectangle";
import {WorldInstance} from "../../../classes/worldInstance";
import WorldScene from "../../world_scene";
import HudScene from "../hud_scene";

export default class TileInfoScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'TILE_INFO_SCENE';
    rexUI: RexUIPlugin;
    private worldScene : WorldScene;
    private hudScene : HudScene;

    private _width = 250;
    private _sceneX = 15;
    private _sceneY = 15;
    private _padding = 15;
    private _currentY = this._padding;


    private _tile: Tile;
    private _tileName;
    private _tileCoordinates;
    private _tileCreatures;
    private _tileResources;
    private _notExplored;
    private _moveButton;
    private _background;

    constructor() {
        super(TileInfoScene.SCENE_KEY);
    }

    create() {
        this.worldScene = <WorldScene>this.scene.get(WorldScene.SCENE_KEY);
        this.hudScene = <HudScene>this.scene.get(HudScene.SCENE_KEY);
        this.scene.setVisible(false);
        this.cameras.main.x = this._sceneX;
        this.cameras.main.y = this._sceneY;
    }

    private updateInfo() {
        this.removeAll();
        this._currentY = this._padding;
        this.tileName();
        this.tileCoordinates();
        if(this._tile.isExplored) {
            this.tileCreatures();
            this.tileResources();
        } else {
            this.notExplored();
        }
        this.moveButton();
        this.background();
    }

    private tileName() {
        this._tileName = this.add.text(
            this._padding,
            this._currentY,
            'Name: ' + this._tile.terrainType + ' - ' + this._tile.terrainSubType,
            {
                fontSize: '16px',
                color: 'white',
                wordWrap: {width: this._width - 2 * this._padding}
            },
        );
        this._tileName.setDepth(1);
        this._currentY += this._tileName.getBounds().height + this._padding;
    }

    private tileCoordinates() {
        let qr: QrStruct = this._tile.positionQR;
        let xy = this._tile.positionXY;

        this._tileCoordinates = this.add.text(
            this._padding,
            this._currentY,
            'Coordinates: ' + 'QR (' + qr.q + ',' + qr.r + '), XY (' + xy.x.toFixed(2) + ',' + xy.y.toFixed(2) + ')',
            {
                fontSize: '16px',
                color: 'white',
                wordWrap: {width: this._width - (2 * this._padding)}
            },
        );
        this._tileCoordinates.setDepth(1);
        this._currentY += this._tileCoordinates.getBounds().height + this._padding;
    }

    private tileCreatures() {
        let x = this._padding;
        let y = this._currentY;
        let width = this._width - (2 * this._padding);
        let height = 75;

        let title = this.add.text(x, y, 'Creatures:');
        y += this._padding;
        this._tileCreatures = this.rexUI.add.scrollablePanel({
            x: this._width / 2,
            y: y + height / 2,
            width: width,
            height: height,
            scrollMode: 1,
            // Elements
            //background: this.rexUI.add.roundRectangle(this._width / 2, y + height / 2, width, height, 10, 0x836F7F),

            panel: {
                child: this.createCreatureObjects(),
            },
            slider: {
                track: this.rexUI.add.roundRectangle(this._width / 2, y + height - this._padding, width, 5, 5, 0x37606f),
                thumb: this.rexUI.add.roundRectangle(this._width / 2, y + height - this._padding, 5, 5, 5, 0x20404c),
            },
            scroller: {
                threshold: 10,
                slidingDeceleration: 5000,
                backDeceleration: 2000,
            },
        }).layout();

        this._tileCreatures.setDepth(1);
        this._currentY += this._tileCreatures.getBounds().height + title.getBounds().height + this._padding;
    }

    private createCreatureObjects() {
        var sizer = this.rexUI.add.sizer({
            orientation: 'x',
        });

        let creatures = this._tile.entityCreatures;
        let creaturesOrganized = {};

        for (let i = 0; i < creatures.length; i++) {
            if(!creaturesOrganized[creatures[i].name]) {
                creaturesOrganized[creatures[i].name] = [];
            }
            creaturesOrganized[creatures[i].name].push(creatures[i]);
        }


        for (var key in creaturesOrganized) {
            let hexContainer = this.add.container();
            hexContainer.setSize(34, 34);
            hexContainer.add(this.add.image(0,0, 'creatureBackground'));
            hexContainer.add(this.add.image(0, 0, key));
            hexContainer.add(this.add.text(-2, 17, creaturesOrganized[key].length, {fontSize: '14px', color: 'white',}));
            sizer.add(
                hexContainer,
                0,
                'left',
                5
            )
        }
        sizer.layout();
        return sizer;
    }

    private tileResources() {
        let x = this._padding;
        let y = this._currentY;
        let width = this._width - (2 * this._padding);
        let height = 75;

        let title = this.add.text(x, y, 'Resources:');
        y += this._padding;
        this._tileResources = this.rexUI.add.scrollablePanel({
            x: this._width / 2,
            y: y + height / 2,
            width: width,
            height: height,
            scrollMode: 1,
            // Elements
            //background: this.rexUI.add.roundRectangle(this._width / 2, y + height / 2, width, height, 10, 0x836F7F),

            panel: {
                child: this.createResourceObjects(),
            },
            slider: {
                track: this.rexUI.add.roundRectangle(this._width / 2, y + height - this._padding, width, 5, 5, 0x37606f),
                thumb: this.rexUI.add.roundRectangle(this._width / 2, y + height - this._padding, 5, 5, 5, 0x20404c),
            },
            scroller: {
                threshold: 10,
                slidingDeceleration: 5000,
                backDeceleration: 2000,
            },
        }).layout();

        this._tileResources.setDepth(1);
        this._currentY += this._tileResources.getBounds().height + title.getBounds().height + this._padding;
    }

    private createResourceObjects() {
        var sizer = this.rexUI.add.sizer({
            orientation: 'x',
        });

        let resources = this._tile.entityObjects;
        let resourcesOrganized = {};

        for (let i = 0; i < resources.length; i++) {
            if(!resourcesOrganized[resources[i].name]) {
                resourcesOrganized[resources[i].name] = [];
            }
            resourcesOrganized[resources[i].name].push(resources[i]);
        }


        for (var key in resourcesOrganized) {
            let hexContainer = this.add.container();
            hexContainer.setSize(34, 34);
            hexContainer.add(this.add.image(0,0, 'creatureBackground'));
            hexContainer.add(this.add.image(0, 0, key));
            hexContainer.add(this.add.text(-2, 17, resourcesOrganized[key].length, {fontSize: '14px', color: 'white',}));
            sizer.add(
                hexContainer,
                0,
                'left',
                5
            )
        }
        sizer.layout();
        return sizer;
    }

    private notExplored() {
        this._notExplored = this.add.text(
            this._padding,
            this._currentY,
            "Tile hasn't been explored yet...",
            {
                fontSize: '16px',
                color: 'white',
                wordWrap: {width: this._width - 2 * this._padding}
            },
        );

        this._notExplored.setDepth(1);
        this._currentY += this._notExplored.getBounds().height + this._padding;
    }

    private moveButton() {
        let neighborOfPlayer = this.worldScene.world.isPlayerNeighbor(this._tile.positionQR);

        if(neighborOfPlayer.result) {
            this._moveButton = this.add.image(this._width / 2,this._currentY + 23, 'moveButton').setInteractive();
            this._moveButton.on('pointerdown', (pointer, localX, localY) => {

                neighborOfPlayer.direction !== null && this.worldScene.world.movePlayer(neighborOfPlayer.direction);
                this.hudScene.updatePlayerStats(this.worldScene.world.player);
                this.worldScene.renderPlayerOnScene();
                this.updateInfo();

            });
        } else {
            this._moveButton = this.add.image(this._width / 2,this._currentY + 23, 'moveButtonDisabled');
        }

        this._moveButton.setDepth(1);
        this._currentY += this._moveButton.getBounds().height + this._padding;
    }

    private background() {
        this._background = this.rexUI.add.roundRectangle(this._width / 2, this._currentY / 2, this._width, this._currentY, 5, 0x436F7F);
        this._background.setDepth(0);
        this._background.setInteractive();
    }

    public removeAll() {
        for(let i = 0; i < this.children.list.length; i++) {
            this.children.list[i].disableInteractive();
        }
        this.children.removeAll();
    }

    public updateTileInfo(tile: Tile | undefined) {
        if (tile) {
            this._tile = tile;
            this.scene.setVisible(true);
            this.updateInfo();
        } else {
            this.scene.setVisible(false);
        }
    }

}