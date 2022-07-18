import {ItemType, OwnableType} from '../types/ownableTypes';
import {TokenId} from './helperClasses/tokenInfo';

export class Ownable {
    private _type : OwnableType;
    private _id : number;

    constructor(type : OwnableType, tokenName : string) {
        this._type = type;
        this.idByName = tokenName;
    }

    set idByName(tokenName : string) {
        this._id = TokenId[tokenName];
    }

    get id() : number {
        return this._id;
    }
}