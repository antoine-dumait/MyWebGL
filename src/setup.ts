export const GLOBAL = {} as any;

GLOBAL.yaw = 0
GLOBAL.pitch = Math.PI * (-(1/5));
GLOBAL.locked = false;
GLOBAL.up = [0,1,0];
GLOBAL.lookDirection = [0,0,-1] as const;
GLOBAL.cameraPosition = [0,7,10];