import {EntityLiving} from "./entityLiving";
import {CreatureType, LivingStats, LivingType} from "../types/entityTypes";

export class EntityCreature extends EntityLiving {
    private _creatureType: CreatureType;

    constructor(
        creatureType: CreatureType,
        livingStats: LivingStats,
        name: string,
        isInGame: boolean,
    ) {
        super(livingStats, name, isInGame);
        this._creatureType = creatureType;
    }

}