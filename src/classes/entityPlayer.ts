import {EntityLiving} from "./entityLiving";
import {LivingType, LivingStats, PlayerStats} from "../types/entityTypes";
import {QrStruct} from "../types/worldTypes";


export class EntityPlayer extends EntityLiving {
    //TODO _items
    //private _items
    private _playerStats: PlayerStats;
    private _location: QrStruct;

    constructor(
        livingStats: LivingStats,
        name: string,
        location: QrStruct,
        isInGame: boolean,
        playerStats: PlayerStats
    ) {
        super(livingStats, name, isInGame);
        this._playerStats = playerStats;
        this._location = location;
    }

    set location(location: QrStruct) {
        this._location = location;
    }

    get location() {
        return this._location;
    }

}