import Matrix4x4 from "./src/matrix4.js";
import { GLOBAL, SCREEN, SCREEN_HEIGHT, SCREEN_WIDTH } from "./setup.js";
import Triangle from "./triangle.js";
import Vector3D from "./src/vec3.js";
import { Block, BlockType, Face } from "./world.js";

export function showHolderBlock(){
    let hit = GLOBAL.WORLD.rayCastHit(GLOBAL.CAMERA.pos, GLOBAL.CAMERA.lookDirection);
    if(hit){
        GLOBAL.hitDir = hit.dir;
        let hitBlock = hit.block;
        GLOBAL.holderBlock.pos = hitBlock.pos;
        GLOBAL.holderBlock.blockType = hitBlock.blockType;
    }
}

export function placeHolderBlock(){
    if(GLOBAL.hitDir){
        let tmp = new Block(Vector3D.add(GLOBAL.holderBlock.pos, GLOBAL.hitDir), GLOBAL.currentBlock);
        GLOBAL.WORLD.addBlock(tmp, tmp.pos.x, tmp.pos.y, tmp.pos.z);
    }
}

export function drawBlock(block: Block|null, teint=false){
    if(!block)return;
    if(!block.pos){
        
        console.log(block);
        
    }
    const clipDistance = 0.5;
    const clipPlane = new Vector3D(0, 0, clipDistance); //point de notre plan, juste devant nous
    const clipPlaneNormal = new Vector3D(0, 0, 1);
    const offsetVector = new Vector3D(1, 1, 0); //offset tri points values x,y from (-1,1) to (0,2)
    const HALF_SCREEN_WIDTH = SCREEN_WIDTH/2;
    const HALF_SCREEN_HEIGHT = SCREEN_HEIGHT/2;
    if(!block)return;
    if(Vector3D.distance(block.pos, GLOBAL.CAMERA.pos) > GLOBAL.renderDistance)return;
    let blockType = block.blockType;
    block!.faces!.forEach( (face: Face) => {
        let texture = blockType.getSideTextures(face.type);
        if(!face.isVisible())return;
        face.triangles.forEach(tri => {  
      
            let triTransformed = tri.copy();
            triTransformed.toWorld();
            triTransformed.mapToAllPoints((p: Vector3D) => Matrix4x4.multiplyVector(GLOBAL.worldMatrix, p));   
            triTransformed.updateNormal();

            let cameraRay = Vector3D.sub(triTransformed.p[0], GLOBAL.CAMERA.pos);
            
            if(Vector3D.dotProduct(triTransformed.normal!, cameraRay) < 0){                 
                //world space -> view space
                GLOBAL.triangleCount ++;

                let triViewed = triTransformed;
    
                triViewed.mapToAllPoints((p: Vector3D) => Matrix4x4.multiplyVector(GLOBAL.matrixView, p));
                
                //z pointe en face de nous, donc normal au plan est z
    
                let tris = Triangle.clipPlane(clipPlane, clipPlaneNormal, triViewed);
                //projection,  3D -> 2D
                
                tris!.forEach((tri: Triangle) => {
                    tri.mapToAllPoints((p: Vector3D) => Matrix4x4.multiplyVector(GLOBAL.matrixProjection, p));
                    
                    tri.t[0].u = tri.t[0].u / tri.p[0].w;
                    tri.t[1].u = tri.t[1].u / tri.p[1].w;
                    tri.t[2].u = tri.t[2].u / tri.p[2].w;
    
                    tri.t[0].v = tri.t[0].v / tri.p[0].w;
                    tri.t[1].v = tri.t[1].v / tri.p[1].w;
                    tri.t[2].v = tri.t[2].v / tri.p[2].w;
    
    
                    tri.t[0].w = 1 / tri.p[0].w;
                    tri.t[1].w = 1 / tri.p[1].w;
                    tri.t[2].w = 1 / tri.p[2].w;
            
                    //diviser par W pour rester dans espace cartÃ©sien ?? TODO : revoir
                    tri.p[0] = Vector3D.divide(tri.p[0], tri.p[0].w);
                    tri.p[1] = Vector3D.divide(tri.p[1], tri.p[1].w);
                    tri.p[2] = Vector3D.divide(tri.p[2], tri.p[2].w);
                    
                    //offset into screen
                    tri.p[0] = Vector3D.add(tri.p[0], offsetVector);
                    tri.p[1] = Vector3D.add(tri.p[1], offsetVector);
                    tri.p[2] = Vector3D.add(tri.p[2], offsetVector);
                    
                    //scale to screen size
                    tri.p[0].x *= (HALF_SCREEN_WIDTH ); 
                    tri.p[0].y *= (HALF_SCREEN_HEIGHT); 
                    tri.p[1].x *= (HALF_SCREEN_WIDTH ); 
                    tri.p[1].y *= (HALF_SCREEN_HEIGHT); 
                    tri.p[2].x *= (HALF_SCREEN_WIDTH ); 
                    tri.p[2].y *= (HALF_SCREEN_HEIGHT); 

                    const triProjected = tri;

                    const triangleQueue = [triProjected];
                    let newTrianglesCount = 1;

                    for(let i=0; i<4; i++){
                        let newTriangles: Triangle[];
                        while(newTrianglesCount > 0){
                            let triToTest = triangleQueue.shift()!;
                            newTrianglesCount--;
                            newTriangles=[];
                            switch(i){
                                case 0: 
                                    newTriangles = Triangle.clipPlane(GLOBAL.planHaut, GLOBAL.normalPlanHaut, triToTest);                     
                                    break;
                                case 1: 
                                    newTriangles = Triangle.clipPlane(GLOBAL.planBas, GLOBAL.normalPlanBas, triToTest);                  
                                    break;
                                case 2: 
                                    newTriangles = Triangle.clipPlane(GLOBAL.planGauche, GLOBAL.normalPlanGauche, triToTest);                     
                                    break;
                                case 3: 
                                    newTriangles = Triangle.clipPlane(GLOBAL.planDroite, GLOBAL.normalPlanDroite, triToTest);                    
                                    break;
                            }
                            triangleQueue.push(...newTriangles);
                        }
                        newTrianglesCount = triangleQueue.length;
                    }
                    
                    triangleQueue.forEach((tri: Triangle) => {
                        GLOBAL.currentRender(tri, texture, teint);
                        // SCREEN.drawTexturedTriangle(tri, texture, teint);
                        // SCREEN.drawWireframeTriangle(tri);
                    });
                });
            }
            });
        });
}

export function removeBlock(){
    if(GLOBAL.hitDir){ //for first click on canvas, to lock view
        let p = GLOBAL.holderBlock.pos;
        GLOBAL.WORLD.blocks[p.y][p.z][p.x] = null;
        GLOBAL.holderBlock.pos = new Vector3D();
    }
}

export function drawLine(
    x1: number, y1: number, w1: number,  
    x2: number, y2: number, w2: number,
    r: number, g: number, b: number){
    let index = (y1 * SCREEN_WIDTH + x1)*4;
    if(SCREEN.zBuffer[index]>w1){return;} //choix arbitraire, w1 décide de toute la ligne
    SCREEN.zBuffer[index] = w1;
    let dx = x2 - x1; 
    let dy = y2 - y1;
    let incX = Math.sign(dx);
    let incY = Math.sign(dy);
    dx = Math.abs(dx);
    dy = Math.abs(dy);
    if(dy == 0){ //horizontal line
        let indexStep = incX*4;

        for(let x=x1; x!=x2 + incX; x += incX){ //pas <= car descend ou monte donc !=
            SCREEN.paintPixelBuffer(index, r, g, b);
            index += indexStep; 
        }
    }

    else if(dx == 0){ //vertical line
        let indexStep = SCREEN_WIDTH*incY*4;

        for(let y=y1; y!=y2 + incY; y += incY){
            // SCREEN.paintPixelBuffer(index, 200, 0, 0);
            SCREEN.paintPixelBuffer(index, r, g, b);
            index += indexStep; 
        }
    }
    else if(dx >= dy){ //ligne + horizontale

        let slope = 2 * dy;
        let error = -dx;
        let errorInc = -2 * dx;
        let indexStep = SCREEN_WIDTH*incY*4;

        for(let x=x1; x!=x2 + incX; x += incX){
            SCREEN.paintPixelBuffer(index, r, g, b);

            index += incX*4; 
            error += slope;
            if(error >= 0){
                index += indexStep;
                error += errorInc;
            }
        }
    }

    else {
        let slope = 2 * dx;
        let error = -dy;
        let errorInc = -2 * dy;        
        let indexStep = SCREEN_WIDTH*incY*4;
        for(let y=y1; y!=y2 + incY; y += incY){
            SCREEN.paintPixelBuffer(index, r, g, b);

            index += indexStep; 
            error += slope;
            if(error >= 0){
                index += incX*4;
                error += errorInc;
            }
        }
    }
}