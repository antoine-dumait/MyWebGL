/// <reference path="main.ts" />
import { GLOBAL } from "./setup.js";
import { subtractVectors, cross, normalize } from "./vec3";
export function updateAngles(x, y) {
    const sensi = 500;
    GLOBAL.yaw = (GLOBAL.yaw - x / sensi); //TODO: sus
    GLOBAL.pitch = Math.max(-(Math.PI / 2) + 0.3, Math.min(Math.PI / 2 - 0.3, (GLOBAL.pitch - y / sensi))); //pas bien       
}
export function getNormals(positions, indices) {
    let normals = [];
    for (let i = 0; i < indices.length; i += 3) {
        let p1 = [positions[indices[i] * 3], positions[indices[i] * 3 + 1], positions[indices[i] * 3 + 2]];
        let p2 = [positions[indices[i + 1] * 3], positions[indices[i + 1] * 3 + 1], positions[indices[i + 1] * 3 + 2]];
        let p3 = [positions[indices[i + 2] * 3], positions[indices[i + 2] * 3 + 1], positions[indices[i + 2] * 3 + 2]];
        let line1 = subtractVectors(p1, p2);
        let line2 = subtractVectors(p1, p3);
        let normal = cross(line1, line2);
        normal = normalize(normal);
        normals.push(...normal);
        normals.push(...normal);
    }
    return normals;
}
export function radToDeg(r) {
    return r * 180 / Math.PI;
}
export function degToRad(d) {
    return d * Math.PI / 180;
}
