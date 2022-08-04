import prompts from 'prompts'

//"text" | "password" | "invisible" | "number" | "confirm" | "list" | "toggle" | "select" | "multiselect" | "autocomplete" | "date" | ...
import { NoiseHeight } from '../src/types/worldTypes'
import ExothiumWorldClient from '../src/scripts/ExothiumWorldClient'
;(async () => {
  const exothiumWorldLib = new ExothiumWorldClient('192.168.0.64', 1337, () => {})
  const response = await prompts({
    type: 'select',
    name: 'MainMenu',
    message: 'Exothium World MainMenu',
    choices: [
      { title: 'New Dimension', description: 'Create a new dimension', value: 0 },
      { title: 'New Game', description: 'Create a new world', value: 1 },
      { title: 'getWorldParameters', value: 2 },
      { title: 'Spectate World', value: 3 }
    ]
  })
  console.log(response)

  switch (response.MainMenu) {
    case 0:
      console.log('[CLIENT] Requested:' + 'createDimension')
      exothiumWorldLib.newDimension('0.0.1', dimensionNumber => {
        console.log('[CLIENT] newDimension Number: #' + dimensionNumber)
      })
      break
    case 1:
      console.log('[CLIENT] Requested:' + 'createDimension')
      exothiumWorldLib.createWorld(0, 'exothium', 15, 100, 10, 1, 1, response => {
        console.log('[CLIENT] createWorld status' + (response === 'ok' ? '✅' : '❌'))
        exothiumWorldLib.createWorld(0, 'exothium', 15, 100, 10, 1, 1, response => {
          console.log('[CLIENT] createWorld status' + (response === 'ok' ? '✅' : '❌'))
        })
      })
    case 2:
      console.log('[CLIENT] Requested:' + 'getWorldParameters')
      exothiumWorldLib.getWorldParameters(1, response => {
        console.log(response)
      })
      break
  }
})()
