export class Position {
    constructor(r, c) {
        this.r = r;
        this.c = c;
    }

    addC(c) {
        return createPos(this.r, this.c + c);
    }

    addR(r) {
        return createPos(this.r + r, this.c);
    }

    add(vec) {
        return createPos(this.r + vec.y, this.c + vec.x);
    }

    equals(pos) {
        return this.r === pos.r && this.c === pos.c;
    }
}

export function createPos(r, c) {
    return new Position(r, c);
}
