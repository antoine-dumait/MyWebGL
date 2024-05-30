import { GLOBAL } from "./setup.js";
import { positions, indices, faceColors, positionsCamera, indicesCamera, positionsCube } from "./data.js";
import { m4 } from "./m4.js";
import { fragment_shader_src, vertex_shader_src, fragment_shader_solid_color_src, vertex_shader_solid_color_src } from "./shaders_src.js";
import { degToRad, getNormals } from "./utils.js";
import { addVectors, normalize } from "./vec3.js";
import { createShader, createProgram } from "./shader.js";
import { f } from "./listeners.js";
f();
console.log("launched");
let CANVAS;
let GL;
CANVAS = document.querySelector("#glcanvas");
CANVAS.width = 1080;
CANVAS.height = 720;
GL = CANVAS.getContext("webgl");
// Only continue if WebGL is available and working
if (GL === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
}
window.requestAnimationFrame(update);
const normals = getNormals(positions, indices);
let colors = [];
// Convert the array of colors into a table for all the vertices.
for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
}
// console.log(indicesCamera.length);
//   // add cone segments
//   const numSegments = 6;
//   const coneBaseIndex = positions.length / 3; 
//   const coneTipIndex =  coneBaseIndex - 1;
//   for (let i = 0; i < numSegments; ++i) {
//     const u = i / numSegments;
//     const angle = u * Math.PI * 2;
//     const x = Math.cos(angle);
//     const y = Math.sin(angle);
//     positionsCamera.push(x, y, 0);
//     // line from tip to edge
//     indicesCamera.push(coneTipIndex, coneBaseIndex + i);
//     // line from point on edge to next point on edge
//     indicesCamera.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments);
//   }
const frameTimes = [];
const maxFramesTime = 20;
var oldTimeStamp = 0;
const fpsElement = document.querySelector("#fps");
function fpsUpdate() {
    const sumDelta = frameTimes.reduce((a, b) => a + b);
    const avgDelta = sumDelta / maxFramesTime;
    const FPS = (1000 / avgDelta);
    fpsElement.textContent = FPS.toFixed(1);
}
const vertex_shader = createShader(GL, GL.VERTEX_SHADER, vertex_shader_src);
const fragment_shader = createShader(GL, GL.FRAGMENT_SHADER, fragment_shader_src);
const program = createProgram(GL, vertex_shader, fragment_shader);
const vertex_shader_solid_color = createShader(GL, GL.VERTEX_SHADER, vertex_shader_solid_color_src);
const fragment_shader_solid_color = createShader(GL, GL.FRAGMENT_SHADER, fragment_shader_solid_color_src);
const program_solid_color = createProgram(GL, vertex_shader_solid_color, fragment_shader_solid_color);
const positionAttributeLocation = GL.getAttribLocation(program, "a_position");
const normalAttributeLocation = GL.getAttribLocation(program, "a_normal");
const colorAttributeLocation = GL.getAttribLocation(program, "a_color");
const texCoordAttributeLocation = GL.getAttribLocation(program, "a_texCoord");
const worldViewProjectionUniformLocation = GL.getUniformLocation(program, "u_worldViewProjection");
const matrixWorldInverseTransposeUniformLocation = GL.getUniformLocation(program, "u_worldInverseTranspose");
const matrixWorldUniformLocation = GL.getUniformLocation(program, "u_world");
const matrixWorldViewUniformLocation = GL.getUniformLocation(program, "u_worldView");
const reverseLightDirectionUniformLocation = GL.getUniformLocation(program, "u_reverseLightDirection");
const lightWorldPositionUniformLocation = GL.getUniformLocation(program, "u_lightWorldPosition");
const viewWorldPositionUniformLocation = GL.getUniformLocation(program, "u_viewWorldPosition");
const colorUniformLocation = GL.getUniformLocation(program, "u_color");
const shininessUniformLocation = GL.getUniformLocation(program, "u_shininess");
const lightColorUniformLocation = GL.getUniformLocation(program, "u_lightColor");
const specularColorUniformLocation = GL.getUniformLocation(program, "u_specularColor");
const spotLightInnerLimitColorUniformLocation = GL.getUniformLocation(program, "u_innerLimit");
const spotLightOuterLimitColorUniformLocation = GL.getUniformLocation(program, "u_outerLimit");
const fogColorUniformLocation = GL.getUniformLocation(program, "u_fogColor");
const fogNearUniformLocation = GL.getUniformLocation(program, "u_fogNear");
const fogFarUniformLocation = GL.getUniformLocation(program, "u_fogFar");
const fogDensityUniformLocation = GL.getUniformLocation(program, "u_fogDensity");
const positionAttributeLocationSolidColor = GL.getAttribLocation(program_solid_color, "a_position");
const colorUniformLocationSolidColor = GL.getUniformLocation(program_solid_color, "u_color");
const matrixUniformLocationSolidColor = GL.getUniformLocation(program_solid_color, "u_matrix");
const fogColor = [0.8, 0.9, 1, 1];
const fogNear = 1;
const fogFar = 120;
const fogDensity = 0.01;
const reverseLightDirection = [0, 0, -1];
const forward = [0, 0, -1, 1];
const lightPosition = [0, 0, 10];
const tmp_rot = [0, 0, 0];
var tmp_angle = 0;
const tmp_rot2 = [0, 0, 0];
var tmp_angle2 = 0;
let countOfRandomBlock = 100;
const blockPosRandomness = 100;
const blockPosRandomnessHalf = blockPosRandomness / 2;
const randomPos = [];
const newWidth = GL.canvas.width / 2;
const fieldOfViewRadians = degToRad(60);
const aspect = newWidth / GL.canvas.height;
const zNear = 0.1;
const zFar = 10000;
const matrixPerspective = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
GL.useProgram(program);
GL.uniform1f(fogNearUniformLocation, fogNear);
GL.uniform1f(fogFarUniformLocation, fogFar);
GL.uniform1f(fogDensityUniformLocation, fogDensity);
GL.uniform1f(spotLightOuterLimitColorUniformLocation, Math.cos(degToRad(22)));
GL.uniform1f(shininessUniformLocation, 5);
GL.uniform1f(spotLightInnerLimitColorUniformLocation, Math.cos(degToRad(20)));
GL.uniform3f(lightColorUniformLocation, 0.5, 0.5, 0.5);
GL.uniform3f(specularColorUniformLocation, 1, 0, 0);
GL.uniform3f(reverseLightDirectionUniformLocation, ...normalize([-GLOBAL.lookDirection[0], -GLOBAL.lookDirection[1], -GLOBAL.lookDirection[2]]));
GL.uniform4f(fogColorUniformLocation, ...fogColor);
GL.uniform4f(colorUniformLocation, 0, 1, 0, 1);
const positionBuffer = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(positions), GL.STATIC_DRAW);
const normalBuffer = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, normalBuffer);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(normals), GL.STATIC_DRAW);
const colorBuffer = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, colorBuffer);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(colors), GL.STATIC_DRAW);
const indexBuffer = GL.createBuffer();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GL.STATIC_DRAW);
// for (let i = 0; i < countOfRandomBlock; i++) {
//   randomPos.push(
//     Math.floor(-blockPosRandomnessHalf + Math.random()*blockPosRandomness),
//     Math.floor(-blockPosRandomnessHalf + Math.random()*blockPosRandomness),
//     Math.floor(-blockPosRandomnessHalf + Math.random()*blockPosRandomness)
//   );
// }
const mapSize = 40;
for (let x = 0; x < mapSize; x += 2) {
    for (let z = 0; z < mapSize; z += 2) {
        randomPos.push(x, 0, z);
        let y = 2;
        let r = Math.random();
        while (r > 0.5) {
            randomPos.push(x, y, z);
            y += 2;
            r = Math.random();
        }
    }
}
countOfRandomBlock = randomPos.length / 3;
// console.log(randomPos);
const texture = GL.createTexture();
GL.bindTexture(GL.TEXTURE_2D, texture);
const block_images_src = ["dirt.png", "stone.png"];
const images = [];
block_images_src.forEach(image_src => {
    let image = new Image();
    image.src = image_src;
    console.log(image);
});
var image = new Image();
image.src = "./f-texture.png";
image.addEventListener('load', function () {
    // Now that the image has loaded make copy it to the texture.
    GL.bindTexture(GL.TEXTURE_2D, texture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    GL.generateMipmap(GL.TEXTURE_2D);
    console.log("image load");
});
function update(timeStamp) {
    const deltaTime = timeStamp - oldTimeStamp;
    oldTimeStamp = timeStamp;
    frameTimes.push(deltaTime);
    if (frameTimes.length > maxFramesTime) {
        frameTimes.shift();
    }
    fpsUpdate();
    GL.useProgram(program);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);
    GL.enable(GL.SCISSOR_TEST);
    GL.uniform3fv(lightWorldPositionUniformLocation, GLOBAL.cameraPosition);
    GL.uniform3fv(viewWorldPositionUniformLocation, GLOBAL.cameraPosition);
    GL.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
    GL.vertexAttribPointer(positionAttributeLocation, 3, GL.FLOAT, false, 0, 0); //size, type, normalize, stride, offset
    GL.enableVertexAttribArray(positionAttributeLocation);
    // provide texture coordinates for the rectangle.
    var texCoordBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, texCoordBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([
        0, 1,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        1, 0,
        0, 0,
    ]), GL.STATIC_DRAW);
    // We'll supply texcoords as floats.
    GL.vertexAttribPointer(texCoordAttributeLocation, 2, GL.FLOAT, false, 0, 0);
    GL.enableVertexAttribArray(texCoordAttributeLocation);
    GL.bindBuffer(GL.ARRAY_BUFFER, normalBuffer);
    GL.vertexAttribPointer(normalAttributeLocation, 3, GL.FLOAT, false, 0, 0);
    GL.enableVertexAttribArray(normalAttributeLocation);
    GL.bindBuffer(GL.ARRAY_BUFFER, colorBuffer);
    GL.vertexAttribPointer(colorAttributeLocation, 3, GL.FLOAT, true, 0, 0);
    GL.enableVertexAttribArray(colorAttributeLocation);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GLOBAL.lookDirection = m4.vectorMultiply(forward, m4.xRotation(GLOBAL.pitch));
    GLOBAL.lookDirection = m4.vectorMultiply(GLOBAL.lookDirection, m4.yRotation(GLOBAL.yaw));
    let posLook = addVectors(GLOBAL.cameraPosition, GLOBAL.lookDirection);
    let matrixCamera;
    let matrixView;
    let matrixViewProj;
    let matrixCamera1;
    var matrixOrthographic;
    let backGroundColor;
    for (let j = 0; j < 2; j++) {
        if (j == 0) {
            GL.viewport(0, 0, newWidth, GL.canvas.height);
            GL.scissor(0, 0, newWidth, GL.canvas.height);
            backGroundColor = [0.0, 0.0, 0.7, 1.0];
            GL.clearColor(...backGroundColor);
            GL.uniform4f(fogColorUniformLocation, ...backGroundColor);
            GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
            matrixCamera = m4.lookAt(GLOBAL.cameraPosition, posLook, GLOBAL.up);
            matrixCamera1 = m4.lookAt(GLOBAL.cameraPosition, posLook, GLOBAL.up);
            matrixView = m4.inverse(matrixCamera);
            matrixViewProj = m4.multiply(matrixPerspective, matrixView);
        }
        if (j == 1) {
            GL.viewport(newWidth, 0, newWidth, GL.canvas.height);
            GL.scissor(newWidth, 0, newWidth, GL.canvas.height);
            backGroundColor = [0.7, 0.0, 0.0, 1.0];
            GL.clearColor(...backGroundColor);
            GL.uniform4f(fogColorUniformLocation, 0.0, 0.0, 0.0, 0.0);
            GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
            //TODO: relook ortho ???
            const orthoUnit = 30;
            const left = -orthoUnit * aspect;
            const right = orthoUnit * aspect;
            const bottom = -orthoUnit;
            const top = orthoUnit;
            const near = 400;
            const far = -400;
            matrixOrthographic = m4.orthographic(left, right, bottom, top, near, far);
            let outCameroPosition = [0, 15, 10]; //cant put x=0 ??
            matrixCamera = m4.lookAt(outCameroPosition, [0, 0, 0], GLOBAL.up);
            matrixView = m4.inverse(matrixCamera);
            matrixViewProj = m4.multiply(matrixOrthographic, matrixView);
        }
        GL.useProgram(program);
        GL.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
        GL.vertexAttribPointer(positionAttributeLocation, 3, GL.FLOAT, false, 0, 0); //size, type, normalize, stride, offset
        for (let i = 0; i < 4; i++) {
            let tmpMatrixModel = m4.identity();
            switch (i) {
                case 0:
                    // tmpMatrixModel = m4.multiply(m4.lookAt(
                    //   [tmpMatrixModel[12], tmpMatrixModel[13], tmpMatrixModel[14]], 
                    //   addVectors([tmpMatrixModel[12], tmpMatrixModel[13], tmpMatrixModel[14]], [tmp_rot[0],0,tmp_rot[2]]), up), 
                    //   tmpMatrixModel);
                    break;
                case 1:
                    tmp_angle = (tmp_angle + 0.01) % 360;
                    tmp_rot[0] = Math.cos(tmp_angle) * 5;
                    tmp_rot[2] = Math.sin(tmp_angle) * 5;
                    // tmpMatrixModel = m4.multiply(m4.translation(2,0,0), tmpMatrixModel);
                    // tmpMatrixModel = m4.multiply(tmpMatrixModel, m4.yRotation(Math.PI/2));
                    let look = addVectors([tmp_rot[0], 0, tmp_rot[2]], [tmp_rot2[0], 0, tmp_rot2[2]]);
                    tmpMatrixModel = m4.multiply(tmpMatrixModel, m4.translation(tmp_rot[0], 0, tmp_rot[2]));
                    tmpMatrixModel = m4.lookAt([tmpMatrixModel[12], tmpMatrixModel[13], tmpMatrixModel[14]], look, GLOBAL.up);
                    // tmpMatrixModel = m4.multiply(tmpMatrixModel, m4.yRotation(degToRad(tmp_angle*500)));
                    // tmpMatrixModel = m4.multiply(tmpMatrixModel, m4.translation(4,0,0));
                    // console.log(addVectors([tmp_rot[0],0,tmp_rot[2]], [tmp_rot2[0],0,tmp_rot2[2]]));
                    //TODO solat system like thing
                    break;
                case 2:
                    tmp_angle2 = (tmp_angle2 + 0.02) % (Math.PI * 2);
                    tmp_rot2[0] = Math.cos(tmp_angle2) * 3;
                    tmp_rot2[2] = Math.sin(tmp_angle2) * 3;
                    tmpMatrixModel = m4.multiply(m4.translation(...addVectors([tmp_rot[0], 0, tmp_rot[2]], [tmp_rot2[0], 0, tmp_rot2[2]])), tmpMatrixModel);
                    tmpMatrixModel = m4.lookAt([tmpMatrixModel[12], tmpMatrixModel[13], tmpMatrixModel[14]], [tmp_rot[0], 0, tmp_rot[2]], GLOBAL.up);
                    break;
                case 3:
                    continue;
                    // let tmpMatrixCamera =  m4.lookAt(cameraPosition, posLook, up);    
                    // tmpMatrixModel = tmpMatrixCamera;
                    // tmpMatrixModel = m4.multiply(m4.translation(0,0,0), tmpMatrixModel);
                    break;
            }
            let matrixWorld = tmpMatrixModel;
            GL.uniformMatrix4fv(matrixWorldUniformLocation, false, matrixWorld);
            let matrixWorldInverse = m4.inverse(matrixWorld);
            let matrixWorldInverseTranspose = m4.transpose(matrixWorldInverse);
            GL.uniformMatrix4fv(matrixWorldInverseTransposeUniformLocation, false, matrixWorldInverseTranspose);
            let matrixWorldView = m4.multiply(matrixView, matrixWorld);
            GL.uniformMatrix4fv(matrixWorldViewUniformLocation, false, matrixWorldView);
            let matrix = m4.multiply(matrixViewProj, matrixWorld);
            GL.uniformMatrix4fv(worldViewProjectionUniformLocation, false, matrix);
            GL.drawElements(GL.TRIANGLES, 36, GL.UNSIGNED_SHORT, 0); //primitiveType, count, offset, indexType
        }
        for (let k = 0; k < countOfRandomBlock; k++) {
            let matrixWorld = m4.translation(randomPos[k * 3], randomPos[k * 3 + 1], randomPos[k * 3 + 2]);
            GL.uniformMatrix4fv(matrixWorldUniformLocation, false, matrixWorld);
            let matrixWorldInverse = m4.inverse(matrixWorld);
            let matrixWorldInverseTranspose = m4.transpose(matrixWorldInverse);
            GL.uniformMatrix4fv(matrixWorldInverseTransposeUniformLocation, false, matrixWorldInverseTranspose);
            let matrixWorldView = m4.multiply(matrixView, matrixWorld);
            GL.uniformMatrix4fv(matrixWorldViewUniformLocation, false, matrixWorldView);
            let matrix = m4.multiply(matrixViewProj, matrixWorld);
            GL.uniformMatrix4fv(worldViewProjectionUniformLocation, false, matrix);
            GL.drawElements(GL.TRIANGLES, 36, GL.UNSIGNED_SHORT, 0); //primitiveType, count, offset, indexType
        }
        if (j == 1) {
            GL.useProgram(program_solid_color);
            let matrix = m4.multiply(matrixOrthographic, m4.inverse(matrixCamera));
            matrix = m4.multiply(matrix, matrixCamera1);
            GL.uniformMatrix4fv(matrixUniformLocationSolidColor, false, matrix);
            GL.uniform4f(colorUniformLocationSolidColor, 0, 0, 0, 1);
            let positionBufferTest = GL.createBuffer();
            GL.bindBuffer(GL.ARRAY_BUFFER, positionBufferTest);
            GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(positionsCamera), GL.STATIC_DRAW);
            GL.vertexAttribPointer(positionAttributeLocationSolidColor, 3, GL.FLOAT, false, 0, 0); //size, type, normalize, stride, offset
            const indexBuffer = GL.createBuffer();
            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
            GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicesCamera), GL.STATIC_DRAW);
            GL.drawElements(GL.LINES, indicesCamera.length, GL.UNSIGNED_SHORT, 0); //primitiveType, count, indexType, offset
            positionBufferTest = GL.createBuffer();
            GL.bindBuffer(GL.ARRAY_BUFFER, positionBufferTest);
            GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(positionsCube), GL.STATIC_DRAW);
            GL.vertexAttribPointer(positionAttributeLocationSolidColor, 3, GL.FLOAT, false, 0, 0); //size, type, normalize, stride, offset
            matrix = m4.multiply(matrix, m4.inverse(matrixPerspective));
            GL.uniformMatrix4fv(matrixUniformLocationSolidColor, false, matrix);
            GL.drawElements(GL.LINES, indicesCamera.length, GL.UNSIGNED_SHORT, 0); //primitiveType, count, indexType, offset
        }
    }
    window.requestAnimationFrame(update);
}
