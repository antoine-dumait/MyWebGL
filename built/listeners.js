// import { cameraPosition, lookDirection, up } from "./main";
import { GLOBAL } from "./setup.js";
import { updateAngles } from "./utils.js";
import { normalize, cross } from "./vec3.js";
export function f() {
    document.body.addEventListener('mousemove', (e) => {
        if (GLOBAL.locked) {
            updateAngles(e.movementX, e.movementY);
        }
    });
    document.body.addEventListener('keydown', (e) => {
        let moveDelta = 0.5;
        let lookDirectionNormalize = normalize(GLOBAL.lookDirection);
        let right = cross(lookDirectionNormalize, GLOBAL.up);
        switch (e.key) {
            case 'z':
                GLOBAL.cameraPosition[0] += moveDelta * lookDirectionNormalize[0];
                GLOBAL.cameraPosition[2] += moveDelta * lookDirectionNormalize[2];
                break;
            case 's':
                GLOBAL.cameraPosition[0] -= moveDelta * lookDirectionNormalize[0];
                GLOBAL.cameraPosition[2] -= moveDelta * lookDirectionNormalize[2];
                break;
            case 'q':
                GLOBAL.cameraPosition[0] -= moveDelta * right[0];
                GLOBAL.cameraPosition[2] -= moveDelta * right[2];
                break;
            case 'd':
                GLOBAL.cameraPosition[0] += moveDelta * right[0];
                GLOBAL.cameraPosition[2] += moveDelta * right[2];
                break;
            case 'Shift':
                GLOBAL.cameraPosition[1] -= moveDelta;
                break;
            case ' ':
                GLOBAL.cameraPosition[1] += moveDelta;
                break;
        }
    });
    document.addEventListener("pointerlockchange", () => {
        GLOBAL.locked = Boolean(document.pointerLockElement);
    });
    document.addEventListener('mousedown', (e) => {
        document.body.requestPointerLock();
    });
}
