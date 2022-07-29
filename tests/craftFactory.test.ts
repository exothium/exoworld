import { CraftFactory } from '../src/classes/craftFactory'

import { suite, test } from '@testdeck/mocha'
import * as _chai from 'chai'
import { mock, instance } from 'ts-mockito'
import { expect } from 'chai'
import * as assert from 'assert'

describe('CraftFactory class', function () {
  it('fails with TokenId size equal or greater than 20bits ', function () {
    const maxTokenId = Math.pow(2, 20)
    const craftFactory = new CraftFactory()
    const error = new TypeError('TokenId Overflow 20bit')
    assert.throws(
      () => craftFactory.addRecipe([0, maxTokenId, 0, 1, 0, 1, 0, 0, 1], [0, 1, 0, 1, 0, 1, 0, 0, 1], 1),
      error
    )
  })
  it('fails with Quantity size equal or greater than 7bits ', function () {
    const quantityValue = Math.pow(2, 7)
    const craftFactory = new CraftFactory()
    const error = new TypeError('Quantity Overflow 7bit')
    assert.throws(
      () => craftFactory.addRecipe([0, 1, 0, 1, 0, 1, 0, 0, 1], [0, quantityValue, 0, 1, 0, 1, 0, 0, 1], 1),
      error
    )
  })
  it('fails on unknown Token Id on recipe', function () {
    const maxTokenId = Math.pow(2, 20) - 1
    const craftFactory = new CraftFactory()
    const error = new TypeError('TokenId doesnt exists')
    assert.throws(
      () => craftFactory.addRecipe([0, maxTokenId, 0, 1, 0, 1, 0, 0, 1], [0, 1, 0, 1, 0, 1, 0, 0, 1], 1),
      error
    )
  })
  it('fails on unknown resulted Token Id', function () {
    const maxResultedTokenId = Math.pow(2, 20) - 1
    const craftFactory = new CraftFactory()
    const error = new TypeError('TokenId doesnt exists')
    assert.throws(
      () => craftFactory.addRecipe([0, 1, 0, 1, 0, 1, 0, 0, 1], [0, 1, 0, 1, 0, 1, 0, 0, 1], maxResultedTokenId),
      error
    )
  })
  it('fails on array sizes not equal to 9', function () {
    const craftFactory = new CraftFactory()
    const error = new TypeError('Array sizes not equal to 9')
    assert.throws(() => craftFactory.addRecipe([0, 1, 0, 1, 0, 1, 0, 0], [0, 1, 0, 1, 0, 1, 0, 0], 1), error)
  })
  it('succeed creating a valid recipe', function () {
    const craftFactory = new CraftFactory()
    const resultTokenId = 1
    const recipeNumber = craftFactory.addRecipe([0, 1, 0, 1, 0, 1, 0, 0, 1], [0, 1, 0, 1, 0, 1, 0, 0, 1], resultTokenId)
    assert.equal(recipeNumber, 0)
  })
  it('succeed getting a TokenId from valid recipe content', function () {
    const craftFactory = new CraftFactory()
    const resultTokenId = 1
    const tokenIds: Array<number> = [0, 1, 0, 1, 0, 1, 0, 0, 1]
    const quantities: Array<number> = [0, 1, 0, 1, 0, 1, 0, 0, 1]
    craftFactory.addRecipe(tokenIds, quantities, resultTokenId)
    const returnedTokenId = craftFactory.getTokenIdFromRecipeContent(tokenIds, quantities)
    assert.equal(returnedTokenId, resultTokenId)
  })
  it('succeed at getting a RecipeId from valid number', function () {
    const craftFactory = new CraftFactory()
    const tokenIds: Array<number> = [1, 1, 1, 1, 1, 1, 1, 1, 1]
    const quantities: Array<number> = [1, 1, 1, 1, 1, 1, 1, 1, 1]
    const expectedRecipeId = '100001020000204000040800008100001020000204000040800008100001'
    const recipeNumber = craftFactory.addRecipe(tokenIds, quantities, 1) // first recipe number = 0
    const returnedRecipeId = craftFactory.getRecipeIdFromRecipeNumber(recipeNumber)

    assert.equal(expectedRecipeId, returnedRecipeId)
  })
  it('succeed at getting a RecipeId from valid recipe content', function () {
    const craftFactory = new CraftFactory()
    const tokenIds: Array<number> = [1, 1, 1, 1, 1, 1, 1, 1, 1]
    const quantities: Array<number> = [1, 1, 1, 1, 1, 1, 1, 1, 1]
    const expectedRecipeId = '100001020000204000040800008100001020000204000040800008100001'
    craftFactory.addRecipe(tokenIds, quantities, 1) // first recipe number = 0
    const returnedRecipeId = craftFactory.getRecipeIdFromRecipeContent(tokenIds, quantities)

    //const expectedRecipeId = craftFactory.getRecipeIdFromRecipeNumber(recipeNumber)
    assert.equal(expectedRecipeId, returnedRecipeId)
  })
})
