(function (self) {
    function unlockPath(path, map, addToInverted, flipped) {
        let up = 1;
        let down = 2;
        let left = 4;
        let right = 8;
        if (flipped) {
            up = 2;
            down = 1;
            left = 8;
            right = 4;
        }
        if (path.A.x == path.B.x) {
            if (path.A.y > path.B.y) {
                map[path.B.y][path.B.x].exits |= up;
                map[path.A.y][path.A.x].exits |= down;
            } else {
                map[path.B.y][path.B.x].exits |= up;
                map[path.A.y][path.A.x].exits |= down;
            }
        } else {
            if (path.A.x > path.B.x) {
                map[path.A.y][path.A.x].exits |= right;
                map[path.B.y][path.B.x].exits |= left;
            } else {
                map[path.A.y][path.A.x].exits |= left;
                map[path.B.y][path.B.x].exits |= right;
            }
        }
        if (addToInverted) {
            let inverted = { A: { x: 59 - path.A.x, y: 93 - path.A.y }, B: { x: 59 - path.B.x, y: 93 - path.B.y } };
            unlockPath(inverted, map, false, true);
        }
    }

    function lockPath(room, exit, map) {
        //create bit masks to remove current exit bits
        let upLock = 1 ^ 15;
        let downLock = 2 ^ 15;
        let leftLock = 4 ^ 15;
        let rightLock = 8 ^ 15;

        switch (exit) {
            case 'up':
                map[room.y][room.x].exits &= upLock;
                break;
            case 'down':
                map[room.y][room.x].exits &= downLock;
                break;
            case 'left':
                map[room.y][room.x].exits &= leftLock;
                break;
            case 'right':
                map[room.y][room.x].exits &= rightLock;
                break;

            default:
                break;
        }
    }

    function flippedBufToHex(buf) {
        return Array.from(buf).map(function (byte) {
            let hexLyte = ('00' + byte.toString(16)).slice(-2);
            let hexByte = hexLyte[1] + hexLyte[0];
            return hexByte;
        }).join('');
    }

    function restoreFileF(data, file) {
        data = data.slice(file.pos, file.pos + file.len);
        file = Buffer.alloc(file.len);
        let curr = file;
        while (data.length) {
            curr.set(data.slice(0, 0x800));
            curr = curr.slice(0x800);
            data = data.slice(0x800);
        }
        return file;
    }

    const exports = {
        unlockPath: unlockPath,
        lockPath: lockPath,
        flippedBufToHex: flippedBufToHex,
        restoreFileF: restoreFileF
    };
    if (self) {
        self.sotnRando = Object.assign(self.sotnRando || {}, {
            map_utils: exports,
        });
    } else {
        module.exports = exports;
    }
})(typeof (self) !== 'undefined' ? self : null);