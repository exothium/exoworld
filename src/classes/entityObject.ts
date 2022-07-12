import {Entity} from "./entity";
import {LivingStats, LivingType, ObjectType} from "../types/entityTypes";
import {QrStruct} from "../types/worldTypes";

export class EntityObject extends Entity {
    private _objectType : ObjectType;

    constructor(
        objectType : ObjectType,
        isInGame: boolean,
    ) {
        super(objectType, true, isInGame);
        this._objectType = objectType;
    }
}