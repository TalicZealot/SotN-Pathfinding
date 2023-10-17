(function (self) {
    let constants;
    let PriorityQueue;

    if (self) {
        constants = self.pathfinding.constants;
        PriorityQueue = self.pathfinding.PriorityQueue;
    } else {
        map = require('./map.json');
        constants = require('./constants');
        PriorityQueue = require('./priority_queue.js');
    }

    const diagonalCost = 14;
    const straightCost = 10;
    const dir = [
        { x: 0, y: -1 }, //up
        { x: 0, y: 1 },  //down
        { x: -1, y: 0 }, //left
        { x: 1, y: 0 },  //right
        { x: -1, y: -1 },//7
        { x: 1, y: 1 },  //9
        { x: -1, y: -1 },//1
        { x: 1, y: 1 }   //3
    ];
    const warpRooms = [
        { key: "E", x: 13, y: 80, cost: 10 }, //Castle Entrance
        { key: "M", x: 33, y: 86, cost: 10 }, //Abandoned Mine
        { key: "W", x: 57, y: 59, cost: 10 }, //Outer Wall
        { key: "K", x: 38, y: 54, cost: 10 }, //Castle Keep
        { key: "O", x: 35, y: 63, cost: 10 }, //Olrox's Quarters
        { key: "e", x: 46, y: 13, cost: 10 }, //Reverse Entrance
        { key: "m", x: 26, y: 7, cost: 10 },  //Reverse Mine
        { key: "w", x: 2, y: 34, cost: 10 },  //Reverse Outer Wall
        { key: "k", x: 21, y: 39, cost: 10 }, //Reverse Keep
        { key: "o", x: 24, y: 30, cost: 10 }  //DeathWing's Lair
    ]

    function checkForPath(nodeValue, dir) {
        switch (dir) {
            case 0:
                return ((nodeValue & 1) > 0);
            case 1:
                return ((nodeValue & 2) > 0);
            case 2:
                return ((nodeValue & 4) > 0);
            case 3:
                return ((nodeValue & 8) > 0);
            case 4:
                return ((nodeValue & 16) > 0);
            case 5:
                return ((nodeValue & 32) > 0);
            case 6:
                return ((nodeValue & 64) > 0);
            case 7:
                return ((nodeValue & 128) > 0);
            default:
                return false;
        }
    }

    function isSubset(firstSet, secondSet) {
        return Array.from(firstSet).reduce(function (allPresent, element) {
            return allPresent && secondSet.has(element);
        }, true);
    }

    function meetsConditions(locks, unlocks) {
        return isSubset(new Set(locks.toString()), new Set(unlocks.toString()));
    }

    function nextWarp(x, warps) {
        let index;
        for (let i = 0; i < warpRooms.length; i++) {
            if (warpRooms[i].x == x) {
                index = i;
                break;
            }
        }
        let max;
        if (index < 5) {
            max = 5;
        } else {
            max = warpRooms.length;
        }
        for (let i = index; i < max; i++) {
            if (warps.includes(warpRooms[i].key)) {
                return i;
            }
        }
        if (max == 5 && index > 0) {
            return 0;
        }
        return -1;
    }

    function getDiagonalDistance(pointA, pointB) {
        let xdiff = Math.abs(pointA.x - pointB.x);
        let ydiff = Math.abs(pointA.y - pointB.y);
        let dist = straightCost * (xdiff + ydiff) + (diagonalCost - 2 * straightCost) * Math.min(xdiff, ydiff);
        return dist;
    }

    function shortestPath(start, end, relics, warps) {
        //  F = G + H
        //  G = total travelled distance at node
        //  H = diagonal distance from node to target
        //  key = unique node key "x:y"
        const open = new PriorityQueue("F", "H", "key");
        const explored = new Map();
        let finished = false;
        const startNode = {
            exits: map[start.y][start.x].exits,
            connections: map[start.y][start.x].connections,
            x: start.x,
            y: start.y,
            G: 0,
            H: getDiagonalDistance(start, end),
            F: getDiagonalDistance(start, end),
            prev: null,
            key: start.x + ":" + start.y
        };
        open.add(startNode);

        while (open.length() > 0) {
            let current = open.deque();
            explored.set(current.x + ":" + current.y, current);
            if (current.x == end.x && current.y == end.y) {
                finished = true;
                break;
            }

            for (let i = 0; i < 8; i++) {
                let cost = i < 4 ? straightCost : diagonalCost;
                const x = current.x + dir[i].x;
                const y = current.y + dir[i].y;
                if (!explored.has(x + ":" + y) && checkForPath(current.exits, i) && map[y] && map[y][x]) {
                    const G = current.G + cost;
                    const H = getDiagonalDistance({ x, y }, { x: end.x, y: end.y });
                    let node = {
                        exits: map[y][x].exits,
                        connections: map[y][x].connections,
                        x: x,
                        y: y,
                        G: G,
                        H: H,
                        F: G + H,
                        prev: current,
                        key: x + ":" + y
                    };
                    open.add(node);
                }
            }
            current.connections?.forEach(c => {
                if (!explored.has(c.x + ":" + c.y) && !c.warp && (!c.locks || meetsConditions(c.locks, relics))) {
                    const x = c.x;
                    const y = c.y;
                    const G = current.G + c.cost;
                    const H = getDiagonalDistance({ x, y }, { x: end.x, y: end.y });
                    let node = {
                        exits: map[y][x].exits,
                        connections: map[y][x].connections,
                        x: x,
                        y: y,
                        G: G,
                        H: H,
                        F: G + H,
                        prev: current,
                        key: x + ":" + y
                    };
                    open.add(node);
                } else if (c.warp) {
                    let dest = nextWarp(current.x, warps);
                    if (dest >= 0) {
                        const x = warpRooms[dest].x;
                        const y = warpRooms[dest].y;
                        const G = current.G + warpRooms[dest].cost;
                        const H = getDiagonalDistance({ x, y }, { x: end.x, y: end.y });
                        let node = {
                            exits: map[y][x].exits,
                            connections: map[y][x].connections,
                            x: x,
                            y: y,
                            G: G,
                            H: H,
                            F: G + H,
                            prev: current,
                            key: x + ":" + y
                        };
                        open.add(node);
                    }
                }
            });
        }

        let path = [];
        if (finished) {
            path.push(explored.get(end.x + ":" + end.y));
        } else {
            const exploredNodes = Array.from(explored.values());
            exploredNodes.sort((a, b) => a.H - b.H);
            path.push(exploredNodes[0]);
        }
        let current = path[path.length - 1];
        while (current.prev) {
            path.push(current.prev);
            current = path[path.length - 1];
        }

        return path.reverse();
    }

    const exports = {
        shortestPath: shortestPath
    };
    if (self) {
        self.pathfinding = Object.assign(self.pathfinding || {}, {
            shortest_path: exports,
        });
    } else {
        module.exports = exports;
    }
})(typeof (self) !== 'undefined' ? self : null);