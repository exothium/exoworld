import {EntityObject} from "../entityObject";
import {ObjectType} from "../../types/entityTypes";
import {Tile} from "../tile";
import {TerrainType} from "../../types/worldTypes";

export class EntityObjectSpawner {

    static spawnRates = {
        [TerrainType.SNOW]: {
            [ObjectType.BUSH]: {
                min: 0,
                max: 20,
            },
            [ObjectType.TREE]: {
                min: 0,
                max: 10,
            },
            [ObjectType.LOOSESTONE]: {
                min: 0,
                max: 5,
            },
            [ObjectType.STONENODE]: {
                min: 0,
                max: 2,
            },
            [ObjectType.FLINTNODE]: {
                min: 0,
                max: 0,
            }
        },
        [TerrainType.MOUNTAIN]: {
            [ObjectType.BUSH]: {
                min: 0,
                max: 15,
            },
            [ObjectType.TREE]: {
                min: 0,
                max: 0,
            },
            [ObjectType.LOOSESTONE]: {
                min: 0,
                max: 15,
            },
            [ObjectType.STONENODE]: {
                min: 0,
                max: 4,
            },
            [ObjectType.FLINTNODE]: {
                min: 0,
                max: 2,
            }
        },
        [TerrainType.FOREST]: {
            [ObjectType.BUSH]: {
                min: 0,
                max: 10,
            },
            [ObjectType.TREE]: {
                min: 0,
                max: 30,
            },
            [ObjectType.LOOSESTONE]: {
                min: 0,
                max: 5,
            },
            [ObjectType.STONENODE]: {
                min: 0,
                max: 3,
            },
            [ObjectType.FLINTNODE]: {
                min: 0,
                max: 1,
            }
        },
        [TerrainType.PLAIN]: {
            [ObjectType.BUSH]: {
                min: 0,
                max: 3,
            },
            [ObjectType.TREE]: {
                min: 0,
                max: 5,
            },
            [ObjectType.LOOSESTONE]: {
                min: 0,
                max: 10,
            },
            [ObjectType.STONENODE]: {
                min: 0,
                max: 3,
            },
            [ObjectType.FLINTNODE]: {
                min: 0,
                max: 0,
            }
        },
        [TerrainType.DESERT]: {
            [ObjectType.BUSH]: {
                min: 0,
                max: 0,
            },
            [ObjectType.TREE]: {
                min: 0,
                max: 0,
            },
            [ObjectType.LOOSESTONE]: {
                min: 0,
                max: 0,
            },
            [ObjectType.STONENODE]: {
                min: 0,
                max: 4,
            },
            [ObjectType.FLINTNODE]: {
                min: 0,
                max: 0,
            }
        },
        [TerrainType.WATER]: {
            [ObjectType.BUSH]: {
                min: 0,
                max: 0,
            },
            [ObjectType.TREE]: {
                min: 0,
                max: 0,
            },
            [ObjectType.LOOSESTONE]: {
                min: 0,
                max: 0,
            },
            [ObjectType.STONENODE]: {
                min: 0,
                max: 0,
            },
            [ObjectType.FLINTNODE]: {
                min: 0,
                max: 0,
            }
        }
    };


    static spawnEntityObjects(terrainType: TerrainType): EntityObject[] {
        let spawnRatesType = this.spawnRates[terrainType];
        let entityObjects : EntityObject[] = [];

        for (const key in spawnRatesType) {
            let objectKey = this.getKeyByValue(ObjectType, key) || '';
            let objectType : ObjectType = ObjectType[objectKey];
            for (let i = spawnRatesType[key].min; i < spawnRatesType[key].max; i++) {
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

    static getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
}