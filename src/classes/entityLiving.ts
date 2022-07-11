import { Entity } from "./entity";
import { QrStruct } from "../types/worldTypes";
import {LivingType, LivingStats} from "../types/entityTypes";

export class EntityLiving extends Entity {
    private _livingType : LivingType;
    private _livingStats : LivingStats;

    constructor(
        livingType : LivingType,
        livingStats : LivingStats,
        name: string,
        isInGame: boolean,
        ) {
            super(name, true, isInGame);
            this._livingType = livingType;
            this._livingStats = livingStats;
    }
}