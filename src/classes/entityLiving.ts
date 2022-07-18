import { Entity } from "./entity";
import { QrStruct } from "../types/worldTypes";
import {LivingType, LivingStats} from "../types/entityTypes";

export class EntityLiving extends Entity {
    private _livingStats : LivingStats;

    constructor(
        livingStats : LivingStats,
        name: string,
        isInGame: boolean,
        ) {
            super(name, true, isInGame);
            this._livingStats = livingStats;
    }
}