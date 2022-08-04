import { Server } from 'socket.io'
import { WorldContract } from './contracts/WorldContract'
import { ACTIONS } from '../src/scripts/ActionEnums'
const io = new Server({
  cors: {
    origin: '*'
  }
})

interface dimensionUserId {
  [dimensionNumber: number]: string
}

interface dimensionInterface {
  [dimensionNumber: number]: { world: WorldContract }
}

// ALL DIMENSION ARE HERE
let _dimensionsCount = 1
const _dimensions: dimensionInterface = {}
const _dimensionUserId: dimensionUserId = {}
//\\ ALL DIMENSION ARE HERE

io.on('connection', socket => {
  console.log(socket.id)
  socket.on(ACTIONS.CREATE_DIMENSION, function (version, callback) {
    console.log('[SERVER] Received: ' + ACTIONS.CREATE_DIMENSION)
    // we will not use version for now
    const dimensionNumber = newDimension(socket.id)
    callback({
      status: 'ok',
      data: { dimensionNumber }
    })
  })
  socket.on(ACTIONS.INITIATE_WORLD, function (data, callback) {
    console.log('[SERVER] Received: ' + ACTIONS.INITIATE_WORLD)
    createWorld(socket.id, data)
    callback({
      status: 'ok'
    })
  })
  socket.on(ACTIONS.GET_WORLD, function (dimensionNumber, callback) {
    console.log('[SERVER] Received: ' + ACTIONS.GET_WORLD)
    const worldParameters = getWorldParameters(dimensionNumber)
    callback(worldParameters)
  })
})

// \\// ******* SERVER FUNCTIONS ******* \\//
function newDimension(userId: string) {
  const worldContract = new WorldContract()
  _dimensions[_dimensionsCount] = { world: worldContract }
  _dimensionUserId[_dimensionsCount] = userId
  console.log('[SERVER] newDimension Number: #' + _dimensionsCount)
  return _dimensionsCount++
}

function createWorld(userId, data) {
  if (_dimensionUserId[data.dimensionNumber] == userId) {
    const worldContract = _dimensions[data.dimensionNumber].world // get world from user.id
    worldContract.create(
      data.worldSeed,
      data.hexRadius,
      data.numberOfRings,
      data.landSize,
      data.shapeNoiseMod,
      data.tileTypeNoiseMod
    )
    console.log('[SERVER][User:' + userId + '] createWorld #' + data.dimensionNumber + ' 🌍')
    console.log('🌱 worldSeed : ' + data.worldSeed)
    console.log('🌱 hexRadius : ' + data.hexRadius)
    console.log('🌱 numberOfRings : ' + data.numberOfRings)
    console.log('🌱 landSize : ' + data.landSize)
    console.log('🌱 shapeNoiseMod : ' + data.shapeNoiseMod)
    console.log('🌱 tileTypeNoiseMod : ' + data.tileTypeNoiseMod)
  } else {
    console.error('[SERVER][createWorld] ACCESS DENIED FOR USER: ' + userId)
  }
}

function getWorldParameters(dimensionNumber) {
  const worldContract = _dimensions[dimensionNumber].world
  const worldParameters = worldContract.getWorldData()
  console.log('[SERVER][getWorldParameters] : ' + JSON.stringify(worldParameters))
  return worldParameters
}

io.listen(1337)
