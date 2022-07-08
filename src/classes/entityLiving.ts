import { Entity } from "./entity";
import { QrStruct } from "../types/worldTypes";
import {Living, LivingStats} from "../types/entityTypes";

export class EntityLiving extends Entity {
    private _livingType : Living;
    private _livingStats : LivingStats;

    constructor(
        livingType : Living,
        livingStats : LivingStats,
        name: string,
        location: QrStruct,
        isInGame: boolean,
        ) {
            super(name, location, true, isInGame);
            this._livingType = livingType;
            this._livingStats = livingStats;
    }
}