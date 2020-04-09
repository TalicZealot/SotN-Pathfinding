(function (self) {
    function PriorityQueue(compareKey) {
        this._heap = [];
        this.compareKey = compareKey;
    }

    PriorityQueue.prototype.push = function (value) {
        this._heap.push(value);
        minHeapifyUp(this._heap, this._heap.length - 1, this.compareKey);
    };

    PriorityQueue.prototype.pop = function () {
        let min = this._heap[0];
        extractMinElement(this._heap, this._heap.length, this.compareKey);
        this._heap.pop();

        return min;
    };

    PriorityQueue.prototype.decreaseKey = function (element, newCost) {
        let elementIndex = this._heap.findIndex(x => x.x == element.x && x.y == element.y);
        if (elementIndex < 0) {
            throw "The passed element is not in the queue!";
        }
        this._heap[elementIndex][this.compareKey] = newCost;
        minHeapifyDown(this._heap, elementIndex, this._heap.length - 1, this.compareKey);
    };

    PriorityQueue.prototype.increaseKey = function (element, newCost) {
        let elementIndex = this._heap.findIndex(x => x.x == element.x && x.y == element.y);
        if (elementIndex < 0) {
            throw "The passed element is not in the queue!";
        }
        this._heap[elementIndex][this.compareKey] = newCost;
        minHeapifyUp(this._heap, elementIndex, this._heap.length - 1, this.compareKey);
    };

    PriorityQueue.prototype.deque = function () {
        for (let length = this._heap.length; length > 1; length--) {
            extractMinElement(this._heap, length);
        }
        return this._heap;
    };

    PriorityQueue.prototype.length = function () {
        return this._heap.length;
    };

    PriorityQueue.prototype.top = function () {
        return this._heap[0];
    };

    PriorityQueue.prototype.find = function (element) {
        return this._heap.find(x => x.x == element.x && x.y == element.y);
    };

    function parent(index) {
        return (Math.round(index / 2) - 1);
    }

    function parentExists(index) {
        return (index >= 0);
    }

    function leftChild(index) {
        return (index * 2) + 1;
    }

    function rightChild(index) {
        return (index * 2) + 2;
    }

    function leftChildExists(index, length) {
        return ((index * 2) + 1) <= length - 1;
    }

    function rightChildExists(index, length) {
        return ((index * 2) + 2) <= length - 1;
    }

    function minChild(array, index, length, compareKey) {
        if (leftChildExists(index, length) && !rightChildExists(index, length)) {
            return leftChild(index);
        } else if (rightChildExists(index, length) && !leftChildExists(index, length)) {
            return rightChild(index);
        } else if (compareKey && array[leftChild(index)][compareKey] < array[rightChild(index)][compareKey]) {
            return leftChild(index);
        } else if (!compareKey && array[leftChild(index)] < array[rightChild(index)]) {
            return leftChild(index);
        } else {
            return rightChild(index);
        }
    }

    function swapNodes(array, indexA, indexB) {
        if (array[indexA] == array[indexB]) {
            return array;
        }
        let tmp = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = tmp;
        return array;
    }

    function minHeapifyDown(array, index, length, compareKey) {
        if (!leftChildExists(index, length) && !rightChildExists(index, length)) {
            return array;
        }
        var minChildIndex = minChild(array, index, length, compareKey);

        if (compareKey && array[minChildIndex][compareKey] < array[index][compareKey]) {
            swapNodes(array, minChildIndex, index);
            minHeapifyDown(array, minChildIndex, length, compareKey);
        } else if (!compareKey && array[minChildIndex] < array[index]) {
            swapNodes(array, minChildIndex, index);
            minHeapifyDown(array, minChildIndex, length);
        } else {
            return array;
        }
    }

    function minHeapifyUp(array, index, compareKey) {
        let parentIndex = parent(index);

        if (!parentExists(parentIndex)) {
            return array;
        }

        if (compareKey && array[parentIndex][compareKey] > array[index][compareKey]) {
            swapNodes(array, parentIndex, index);
            minHeapifyUp(array, parentIndex, compareKey);
        } else if (!compareKey && array[parentIndex] > array[index]) {
            swapNodes(array, parentIndex, index);
            minHeapifyUp(array, parentIndex);
        } else {
            return array;
        }
    }

    function extractMinElement(array, length, compareKey) {
        swapNodes(array, 0, length - 1);
        newLength = length - 1;
        minHeapifyDown(array, 0, newLength, compareKey);
        return array;
    }
    if (self) {
        self.sotnRando = Object.assign(self.sotnRando || {}, {
            PriorityQueue: PriorityQueue
        });
    } else {
        module.exports = PriorityQueue;
    }
})(typeof (self) !== 'undefined' ? self : null);