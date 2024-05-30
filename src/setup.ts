export const GLOBAL = {} as any;

GLOBAL.yaw = Math.PI * -(1/2)
GLOBAL.pitch = Math.PI * -(1/5);
GLOBAL.locked = false;
GLOBAL.up = [0,1,0];
GLOBAL.lookDirection = [0,0,-1] as const; //dont define, modify yaw and pitch
GLOBAL.cameraPosition = [-10,23,15];