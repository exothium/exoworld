import { EntityLiving } from "./entityLiving";
import { LivingType, LivingStats, PlayerStats} from "../types/entityTypes";
import {QrStruct} from "../types/worldTypes";


export class EntityPlayer extends EntityLiving {
    //TODO _items
    //private _items
    private _playerStats : PlayerStats;
    private _location : QrStruct;

    constructor(
        livingType : LivingType,
        livingStats : LivingStats,
        name : string,
        location : QrStruct,
        isInGame : boolean,
        playerStats : PlayerStats
    ) {
        super(livingType, livingStats, name, isInGame);
        this._playerStats = playerStats;
        this._location = location;
    }
}