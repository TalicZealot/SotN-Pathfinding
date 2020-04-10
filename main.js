var width = 1000;
var height = 2000;
var padding = 500;

var scrollContainer = document.getElementById('scroll-container');

var findButton = document.getElementById('findButton');
var resetButton = document.getElementById('resetButton');

var startX = document.getElementById('startX');
var startY = document.getElementById('startY');
var endX = document.getElementById('endX');
var endY = document.getElementById('endY');
var distanceDisplay = document.getElementById('distance');

var prevStartX = document.getElementById('prevStartX');
var prevStartY = document.getElementById('prevStartY');
var prevEndX = document.getElementById('prevEndX');
var prevEndY = document.getElementById('prevEndY');
var prevDistanceDisplay = document.getElementById('prevDistance');

var stage = new Konva.Stage({
    container: 'container',
    width: width + padding,
    height: height
});

var background = new Konva.Layer();
var foreground = new Konva.Layer();

var selected = [];
var path;
var svgPath;
var distance;

function getManhattanDistance(pointA, pointB) {
    let xdifference = Math.abs(pointA.x - pointB.x);
    let ydifference = Math.abs(pointA.y - pointB.y);
    return (xdifference + ydifference);
}

function drawMap() {
    let squares = [];
    let paths = [];

    let room = new Konva.Rect({
        x: 15,
        y: 15,
        width: 15,
        height: 15,
        fill: '#5070f8',
        stroke: '#c0c0c0',
        strokeWidth: 3
    });

    let path = new Konva.Rect({
        x: 5,
        y: 5,
        width: 5,
        height: 5,
        fill: '#5070f8'
    });

    for (let i = 0; i < map.length; i++) {
        squares[i] = [];
        for (let j = 0; j < map[0].length; j++) {
            squares[i][j] = 0;
        }
    }

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j].exits > 0) {
                let square = room.clone({ x: 52 + 15 * j, y: 52 + 15 * i });
                square.cache();
                squares[i][j] = square;
            }
            if ((map[i][j].exits & 1) > 0) { //up
                let square = path.clone({ x: 52 + 15 * j + 5, y: 52 + 15 * i - 3 });
                square.cache();
                paths.push(square);
            }
            if ((map[i][j].exits & 2) > 0) { //down
                let square = path.clone({ x: 52 + 15 * j + 5, y: 52 + 15 * i + 3 });
                square.cache();
                paths.push(square);
            }
            if ((map[i][j].exits & 4) > 0) { //left
                let square = path.clone({ x: 52 + 15 * j - 5, y: 52 + 15 * i + 5 });
                square.cache();
                paths.push(square);
            }
            if ((map[i][j].exits & 8) > 0) { //right
                let square = path.clone({ x: 52 + 15 * j + 15, y: 52 + 15 * i + 5 });
                square.cache();
                paths.push(square);
            }
        }
    }

    for (let i = 0; i < squares.length; i++) {
        for (let j = 0; j < squares[0].length; j++) {
            if (squares[i][j] != 0) {
                background.add(squares[i][j]);
            }
        }
    }

    paths.forEach(path => background.add(path));
}

function selectRoom(x, y) {
    let room = new Konva.Rect({
        mapX: x,
        mapY: y,
        x: 54 + (x * 15),
        y: 54 + (y * 15),
        width: 11,
        height: 11,
        fill: '#2d14ae',
    });
    room.on('mousedown', function () {
        let index = selected.indexOf(room);
        selected.splice(index, 1);
        this.destroy();
        foreground.batchDraw();
    });

    selected.push(room);
    foreground.add(room);
    foreground.batchDraw();
}

function clearSelected() {
    if (selected[0]) {
        selected[0].destroy();
    }
    if (selected[1]) {
        selected[1].destroy();
    }

    if (distanceDisplay.textContent != '') {
    prevStartX.textContent = startX.textContent;
    prevStartY.textContent = startY.textContent;
    prevEndX.textContent = endX.textContent;
    prevEndY.textContent = endY.textContent;
    prevDistanceDisplay.textContent = distanceDisplay.textContent;
    }

    startX.textContent = 'X:';
    startY.textContent = 'Y: ';
    endX.textContent = 'X:';
    endY.textContent = 'Y: ';
    distanceDisplay.textContent = '';

    selected = [];
    foreground.batchDraw();
}

function clearSvgPath() {
    if (svgPath) {
        svgPath.destroy();
    }
    foreground.batchDraw();
    svgPath = null;
}

function reset() {
    clearSelected();
    clearSvgPath();
    path = null;
    svgPath = null;
}

function getRelativePointerPosition(node) {
    var transform = node.getAbsoluteTransform().copy();
    transform.invert();
    var pos = node.getStage().getPointerPosition();
    return transform.point(pos);
}

function getAndDrawPath(start, end) {
    let startNode = {
        x: start.attrs.mapX,
        y: start.attrs.mapY,
        connections: []
    };
    let endNode = {
        x: end.attrs.mapX,
        y: end.attrs.mapY,
        connections: []
    };
    try {
        path = sotnRando.shortest_path.shortestPath(startNode, endNode, map, "BJ");
    } catch (error) {
        console.error(error);
        clearSelected();
    }

    if (path && path.length > 0) {
        let svgData = 'M';
        for (let i = path.length - 1; i >= 0; i--) {
            if (i < path.length - 1) {
                if (i < path.length - 1 && getManhattanDistance(path[i + 1], path[i]) > 3) {
                    svgData += 'M';
                } else {
                    svgData += 'L';
                }
            }
            svgData += (55 + (path[i].x * 15)) + ',' + (59 + (path[i].y * 15)) + ' ';
        }
        drawPath(svgData);

        foreground.batchDraw();
        distanceDisplay.textContent = path.length;
    }
}

function drawPath(data) {
    svgPath = new Konva.Path({
        x: 0,
        y: 0,
        data: data,
        stroke: 'green',
        strokeWidth: 7,
    });

    var pathLen = svgPath.getLength();
    svgPath.dashOffset(pathLen);
    svgPath.dash([pathLen]);

    var anim = new Konva.Animation(function (frame) {
        var dashLen = pathLen - frame.time / 5;
        if (svgPath) {
            svgPath.dashOffset(dashLen);
        } else {
            anim.stop();
        }
        if (dashLen < 0) {
            anim.stop();
        }
    }, foreground);
    anim.start();

    foreground.add(svgPath);
}

findButton.addEventListener('mousedown', e => {
    if (!svgPath) {
        getAndDrawPath(selected[0], selected[1]);
    }
});

resetButton.addEventListener('mousedown', e => {
    reset();
});

var imageObj = new Image();
imageObj.onload = function () {
    var mapImage = new Konva.Image({
        x: 50,
        y: 50,
        image: imageObj,
        width: 904,
        height: 1414
    });

    background.add(mapImage);
    background.batchDraw();

    mapImage.on('mousedown', function () {
        let mousePos = getRelativePointerPosition(mapImage);
        let x = Math.floor((mousePos.x - 4) / 15);
        let y = Math.floor((mousePos.y - 4) / 15);

        if (selected.length == 0 && map[y][x].exits > 0) {
            selectRoom(x, y);
            startX.textContent = 'X: ' + x;
            startY.textContent = 'Y: ' + y;
        } else if (selected.length == 1 && map[y][x].exits > 0) {
            selectRoom(x, y);
            endX.textContent = 'X: ' + x;
            endY.textContent = 'Y: ' + y;
        }  else if (svgPath && map[y][x].exits > 0) {
            reset();
            selectRoom(x, y);
            startX.textContent = 'X: ' + x;
            startY.textContent = 'Y: ' + y;
            endX.textContent = 'X:';
            endY.textContent = 'Y: ';
        }
    });
};
imageObj.src = './images/map.png';

stage.add(background);
stage.add(foreground);

function repositionStage() {
    var dx = scrollContainer.scrollLeft - padding;
    var dy = scrollContainer.scrollTop - padding;
    stage.container().style.transform =
        'translate(' + dx + 'px, ' + dy + 'px)';
    stage.x(-dx);
    stage.y(-dy);
    stage.batchDraw();
}
scrollContainer.addEventListener('scroll', repositionStage);
repositionStage();