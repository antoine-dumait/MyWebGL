import { fragment_shader_src, vertex_shader_src } from "./shaders";
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
let CANVAS;
let GL;
function main() {
    CANVAS = document.querySelector("#glcanvas");
    CANVAS.width = 1080;
    CANVAS.height = 720;
    GL = CANVAS.getContext("webgl");
    // Only continue if WebGL is available and working
    if (GL === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    window.requestAnimationFrame(update);
}
let yaw = 0;
let pitch = 0;
function updateAngles(x, y) {
    let sensi = 500;
    yaw = (yaw - x / sensi); //TODO: sus
    pitch = Math.max(-(Math.PI / 2) + 0.3, Math.min(Math.PI / 2 - 0.3, (pitch - y / sensi))); //pas bien       
}
document.body.addEventListener('mousemove', (e) => {
    if (locked) {
        updateAngles(e.movementX, e.movementY);
    }
});
document.body.addEventListener('keydown', (e) => {
    let moveDelta = 0.2;
    let forward = [0, 0, 1];
    switch (e.key) {
        case 'z':
            cameraPosition[2] += moveDelta;
            break;
        case 's':
            cameraPosition[2] -= moveDelta;
            break;
        case 'q':
            cameraPosition[0] -= moveDelta;
            break;
        case 'd':
            cameraPosition[0] += moveDelta;
            break;
        case 'Shift':
            cameraPosition[1] -= moveDelta;
            break;
        case ' ':
            cameraPosition[1] += moveDelta;
            break;
    }
});
function addVectors(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function normalize(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    }
    else {
        return [0, 0, 0];
    }
}
function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]];
}
var m4 = {
    transpose: function (m) {
        return [
            m[0], m[3], m[6], m[9],
            m[1], m[4], m[7], m[10],
            m[2], m[5], m[8], m[11]
        ];
    },
    lookAt: function (cameraPosition, target, up) {
        var zAxis = normalize(subtractVectors(cameraPosition, target));
        var xAxis = normalize(cross(up, zAxis));
        var yAxis = normalize(cross(zAxis, xAxis));
        return [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0],
            cameraPosition[1],
            cameraPosition[2],
            1,
        ];
    },
    perspective: function (fieldOfViewInRadians, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },
    projection: function (width, height, depth) {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1,
        ];
    },
    multiply: function (a, b) {
        const a00 = a[0 * 4 + 0];
        const a01 = a[0 * 4 + 1];
        const a02 = a[0 * 4 + 2];
        const a03 = a[0 * 4 + 3];
        const a10 = a[1 * 4 + 0];
        const a11 = a[1 * 4 + 1];
        const a12 = a[1 * 4 + 2];
        const a13 = a[1 * 4 + 3];
        const a20 = a[2 * 4 + 0];
        const a21 = a[2 * 4 + 1];
        const a22 = a[2 * 4 + 2];
        const a23 = a[2 * 4 + 3];
        const a30 = a[3 * 4 + 0];
        const a31 = a[3 * 4 + 1];
        const a32 = a[3 * 4 + 2];
        const a33 = a[3 * 4 + 3];
        const b00 = b[0 * 4 + 0];
        const b01 = b[0 * 4 + 1];
        const b02 = b[0 * 4 + 2];
        const b03 = b[0 * 4 + 3];
        const b10 = b[1 * 4 + 0];
        const b11 = b[1 * 4 + 1];
        const b12 = b[1 * 4 + 2];
        const b13 = b[1 * 4 + 3];
        const b20 = b[2 * 4 + 0];
        const b21 = b[2 * 4 + 1];
        const b22 = b[2 * 4 + 2];
        const b23 = b[2 * 4 + 3];
        const b30 = b[3 * 4 + 0];
        const b31 = b[3 * 4 + 1];
        const b32 = b[3 * 4 + 2];
        const b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },
    translation: function (tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },
    xRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },
    yRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },
    zRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },
    scaling: function (sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    },
    translate: function (m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },
    xRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },
    yRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },
    zRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },
    scale: function (m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },
    inverse: function (m) {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;
        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
    },
    vectorMultiply: function (v, m) {
        var dst = [];
        for (var i = 0; i < 4; ++i) {
            dst[i] = 0.0;
            for (var j = 0; j < 4; ++j) {
                dst[i] += v[j] * m[j * 4 + i];
            }
        }
        return dst;
    },
};
let positions = [
    // Face avant
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    // Face arrière
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
    // Face supérieure
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
    // Face inférieure
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    // Face droite
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
    // Face gauche
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
];
positions = positions.map(x => x / 4);
const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
];
let colors = [];
const faceColors = [
    [1.0, 1.0, 1.0], // Front face: white
    [1.0, 0.0, 0.0], // Back face: red
    [0.0, 1.0, 0.0], // Top face: green
    [0.0, 0.0, 1.0], // Bottom face: blue
    [1.0, 1.0, 0.0], // Right face: yellow
    [1.0, 0.0, 1.0], // Left face: purple
];
// Convert the array of colors into a table for all the vertices.
for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
}
function radToDeg(r) {
    return r * 180 / Math.PI;
}
function degToRad(d) {
    return d * Math.PI / 180;
}
let cameraPosition = [0, 0, 0];
var locked = false;
document.addEventListener("pointerlockchange", () => {
    locked = Boolean(document.pointerLockElement);
});
document.addEventListener('mousedown', (e) => {
    document.body.requestPointerLock();
});
const forward = [0, 0, -1, 1];
const up = [0, 1, 0];
var lookDirection;
function update() {
    const vertex_shader = createShader(GL, GL.VERTEX_SHADER, vertex_shader_src);
    const fragment_shader = createShader(GL, GL.FRAGMENT_SHADER, fragment_shader_src);
    const program = createProgram(GL, vertex_shader, fragment_shader);
    const positionAttributeLocation = GL.getAttribLocation(program, "a_position");
    const colorAttributeLocation = GL.getAttribLocation(program, "a_color");
    const colorUniformLocation = GL.getUniformLocation(program, "u_color");
    const matrixUniformLocation = GL.getUniformLocation(program, "u_matrix");
    const positionBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
    GL.enable(GL.CULL_FACE);
    GL.enable(GL.DEPTH_TEST);
    const fieldOfViewRadians = degToRad(60);
    const aspect = CANVAS.width / CANVAS.height;
    const zNear = 0.1;
    const zFar = 2000;
    const matrixProjection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    lookDirection = m4.vectorMultiply(forward, m4.xRotation(pitch));
    lookDirection = m4.vectorMultiply(lookDirection, m4.yRotation(yaw));
    let posLook = addVectors(cameraPosition, lookDirection);
    // console.log(posLook);
    let matrixCamera_ = m4.lookAt(cameraPosition, posLook, up);
    let matrixView = m4.inverse(matrixCamera_);
    let matrixViewProj = m4.multiply(matrixProjection, matrixView);
    // matrixViewProj = m4.multiply(matrixViewProj, m4.translation(0,0,2));
    // var matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    // // matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    // matrix = m4.xRotate(matrix, rotation[0]);
    // matrix = m4.yRotate(matrix, rotation[1]);
    // matrix = m4.zRotate(matrix, rotation[2]);
    // matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
    // console.log(matrixProjectionNew);
    // let positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    // console.log(positions);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(positions), GL.STATIC_DRAW);
    GL.viewport(0, 0, GL.canvas.width, GL.canvas.height);
    // Set clear color to black, fully opaque
    GL.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.useProgram(program);
    GL.enableVertexAttribArray(positionAttributeLocation);
    GL.uniformMatrix4fv(matrixUniformLocation, false, matrixViewProj);
    GL.uniform4f(colorUniformLocation, 0, 0, 1, 1);
    let size;
    let type;
    let normalize;
    let stride;
    let offset_;
    size = 3;
    type = GL.FLOAT;
    normalize = false;
    stride = 0;
    offset_ = 0;
    GL.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset_);
    const colorBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, colorBuffer);
    // console.log(colors);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(colors), GL.STATIC_DRAW);
    size = 3;
    type = GL.FLOAT;
    normalize = true;
    stride = 0;
    offset_ = 0;
    GL.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset_);
    GL.enableVertexAttribArray(colorAttributeLocation);
    const indexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GL.STATIC_DRAW);
    let primitiveType = GL.TRIANGLES;
    type = GL.UNSIGNED_SHORT;
    let offset = 0;
    let count = 36;
    // GL.drawArrays(primitiveType, offset, count/size);
    GL.drawElements(primitiveType, count, type, offset);
    // console.log("update !");
    window.requestAnimationFrame(update);
}
main();
