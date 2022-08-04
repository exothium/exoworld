import BigNumber from 'bignumber.js'
import { pTokenId } from '../classes/helperClasses/tokenInfo'
import { Inventory } from './inventory'

const tokenBitSize = 20
const quantityBitSize = 7
const craftSlots = 9

interface recipeNumber {
  [recipeNumber: number]: string // recipeId hexString
}

interface recipes {
  [recipeId: string]: number //tokenId
}

//EIP 1155 similar
export class CraftFactory {
  //mapping (uint256 => mapping(address => uint256)) internal balances;
  private _totalRecipes = 0
  private _recipeNumber: recipeNumber = {}
  private _recipes: recipes = {}
  private _inventory: Inventory

  constructor(inventory) {
    this._inventory = inventory
  }

  addRecipe(tokenIds: Array<number>, quantities: Array<number>, resultTokenId: number): number {
    this.assertTokenIdExists(resultTokenId)
    const recipeId: string = this.getRecipeIdFromRecipeContent(tokenIds, quantities)
    this._recipeNumber[this._totalRecipes] = recipeId
    this._recipes[recipeId] = resultTokenId
    return this._totalRecipes++
  }

  getRecipeIdFromRecipeNumber(recipeNumber: number): string {
    const resultTokenId = this._recipeNumber[recipeNumber]
    return resultTokenId
  }

  //returns the TokenId that will be crafted with this recipe content
  getTokenIdFromRecipeContent(tokenIds: Array<number>, quantities: Array<number>): number {
    const recipeId: string = this.getRecipeIdFromRecipeContent(tokenIds, quantities)
    return this._recipes[recipeId]
  }

  //returns if exists the RecipeId from the combination of items and quantities given
  getRecipeIdFromRecipeContent(tokenIds: Array<number>, quantities: Array<number>): string {
    this.assertArraySizes(tokenIds, quantities)

    let bitPosition = 0
    let recipeId = new BigNumber(0)
    for (let i = 0; i < craftSlots; i++) {
      const tokenId = tokenIds[i]
      this.assertTokenIdbitSize(tokenId)
      this.assertTokenIdExists(tokenId)
      const quantity = quantities[i]
      this.assertQuantityBitSize(quantity)

      //add tokenId
      const tokenInteger = new BigNumber(tokenId).multipliedBy(Math.pow(2, 0))
      //add Quantity
      const quantityInteger = new BigNumber(quantity).multipliedBy(Math.pow(2, tokenBitSize))

      const sumSlot = new BigNumber(tokenInteger).plus(quantityInteger)

      //checkslotsize
      const totalSlotSize = tokenBitSize + quantityBitSize
      const possibleSize = new BigNumber(2).pow(totalSlotSize).minus(1)
      !sumSlot.isLessThanOrEqualTo(possibleSize) && process.exit(0)
      //console.log("slot" + i + " slot correct: " + (sumSlot.isEqualTo(possibleSize)));

      const auxSlot = new BigNumber(sumSlot).multipliedBy(new BigNumber(2).pow(bitPosition))
      recipeId = recipeId.plus(auxSlot)
      bitPosition += totalSlotSize

      //check total size
      const totalUntilNow = new BigNumber(2).pow(bitPosition).minus(1)
      !recipeId.isLessThanOrEqualTo(totalUntilNow) && process.exit(0)
      //console.log("slot" + i + " check total size: " +  recipeId.isEqualTo( totalUntilNow));
    }

    return recipeId.toString(16)
  }

  assertTokenIdbitSize(tokenId) {
    // 20 bit number 1M items
    const result = tokenId.toString(2).length <= tokenBitSize
    if (!result) {
      throw new TypeError('TokenId Overflow 20bit')
    }
  }

  assertTokenIdExists(tokenId) {
    const result = pTokenId[tokenId]
    if (!result) {
      throw new TypeError('TokenId doesnt exists')
    }
  }

  assertQuantityBitSize(quantity) {
    // 7 bit number 127
    const result = quantity.toString(2).length <= quantityBitSize
    if (!result) {
      throw new TypeError('Quantity Overflow 7bit')
    }
  }

  assertArraySizes(arr1, arr2) {
    const result = arr1.length == arr2.length && arr2.length == 9
    if (!result) {
      throw new TypeError('Array sizes not equal to 9')
    }
  }
}
