type Tile = {
    q: number;
    r: number;
    x: number;
    y: number;
}

type qrStruct = {
    q: number;
    r: number;
}

export class World {
    private readonly _canvasWidth : number = 1280;
    private readonly _canvasHeight : number = 720;
    private readonly _canvasCenterX : number = this._canvasWidth / 2;
    private readonly _canvasCenterY : number = this._canvasHeight / 2;
    private readonly _hexRadius : number;

    private _worldSeed : string;
    private _worldRadius : number;
    private _numberOfRings : number;
    private _landSize : number;
    private _shapeNoiseMod : number;
    private _tileTypeNoiseMod : number;
    private _tiles : object;

    public constructor(
        worldSeed : string,
        hexRadius : number,
        numberOfRings : number,
        landSize : number,
        shapeNoiseMod : number,
        tileTypeNoiseMod : number,
    ) {
        this._worldSeed = worldSeed;
        this._hexRadius = hexRadius;
        this._numberOfRings = numberOfRings;
        this._landSize = landSize;
        this._shapeNoiseMod = shapeNoiseMod;
        this._tileTypeNoiseMod = tileTypeNoiseMod;
        this._worldRadius = (hexRadius * numberOfRings) * Math.sqrt(3) + (hexRadius / 2 * Math.sqrt(3));
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

    set tiles(tiles : object) {
        this._tiles = tiles;
    }

    set tile(tile : Tile) {
        this._tiles[tile.q + '_' + tile.r] = tile;
    }

    public setTileCoordinates() {
        let x = 0;
        let y = 0;
        let qrHex = {};

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

        this.tiles = qrHex;
    }

    private calculateQR(x, y) {
        let qr : qrStruct = {
            q: 0,
            r: 0,
        };

        qr.q = Math.round((Math.sqrt(3) / 3 * x - y / 3) / (this.hexRadius));
        qr.r = Math.round((y * 2 / 3) / (this.hexRadius));

        return qr;
    }

    public getInitialHexAxialCoordinates(x_, y_) {
        let spaceX = Math.round(x_);
        let spaceY = Math.round(y_);
        return this.calculateQR(spaceX, spaceY);
    }

    public getAxialCoordinatesFromOffSetCoordinates(x_, y_) {
        let spaceX = Math.round(x_ - (this._worldRadius));
        let spaceY = Math.round(y_ - (this._worldRadius));
        return this.calculateQR(spaceX, spaceY);
    }
}