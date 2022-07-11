import {QrStruct, TerrainSubType, TerrainType} from "../types/worldTypes";


export class Tile {
    private _q: number;
    private _r: number;
    private _x: number;
    private _y: number;
    private _terrainType: TerrainType;
    private _terrainSubType: TerrainSubType;

    public constructor(
        q: number,
        r: number,
        x: number,
        y: number,
        terrainType: TerrainType,
        terrainSubType: TerrainSubType,
    ) {
        this._q = q;
        this._r = r;
        this._x = x;
        this._y = y;
        this._terrainType = terrainType;
        this._terrainSubType = terrainSubType;
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

}