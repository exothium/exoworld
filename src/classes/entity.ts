import { QrStruct } from "../types/worldTypes";

export class Entity {
    private _name : string;
    private _isInteractive : boolean;
    private _isInGame : boolean;

    //TODO _interaction and _interact
    //private _interactions;
    //private _interact;

    constructor(
        name : string,
        isInteractive : boolean,
        isInGame : boolean,
        ) {
        this._name = name;
        this._isInteractive = isInteractive;
        this._isInGame = isInGame;
    }
}