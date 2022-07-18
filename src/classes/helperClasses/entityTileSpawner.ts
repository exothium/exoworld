import {EntityObject} from "../entityObject";
import {EntityCreature} from "../entityCreature";
import {CreatureType, LivingStats, ObjectType} from "../../types/entityTypes";
import {Tile} from "../tile";
import {TerrainType} from "../../types/worldTypes";

export class EntityTileSpawner {

    static spawnRates = {
        [TerrainType.SNOW]: {
            entityObjects: {
                [ObjectType.BUSH]: {min: 0, max: 20},
                [ObjectType.TREE]: {min: 0, max: 10},
                [ObjectType.LOOSESTONE]: {min: 0, max: 5},
                [ObjectType.STONENODE]: {min: 0, max: 2},
                [ObjectType.FLINTNODE]: {min: 0, max: 0}
            },
            entityCreatures: {
                [CreatureType.WOLF]: {min: 0, max: 2},
                [CreatureType.RAM]: {min: 0, max: 0},
                [CreatureType.BEAR]: {min: 0, max: 0},
                [CreatureType.HYENA]: {min: 0, max: 0},
                [CreatureType.GIANTWORM]: {min: 0, max: 0},
                [CreatureType.RABBIT]: {min: 0, max: 10},
                [CreatureType.DEER]: {min: 0, max: 5},
                [CreatureType.SNAKE]: {min: 0, max: 0},
                [CreatureType.BOAR]: {min: 0, max: 0},
                [CreatureType.SALMON]: {min: 0, max: 0},
                [CreatureType.SIMPLEFISH]: {min: 0, max: 0},
            }
        },
        [TerrainType.MOUNTAIN]: {
            entityObjects: {
                [ObjectType.BUSH]: {min: 0, max: 15},
                [ObjectType.TREE]: {min: 0, max: 0},
                [ObjectType.LOOSESTONE]: {min: 0, max: 15},
                [ObjectType.STONENODE]: {min: 0, max: 4},
                [ObjectType.FLINTNODE]: {min: 0, max: 2}
            },
            entityCreatures: {
                [CreatureType.WOLF]: {min: 0, max: 0},
                [CreatureType.RAM]: {min: 0, max: 2},
                [CreatureType.BEAR]: {min: 0, max: 0},
                [CreatureType.HYENA]: {min: 0, max: 0},
                [CreatureType.GIANTWORM]: {min: 0, max: 0},
                [CreatureType.RABBIT]: {min: 0, max: 10},
                [CreatureType.DEER]: {min: 0, max: 0},
                [CreatureType.SNAKE]: {min: 0, max: 5},
                [CreatureType.BOAR]: {min: 0, max: 0},
                [CreatureType.SALMON]: {min: 0, max: 0},
                [CreatureType.SIMPLEFISH]: {min: 0, max: 0},
            }
        },
        [TerrainType.FOREST]: {
            entityObjects: {
                [ObjectType.BUSH]: {min: 0, max: 10},
                [ObjectType.TREE]: {min: 0, max: 30},
                [ObjectType.LOOSESTONE]: {min: 0, max: 5},
                [ObjectType.STONENODE]: {min: 0, max: 3},
                [ObjectType.FLINTNODE]: {min: 0, max: 1}
            },
            entityCreatures: {
                [CreatureType.WOLF]: {min: 0, max: 0},
                [CreatureType.RAM]: {min: 0, max: 0},
                [CreatureType.BEAR]: {min: 0, max: 2},
                [CreatureType.HYENA]: {min: 0, max: 0},
                [CreatureType.GIANTWORM]: {min: 0, max: 0},
                [CreatureType.RABBIT]: {min: 0, max: 0},
                [CreatureType.DEER]: {min: 0, max: 10},
                [CreatureType.SNAKE]: {min: 0, max: 0},
                [CreatureType.BOAR]: {min: 0, max: 5},
                [CreatureType.SALMON]: {min: 0, max: 0},
                [CreatureType.SIMPLEFISH]: {min: 0, max: 0},
            }
        },
        [TerrainType.PLAIN]: {
            entityObjects: {
                [ObjectType.BUSH]: {min: 0, max: 3},
                [ObjectType.TREE]: {min: 0, max: 5},
                [ObjectType.LOOSESTONE]: {min: 0, max: 10},
                [ObjectType.STONENODE]: {min: 0, max: 3},
                [ObjectType.FLINTNODE]: {min: 0, max: 0}
            },
            entityCreatures: {
                [CreatureType.WOLF]: {min: 0, max: 0},
                [CreatureType.RAM]: {min: 0, max: 0},
                [CreatureType.BEAR]: {min: 0, max: 0},
                [CreatureType.HYENA]: {min: 0, max: 2},
                [CreatureType.GIANTWORM]: {min: 0, max: 0},
                [CreatureType.RABBIT]: {min: 0, max: 5},
                [CreatureType.DEER]: {min: 0, max: 0},
                [CreatureType.SNAKE]: {min: 0, max: 0},
                [CreatureType.BOAR]: {min: 0, max: 10},
                [CreatureType.SALMON]: {min: 0, max: 0},
                [CreatureType.SIMPLEFISH]: {min: 0, max: 0},
            }
        },
        [TerrainType.DESERT]: {
            entityObjects: {
                [ObjectType.BUSH]: {min: 0, max: 0},
                [ObjectType.TREE]: {min: 0, max: 0},
                [ObjectType.LOOSESTONE]: {min: 0, max: 0},
                [ObjectType.STONENODE]: {min: 0, max: 4},
                [ObjectType.FLINTNODE]: {min: 0, max: 0}
            },
            entityCreatures: {
                [CreatureType.WOLF]: {min: 0, max: 0},
                [CreatureType.RAM]: {min: 0, max: 0},
                [CreatureType.BEAR]: {min: 0, max: 0},
                [CreatureType.HYENA]: {min: 0, max: 0},
                [CreatureType.GIANTWORM]: {min: 0, max: 2},
                [CreatureType.RABBIT]: {min: 0, max: 0},
                [CreatureType.DEER]: {min: 0, max: 0},
                [CreatureType.SNAKE]: {min: 0, max: 5},
                [CreatureType.BOAR]: {min: 0, max: 10},
                [CreatureType.SALMON]: {min: 0, max: 0},
                [CreatureType.SIMPLEFISH]: {min: 0, max: 0},
            }
        },
        [TerrainType.WATER]: {
            entityObjects: {
                [ObjectType.BUSH]: {min: 0, max: 0},
                [ObjectType.TREE]: {min: 0, max: 0},
                [ObjectType.LOOSESTONE]: {min: 0, max: 0},
                [ObjectType.STONENODE]: {min: 0, max: 0},
                [ObjectType.FLINTNODE]: {min: 0, max: 0}
            },
            entityCreatures: {
                [CreatureType.WOLF]: {min: 0, max: 0},
                [CreatureType.RAM]: {min: 0, max: 0},
                [CreatureType.BEAR]: {min: 0, max: 0},
                [CreatureType.HYENA]: {min: 0, max: 0},
                [CreatureType.GIANTWORM]: {min: 0, max: 0},
                [CreatureType.RABBIT]: {min: 0, max: 0},
                [CreatureType.DEER]: {min: 0, max: 0},
                [CreatureType.SNAKE]: {min: 0, max: 0},
                [CreatureType.BOAR]: {min: 0, max: 0},
                [CreatureType.SALMON]: {min: 0, max: 10},
                [CreatureType.SIMPLEFISH]: {min: 0, max: 30},
            }
        }
    };

    static entitiesOnTile(terrainType: TerrainType): { entityObjects: EntityObject [], entityCreatures: EntityCreature[] } {
        return {
            entityObjects: this.spawnEntityObjects(terrainType),
            entityCreatures: this.spawnEntityCreatures(terrainType)
        }
    }

    static spawnEntityObjects(terrainType: TerrainType): EntityObject[] {
        let spawnRatesType = this.spawnRates[terrainType].entityObjects;
        let entityObjects: EntityObject[] = [];

        for (const key in spawnRatesType) {
            let objectKey = this.getKeyByValue(ObjectType, key) || '';
            let objectType: ObjectType = ObjectType[objectKey];
            let numberSpawns = this.random(spawnRatesType[key].min, spawnRatesType[key].max);

            for (let i = 0; i < numberSpawns; i++) {
                entityObjects.push(
                    new EntityObject(
                        objectType,
                        true
                    )
                )
            }
        }
        return entityObjects;
    }

    static spawnEntityCreatures(terrainType: TerrainType): EntityCreature[] {
        let spawnRatesType = this.spawnRates[terrainType].entityCreatures;
        let entityCreatures: EntityCreature[] = [];

        for (const key in spawnRatesType) {
            let objectKey = this.getKeyByValue(CreatureType, key) || '';
            let creatureType: CreatureType = CreatureType[objectKey];
            let numberSpawns = this.random(spawnRatesType[key].min, spawnRatesType[key].max);
            let livingStats: LivingStats = {
                hp: 100,
                stamina: 100,
            }

            for (let i = 0; i < numberSpawns; i++) {
                entityCreatures.push(
                    new EntityCreature(
                        creatureType,
                        livingStats,
                        creatureType,
                        true,
                    )
                )
            }
        }
        return entityCreatures;
    }

    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
}