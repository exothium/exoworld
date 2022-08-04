import WorldScene from "../../world_scene";
import HudScene from "../hud_scene";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import {CreatureType} from "../../../../types/entityTypes";
import {EntityCreature} from "../../../../classes/entityCreature";
import {EntityObject} from "../../../../classes/entityObject";
import {entityCreatureAction, entityObjectAction} from "../../../../classes/helperClasses/actions";
import {actionsType} from "../../../../types/actionTypes";


export default class TileActionWindowScene extends Phaser.Scene {
    static readonly SCENE_KEY = 'TILE_ACTION_WINDOW_SCENE';
    rexUI: RexUIPlugin;
    private worldScene: WorldScene;
    private hudScene: HudScene;

    private _width = 250;
    private _sceneX = 0;
    private _sceneY = 0;
    private _padding = 0;
    private _currentY = this._padding;

    private _entitiesName;
    private _entities = [];
    private _entitiesPanel;
    private _background;
    private _selectedEntityIndex = 0;
    private _entityName;
    private _entityDescription;
    private _entityActions;
    private _entityActionButton;

    constructor() {
        super(TileActionWindowScene.SCENE_KEY);
    }

    init(data) {
        let { sceneX, sceneY, padding }= data;
        this._sceneX = sceneX;
        this._sceneY = sceneY;
        this.cameras.main.x = this._sceneX;
        this.cameras.main.y = this._sceneY;
        this._padding = padding;
        this._currentY = this._padding;

    }

    create() {
        this.worldScene = <WorldScene>this.scene.get(WorldScene.SCENE_KEY);
        this.hudScene = <HudScene>this.scene.get(HudScene.SCENE_KEY);
        this.scene.setVisible(false);
    }

    private updateInfo() {
        this.removeAll();
        this._currentY = this._padding;
        this.objectsPanel();
        this.objectName();
        this.objectDescription();
        this.objectActions()
        this.background();
        this.scene.setVisible(true);
    }

    private objectsPanel() {
        let x = this._padding;
        let y = this._currentY;
        let arrowHeight = 30;
        let arrowWidth = 17;
        let arrowPadding = 5;
        let width = this._width - (2 * this._padding) - (2 * arrowWidth) - (2 * arrowPadding);
        let height = 75;

        let leftArrow = this.add.image(x + (arrowWidth / 2), y + height / 2, 'arrowLeft').setDepth(1).setInteractive();
        leftArrow.on('pointerdown', (pointer, localX, localY) => {this.changeSelectedObject(this._selectedEntityIndex - 1)});
        let rightArrow = this.add.image(x + arrowWidth + width + (arrowWidth / 2) + (2 * arrowPadding), y + height / 2, 'arrowRight').setDepth(1).setInteractive();
        rightArrow.on('pointerdown', (pointer, localX, localY) => {this.changeSelectedObject(this._selectedEntityIndex + 1)});


        this._entitiesPanel = this.rexUI.add.scrollablePanel({
            x: this._width / 2,
            y: y + height / 2,
            width: width,
            height: height,
            scrollMode: 1,
            panel: {
                child: this.createObjects(),
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

        this._entitiesPanel.setDepth(1);
        this._entitiesPanel.t = this.scrollToSelectedObject();
        this._entitiesPanel.setChildrenInteractive().on('child.click', (child, pointer) => {
            this.changeSelectedObject(child.data.list.index)
        });
        this._currentY += this._entitiesPanel.getBounds().height;
    }


    private createObjects() {
        let sizer = this.rexUI.add.sizer({
            orientation: 'x',
        });

        let childName = this._entitiesName;
        let objects = this._entities;
        let selectedObjectScale = 1.5;

        for (let i = 0; i < objects.length;i++) {
            let hexContainer = this.add.container();
            hexContainer.setData({index: i, object: objects[i]});
            hexContainer.setSize(34, 34);
            hexContainer.add(this.add.image(0, 0, 'creatureBackground')).setScale(i === this._selectedEntityIndex ? selectedObjectScale : 1, i === this._selectedEntityIndex ? selectedObjectScale : 1);
            hexContainer.add(this.add.image(0, 0, childName)).setScale(i === this._selectedEntityIndex ? selectedObjectScale : 1, i === this._selectedEntityIndex ? selectedObjectScale : 1);
            sizer.add(
                hexContainer,
                0,
                'left',
                5,
                false,
            )
        }
        sizer.layout();
        return sizer;
    }

    private changeSelectedObject(index) {
        if(index >= 0 && index < this._entities.length) {
            this._selectedEntityIndex = index;
        }
        this.updateInfo();
    }

    private scrollToSelectedObject() {
        let scrollIndex;
        if(this._selectedEntityIndex === 0) {
            scrollIndex = 0;
        } else if (this._selectedEntityIndex === this._entities.length - 1) {
            scrollIndex = 1;
        } else {
            scrollIndex = (this._selectedEntityIndex + 1) / this._entities.length;
        }
        return scrollIndex;
    }

    private objectName() {
        this._currentY += this._padding;
        this._entityName = this.add.text(
            this._padding,
            this._currentY,
            'Name: ' + this._entities[this._selectedEntityIndex].name,
            {
                fontSize: '16px',
                color: '#D1BBB6',
                wordWrap: {width: this._width - 2 * this._padding}
            },
        );
        this._entityName.setDepth(1);
        this._currentY += this._entityName.getBounds().height;
    }

    private objectDescription() {
        this._currentY += this._padding;
        this._entityDescription = this.add.text(
            this._padding,
            this._currentY,
            'Description: ',
            {
                fontSize: '16px',
                color: '#D1BBB6',
                wordWrap: {width: this._width - 2 * this._padding}
            },
        );
        this._entityDescription.setDepth(1);
        this._currentY += this._entityDescription.getBounds().height;
    }

    private objectActions() {
        this._currentY += this._padding;

        if(this._entities[this._selectedEntityIndex] instanceof EntityCreature) {
            this._entityActions = entityCreatureAction[this._entities[this._selectedEntityIndex].creatureType];
        } else if(this._entities[this._selectedEntityIndex] instanceof EntityObject) {
            this._entityActions = entityObjectAction[this._entities[this._selectedEntityIndex].objectType];
        }

        this._entityActionButton = this.add.image(this._width / 2, this._currentY + 23, this._entityActions[0] + 'Button').setInteractive();

        this._entityActionButton.setDepth(1);
        this._currentY += this._entityActionButton.getBounds().height;
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

    public removeAll() {
        for (let i = 0; i < this.children.list.length; i++) {
            this.children.list[i].disableInteractive();
        }
        this.children.removeAll();
    }

    public updateAction(child) {
        this._entities = child.objects;
        this._entitiesName = child.name;
        this._selectedEntityIndex = 0;
        this.updateInfo();
    }
}