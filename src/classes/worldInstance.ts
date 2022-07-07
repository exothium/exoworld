import {
    AssetSprite,
    NoiseHeight,
    NoiseLand,
    QrStruct,
    TerrainHeight,
    TerrainSubType,
    TerrainType,
    Tile,
    Tiles
} from '../types/worldTypes';
import SimplexNoise from 'simplex-noise';

export class WorldInstance {
    private readonly _canvasWidth : number = 1280;
    private readonly _canvasHeight : number = 720;
    private readonly _canvasCenterX : number = this._canvasWidth / 2;
    private readonly _canvasCenterY : number = this._canvasHeight / 2;
    private readonly _hexRadius : number;
    private _tiles : Tiles;
    private _simplex;

    private _worldSeed : string;
    private _worldRadius : number;
    private _numberOfRings : number;
    private _landSize : number;
    private _shapeNoiseMod : number;
    private _tileTypeNoiseMod : number;
    private _noiseHeight : NoiseHeight;
    private _noiseLand : NoiseLand;


    public constructor(
        worldSeed : string,
        hexRadius : number,
        numberOfRings : number,
        landSize : number,
        shapeNoiseMod : number,
        tileTypeNoiseMod : number,
        noiseHeight : NoiseHeight,
        noiseLand : NoiseLand,
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
        this._simplex  = new SimplexNoise(this.worldSeed);
        this.setTileCoordinates();

    }

    public get canvasWidth() {
        return this._canvasWidth;
    }

    get canvasHeight() {
        return this._canvasHeight;
    }

    get canvasCenterX() {
        return this._canvasCenterX;
    }

    get canvasCenterY() {
        return this._canvasCenterY;
    }

    get worldSeed() {
        return this._worldSeed;
    }

    set worldSeed(worldSeed : string) {
        this._worldSeed = worldSeed;
        this._simplex = new SimplexNoise(this.worldSeed);
    }

    get worldRadius() {
        return this._worldRadius;
    }

    get hexRadius() {
        return this._hexRadius;
    }

    get numberOfRings() {
        return this._numberOfRings;
    }

    set numberOfRings(numberOfRings : number) {
        this._numberOfRings = numberOfRings;
    }

    get landSize() {
        return this._landSize;
    }

    set landSize(landSize : number) {
        this._landSize = landSize;
    }

    get shapeNoiseMod() {
        return this._shapeNoiseMod;
    }

    set shapeNoiseMod(shapeNoiseMod : number) {
        this._shapeNoiseMod = shapeNoiseMod;
    }

    get tileTypeNoiseMod() {
        return this._tileTypeNoiseMod;
    }

    set tileTypeNoiseMod(tileTypeNoiseMod : number) {
        this._tileTypeNoiseMod = tileTypeNoiseMod;
    }

    get tiles() {
        return this._tiles;
    }

    set tiles(tiles : Tiles) {
        this._tiles = tiles;
    }

    set tile(tile : Tile) {
        this._tiles[tile.q + '_' + tile.r] = tile;
    }

    get noiseHeight() {
        return this._noiseHeight;
    }

    set noiseHeight(noiseHeight : NoiseHeight) {
        this._noiseHeight = noiseHeight;
    }

    get noiseLand() {
        return this._noiseLand;
    }

    set noiseLand(noiseLand : NoiseLand) {
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
        let qrHex : object = {};

        //center tile coordinates
        let currenthexQR = this.getInitialHexAxialCoordinates(x, y);
        qrHex[currenthexQR.q + '_' + currenthexQR.r] = {x: x, y: y, q: currenthexQR.q, r: currenthexQR.r};

        let centerToCloseBorder = (this.hexRadius) * Math.sqrt(3);
        let radians = Math.PI / 180;

        let countHex = 0;
        for (let i = 1; i <= this.numberOfRings; i++) {
            for (let j = 0; j < 6; j++) {
                let diagonalX = x + Math.cos(j * 60 * radians) * centerToCloseBorder * i;
                let diagonalY = y + Math.sin(j * 60 * radians) * centerToCloseBorder * i;
                currenthexQR = this.getInitialHexAxialCoordinates(diagonalX, diagonalY);
                qrHex[currenthexQR.q + '_' + currenthexQR.r] = {x: diagonalX, y: diagonalY, q: currenthexQR.q, r: currenthexQR.r};
                countHex++;
                for (let k = 1; k < i; k++) {
                    let fillX = diagonalX + Math.cos((j * 60 + 120) * radians) * centerToCloseBorder * k;
                    let fillY = diagonalY + Math.sin((j * 60 + 120) * radians) * centerToCloseBorder * k;
                    currenthexQR = this.getInitialHexAxialCoordinates(fillX, fillY);
                    qrHex[currenthexQR.q + '_' + currenthexQR.r] = {x: fillX, y: fillY, q: currenthexQR.q, r: currenthexQR.r};
                    countHex++;
                }
            }
        }
        //this.tiles = qrHex;
        this.populateTileTerrainType(qrHex);
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
            tiles[key].terrainType = terrainType;
            tiles[key].terrainSubType = terrainSubType;
        }
        this._tiles = tiles;
    }

    private calculateQR(x, y) {
        let qr : QrStruct = {
            q: 0,
            r: 0,
        };

        qr.q = Math.round((Math.sqrt(3) / 3 * x - y / 3) / (this.hexRadius));
        qr.r = Math.round((y * 2 / 3) / (this.hexRadius));

        return qr;
    }

    private getInitialHexAxialCoordinates(x_, y_) {
        let spaceX = Math.round(x_);
        let spaceY = Math.round(y_);
        return this.calculateQR(spaceX, spaceY);
    }

    public getAxialCoordinatesFromOffSetCoordinates(x_, y_) {
        let spaceX = Math.round(x_ - (this._worldRadius));
        let spaceY = Math.round(y_ - (this._worldRadius));
        return this.calculateQR(spaceX, spaceY);
    }

    public terrainHeight(n) {
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

    public terrainTypeOnLand(n) {
        let v = Math.abs(parseFloat(n) * 255);
        let terrainType : TerrainType;

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

    public getTileMapNoise(x, y, type) {
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

        let value2d = this.map_function(simplexNoiseValue, -1.0, 1.0, 0.0, 1.0);

        let dist = Math.sqrt(
            Math.pow(matrixXvalue - matrixWidth / 2, 2) +
            Math.pow(matrixYvalue - matrixHeight / 2, 2)
        );

        let grad = dist / (this.landSize * Math.min(matrixWidth, matrixHeight));

        value2d -= Math.pow(grad, 3);
        value2d = Math.max(value2d, 0);

        return value2d;
    }

    public map_function(value, in_min, in_max, out_min, out_max) {
        return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    };
}