//#!/usr/bin/env node
// This tool parses F_MAP.bin and generates an adjacency map if the rooms in the game for the shortest-path utility.
// Usage: tools/map-graph <path-to-F_MAP.bin> <path-to-output>
const fs = require('fs');
const constants = require('./constants');
const utils = require('./map_utils');

const BREAKABLE_WALLS = constants.BREAKABLE_WALLS;
const LOCKED_PATHS = constants.LOCKED_PATHS;
const PATHS = constants.PATHS;
const WARPS = constants.WARPS;

function drawMap(map) {
    console.log('IN-GAME MAP');
    let hRow = '0  :';
    for (let i = 0; i < map.length; i++) {
        let row = i / 256;

        if (map[i] == '0') {
            hRow = hRow + ' ';
        } else if (map[i] == '1' || map[i] == '2') {
            hRow = hRow + '█';
        } else if (map[i] == '4') {
            hRow = hRow + '▓';
        } else if (map[i] == '5') {
            hRow = hRow + '▒';
        } else {
            hRow = hRow + map[i];
        }

        if (i > 0 && i % 256 == 0) {
            console.log(hRow);
            hRow = row.toString().padEnd(3, " ") + ': ';
        }
    }
}
function drawAdjacencyMap(map) {
    let hRow = '0  : ';
    for (let i = 0; i < 94; i++) {
        for (let j = 0; j < 60; j++) {
            if (!map[i][j].exits) {
                hRow = hRow + '  ';
            } else if (map[i][j].exits == 0) {
                hRow = hRow + '  ';
            } else if (map[i][j].exits == 15) {
                hRow = hRow + '┤├';
            } else if (map[i][j].exits == 8) {
                hRow = hRow + '█─';
            } else if (map[i][j].exits == 4) {
                hRow = hRow + '─█';
            } else if (map[i][j].exits == 1) {
                hRow = hRow + '╛╘';
            } else if (map[i][j].exits == 2) {
                hRow = hRow + '╕╒';
            } else if (map[i][j].exits == 3) {
                hRow = hRow + '││';
            } else if (map[i][j].exits == 12) {
                hRow = hRow + '──';
            } else if (map[i][j].exits == 5) {
                hRow = hRow + '─┘';
            } else if (map[i][j].exits == 9) {
                hRow = hRow + '└─';
            } else if (map[i][j].exits == 6) {
                hRow = hRow + '─┐';
            } else if (map[i][j].exits == 10) {
                hRow = hRow + '┌─';
            } else if (map[i][j].exits == 7) {
                hRow = hRow + '┤█';
            } else if (fullMapGraph[i][j].exits == 11) {
                hRow = hRow + '█├';
            } else {
                hRow = hRow + '██';
            }
        }
        console.log(hRow);
        hRow = (i + 1).toString().padEnd(3, " ") + ': ';
    }
}

// Read input bin.
const bin = fs.readFileSync(process.argv[2]);
const savePath = process.argv[3];

let data = utils.restoreFileF(bin, constants.F_MAP);
let mapHex = utils.flippedBufToHex(data);

// Path adjacency map
let mapGraph = [];
for (let i = 0; i < 47; i++) {
    mapGraph[i] = [];
    for (let j = 0; j < 60; j++) {
        mapGraph[i][j] = 0;
    }
}

for (let i = 0; i < 47; i++) {
    for (let j = 0; j < 60; j++) {
        index = 256 + 10 + (j * 4) + (i * (256 * 4));
        if (mapHex[index] > 0) {
            if ((index - (256 * 2)) > 0 && mapHex[index - (256 * 2)] > 0) {
                mapGraph[i][j] |= 1; //up
            }
            if (mapHex[index + (256 * 2)] > 0) {
                mapGraph[i][j] |= 2; //down
            }
            if ((index - 2) > 0 && mapHex[index - 2] > 0) {
                mapGraph[i][j] |= 4; //left
            }
            if (mapHex[index + 2] > 0) {
                mapGraph[i][j] |= 8; //right
            }
            if ((index - (256 * 2) - 2) > 0 && mapHex[index - (256 * 2) - 2] > 0) {
                mapGraph[i][j] |= 16; //up-left
            }
            if ((index - (256 * 2) + 2) > 0 && mapHex[index - (256 * 2) + 2] > 0) {
                mapGraph[i][j] |= 32; //up-right
            }
            if ((index + (256 * 2) - 2) > 0 && mapHex[index + (256 * 2) - 2] > 0) {
                mapGraph[i][j] |= 64; //down-left
            }
            if (mapHex[index + (256 * 2) + 2] > 0) {
                mapGraph[i][j] |= 128; //down-right
            }
        }
    }
}

// Inverted castle
let fullMapGraph = [];
for (let i = 0; i < 94; i++) {
    fullMapGraph[i] = [];
    for (let j = 0; j < 60; j++) {
        fullMapGraph[i][j] = {};
    }
}
let row = 46;
let col = 60;
let flipped = false;
for (let i = 0; i < 94; i++) {
    for (let j = 0; j < 60; j++) {
        if (!flipped) {
            col--;
        } else {
            col = j;
        }

        let value = mapGraph[row][col];

        if (value == 0) {
            continue;
        }

        //mirror exits
        if (!flipped && ((value & 1) > 0)) {
            fullMapGraph[i][j].exits |= 2;
        }
        if (!flipped && ((value & 2) > 0)) {
            fullMapGraph[i][j].exits |= 1;
        }
        if (!flipped && ((value & 4) > 0)) {
            fullMapGraph[i][j].exits |= 8;
        }
        if (!flipped && ((value & 8) > 0)) {
            fullMapGraph[i][j].exits |= 4;
        }
        if (!flipped && ((value & 16) > 0)) {
            fullMapGraph[i][j].exits |= 128;
        }
        if (!flipped && ((value & 32) > 0)) {
            fullMapGraph[i][j].exits |= 64;
        }
        if (!flipped && ((value & 64) > 0)) {
            fullMapGraph[i][j].exits |= 32;
        }
        if (!flipped && ((value & 128) > 0)) {
            fullMapGraph[i][j].exits |= 16;
        }
        if (flipped) {
            fullMapGraph[i][j].exits = mapGraph[row][col];
        }
    }
    if (row > 0 && !flipped) {
        col = 60;
        row--;
    } else if (row == 0 && !flipped) {
        flipped = true;
    } else {
        row++;
    }
}

// Connect castles
fullMapGraph[44][30].exits |= 2;
fullMapGraph[45][30].exits |= 3;
fullMapGraph[46][30].exits |= 1;
fullMapGraph[46][30].exits |= 4;
fullMapGraph[46][29].exits |= 2;
fullMapGraph[46][29].exits |= 8;
fullMapGraph[47][29].exits |= 3;
fullMapGraph[48][29].exits |= 3;
fullMapGraph[49][29].exits |= 1;

// Unlock breakable walls
BREAKABLE_WALLS.forEach(wall => {
    utils.unlockPath(wall, fullMapGraph, true);
});
// Lock paths
LOCKED_PATHS.forEach(path => {
    utils.lockPath(path, path.exit, fullMapGraph);
});
// Add custom paths
PATHS.forEach(path => {
    let newPath = {
        x: path.dest.x,
        y: path.dest.y,
        cost: path.cost,
        locks: path.locks,
        warp: path.warp
    };

    if (!fullMapGraph[path.y][path.x].connections) {
        fullMapGraph[path.y][path.x].connections = [];
    }

    fullMapGraph[path.y][path.x].connections.push(newPath);
});
// Add warps
WARPS.forEach(w => {
    let warp = {
        warp: w.warp
    };

    if (!fullMapGraph[w.y][w.x].connections) {
        fullMapGraph[w.y][w.x].connections = [];
    }

    fullMapGraph[w.y][w.x].connections.push(warp);
});

// Output to JSON
/*
let jsonGraph = JSON.stringify(fullMapGraph);
fs.writeFile(savePath, jsonGraph, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing file.");
        return console.log(err);
    }
    console.log("File has been saved.");
}); 
*/

// Output to JS
let jsGraph = 'const map = ' + JSON.stringify(fullMapGraph);
fs.writeFile(savePath, jsGraph, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing file.");
        return console.log(err);
    }
    console.log("File has been saved.");
});


drawAdjacencyMap(fullMapGraph);