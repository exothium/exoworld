```mermaid
classDiagram

Extract --> Character

Extract --> ItemInventory

Extract --> WorldEntityObject

Extract --> ResourceInventory

Extract .. World

class Extract{
(harvest,chop,mine,fish)
+startExtract(characterId,itemPosition,worldEntityObjectPosition)
+finishExtract(characterId,worldEntityObjectPosition)
+canExtract(entityObject)
+getEntityResourceBalance(entityObject)
+getEntityResourceTokenId(entityObject)
+getRandomQuantity(cooldown,resourceBalance)

}

Character .. World

Character : +Struct characterID => walletAddress

Character : +Struct characterID => characterData

Character : +mint()

Character : +airDrop(characterId)

Character : +setLockPosition(20bits)

Character : +setCooldown(20bits)

Character : +setCooldownByActivityType(10bits)

Character : +subHp(10bits)

Character : +subSp(7bits)

Character : +subHn(7bits)

Character : +addHp(10bits)

Character : +addSp(7bits)

Character : +addHn(7bits)

Character : +setLocation(tileId)
Character : +setLock(1bit)
Character : +setLockActivity(activityType,time,position)
Character : +setHimFree()

class ResourceInventory{

  

+Struct characterID => tokenId => balance

  

+mint(characterID,tokenId)

  

+burn(characterID,tokenId,quantity)

  

}

class ItemInventory{

  

+Struct chracterID => [item]

  

+mint(characterID,tokenId)

  

+burn(characterID,position)

  

}

  
  
  

class World{

+Struct tileId => tile

+Struct tileId => [entity]
+getEntity(tileId,position)
}

WorldEntityObject --> World

class WorldEntityObject{

+mint(tileId,EntityObjectType)

+burn(tileId,position,quantity)

+getEntityObject(tileId,position)

}
```

##### startExtract

- characterId
- itemPosition
- entityObjectPosition

```mermaid
sequenceDiagram

Extract ->> Character: isLocked or cooldowned?
Character ->> Extract: No
Extract ->> ItemInventory: has item?
ItemInventory ->> Extract: Yes
Extract ->> WorldEntityObject: getEntityObject(tileId,position)
WorldEntityObject ->> World: getEntity(tileId,position)
World ->> WorldEntityObject: entity
WorldEntityObject ->> WorldEntityObject: getEntityType(entity) ?isEntityObject?
WorldEntityObject ->> WorldEntityObject: parseEntityToObject(entity)
WorldEntityObject ->> Extract: entityObject
Extract ->> Extract: canBeExtracted(entityObject)?
Extract ->> Character: setLockActivity(time,activity,position) | subSt(7bits) 

```


##### finishExtract

- characterId

```mermaid
sequenceDiagram

Extract ->> Character: isLocked And cooldown passed?
Character ->> Extract: Yes
Extract ->> Character: getActivity() | getPosition() | getTileId() | getCooldown
Character ->> Extract: activityType | position | tileId | cooldown
Extract ->> WorldEntityObject: getEntityObject(tileId,position)
WorldEntityObject ->> World: getEntity(tileId,position)
World ->> WorldEntityObject: entity
WorldEntityObject ->> WorldEntityObject: getEntityType(entity) ?isEntityObject?
WorldEntityObject ->> WorldEntityObject: parseEntityToObject(entity)
WorldEntityObject ->> Extract: entityObject
Extract ->> Extract: getEntityResourceBalance(entityObject)
Extract ->> Extract: getEntityResourceTokenId(entityObject)
Extract ->> Extract: calculateRandomQuantity(cooldown,resourceBalance)
Extract ->> ResourceInventory: mint(characterId,tokenId,randomQuantity)
Extract ->> WorldEntityObject: burn(tileId,position,randomQuantity)
Extract ->> Character: setHimFree(characterId) 
Note over Extract,Character: setActivity(None) setlockPosition(0) setLocked(0) setCooldown(0)
```
