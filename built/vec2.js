export default class Vector2D {
    u;
    v;
    w;
    constructor(u = 0, v = 0, w = 1) {
        this.u = u;
        this.v = v;
        this.w = w;
    }
    copy() {
        return new Vector2D(this.u, this.v, this.w);
    }
}
