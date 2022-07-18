import {QrStruct, TerrainSubType, TerrainType} from "../types/worldTypes";
import {EntityObject} from "./entityObject";
import {EntityCreature} from "./entityCreature";


export class Tile {
    private _q: number;
    private _r: number;
    private _x: number;
    private _y: number;
    private _terrainType: TerrainType;
    private _terrainSubType: TerrainSubType;
    private _isExplored: boolean;
    private _entityObjects : EntityObject[];
    private _entityCreatures : EntityCreature[];

    public constructor(
        q: number,
        r: number,
        x: number,
        y: number,
        terrainType: TerrainType,
        terrainSubType: TerrainSubType,
        isExplored: boolean,
        entityObjects: EntityObject[],
        entityCreatures: EntityCreature[],
    ) {
        this._q = q;
        this._r = r;
        this._x = x;
        this._y = y;
        this._terrainType = terrainType;
        this._terrainSubType = terrainSubType;
        this._isExplored = isExplored;
        this._entityObjects = entityObjects;
        this._entityCreatures = entityCreatures;
    }

    get positionQR(): QrStruct {
        return ({
            q: this._q,
            r: this._r,
        })
    }

    get positionXY() {
        return ({
            x: this._x,
            y: this._y,
        })
    }

    get terrainType() : TerrainType {
        return this._terrainType;
    }

    get terrainSubType() : TerrainSubType {
        return this._terrainSubType;
    }

    get isExplored() : boolean {
        return this._isExplored;
    }

    set isExplored(isExplored : boolean) {
        this._isExplored = isExplored;
    }

    get entityObjects() : EntityObject[] {
        return this._entityObjects;
    }

    set entityObjects(entityObjects : EntityObject[]) {
        this._entityObjects = entityObjects;
    }

    get entityCreatures() : EntityCreature[] {
        return this._entityCreatures;
    }

    set entityCreatures(entityCreatures : EntityCreature[]) {
        this._entityCreatures = entityCreatures;
    }

}