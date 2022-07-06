//to get the tiles for the heights. If LAND then we generate new tiles for LAND. Beach is treated as Desert for now.
export enum TerrainHeight {
    DEEPWATER = 'deepWater',
    SHALLOWWATER = 'shallowWater',
    BEACH = 'beach',
    LAND = 'land',
    MOUNTAIN = 'mountain',
}

//values that a tile can have to describe to biome
export enum TerrainType {
    DESERT = 'desert',
    PLAIN = 'plain',
    FOREST = 'forest',
    SNOW = 'snow',
    MOUNTAIN = 'mountain',
    WATER = 'water',
}

//The values are for sprites that have the same name (see texture.json)
export enum AssetSprite {
    DARKWATER = 'dark_water',
    LIGHTWATER = 'light_water',
    DESERT = 'desert',
    PLAIN = 'plain',
    FOREST = 'forest',
    SNOW = 'snow',
    MOUNTAIN = 'mountain'
}

export type Tile = {
    q: number;
    r: number;
    x: number;
    y: number;
}

export interface Tiles {
    [key:string] : Tile;
}

export type TerrainStruct = {
    height: number;
}

export type NoiseHeight = {
    [TerrainHeight.DEEPWATER] : TerrainStruct,
    [TerrainHeight.SHALLOWWATER]: TerrainStruct,
    [TerrainHeight.BEACH]: TerrainStruct, //treated as desert
    [TerrainHeight.LAND]: TerrainStruct,
    [TerrainHeight.MOUNTAIN]: TerrainStruct,
}

export type NoiseLand = {
    [TerrainType.DESERT]: TerrainStruct,
    [TerrainType.PLAIN]: TerrainStruct,
    [TerrainType.FOREST]: TerrainStruct,
    [TerrainType.SNOW]: TerrainStruct,
    [TerrainType.MOUNTAIN]: TerrainStruct,
}

export type QrStruct = {
    q: number;
    r: number;
}

