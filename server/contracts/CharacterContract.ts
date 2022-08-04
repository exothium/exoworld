import SimplexNoise from 'simplex-noise'
import {AssetSprite, QrStruct, TerrainHeight, TerrainSubType, TerrainType, Tiles} from '../../src/types/worldTypes'
import {Tile} from '../../src/classes/tile'
import {CanvasSettings, NoiseHeightDefaults, NoiseLandDefaults} from '../../src/types/gameConstants'

export class CharacterContract {
    private _characterCount = 0;
    private _character: { [characterNumber: number]: string };
    private _tileId: string;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor() {
    }

    //Create a character and Wallet/userID connection
    public mint(userID): number {
        const characterNumber = this._characterCount;
        this._character[characterNumber] = userID;
        this._characterCount++;
        return characterNumber
    }

    public airDrop(characterNumber: number): string {
        const q = 0;
        const r = 0;
        const tileID = q + '_' + r;
        this._tileId = tileID;
        return tileID
    }

    // todo move this to the contract -> MOVE
    public move(characterNumber: number, q: number, r: number): string {
        const tileID = q + '_' + r;
        this._tileId = tileID;
        return tileID
    }
}
