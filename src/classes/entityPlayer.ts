import { EntityLiving } from "./entityLiving";
import { Living, LivingStats, PlayerStats} from "../types/entityTypes";
import {QrStruct} from "../types/worldTypes";


export class EntityPlayer extends EntityLiving {
    //TODO _items
    //private _items
    private _playerStats : PlayerStats;

    constructor(
        livingType : Living,
        livingStats : LivingStats,
        name : string,
        location : QrStruct,
        isInGame : boolean,
        playerStats : PlayerStats
    ) {
        super(livingType, livingStats, name, location, isInGame);
        this._playerStats = playerStats;
    }
}