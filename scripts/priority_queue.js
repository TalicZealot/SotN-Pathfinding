(function (self) {
    class PriorityQueue {
        #priorityKey;
        #secondaryKey;
        #uniqueKey;
        #arity;
        #map = new Map();
        #heap = [];

        constructor(compareKey, secondaryKey, uniqueKey, arity = 4) {
            this.#priorityKey = compareKey;
            this.#secondaryKey = secondaryKey;
            this.#uniqueKey = uniqueKey;
            this.#arity = arity;
        }
        
        length() {
            return this.#heap.length;
        }

        add(value) {
            if (this.#map.has(value[this.#uniqueKey])) {
                let index = this.#map.get(value[this.#uniqueKey]);
                if (this.#heap[index][this.#priorityKey] > value[this.#priorityKey] ||
                    (this.#heap[index][this.#priorityKey] == value[this.#priorityKey] && this.#heap[index][this.#secondaryKey] > value[this.#secondaryKey])) {
                    this.#heap[index] = value;
                    this.#heapifyUp(index);
                    return;
                }
                return;
            }
            this.#heap.push(value);
            this.#map.set(value[this.#uniqueKey], this.#heap.length - 1); 
            this.#heapifyUp(this.#heap.length - 1);
        };

        deque() {
            this.#swap(0, this.#heap.length - 1)
            let min = this.#heap.pop();
            this.#map.delete(min[this.#uniqueKey])
            this.#heapifyDown(0);
            return min;
        }

        #swap(indexA, indexB) {
            let temp = this.#heap[indexA];
            this.#heap[indexA] = this.#heap[indexB];
            this.#heap[indexB] = temp;
            this.#map.set(this.#heap[indexA][this.#uniqueKey], indexA);
            this.#map.set(this.#heap[indexB][this.#uniqueKey], indexB);
        }

        #heapifyDown(index) {
            if (index == this.#heap.length - 1) {
                return;
            }
            let i = index;
            while (i < this.#heap.length) {
                let minChild = this.#minChild(i);
                if (minChild >= this.#heap.length) {
                    break;
                }
                if (this.#heap[i][this.#priorityKey] > this.#heap[minChild][this.#priorityKey]) {
                    this.#swap(i, minChild)
                    i = minChild;
                } else if (this.#heap[i][this.#priorityKey] == this.#heap[minChild][this.#priorityKey]) {
                    if (this.#heap[i][this.#secondaryKey] > this.#heap[minChild][this.#secondaryKey]) {
                        this.#swap(i, minChild)
                        i = minChild;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }

        #heapifyUp(index) {
            if (index == 0) {
                return;
            }
            let i = index;
            while (i > 0) {
                if (i == 0) {
                    return;
                }
                let parentIndex = this.#parentIndex(i);
                if (this.#heap[i][this.#priorityKey] < this.#heap[parentIndex][this.#priorityKey]) {
                    this.#swap(i, parentIndex);
                    i = parentIndex;
                } else if (this.#heap[i][this.#priorityKey] == this.#heap[parentIndex][this.#priorityKey]) {
                    if (this.#heap[i][this.#secondaryKey] < this.#heap[parentIndex][this.#secondaryKey]) {
                        this.#swap(i, parentIndex);
                        i = parentIndex;
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            }
        }

        #parentIndex(index) {
            return Math.floor((index - 1) / this.#arity);
        }

        #childNthIndex(index, n) {
            return (index * this.#arity) + 1 + n;
        }

        #minChild(index) {
            let minChild = this.#childNthIndex(index, 0);
            for (let i = 0; i < this.#arity; i++) {
                if (this.#childNthIndex(index, i) >= this.#heap.length) {
                    break;
                }
                if (this.#heap[this.#childNthIndex(index, i)][this.#priorityKey] < this.#heap[minChild][this.#priorityKey]) {
                    minChild = this.#childNthIndex(index, i);
                }
            }
            return minChild;
        }
    }

    if (self) {
        self.pathfinding = Object.assign(self.pathfinding || {}, {
            PriorityQueue: PriorityQueue
        });
    } else {
        module.exports = PriorityQueue;
    }
})(typeof (self) !== 'undefined' ? self : null);