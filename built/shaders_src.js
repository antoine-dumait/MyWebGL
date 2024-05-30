export const vertex_shader_src = `
// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec4 a_color;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;

uniform mat4 u_world;
uniform mat4 u_worldView;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

varying vec4 v_color;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
// varying float v_fogDepth;
varying vec3 v_position;
// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = u_worldViewProjection * a_position;

  v_texCoord = a_texCoord;

  v_color = a_color;
  v_normal = mat3(u_worldInverseTranspose) * a_normal; //we dont want to move the normals, only use orientation part of matrix

  vec3 surfaceWorldPosition = (u_world * a_position).xyz;

  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;

  v_position = (u_worldView * a_position).xyz;
  // v_fogDepth = -(u_worldView * a_position).z;
}
`;
export const fragment_shader_src = `   
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying vec4 v_color;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
// varying float v_fogDepth;
varying vec3 v_position;

uniform sampler2D u_image;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;
uniform float u_shininess;
uniform float u_innerLimit;
uniform float u_outerLimit;
uniform vec3 u_lightColor;
uniform vec3 u_specularColor;
// uniform float u_fogNear;
// uniform float u_fogFar;
uniform vec4 u_fogColor;
uniform float u_fogDensity;

void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  vec3 normal = normalize(v_normal);

  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  // float light = dot(normal, u_reverseLightDirection);
  // float light = dot(normal, surfaceToLightDirection);
  // float light = 0.0;
  // float specular = 0.0;

  float dotFromDirection = dot(surfaceToLightDirection, u_reverseLightDirection); //pk distance change surfaceToLightDirection 
  float limitRange = u_innerLimit - u_outerLimit;
  float inLight = clamp((dotFromDirection - u_outerLimit) / limitRange, 0.0, 1.0);

  float light = inLight * dot(normal, surfaceToLightDirection);
  float specular = inLight * pow(dot(normal, halfVector), u_shininess);
  // if(dotFromDirection >= u_innerLimit){
  //   light = dot(normal, surfaceToLightDirection);
  //   if(light > 0.0){
  //     specular = pow(dot(normal, halfVector), u_shininess);
  //   }
  // }
  vec4 color = texture2D(u_image, v_texCoord);

  #define LOG2 1.442695
    
  float fogDistance = length(v_position);
  float fogAmount = 1. - exp2(-u_fogDensity * u_fogDensity * fogDistance * fogDistance * LOG2);
  fogAmount = clamp(fogAmount, 0., 1.);

  // float fogAmount = smoothstep(u_fogNear, u_fogFar, fogDistance);

  // float fogAmount = smoothstep(u_fogNear, u_fogFar, v_fogDepth);

  gl_FragColor = mix(color, u_fogColor, fogAmount); // return redish-purple

  // gl_FragColor.rgb *= light * u_lightColor;
  
  // gl_FragColor.rgb += specular * u_specularColor;
}
`;
export const vertex_shader_solid_color_src = `
// an attribute will receive data from a buffer
precision highp float;
attribute vec4 a_position;
uniform mat4 u_matrix;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = u_matrix * a_position;
}
`;
export const fragment_shader_solid_color_src = `   
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

uniform vec4 u_color;
// uniform vec4 u_color;

void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  gl_FragColor = u_color; // return redish-purple
}
`;
