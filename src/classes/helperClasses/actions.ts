import {CreatureType, ObjectType} from "../../types/entityTypes";
import {actionsType} from "../../types/actionTypes";

export const entityObjectAction = {
    [ObjectType.BUSH]: [actionsType.HARVEST],
    [ObjectType.TREE]: [actionsType.CHOP],
    [ObjectType.LOOSESTONE]: [actionsType.HARVEST],
    [ObjectType.STONENODE]: [actionsType.MINE],
    [ObjectType.FLINTNODE]: [actionsType.MINE],
}

export const entityCreatureAction = {
    [CreatureType.WOLF]: [actionsType.HUNT],
    [CreatureType.RAM] : [actionsType.HUNT],
    [CreatureType.BEAR]: [actionsType.HUNT],
    [CreatureType.HYENA]: [actionsType.HUNT],
    [CreatureType.GIANTWORM]: [actionsType.HUNT],
    [CreatureType.RABBIT]: [actionsType.HUNT],
    [CreatureType.DEER]: [actionsType.HUNT],
    [CreatureType.SNAKE]: [actionsType.HUNT],
    [CreatureType.BOAR]: [actionsType.HUNT],
}