export class Coordinate {
    constructor(r, c) {
        this.r = r;
        this.c = c;
    }

    addC(c) {
        return createCoordinate(this.r, this.c + c);
    }

    addR(r) {
        return createCoordinate(this.r + r, this.c);
    }

    add(vector) {
        return createCoordinate(this.r + vector.y, this.c + vector.x);
    }

    equals(pos) {
        return pos !== undefined && this.r === pos.r && this.c === pos.c;
    }
}

export function createCoordinate(r, c) {
    return new Coordinate(r, c);
}
