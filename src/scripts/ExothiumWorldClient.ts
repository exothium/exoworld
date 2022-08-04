import { io, Socket } from 'socket.io-client'
import { ACTIONS } from './ActionEnums'

export default class ExothiumWorldClient {
  private _socket: Socket

  public constructor(server: string, port: number, callback) {
    this._socket = io(`http://${server}:${port}`)
    this._socket.on('connect', () => {
      console.log('[ExothiumWorldClient] User Id: ' + this._socket.id)
      callback()
    })
  }

  public newDimension(version, callback) {
    // client-side
    this._socket.emit(ACTIONS.CREATE_DIMENSION, version, response => {
      console.log(`[ExothiumWorldClient][${ACTIONS.CREATE_DIMENSION}][ACK] status` + response.status)
      callback(response.data.dimensionNumber)
    })
  }
  //public createDimension(version: string) {}

  // Validate Content Return worldGenesisData
  public createWorld(
    dimensionNumber: number,
    worldSeed: string,
    hexRadius: number,
    numberOfRings: number,
    landSize: number,
    shapeNoiseMod: number,
    tileTypeNoiseMod: number,
    callback
  ) {
    const _worldSeed = worldSeed
    const _hexRadius = hexRadius
    const _numberOfRings = numberOfRings
    const _landSize = landSize
    const _shapeNoiseMod = shapeNoiseMod
    const _tileTypeNoiseMod = tileTypeNoiseMod
    const _worldRadius = hexRadius * numberOfRings * Math.sqrt(3) + (hexRadius / 2) * Math.sqrt(3)
    //todo is valid?

    const worldData = {
      dimensionNumber,
      worldSeed: _worldSeed,
      hexRadius: _hexRadius,
      numberOfRings: _numberOfRings,
      landSize: _landSize,
      shapeNoiseMod: _shapeNoiseMod,
      tileTypeNoiseMod: _tileTypeNoiseMod,
      worldRadius: _worldRadius
    }
    this._socket.emit(ACTIONS.INITIATE_WORLD, worldData, response => {
      console.log('[ExothiumWorldClient][ACK] createWorld status' + response.status)
      callback(response.status)
    })
  }

  public getWorldParameters(dimensionNumber: number, callback) {
    this._socket.emit(ACTIONS.GET_WORLD, dimensionNumber, worldParameters => {
      console.log('[ExothiumWorldClient][ACK] createWorld status' + worldParameters)
      callback(worldParameters)
    })
  }
}
