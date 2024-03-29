//to get the tiles for the heights. If LAND then we generate new tiles for LAND. Beach is treated as Desert for now.
import { Tile } from '../classes/tile'

export enum TerrainHeight {
  DEEPWATER = 'deepWater',
  SHALLOWWATER = 'shallowWater',
  BEACH = 'beach',
  LAND = 'land',
  MOUNTAIN = 'mountain'
}

//values that a tile can have to describe the biome
export enum TerrainType {
  DESERT = 'desert',
  PLAIN = 'plain',
  FOREST = 'forest',
  SNOW = 'snow',
  MOUNTAIN = 'mountain',
  WATER = 'water'
}

//values that a tile can have to describe the biome subtype
export enum TerrainSubType {
  DEEPWATER = 'deep water',
  SHALLOWWATER = 'shallow water',
  BEACH = 'beach',
  DESERT = 'desert',
  PLAIN = 'plain',
  FOREST = 'forest',
  SNOW = 'snow',
  MOUNTAIN = 'mountain'
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

export enum Directions {
  NE,
  E,
  SE,
  SW,
  W,
  NW
}

export type Neighbors = {
  direction: Directions
  tile: Tile
}

export type TileType = {
  q: number
  r: number
  x: number
  y: number
  terrainType: TerrainType
  terrainSubType: TerrainSubType
}

export interface Tiles {
  [key: string]: Tile
}

export type TerrainStruct = {
  height: number
}

export type NoiseHeight = {
  [TerrainHeight.DEEPWATER]: TerrainStruct
  [TerrainHeight.SHALLOWWATER]: TerrainStruct
  [TerrainHeight.BEACH]: TerrainStruct //treated as desert
  [TerrainHeight.LAND]: TerrainStruct
  [TerrainHeight.MOUNTAIN]: TerrainStruct
}

export type NoiseLand = {
  [TerrainType.DESERT]: TerrainStruct
  [TerrainType.PLAIN]: TerrainStruct
  [TerrainType.FOREST]: TerrainStruct
  [TerrainType.SNOW]: TerrainStruct
  [TerrainType.MOUNTAIN]: TerrainStruct
}

export type QrStruct = {
  q: number
  r: number
}
