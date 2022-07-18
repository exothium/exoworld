import {
    AssetSprite,
    NoiseHeight,
    NoiseLand,
    QrStruct,
    TerrainHeight,
    TerrainSubType,
    TerrainType,
    //TileType,
    Tiles,
    MoveTypes
} from '../types/worldTypes';
import {Tile} from './tile';
import SimplexNoise from 'simplex-noise';
import {EntityTileSpawner} from './helperClasses/entityTileSpawner';
import {EntityPlayer} from "./entityPlayer";
import {EntityObject} from "./entityObject";
import {EntityCreature} from "./entityCreature";

export class WorldInstance {
    private readonly _canvasWidth: number = 1280;
    private readonly _canvasHeight: number = 720;
    private readonly _canvasCenterX: number = this._canvasWidth / 2;
    private readonly _canvasCenterY: number = this._canvasHeight / 2;
    private readonly _hexRadius: number;
    private _tiles: { [key: string]: Tile };
    private _simplex;

    private _worldSeed: string;
    private _worldRadius: number;
    private _numberOfRings: number;
    private _landSize: number;
    private _shapeNoiseMod: number;
    private _tileTypeNoiseMod: number;
    private _noiseHeight: NoiseHeight;
    private _noiseLand: NoiseLand;

    public constructor(
        worldSeed: string,
        hexRadius: number,
        numberOfRings: number,
        landSize: number,
        shapeNoiseMod: number,
        tileTypeNoiseMod: number,
        noiseHeight: NoiseHeight,
        noiseLand: NoiseLand,
    ) {
        this._worldSeed = worldSeed;
        this._hexRadius = hexRadius;
        this._numberOfRings = numberOfRings;
        this._landSize = landSize;
        this._shapeNoiseMod = shapeNoiseMod;
        this._tileTypeNoiseMod = tileTypeNoiseMod;
        this._worldRadius = (hexRadius * numberOfRings) * Math.sqrt(3) + (hexRadius / 2 * Math.sqrt(3));
        this._noiseHeight = noiseHeight;
        this._noiseLand = noiseLand;

        //populate tiles
        this._simplex = new SimplexNoise(this.worldSeed);
        this.setTileCoordinates();

    }

    public get canvasWidth(): number {
        return this._canvasWidth;
    }

    get canvasHeight(): number {
        return this._canvasHeight;
    }

    get canvasCenterX(): number {
        return this._canvasCenterX;
    }

    get canvasCenterY(): number {
        return this._canvasCenterY;
    }

    get worldSeed(): string {
        return this._worldSeed;
    }

    set worldSeed(worldSeed: string) {
        this._worldSeed = worldSeed;
        this._simplex = new SimplexNoise(this.worldSeed);
    }

    get worldRadius(): number {
        return this._worldRadius;
    }

    get hexRadius(): number {
        return this._hexRadius;
    }

    get numberOfRings(): number {
        return this._numberOfRings;
    }

    set numberOfRings(numberOfRings: number) {
        this._numberOfRings = numberOfRings;
    }

    get landSize(): number {
        return this._landSize;
    }

    set landSize(landSize: number) {
        this._landSize = landSize;
    }

    get shapeNoiseMod(): number {
        return this._shapeNoiseMod;
    }

    set shapeNoiseMod(shapeNoiseMod: number) {
        this._shapeNoiseMod = shapeNoiseMod;
    }

    get tileTypeNoiseMod(): number {
        return this._tileTypeNoiseMod;
    }

    set tileTypeNoiseMod(tileTypeNoiseMod: number) {
        this._tileTypeNoiseMod = tileTypeNoiseMod;
    }

    get tiles(): Tiles {
        return this._tiles;
    }

    set tiles(tiles: Tiles) {
        this._tiles = tiles;
    }

    get noiseHeight(): NoiseHeight {
        return this._noiseHeight;
    }

    set noiseHeight(noiseHeight: NoiseHeight) {
        this._noiseHeight = noiseHeight;
    }

    get noiseLand() {
        return this._noiseLand;
    }

    set noiseLand(noiseLand: NoiseLand) {
        this._noiseLand = noiseLand;
    }

    get simplex() {
        return this._simplex;
    }

    set simplex(simplex) {
        this._simplex = simplex;
    }

    public reconstruct() {
        this.setTileCoordinates();
    }

    public setTileCoordinates() {
        let x = 0;
        let y = 0;
        let tiles: object = {};

        //center tile coordinates
        let currenthexQR = this.getInitialHexAxialCoordinates(x, y);
        tiles[currenthexQR.q + '_' + currenthexQR.r] = {x: x, y: y, q: currenthexQR.q, r: currenthexQR.r};

        let centerToCloseBorder = (this.hexRadius) * Math.sqrt(3);
        let radians = Math.PI / 180;

        let countHex = 0;
        for (let i = 1; i <= this.numberOfRings; i++) {
            for (let j = 0; j < 6; j++) {
                let diagonalX = x + Math.cos(j * 60 * radians) * centerToCloseBorder * i;
                let diagonalY = y + Math.sin(j * 60 * radians) * centerToCloseBorder * i;
                currenthexQR = this.getInitialHexAxialCoordinates(diagonalX, diagonalY);
                tiles[currenthexQR.q + '_' + currenthexQR.r] = {
                    x: diagonalX,
                    y: diagonalY,
                    q: currenthexQR.q,
                    r: currenthexQR.r
                };
                countHex++;
                for (let k = 1; k < i; k++) {
                    let fillX = diagonalX + Math.cos((j * 60 + 120) * radians) * centerToCloseBorder * k;
                    let fillY = diagonalY + Math.sin((j * 60 + 120) * radians) * centerToCloseBorder * k;
                    currenthexQR = this.getInitialHexAxialCoordinates(fillX, fillY);
                    tiles[currenthexQR.q + '_' + currenthexQR.r] = {
                        x: fillX,
                        y: fillY,
                        q: currenthexQR.q,
                        r: currenthexQR.r
                    };
                    countHex++;
                }
            }
        }
        this.populateTileTerrainType(tiles);
    }

    public getTile(qr: QrStruct): Tile {
        return this._tiles[qr.q + "_" + qr.r];
    }

    //populate
    private populateTileTerrainType(tiles) {
        for (let key in tiles) {
            let value2d = this.getTileMapNoise(tiles[key].x, tiles[key].y, 'height');
            let terrainHeight = this.terrainHeight(value2d);

            let terrainType;
            let terrainSubType;
            let terrainAssetKey;

            switch (terrainHeight) {
                case TerrainHeight.DEEPWATER:
                    terrainType = TerrainType.WATER;
                    terrainSubType = TerrainSubType.DEEPWATER;
                    terrainAssetKey = AssetSprite.DARKWATER;
                    break;
                case TerrainHeight.SHALLOWWATER:
                    terrainType = TerrainType.WATER;
                    terrainSubType = TerrainSubType.SHALLOWWATER;
                    terrainAssetKey = AssetSprite.LIGHTWATER;
                    break;
                case TerrainHeight.BEACH:
                    terrainType = TerrainType.DESERT;
                    terrainSubType = TerrainSubType.BEACH;
                    terrainAssetKey = AssetSprite.DESERT;
                    break;
                case TerrainHeight.LAND:
                    //if Land we use a new noise for creating more caotic tiles on land
                    value2d = this.getTileMapNoise(tiles[key].x, tiles[key].y, 'terrainType');
                    terrainType = this.terrainTypeOnLand(value2d);
                    terrainSubType = terrainType;
                    break;
                case TerrainHeight.MOUNTAIN:
                    terrainType = TerrainType.MOUNTAIN;
                    terrainSubType = TerrainSubType.MOUNTAIN;
                    terrainAssetKey = AssetSprite.MOUNTAIN;
                    break;
                default:
                    console.log(terrainHeight + ' has no asset to display.')
            }

            tiles[key] =
                new Tile(
                    tiles[key].q,
                    tiles[key].r,
                    tiles[key].x,
                    tiles[key].y,
                    terrainType,
                    terrainSubType,
                    false,
                    [],
                    [],
                );
        }
        this._tiles = tiles;
    }

    private calculateQR(x, y): QrStruct {
        let qr: QrStruct = {
            q: 0,
            r: 0,
        };

        qr.q = Math.round((Math.sqrt(3) / 3 * x - y / 3) / (this.hexRadius));
        qr.r = Math.round((y * 2 / 3) / (this.hexRadius));

        return qr;
    }

    private getInitialHexAxialCoordinates(x_, y_): QrStruct {
        let spaceX = Math.round(x_);
        let spaceY = Math.round(y_);
        return this.calculateQR(spaceX, spaceY);
    }

    public getAxialCoordinatesFromOffSetCoordinates(x_, y_): QrStruct {
        let spaceX = Math.round(x_ - (this._worldRadius));
        let spaceY = Math.round(y_ - (this._worldRadius));
        return this.calculateQR(spaceX, spaceY);
    }

    public terrainHeight(n): string {
        let v = Math.abs(parseFloat(n) * 255);
        let assetKey: string = '';
        if (v < this.noiseHeight[TerrainHeight.DEEPWATER].height * 255) {
            assetKey = TerrainHeight.DEEPWATER;
        } else if (v < this.noiseHeight[TerrainHeight.SHALLOWWATER].height * 255) {
            assetKey = TerrainHeight.SHALLOWWATER;
        } else if (v < this.noiseHeight[TerrainHeight.BEACH].height * 255) {
            assetKey = TerrainHeight.BEACH;
        } else if (v < this.noiseHeight[TerrainHeight.LAND].height * 255) {
            assetKey = TerrainHeight.LAND;
        } else {
            assetKey = TerrainHeight.MOUNTAIN;
        }

        return assetKey;
    }

    public terrainTypeOnLand(n): TerrainType {
        let v = Math.abs(parseFloat(n) * 255);
        let terrainType: TerrainType;

        if (v < this.noiseLand[TerrainType.DESERT].height * 255) {
            terrainType = TerrainType.DESERT;
        } else if (v < this.noiseLand[TerrainType.PLAIN].height * 255) {
            terrainType = TerrainType.PLAIN;
        } else if (v < this.noiseLand[TerrainType.FOREST].height * 255) {
            terrainType = TerrainType.FOREST;
        } else if (v < this.noiseLand[TerrainType.SNOW].height * 255) {
            terrainType = TerrainType.SNOW;
        } else {
            terrainType = TerrainType.MOUNTAIN;
        }

        return terrainType;
    }

    public getTileMapNoise(x, y, type): number {
        let r = this.hexRadius;
        let matrixXvalue = Math.ceil((x + this.canvasCenterX) / (this.hexRadius * 2));
        let matrixYvalue = Math.ceil((y - r + this.canvasCenterY) / (this.hexRadius * 2));
        let matrixWidth = Math.ceil((this.canvasWidth) / (this.hexRadius * 2));
        let matrixHeight = Math.ceil(this.canvasHeight / (this.hexRadius * 2));

        let noiseMod: number = 0;
        if (type === 'height') {
            noiseMod = this.shapeNoiseMod;
        } else if (type === 'terrainType') {
            noiseMod = this.tileTypeNoiseMod;
        }

        let simplexNoiseValue = this._simplex.noise2D(
            Number(matrixXvalue / noiseMod),
            Number(matrixYvalue / noiseMod)
        );

        let value2d = this.mapFunction(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0);

        let dist = Math.sqrt(
            Math.pow(matrixXvalue - matrixWidth / 2, 2) +
            Math.pow(matrixYvalue - matrixHeight / 2, 2)
        );

        let grad = dist / (this.landSize * Math.min(matrixWidth, matrixHeight));

        value2d -= Math.pow(grad, 3);
        value2d = Math.max(value2d, 0);

        return value2d;
    }

    public mapFunction(value, in_min, in_max, out_min, out_max): number {
        return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    };

    public movePlayer(player: EntityPlayer, direction: MoveTypes) {
        let location = <QrStruct>player.location;
        let wantedLocation: QrStruct = {
            q: 0,
            r: 0,
        };
        switch (direction) {
            case MoveTypes.NO:
                wantedLocation = {
                    q: location.q + 1,
                    r: location.r - 1,
                };
                break;
            case MoveTypes.O:
                wantedLocation = {
                    q: location.q + 1,
                    r: location.r,
                };
                break;
            case MoveTypes.SO:
                wantedLocation = {
                    q: location.q,
                    r: location.r + 1,
                };
                break;
            case MoveTypes.SW:
                wantedLocation = {
                    q: location.q - 1,
                    r: location.r + 1,
                };
                break;
            case MoveTypes.W:
                wantedLocation = {
                    q: location.q - 1,
                    r: location.r,
                };
                break;
            case MoveTypes.NW:
                wantedLocation = {
                    q: location.q,
                    r: location.r - 1,
                };
                break;
        }
        const targetTile: Tile = this.getTile(wantedLocation);


        if (targetTile.terrainType !== TerrainType.WATER) {
            //can move
            player.location = wantedLocation;
            if (!targetTile.isExplored) {
                let tileEntities : { entityObjects: EntityObject [], entityCreatures: EntityCreature[] } = EntityTileSpawner.entitiesOnTile(targetTile.terrainType);
                targetTile.entityObjects = tileEntities.entityObjects;
                targetTile.entityCreatures = tileEntities.entityCreatures;
                targetTile.isExplored = true;
            }
        } else {
            //cant move
            player.location = location;
            console.log("Player cant move to water tile");
        }

    }

}