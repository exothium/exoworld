import {Tile} from "../../../../classes/tile";
import {Directions, QrStruct} from "../../../../types/worldTypes";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import RoundRectangle from "phaser3-rex-plugins/plugins/gameobjects/shape/roundrectangle/RoundRectangle";
import {WorldInstance} from "../../../../classes/worldInstance";
import WorldScene from "../../world_scene";
import HudScene from "../hud_scene";
import TileActionWindowScene from "./tile_action_window_scene";

export default class TileWindowScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'TILE_WINDOW_SCENE';
    rexUI: RexUIPlugin;
    private worldScene: WorldScene;
    private hudScene: HudScene;

    private _width = 250;
    private _sceneX = 15;
    private _sceneY = 15;
    private _padding = 15;
    private _currentY = this._padding;

    private _tile: Tile;
    private _tileName;
    private _tileCoordinates;
    private _tileCreatures: object = {};
    private _tileCreaturesPanel;
    private _tileResources;
    private _tileResourcesPanel;
    private _notExplored;
    private _moveButton;
    private _background;

    constructor() {
        super(TileWindowScene.SCENE_KEY);
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
        if (this._tile.isExplored) {
            this.tileCreatures();
            this.tileResources();
        } else {
            this.notExplored();
        }
        this.moveButton();
        this.background();

        this.setInteractive();

        this.showTileActionWindowScene();
    }

    private showTileActionWindowScene() {
        this.game.scene.start(TileActionWindowScene.SCENE_KEY, {sceneX: this._sceneX + this._width, sceneY: this._sceneY, padding: this._padding});
    }

    private tileName() {
        this._tileName = this.add.text(
            this._padding,
            this._currentY,
            'Name: ' + this._tile.terrainType + ' - ' + this._tile.terrainSubType,
            {
                fontSize: '16px',
                color: '#D1BBB6',
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
                color: '#D1BBB6',
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

        let title = this.add.text(x, y, 'Creatures', {fontSize: '18px', color: '#D1BBB6'}).setDepth(1);
        y += this._padding;
        this._tileCreaturesPanel = this.rexUI.add.scrollablePanel({
            x: this._width / 2,
            y: y + height / 2,
            width: width,
            height: height,
            scrollMode: 1,
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

        this._tileCreaturesPanel.setDepth(1);
        this._tileCreaturesPanel.setChildrenInteractive().on('child.click', (child, pointer) => {
            this.hudScene.tileActionWindowScene.updateAction(child.data.list);
        });
        this._currentY += this._tileCreaturesPanel.getBounds().height + title.getBounds().height + this._padding;
    }

    private createCreatureObjects() {
        let sizer = this.rexUI.add.sizer({
            orientation: 'x',
        });

        let creatures = this._tile.entityCreatures;
        this._tileCreatures = {};

        for (let i = 0; i < creatures.length; i++) {
            if (!this._tileCreatures[creatures[i].creatureType]) {
                this._tileCreatures[creatures[i].creatureType] = [];
            }
            this._tileCreatures[creatures[i].creatureType].push(creatures[i]);
        }


        for (var key in this._tileCreatures) {
            let hexContainer = this.add.container();
            hexContainer.setData({name: key, objects: this._tileCreatures[key]});
            hexContainer.setSize(34, 34);
            hexContainer.add(this.add.image(0, 0, 'creatureBackground'));
            hexContainer.add(this.add.image(0, 0, key));
            hexContainer.add(this.add.text(-2, 17, this._tileCreatures[key].length, {
                fontSize: '14px',
                color: '#D1BBB6',
            }));
            sizer.add(
                hexContainer,
                0,
                'left',
                5,
                false,
                key,
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

        let title = this.add.text(x, y, 'Resources', {fontSize: '18px', color: '#D1BBB6'}).setDepth(1);
        y += this._padding;
        this._tileResourcesPanel = this.rexUI.add.scrollablePanel({
            x: this._width / 2,
            y: y + height / 2,
            width: width,
            height: height,
            scrollMode: 1,
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

        this._tileResourcesPanel.setDepth(1);
        this._tileResourcesPanel.setChildrenInteractive().on('child.click', (child, pointer, event) => {
            this.hudScene.tileActionWindowScene.updateAction(child.data.list);
        });
        this._currentY += this._tileResourcesPanel.getBounds().height + title.getBounds().height + this._padding;
    }

    private createResourceObjects() {
        var sizer = this.rexUI.add.sizer({
            orientation: 'x',
        });

        let resources = this._tile.entityObjects;
        this._tileResources = {};

        for (let i = 0; i < resources.length; i++) {
            if (!this._tileResources[resources[i].objectType]) {
                this._tileResources[resources[i].objectType] = [];
            }
            this._tileResources[resources[i].objectType].push(resources[i]);
        }


        for (var key in this._tileResources) {
            let hexContainer = this.add.container();
            hexContainer.setSize(34, 34);
            hexContainer.setData({name: key, objects: this._tileResources[key]});
            hexContainer.add(this.add.image(0, 0, 'creatureBackground'));
            hexContainer.add(this.add.image(0, 0, key));
            hexContainer.add(this.add.text(-2, 17, this._tileResources[key].length, {
                fontSize: '14px',
                color: '#D1BBB6',
            }));
            sizer.add(
                hexContainer,
                0,
                'left',
                5,
                false,
                key,
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
                color: '#D1BBB6',
                wordWrap: {width: this._width - 2 * this._padding}
            },
        );

        this._notExplored.setDepth(1);
        this._currentY += this._notExplored.getBounds().height + this._padding;
    }

    private moveButton() {
        let neighborOfPlayer = this.worldScene.world.isPlayerNeighbor(this._tile.positionQR);

        if (neighborOfPlayer.result) {
            this._moveButton = this.add.image(this._width / 2, this._currentY + 23, 'moveButton').setInteractive();
        } else {
            this._moveButton = this.add.image(this._width / 2, this._currentY + 23, 'moveButtonDisabled');
        }

        this._moveButton.setDepth(1);
        this._currentY += this._moveButton.getBounds().height;
    }

    private background() {
        this._currentY += this._padding;
        let graphics = this.add.graphics();
        graphics.lineStyle(5, 0xD1BBB6, 1);
        graphics.strokeRect(2.5, 2.5, this._width, this._currentY);
        graphics.setDepth(0.1);
        this._background = this.rexUI.add.roundRectangle(this._width / 2, this._currentY / 2, this._width, this._currentY, 0, 0x436F7F);
        this._background.setDepth(0);
        this._background.setInteractive();
    }

    private setInteractive() {
        //move button
        let neighborOfPlayer = this.worldScene.world.isPlayerNeighbor(this._tile.positionQR);
        this._moveButton.on('pointerdown', (pointer, localX, localY) => {
            neighborOfPlayer.direction !== null && this.worldScene.world.movePlayer(neighborOfPlayer.direction);
            this.hudScene.updatePlayerStats(this.worldScene.world.player);
            this.worldScene.renderPlayerOnScene();
            this.updateInfo();
        });


    }

    public removeAll() {
        for (let i = 0; i < this.children.list.length; i++) {
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