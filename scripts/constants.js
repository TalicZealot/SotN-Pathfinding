(function (self) {
    const RELIC = {
        SOUL_OF_BAT: 'B',
        FIRE_OF_BAT: 'f',
        ECHO_OF_BAT: 'E',
        FORCE_OF_ECHO: 'e',
        SOUL_OF_WOLF: 'W',
        POWER_OF_WOLF: 'p',
        SKILL_OF_WOLF: 's',
        FORM_OF_MIST: 'M',
        POWER_OF_MIST: 'P',
        GAS_CLOUD: 'c',
        CUBE_OF_ZOE: 'z',
        SPIRIT_ORB: 'o',
        GRAVITY_BOOTS: 'V',
        LEAP_STONE: 'L',
        HOLY_SYMBOL: 'y',
        FAERIE_SCROLL: 'l',
        JEWEL_OF_OPEN: 'J',
        MERMAN_STATUE: 'U',
        BAT_CARD: 'b',
        GHOST_CARD: 'g',
        FAERIE_CARD: 'a',
        DEMON_CARD: 'd',
        SWORD_CARD: 'w',
        HEART_OF_VLAD: 'h',
        TOOTH_OF_VLAD: 't',
        RIB_OF_VLAD: 'r',
        RING_OF_VLAD: 'n',
        EYE_OF_VLAD: 'i',
        GOLD_RING: 'G',
        SILVER_RING: 'S',
        SPIKE_BREAKER: 'K',
        HOLY_GLASSES: 'H',
    };

    const BREAKABLE_WALLS = [
        { description: "Holy Symbol", A: { x: 37, y: 81 }, B: { x: 37, y: 82 } },
        { description: "Holy Glasses", A: { x: 30, y: 68 }, B: { x: 30, y: 69 } },
        { description: "Sword Card", A: { x: 17, y: 60 }, B: { x: 17, y: 61 } },
        { description: "Alch Lab Secret Down", A: { x: 10, y: 76 }, B: { x: 10, y: 77 } },
        { description: "Clock Tower Funny Wall", A: { x: 48, y: 53 }, B: { x: 49, y: 53 } }
    ];

    const LOCKED_PATHS = [
        { x: 3, y: 70, exit: "right" }, //Blue Door Alchemy Lab
        { x: 4, y: 70, exit: "left" },  //Blue Door Alchemy Lab
        { x: 38, y: 66, exit: "down" }, //Passage to Caverns
        { x: 38, y: 67, exit: "up" },   //Passage to Caverns
        { x: 37, y: 70, exit: "up" },   //Caverns Shoot needs flight to go up
        { x: 51, y: 54, exit: "left" }, //Clock Tower Upper
        { x: 17, y: 78, exit: "right" }, //Entrance Marble Shortcut needs flight
    ];

    const PATHS = [
        { description: "Blue Door Alchemy Lab", x: 3, y: 70, dest: { x: 4, y: 70 }, cost: 10, locks: [[RELIC.JEWEL_OF_OPEN]] },
        { description: "Blue Door Alchemy Lab", x: 4, y: 70, dest: { x: 3, y: 70 }, cost: 10, locks: [[RELIC.JEWEL_OF_OPEN]] },
        { description: "Blue Door RevAlchemy Lab", x: 54, y: 23, dest: { x: 55, y: 23 }, cost: 10, locks: [[RELIC.JEWEL_OF_OPEN]] },
        { description: "Blue Door RevAlchemy Lab", x: 55, y: 23, dest: { x: 54, y: 23 }, cost: 10, locks: [[RELIC.JEWEL_OF_OPEN]] },
        { description: "Passage to Caverns", x: 38, y: 66, dest: { x: 38, y: 67 }, cost: 10, locks: [[RELIC.JEWEL_OF_OPEN]] },
        { description: "Passage to Caverns", x: 38, y: 67, dest: { x: 38, y: 66 }, cost: 10, locks: [[RELIC.JEWEL_OF_OPEN]] },
        { description: "Mines Switch", x: 30, y: 82, dest: { x: 31, y: 82 }, cost: 10, locks: [[RELIC.DEMON_CARD]] },
        { description: "Mines Switch", x: 31, y: 82, dest: { x: 30, y: 82 }, cost: 10, locks: [[RELIC.DEMON_CARD]] },
        { description: "RevMines Switch", x: 28, y: 11, dest: { x: 29, y: 1 }, cost: 10, locks: [[RELIC.DEMON_CARD]] },
        { description: "RevMines Switch", x: 29, y: 1, dest: { x: 28, y: 1 }, cost: 10, locks: [[RELIC.DEMON_CARD]] },
        {
            description: "Caverns Shoot needs flight to go up", x: 37, y: 70, dest: { x: 37, y: 69 }, cost: 10,
            locks: [[RELIC.SOUL_OF_BAT], [RELIC.LEAP_STONE + RELIC.GRAVITY_BOOTS], [RELIC.SOUL_OF_WOLF + RELIC.GRAVITY_BOOTS],
            [RELIC.FORM_OF_MIST + RELIC.GRAVITY_BOOTS], [RELIC.FORM_OF_MIST + RELIC.POWER_OF_MIST]]
        },
        {
            description: "Clock Tower Upper", x: 51, y: 54, dest: { x: 50, y: 54 }, cost: 10,
            locks: [[RELIC.SOUL_OF_BAT], [RELIC.LEAP_STONE + RELIC.GRAVITY_BOOTS], [RELIC.SOUL_OF_WOLF + RELIC.GRAVITY_BOOTS],
            [RELIC.FORM_OF_MIST + RELIC.GRAVITY_BOOTS], [RELIC.FORM_OF_MIST + RELIC.POWER_OF_MIST]]
        },
        {
            description: "Entrance Marble Shortcut needs flight", x: 17, y: 78, dest: { x: 18, y: 78 }, cost: 10,
            locks: [[RELIC.SOUL_OF_BAT], [RELIC.LEAP_STONE + RELIC.GRAVITY_BOOTS], [RELIC.SOUL_OF_WOLF + RELIC.GRAVITY_BOOTS],
            [RELIC.FORM_OF_MIST + RELIC.GRAVITY_BOOTS], [RELIC.FORM_OF_MIST + RELIC.POWER_OF_MIST]]
        }
    ];

    const WARPS = [
        { warp: true, x: 13, y: 80, },//CastleEntrance
        { warp: true, x: 33, y: 86, },//AbandonedMine
        { warp: true, x: 57, y: 59, },//OuterWall
        { warp: true, x: 38, y: 54, },//CastleKeep
        { warp: true, x: 35, y: 63, },//Olrox's Quarters
        { warp: true, x: 46, y: 13, },//ReverseEntrance
        { warp: true, x: 26, y: 7, }, //ReverseMine
        { warp: true, x: 2, y: 34, }, //ReverseOuterWall
        { warp: true, x: 21, y: 39, },//ReverseKeep
        { warp: true, x: 24, y: 30, } //DeathWing'sLair
    ];

    const ROOMS = {
        SOUL_OF_BAT: 0,
        FIRE_OF_BAT: 1,
        ECHO_OF_BAT: 2,
        FORCE_OF_ECHO: 3,
        SOUL_OF_WOLF: 4,
        POWER_OF_WOLF: 5,
        SKILL_OF_WOLF: 6,
        FORM_OF_MIST: 7,
        POWER_OF_MIST: 8,
        GAS_CLOUD: 9,
        CUBE_OF_ZOE: 10,
        SPIRIT_ORB: 11,
        GRAVITY_BOOTS: 12,
        LEAP_STONE: 13,
        HOLY_SYMBOL: 14,
        FAERIE_SCROLL: 15,
        JEWEL_OF_OPEN: 16,
        MERMAN_STATUE: 17,
        BAT_CARD: 18,
        GHOST_CARD: 19,
        FAERIE_CARD: 20,
        DEMON_CARD: 21,
        SWORD_CARD: 22,
        HEART_OF_VLAD: 23,
        TOOTH_OF_VLAD: 24,
        RIB_OF_VLAD: 25,
        RING_OF_VLAD: 26,
        EYE_OF_VLAD: 27,
        GOLD_RING: 28,
        SILVER_RING: 29,
        SPIKE_BREAKER: 30,
        HOLY_GLASSES: 31,
        MORMEGIL: 32,
        DARK_BLADE: 33,
        RING_OF_ARCANA: 34,
        ENTRANCE_WARP: 35,
        MINE_WARP: 36,
        OUTER_WARP: 37,
        KEEP_WARP: 38,
        OLROX_WARP: 39,
        REV_ENTRANCE_WARP: 40,
        REV_MINE_WARP: 41,
        REV_OUTER_WARP: 42,
        REV_KEEP_WARP: 43,
        REV_OLROX_WARP: 44
    };

    const MAP_ROOMS = [
        { name: "SOUL_OF_BAT", x: 46, y: 63 },
        { name: "FIRE_OF_BAT", x: 57, y: 53 },
        { name: "ECHO_OF_BAT", x: 14, y: 58 },
        { name: "FORCE_OF_ECHO", x: 6, y: 10 },
        { name: "SOUL_OF_WOLF", x: 59, y: 60 },
        { name: "POWER_OF_WOLF", x: 1, y: 80 },
        { name: "SKILL_OF_WOLF", x: 14, y: 77 },
        { name: "FORM_OF_MIST", x: 20, y: 65 },
        { name: "POWER_OF_MIST", x: 29, y: 51 },
        { name: "GAS_CLOUD", x: 44, y: 1 },
        { name: "CUBE_OF_ZOE", x: 17, y: 78 },
        { name: "SPIRIT_ORB", x: 23, y: 73 },
        { name: "GRAVITY_BOOTS", x: 32, y: 65 },
        { name: "LEAP_STONE", x: 29, y: 53 },
        { name: "HOLY_SYMBOL", x: 53, y: 83 },
        { name: "FAERIE_SCROLL", x: 57, y: 60 },
        { name: "JEWEL_OF_OPEN", x: 47, y: 62 },
        { name: "MERMAN_STATUE", x: 6, y: 84 },
        { name: "BAT_CARD", x: 11, y: 69 },
        { name: "GHOST_CARD", x: 37, y: 49 },
        { name: "FAERIE_CARD", x: 50, y: 60 },
        { name: "DEMON_CARD", x: 27, y: 86 },
        { name: "SWORD_CARD", x: 18, y: 60 },
        { name: "HEART_OF_VLAD", x: 38, y: 38 },
        { name: "TOOTH_OF_VLAD", x: 4, y: 28 },
        { name: "RIB_OF_VLAD", x: 42, y: 35 },
        { name: "RING_OF_VLAD", x: 21, y: 41 },
        { name: "EYE_OF_VLAD", x: 31, y: 11 },
        { name: "GOLD_RING", x: 43, y: 75 },
        { name: "SILVER_RING", x: 6, y: 57 },
        { name: "SPIKE_BREAKER", x: 39, y: 93 },
        { name: "HOLY_GLASSES", x: 30, y: 74 },
        { name: "MORMEGIL", x: 15, y: 92 },
        { name: "DARK_BLADE", x: 21, y: 13 },
        { name: "RING_OF_ARCANA", x: 48, y: 24 },
        { name: "ENTRANCE_WARP", x: 13, y: 80 },
        { name: "MINE_WARP", x: 33, y: 86 },
        { name: "OUTER_WARP", x: 57, y: 59 },
        { name: "KEEP_WARP", x: 38, y: 54 },
        { name: "OLROX_WARP", x: 35, y: 63 },
        { name: "REV_ENTRANCE_WARP", x: 46, y: 13 },
        { name: "REV_MINE_WARP", x: 26, y: 7 },
        { name: "REV_OUTER_WARP", x: 2, y: 34 },
        { name: "REV_KEEP_WARP", x: 21, y: 39 },
        { name: "REV_OLROX_WARP", x: 24, y: 30 }
    ];

    const F_MAP = { pos: 0x0000A80, len: 23935 };

    const exports = {
        BREAKABLE_WALLS: BREAKABLE_WALLS,
        LOCKED_PATHS: LOCKED_PATHS,
        PATHS: PATHS,
        WARPS: WARPS,
        RELIC: RELIC,
        ROOMS: ROOMS,
        MAP_ROOMS: MAP_ROOMS,
        F_MAP: F_MAP
    };
    if (self) {
        self.sotnRando = Object.assign(self.sotnRando || {}, {
            constants: exports,
        });
    } else {
        module.exports = exports;
    }
})(typeof (self) !== 'undefined' ? self : null);