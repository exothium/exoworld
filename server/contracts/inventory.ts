import { ItemType, OwnableType, ResourceType } from '../types/ownableTypes'
import { pTokenId, TokenId } from '../classes/helperClasses/tokenInfo'

const tokenBitSize = 20

interface characterBalance {
  [characterId: number]: number
}

interface tokenCharacterBalance {
  [tokenId: number]: characterBalance
}

//ETC 1155 similar
export class Inventory {
  //ERC 1155 mapping (uint256 => mapping(address => uint256)) internal balances;
  //token_id => character_id => balance
  private _balances: tokenCharacterBalance = {}

  //ERC721 mapping (uint256 => mapping(uint256 => address) private _owners
  //token_id => token_number => character_id
  private _fungible_balances: tokenCharacterBalance = {}

  //token_id => token_count
  private _fungible_counts: tokenCharacterBalance = {}

  constructor() {
    this._fungible_balances[TokenId[ItemType.AXE]] = {} // 0
    this._fungible_balances[TokenId[ItemType.PICKAXE]] = {} // 1
    this._fungible_balances[TokenId[ItemType.SPEAR]] = {} // 2
    this._fungible_balances[TokenId[ItemType.FISHINGSPEAR]] = {} // 3
    this._fungible_balances[TokenId[ItemType.KNIFE]] = {} // 4
    this._fungible_balances[TokenId[ItemType.BEDROLL]] = {} // 5
    this._fungible_balances[TokenId[ItemType.FLINTSPEAR]] = {} // 6
    this._fungible_balances[TokenId[ItemType.FLINTKNIFE]] = {} // 7

    this._balances[TokenId[ResourceType.MEAT]] = {} // 9
    this._balances[TokenId[ResourceType.FISH]] = {} // 9
    this._balances[TokenId[ResourceType.BERRY]] = {} // 10
    this._balances[TokenId[ResourceType.STONE]] = {} // 11
    this._balances[TokenId[ResourceType.FLINT]] = {} // 12
    this._balances[TokenId[ResourceType.WOOD]] = {} // 13
    this._balances[TokenId[ResourceType.SKIN]] = {} // 14
  }

  mint(tokenId: number, characterIds: Array<number>, quantities: Array<number>) {
    this.assertTokenIdbitSize(tokenId)
    this.assertTokenIdExists(tokenId)
    for (let i = 0; i < characterIds.length; i++) {
      const characterId = characterIds[i]
      this.assertCharacterIdbitSize(characterId)
      const quantity = quantities[i]

      // check and initialize token structure if doesnt exist
      if (!this._balances[tokenId]) {
        this._balances[tokenId] = {}
      }

      // Grant the items to the caller
      const pastBalance = this._balances[tokenId][characterId] ? this._balances[tokenId][characterId] : 0
      const characterBalance = { [characterId]: quantity + pastBalance }
      this._balances[tokenId] = characterBalance
    }
  }

  burn(tokenId: number, characterId: number, quantity: number) {
    this.assertTokenIdbitSize(tokenId)
    this.assertTokenIdExists(tokenId)
    this.assertCharacterIdbitSize(characterId)
    this.assertBalanceOf(tokenId, characterId)

    const newBalance = this._balances[tokenId][characterId] - quantity
    this.assertValidBalance(newBalance)
    this._balances[tokenId][characterId] = newBalance
  }

  balanceOf(characterId: number, tokenId: number): number {
    if (!this._balances[tokenId]) {
      return 0
    } else if (!this._balances[tokenId][characterId]) {
      return 0
    } else {
      return this._balances[tokenId][characterId]
    }
  }

  balanceOfBatch(characterIds: Array<number>, tokenIds: Array<number>): Array<number> {
    this.assertArraySizes(characterIds, tokenIds)
    const balances: Array<number> = []
    for (let i = 0; i < characterIds.length; i++) {
      const balanceForCharacter = this.balanceOf(characterIds[i], tokenIds[i])
      balances.push(balanceForCharacter)
    }
    return balances
  }

  assertBalanceOf(tokenId: number, characterId: number) {
    if (!this._balances[tokenId]) {
      throw new TypeError('Balance is zero')
    } else if (this._balances[tokenId][characterId] == 0) {
      throw new TypeError('Balance is zero')
    }
  }

  assertValidBalance(newBalance: number) {
    if (newBalance <= 0) {
      throw new TypeError('Balance is negative')
    }
  }

  assertCharacterIdbitSize(characterId) {
    // 20 bit number 1M players
    const result = characterId.toString(2).length <= 20
    if (!result) {
      throw new TypeError('CharacterId Overflow 20bit')
    }
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

  assertArraySizes(arr1, arr2) {
    const result = arr1.length == arr2.length && arr2.length == 9
    if (!result) {
      throw new TypeError('Array sizes not equal to 9')
    }
  }
}
