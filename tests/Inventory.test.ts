import { Inventory } from '../src/contracts/Inventory'

import { suite, test } from '@testdeck/mocha'
import * as _chai from 'chai'
import { mock, instance } from 'ts-mockito'
import { expect } from 'chai'
import * as assert from 'assert'

describe('Inventory class', function () {
  it('fails with TokenId size equal or greater than 20bits ', function () {
    const maxTokenId = Math.pow(2, 20)
    const inventory = new Inventory()
    const error = new TypeError('TokenId Overflow 20bit')
    assert.throws(() => inventory.mint(maxTokenId, [0, 1], [1, 1]), error)
  })
  it('fails on unknown TokenId ', function () {
    const maxTokenId = Math.pow(2, 20) - 1
    const inventory = new Inventory()
    const error = new TypeError('TokenId doesnt exists')
    assert.throws(() => inventory.mint(maxTokenId, [0, 1], [1, 1]), error)
  })
  it('fails with characterIds size equal or greater than 20bits ', function () {
    const characterId = Math.pow(2, 20)
    const inventory = new Inventory()
    const error = new TypeError('CharacterId Overflow 20bit')
    assert.throws(() => inventory.mint(1, [0, characterId], [1, 1]), error)
  })
  it('fails at burn a valid tokenId and valid characterId from an empty balance ', function () {
    const tokenId = 0
    const characterId = Math.pow(2, 20) - 1
    const burnQuantity = 1
    const inventory = new Inventory()
    const error = new TypeError('Balance is zero')
    assert.throws(() => inventory.burn(tokenId, characterId, burnQuantity), error)
  })
  it('fails at burn a valid tokenId returning negative balance from valid characterId ', function () {
    const tokenId = 0
    const characterId = Math.pow(2, 20) - 1
    const quantity = 1
    const burnQuantity = 2
    const inventory = new Inventory()
    const error = new TypeError('Balance is negative')
    inventory.mint(tokenId, [characterId], [quantity])
    assert.throws(() => inventory.burn(tokenId, characterId, burnQuantity), error)
  })
  it('succeed getting balance zero of a valid tokenId from valid characterId ', function () {
    const tokenId = 0
    const characterId = Math.pow(2, 20) - 1
    const inventory = new Inventory()
    const expectedBalance = 0
    const balanceOfcharacterId = inventory.balanceOf(characterId, tokenId)
    assert.equal(balanceOfcharacterId, expectedBalance)
  })
  it('succeed minting a valid tokenId to a valid characterId ', function () {
    const tokenId = 0
    const characterId = Math.pow(2, 20) - 1
    const quantity = 1
    const inventory = new Inventory()
    inventory.mint(tokenId, [characterId], [quantity])
    const balanceOfcharacterId = inventory.balanceOf(characterId, tokenId)
    assert.equal(balanceOfcharacterId, quantity)
  })
  it('succeed burn a valid tokenId from valid characterId ', function () {
    const tokenId = 0
    const characterId = Math.pow(2, 20) - 1
    const quantity = 1
    const expectedBalance = 0
    const inventory = new Inventory()
    inventory.mint(tokenId, [characterId], [quantity])
    inventory.burn(tokenId, characterId, quantity)
    const balanceOfcharacterId = inventory.balanceOf(characterId, tokenId)
    assert.equal(balanceOfcharacterId, expectedBalance)
  })
})
