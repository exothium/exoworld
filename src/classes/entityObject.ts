import {Entity} from "./entity";
import {LivingStats, LivingType, ObjectType} from "../types/entityTypes";
import {QrStruct} from "../types/worldTypes";

export class EntityObject extends Entity {
    private _objectType : ObjectType;

    constructor(
        objectType : ObjectType,
        name: string,
        isInGame: boolean,
    ) {
        super(name, true, isInGame);
        this._objectType = objectType;
    }
}