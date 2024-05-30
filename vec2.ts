export default class Vector2D{
    u: number;
    v: number;
    w: number;
    constructor(u=0, v=0, w=1){
        this.u = u;
        this.v = v;
        this.w = w;
    }

    copy(): Vector2D{
        return new Vector2D(this.u, this.v, this.w);
    }
}
