import { TerrainHeight, TerrainType } from './worldTypes'

export enum CanvasSettings {
  width = 1280,
  height = 720
}

// todo move this to constant game settings
export const NoiseHeightDefaults = {
  [TerrainHeight.DEEPWATER]: {
    height: 0.1
  },
  [TerrainHeight.SHALLOWWATER]: {
    height: 0.2
  },
  [TerrainHeight.BEACH]: {
    height: 0.25
  },
  [TerrainHeight.LAND]: {
    height: 0.9
  },
  [TerrainHeight.MOUNTAIN]: {
    height: 1
  }
}

// todo move this to constant game settings
export const NoiseLandDefaults = {
  [TerrainType.DESERT]: {
    height: 0.05
  },
  [TerrainType.PLAIN]: {
    height: 0.5
  },
  [TerrainType.FOREST]: {
    height: 0.85
  },
  [TerrainType.SNOW]: {
    height: 0.9
  },
  [TerrainType.MOUNTAIN]: {
    height: 1
  }
}
