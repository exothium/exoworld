import {ResourceType, OwnableType, ItemType} from '../types/ownableTypes';

import {Ownable} from "./ownable";


export class Resource extends Ownable {
    private _resourceType : ResourceType;

    constructor(type: OwnableType, resourceType: ResourceType) {
        super(type, resourceType);
        this._resourceType = resourceType;
    }

    get resourceType() {
        return this._resourceType;
    }
}