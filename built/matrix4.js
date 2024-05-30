import Vector3D from "./vec3.js";
export default class Matrix4x4 {
    m;
    static multiplyVector(M, v) {
        let newV = new Vector3D();
        newV.x = v.x * M.m[0][0] + v.y * M.m[1][0] + v.z * M.m[2][0] + v.w * M.m[3][0];
        newV.y = v.x * M.m[0][1] + v.y * M.m[1][1] + v.z * M.m[2][1] + v.w * M.m[3][1];
        newV.z = v.x * M.m[0][2] + v.y * M.m[1][2] + v.z * M.m[2][2] + v.w * M.m[3][2];
        newV.w = v.x * M.m[0][3] + v.y * M.m[1][3] + v.z * M.m[2][3] + v.w * M.m[3][3];
        return newV;
    }
    static getIdentity() {
        let M = new Matrix4x4();
        M.m[0][0] = 1.0;
        M.m[1][1] = 1.0;
        M.m[2][2] = 1.0;
        M.m[3][3] = 1.0;
        return M;
    }
    static rotation(X, Y, Z) {
        let M = new Matrix4x4();
        let cX = Math.cos(X), sX = Math.sin(X);
        let cY = Math.cos(Y), sY = Math.sin(Y);
        let cZ = Math.cos(Z), sZ = Math.sin(Z);
        M.m = [
            [cZ * cY, cZ * sY * sX - sZ * cX, cZ * sY * cX + sZ * sX, 0],
            [sZ * cY, sZ * sY * sX + cZ * cX, sZ * sY * cX - cZ * sX, 0],
            [-sY, cY * sX, cY * cX, 0],
            [0, 0, 0, 1]
        ];
        return M;
    }
    static rotationX(angleRad) {
        let M = new Matrix4x4();
        M.m[0][0] = 1.0;
        M.m[1][1] = Math.cos(angleRad);
        M.m[1][2] = Math.sin(angleRad);
        M.m[2][1] = -Math.sin(angleRad);
        M.m[2][2] = Math.cos(angleRad);
        M.m[3][3] = 1.0;
        return M;
    }
    static rotationY(angleRad) {
        let M = new Matrix4x4();
        M.m[0][0] = Math.cos(angleRad);
        M.m[0][2] = Math.sin(angleRad);
        M.m[2][0] = -Math.sin(angleRad);
        M.m[1][1] = 1.0;
        M.m[2][2] = Math.cos(angleRad);
        M.m[3][3] = 1.0;
        return M;
    }
    static rotationZ(angleRad) {
        let M = new Matrix4x4();
        M.m[0][0] = Math.cos(angleRad);
        M.m[0][1] = Math.sin(angleRad);
        M.m[1][0] = -Math.sin(angleRad);
        M.m[1][1] = Math.cos(angleRad);
        M.m[2][2] = 1.0;
        M.m[3][3] = 1.0;
        return M;
    }
    static translation(x, y, z) {
        let M = Matrix4x4.getIdentity();
        M.m[3][0] = x;
        M.m[3][1] = y;
        M.m[3][2] = z;
        return M;
    }
    static makeProjection(FOVdegrees, aspectRatio, near, far) {
        let FOVrad = 1 / Math.tan(FOVdegrees * 0.5 * Math.PI / 180);
        let M = new Matrix4x4();
        M.m[0][0] = aspectRatio * FOVrad;
        M.m[1][1] = FOVrad;
        M.m[2][2] = far / (far - near);
        M.m[3][2] = (-far * near) / (far - near);
        M.m[2][3] = 1.0;
        M.m[3][3] = 0.0;
        return M;
    }
    static multiplyMatrix(M1, M2) {
        let M = new Matrix4x4();
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                M.m[r][c] = M1.m[r][0] * M2.m[0][c] + M1.m[r][1] * M2.m[1][c] + M1.m[r][2] * M2.m[2][c] + M1.m[r][3] * M2.m[3][c];
            }
        }
        return M;
    }
    static pointAt(pos, target, up) {
        //forward de nouvelle direction
        let newForward = Vector3D.sub(target, pos);
        newForward = Vector3D.normalise(newForward);
        //up de nouvelle direction
        let a = Vector3D.multiply(newForward, Vector3D.dotProduct(up, newForward)); //difference entre new up et up, mutliplié par new forward pour etre normal
        let newUp = Vector3D.sub(up, a);
        newUp = Vector3D.normalise(newUp);
        //right de nouvelle direction
        let newRight = Vector3D.crossProduct(newUp, newForward);
        let M = new Matrix4x4();
        M.m = [
            [newRight.x, newRight.y, newRight.z, 0],
            [newUp.x, newUp.y, newUp.z, 0],
            [newForward.x, newForward.y, newForward.z, 0],
            [pos.x, pos.y, pos.z, 1]
        ];
        return M;
    }
    static quickInverse(M1) {
        let M2 = new Matrix4x4();
        let A = new Vector3D(M1.m[0][0], M1.m[0][1], M1.m[0][2]);
        let B = new Vector3D(M1.m[1][0], M1.m[1][1], M1.m[1][2]);
        let C = new Vector3D(M1.m[2][0], M1.m[2][1], M1.m[2][2]);
        let T = new Vector3D(M1.m[3][0], M1.m[3][1], M1.m[3][2]); //translation Vector
        M2.m = [
            [A.x, B.x, C.x, 0],
            [A.y, B.y, C.y, 0],
            [A.z, B.z, C.z, 0],
            [-Vector3D.dotProduct(T, A), -Vector3D.dotProduct(T, B), -Vector3D.dotProduct(T, C), 1]
        ];
        return M2;
    }
    constructor(values = Array.from(Array(4), () => Array(4).fill(0))) {
        this.m = values;
    }
}
