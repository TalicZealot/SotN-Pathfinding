const width = 1000;
const height = 2000;
const padding = 500;

const scrollContainer = document.getElementById('scroll-container');
const findButton = document.getElementById('findButton');
const resetButton = document.getElementById('resetButton');
const startX = document.getElementById('startX');
const startY = document.getElementById('startY');
const endX = document.getElementById('endX');
const endY = document.getElementById('endY');
const distanceDisplay = document.getElementById('distance');
const prevStartX = document.getElementById('prevStartX');
const prevStartY = document.getElementById('prevStartY');
const prevEndX = document.getElementById('prevEndX');
const prevEndY = document.getElementById('prevEndY');
const prevDistanceDisplay = document.getElementById('prevDistance');
const SoulOfBat = document.getElementById('SoulOfBat');
const JewelOfOpen = document.getElementById('JewelOfOpen');
const DemonCard = document.getElementById('DemonCard');
const GravityBoots = document.getElementById('GravityBoots');
const LeapStone = document.getElementById('LeapStone');
const SoulOfWolf = document.getElementById('SoulOfWolf');
const FormOfMist = document.getElementById('FormOfMist');
const PowerOfMist = document.getElementById('PowerOfMist');
const CastleEntrance = document.getElementById('CastleEntrance');
const AbandonedMine = document.getElementById('AbandonedMine');
const OuterWall = document.getElementById('OuterWall');
const CastleKeep = document.getElementById('CastleKeep');
const OlroxsQuarters = document.getElementById('OlroxsQuarters');
const ReverseEntrance = document.getElementById('ReverseEntrance');
const ReverseMine = document.getElementById('ReverseMine');
const ReverseOuterWall = document.getElementById('ReverseOuterWall');
const ReverseKeep = document.getElementById('ReverseKeep');
const DeathWingsLair = document.getElementById('DeathWingsLair');

var stage = new Konva.Stage({
    container: 'container',
    width: width + padding,
    height: height
});

const background = new Konva.Layer();
const foreground = new Konva.Layer();
const unlocks = '';
const warps = '';
const selected = [];
var path;
var svgPath;
var distance;

function getManhattanDistance(pointA, pointB) {
    let xdifference = Math.abs(pointA.x - pointB.x);
    let ydifference = Math.abs(pointA.y - pointB.y);
    return (xdifference + ydifference);
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

    selected.length = 0;
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
        path = pathfinding.shortest_path.shortestPath(startNode, endNode, unlocks, warps);
    } catch (error) {
        console.error(error);
        clearSelected();
    }

    if (path && path.length > 0) {
        let svgData = 'M';
        for (let i = 0; i < path.length; i++) {
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
        stroke: '#2d14ae',
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

function toggleRelic(element) {
    if (element.classList) {
        element.classList.toggle("selected");
    } else {
        var classes = element.className.split(" ");
        var i = classes.indexOf("selected");

        if (i >= 0)
            classes.splice(i, 1);
        else
            classes.push("selected");
        element.className = classes.join(" ");
    }
}

findButton.addEventListener('mousedown', e => {
    if (!svgPath) {
        getAndDrawPath(selected[0], selected[1]);
    }
});

resetButton.addEventListener('mousedown', e => {
    reset();
});
//Relic toggles
SoulOfBat.addEventListener('mousedown', e => {
    toggleRelic(SoulOfBat);
    if (unlocks.includes('B')) {
        unlocks = unlocks.replace('B', '');
    } else {
        unlocks += 'B';
    }
});
JewelOfOpen.addEventListener('mousedown', e => {
    toggleRelic(JewelOfOpen);
    if (unlocks.includes("J")) {
        unlocks = unlocks.replace('J', '');
    } else {
        unlocks += 'J';
    }
});
DemonCard.addEventListener('mousedown', e => {
    toggleRelic(DemonCard);
    if (unlocks.includes("d")) {
        unlocks = unlocks.replace('d', '');
    } else {
        unlocks += 'd';
    }
});
GravityBoots.addEventListener('mousedown', e => {
    toggleRelic(GravityBoots);
    if (unlocks.includes("V")) {
        unlocks = unlocks.replace('V', '');
    } else {
        unlocks += 'V';
    }
});
LeapStone.addEventListener('mousedown', e => {
    toggleRelic(LeapStone);
    if (unlocks.includes("L")) {
        unlocks = unlocks.replace('L', '');
    } else {
        unlocks += 'L';
    }
});
SoulOfWolf.addEventListener('mousedown', e => {
    toggleRelic(SoulOfWolf);
    if (unlocks.includes("W")) {
        unlocks = unlocks.replace('W', '');
    } else {
        unlocks += 'W';
    }
});
FormOfMist.addEventListener('mousedown', e => {
    toggleRelic(FormOfMist);
    if (unlocks.includes("M")) {
        unlocks = unlocks.replace('M', '');
    } else {
        unlocks += 'M';
    }
});
PowerOfMist.addEventListener('mousedown', e => {
    toggleRelic(PowerOfMist);
    if (unlocks.includes("P")) {
        unlocks = unlocks.replace('P', '');
    } else {
        unlocks += 'P';
    }
});
//Warp toggles
CastleEntrance.addEventListener('mousedown', e => {
    if (warps.includes('E')) {
        warps = warps.replace('E', '');
    } else {
        wars += 'E';
    }
});
AbandonedMine.addEventListener('mousedown', e => {
    if (warps.includes('M')) {
        warps = warps.replace('M', '');
    } else {
        wars += 'M';
    }
});
OuterWall.addEventListener('mousedown', e => {
    if (warps.includes('W')) {
        warps = warps.replace('W', '');
    } else {
        wars += 'W';
    }
});
CastleKeep.addEventListener('mousedown', e => {
    if (warps.includes('K')) {
        warps = warps.replace('K', '');
    } else {
        wars += 'K';
    }
});
OlroxsQuarters.addEventListener('mousedown', e => {
    if (warps.includes('O')) {
        warps = warps.replace('O', '');
    } else {
        wars += 'O';
    }
});
ReverseEntrance.addEventListener('mousedown', e => {
    if (warps.includes('e')) {
        warps = warps.replace('e', '');
    } else {
        wars += 'e';
    }
});
ReverseMine.addEventListener('mousedown', e => {
    if (warps.includes('m')) {
        warps = warps.replace('m', '');
    } else {
        wars += 'm';
    }
});
ReverseOuterWall.addEventListener('mousedown', e => {
    if (warps.includes('w')) {
        warps = warps.replace('w', '');
    } else {
        wars += 'w';
    }
});
ReverseKeep.addEventListener('mousedown', e => {
    if (warps.includes('k')) {
        warps = warps.replace('k', '');
    } else {
        wars += 'k';
    }
});
DeathWingsLair.addEventListener('mousedown', e => {
    if (warps.includes('o')) {
        warps = warps.replace('o', '');
    } else {
        wars += 'o';
    }
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
        } else if (svgPath && map[y][x].exits > 0) {
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
scrollContainer.scrollBy({
    top: 760,
    behavior: 'auto'
});