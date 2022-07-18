import {ItemType, OwnableType} from '../types/ownableTypes';
import {Ownable} from "./ownable";


export class Item extends Ownable {
    private _itemType : ItemType;

    constructor(type: OwnableType, itemType: ItemType) {
        super(type, itemType);
        this._itemType = itemType;
    }

    get itemType() {
        return this._itemType;
    }
}