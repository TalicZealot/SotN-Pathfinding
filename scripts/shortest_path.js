//A* implementation, tips taken from https://github.com/mikepound/mazesolving
(function (self) {

    let map;
    let constants;
    let PriorityQueue;

    if (self) {
        constants = self.sotnRando.constants;
        PriorityQueue = self.sotnRando.PriorityQueue;
    } else {
        map = require('./map.json');
        constants = require('./constants');
        PriorityQueue = require('./priority_queue.js');
    }

    const MAP_ROOMS = constants.MAP_ROOMS;
    const ROOMS = constants.ROOMS;

    function drawPath(path, map) {
        let pathMap = [];
        for (let i = 0; i < map.length; i++) {
            pathMap[i] = [];
            for (let j = 0; j < map[0].length; j++) {
                pathMap[i][j] = 0;
            }
        }

        path.forEach(x => {
            pathMap[x.y][x.x] = 1;
        });

        hRow = '0  : ';
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (pathMap[i][j] > 0) {
                    hRow = hRow + '▒▒';
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
                } else if (map[i][j].exits == 11) {
                    hRow = hRow + '█├';
                } else {
                    hRow = hRow + '██';
                }
            }
            console.log(hRow);
            hRow = (i + 1).toString().padEnd(3, " ") + ': ';
        }
    }
    function performanceTest(loops, locations, map) {
        let startTime = new Date().getTime();
        for (let i = 0; i < loops; i++) {
            for (let i = 0; i < locations.length; i++) {
                for (let j = 0; j < locations.length; j++) {
                    if (j != i) {
                        let path = shortestPath(locations[i], locations[j], map);
                    }
                }
            }
        }
        let endTime = new Date().getTime() - startTime;
        let seconds = Math.floor((endTime / 1000) % 60);
        let minutes = Math.floor((endTime / (1000 * 60)) % 60);
        let hours = Math.floor((endTime / (1000 * 60 * 60)) % 24);
        console.log('Executed shortestPath a total of ' + (loops * locations.length) + 'times in: ' + hours + ' hours, ' + minutes + ' minutes and ' + seconds + ' seconds.');
    }
    // EuclideanDistance would be used in a scenario, where more precise positions on a non-grid map were significant.
    function getEuclideanDistance(pointA, pointB) {
        let xdifference = Math.abs(pointA.x - pointB.x);
        let ydifference = Math.abs(pointA.y - pointB.y);
        return Math.sqrt((xdifference * xdifference) + (ydifference * ydifference));
    }

    function getManhattanDistance(pointA, pointB) {
        let xdifference = Math.abs(pointA.x - pointB.x);
        let ydifference = Math.abs(pointA.y - pointB.y);
        return (xdifference + ydifference);
    }

    function checkForPathUp(nodeValue) {
        return ((nodeValue & 1) > 0);
    }

    function checkForPathDown(nodeValue) {
        return ((nodeValue & 2) > 0);
    }

    function checkForPathLeft(nodeValue) {
        return ((nodeValue & 4) > 0);
    }

    function checkForPathRight(nodeValue) {
        return ((nodeValue & 8) > 0);
    }

    function nodeExists(x, y) {
        return (x >= 0 && y >= 0);
    }

    function expandExit(node, queue, goalNode, prevDistance, prevNode, explored, connections) {
        let queuedNode = queue.find(node);

        if (explored.find(x => x.x == node.x && x.y == node.y)) {
            return;
        }

        // Increment distance by 1, since we are dealing with adjacent rooms.
        let newdistance = prevDistance + 1;
        // Prioritize travelling in a vector towards the goal. Manhattan distance works well, since this is a square grid.
        let remaining = getManhattanDistance(node, goalNode);

        if (queuedNode && newdistance < queuedNode.distance) {
            queuedNode.distance = newdistance;
            queuedNode.prev = prevNode;
            queue.increaseKey(queuedNode, newdistance + remaining);
        } else if (queuedNode && newdistance > queuedNode.distanc) {
            queue.decreaseKey(queuedNode, newdistance + remaining);
        } else if (!queuedNode) {
            let newNode = {
                x: node.x,
                y: node.y,
                distance: newdistance,
                cost: newdistance + remaining,
                prev: prevNode,
                connections: connections
            };
            queue.push(newNode);
        }
    }

    function expandConnection(node, queue, goalNode, prevDistance, prevNode, explored, gapDistance, connections) {
        let queuedNode = queue.find(node);

        if (explored.find(x => x.x == node.x && x.y == node.y)) {
            return;
        }

        let newdistance = prevDistance + gapDistance;
        let remaining = getManhattanDistance(node, goalNode);

        if (queuedNode && newdistance < queuedNode.distance) {
            queuedNode.distance = newdistance;
            queuedNode.prev = prevNode;
            queue.increaseKey(queuedNode, newdistance + remaining);
        } else if (queuedNode && newdistance > queuedNode.distanc) {
            queue.decreaseKey(queuedNode, newdistance + remaining);
        } else if (!queuedNode) {
            let newNode = {
                x: node.x,
                y: node.y,
                distance: newdistance,
                cost: newdistance + remaining,
                prev: prevNode,
                connections: connections
            };
            queue.push(newNode);
        }
    }

    function shortestPath(startingNode, goalNode, adjacencyMap, unlocks) {
        if (adjacencyMap[startingNode.y][startingNode.x].exits == 0) {
            throw 'Start is not on the map!';
        }
        if (adjacencyMap[goalNode.y][goalNode.x].exits == 0) {
            throw 'End is not on the map!';
        }

        let start = {};
        start.x = startingNode.x;
        start.y = startingNode.y;
        start.remaining = getManhattanDistance(start, goalNode);
        start.distance = 0;
        start.connections = adjacencyMap[startingNode.y][startingNode.x].connections;
        let travelled = new PriorityQueue("cost");
        travelled.push(start);
        let explored = [];
        let path = [];

        while (true) {
            currentRoot = travelled.top();

            // End if the goal bubbles to the top of the queue.
            if (currentRoot.x == goalNode.x && currentRoot.y == goalNode.y) {
                break;
            }

            // Expand all exits
            let roomExits = adjacencyMap[currentRoot.y][currentRoot.x].exits;
            if (checkForPathUp(roomExits) && nodeExists(currentRoot.x, currentRoot.y - 1)) {
                let node = {
                    x: currentRoot.x,
                    y: currentRoot.y - 1
                };
                expandExit(node, travelled, goalNode, currentRoot.distance, currentRoot, explored, adjacencyMap[node.y][node.x].connections);
            }
            if (checkForPathDown(roomExits) && nodeExists(currentRoot.x, currentRoot.y + 1)) {
                let node = {
                    x: currentRoot.x,
                    y: currentRoot.y + 1
                };
                expandExit(node, travelled, goalNode, currentRoot.distance, currentRoot, explored, adjacencyMap[node.y][node.x].connections);
            }
            if (checkForPathLeft(roomExits) && nodeExists(currentRoot.x - 1, currentRoot.y)) {
                let node = {
                    x: currentRoot.x - 1,
                    y: currentRoot.y
                };
                expandExit(node, travelled, goalNode, currentRoot.distance, currentRoot, explored, adjacencyMap[node.y][node.x].connections);
            }
            if (checkForPathRight(roomExits) && nodeExists(currentRoot.x + 1, currentRoot.y)) {
                let node = {
                    x: currentRoot.x + 1,
                    y: currentRoot.y
                };
                expandExit(node, travelled, goalNode, currentRoot.distance, currentRoot, explored, adjacencyMap[node.y][node.x].connections);
            }
            // Expand custom connections
            currentRoot.connections.forEach(connection => {
                if (connection.locks) {
                    for (let i = 0; i < connection.locks.length; i++) {
                        if (unlocks.includes(connection.locks[i])) {
                            let node = {
                                x: connection.x,
                                y: connection.y
                            };
                            expandConnection(node, travelled, goalNode, currentRoot.distance, currentRoot, explored, connection.gapDistance, adjacencyMap[node.y][node.x].connections);
                            break;
                        }
                    }
                } else if (!connection.locks) {
                    let node = {
                        x: connection.x,
                        y: connection.y
                    };
                    expandConnection(node, travelled, goalNode, currentRoot.distance, currentRoot, explored, connection.gapDistance, adjacencyMap[node.y][node.x].connections);
                }
            });

            if (!checkForPathUp(roomExits) && !checkForPathDown(roomExits) && !checkForPathLeft(roomExits) && !checkForPathRight(roomExits) && (!currentRoot.connections || currentRoot.connections.length < 1)) {
                throw "No exit \n" + adjacencyMap[currentRoot.y][currentRoot.x];
            }

            // If the current root is explored, but still at the top, pop it out.
            if (currentRoot == travelled.top()) {
                explored.push(travelled.pop());
            }
        }

        // Trace previous rooms for resulting path.
        path.push(travelled.top());
        while (path[path.length - 1].prev) {
            path.push(path[path.length - 1].prev);
        }
        return path;
    }

    const exports = {
        shortestPath: shortestPath
    };
    if (self) {
        self.sotnRando = Object.assign(self.sotnRando || {}, {
            shortest_path: exports,
        });
    } else {
        module.exports = exports;
    }
})(typeof (self) !== 'undefined' ? self : null);