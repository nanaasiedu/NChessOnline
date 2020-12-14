export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    normalise() {
        const magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
        return createVec(Math.round(this.x/magnitude), Math.round(this.y/magnitude));
    }

    isDiagonal() {
        return Math.abs(this.x) > 0 && Math.abs(this.y);
    }

    neg() {
        return createVec(-this.x, -this.y)
    }

    static makeDirectionVec(startPos, endPos) {
        return createVec(endPos.c - startPos.c, endPos.r - startPos.r).normalise()
    }

    equals(vec) {
        return this.x === vec.x && this.y === vec.y;
    }
}

export function createVec(x, y) {
    return new Vector(x, y);
}