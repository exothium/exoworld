export enum LivingType {
    PLAYER = 'player',
    CREATURE = 'creature',
}

export type LivingStats = {
    hp: number,
    stamina: number,
}

export type PlayerStats = {
    hunger: number,
}

export enum ObjectType {
    BUSH = 'bush',
    TREE = 'tree',
    LOOSESTONE = 'loose stone',
    STONENODE = 'stone node',
    FLINTNODE = 'flint node'
}

export enum CreatureType {
    WOLF = 'wolf',
    RAM = 'ram',
    BEAR = 'bear',
    HYENA = 'hyena',
    GIANTWORM = 'giant worm',
    RABBIT = 'rabbit',
    DEER = 'deer',
    SNAKE = 'snake',
    BOAR = 'boar',
    SALMON = 'salmon',
    SIMPLEFISH = 'simple fish'
}


