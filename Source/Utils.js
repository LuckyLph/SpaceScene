function createTransform(coords, rotation, scale){
    var transform = {};
    transform.coords = coords;
    transform.rotation = rotation;
    transform.scale = scale;

    transform.getModelMatrix = function () {
        var modelMatrix = createIdentityMatrix();
        modelMatrix = mult(modelMatrix, translate(this.coords));
        modelMatrix = mult(modelMatrix, rotate(this.rotation[0], 1, 0, 0));
        modelMatrix = mult(modelMatrix, rotate(this.rotation[1], 0, 1, 0));
        modelMatrix = mult(modelMatrix, rotate(this.rotation[2], 0, 0, 1));
        modelMatrix = mult(modelMatrix, scaleMatrix(this.scale));
        return modelMatrix;
    }

    transform.getNormalMatrix = function () {
        var modelMatrix = createIdentityMatrix();
        modelMatrix = mult(modelMatrix, translate(this.coords));
        modelMatrix = mult(modelMatrix, rotate(this.rotation[0], 1, 0, 0));
        modelMatrix = mult(modelMatrix, rotate(this.rotation[1], 0, 1, 0));
        modelMatrix = mult(modelMatrix, rotate(this.rotation[2], 0, 0, 1));
        return extractNormalMatrix(modelMatrix);  // extracted normal matrix before scaling is applied
    }

    return transform;
}

function createColor(ambient, diffuse, specular, shininess){
    var color = {}
    color.ambient = ambient;
    color.diffuse = diffuse;
    color.specular = specular;
    color.shininess = shininess;

    return color;
}

function createTexture(textureData, index) {
    var texture = {};
    texture.data = textureData;
    texture.index = index;

    return texture;
}

function createTextureMap(textureData, images, index) {
    var textureMap = {};
    textureMap.textureData = textureData;
    textureMap.images = images;
    textureMap.index = index;

    return textureMap;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    var vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vertexShaderSource);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
    }
    var fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}

function loadTexture(currentIndex, path, name, isLastTexture = false) {
    var textureData = gl.createTexture();
    textureData.image = new Image();
    if (isLastTexture)
        textureData.image.onload = initLoop;
    textureData.image.src = path;
    textures[name] = createTexture(textureData, currentIndex);
    return ++currentIndex;
}

function loadTextureMap(currentIndex, paths, name, isLastTexture = false) {
    var textureData = gl.createTexture();
    var images = [];

    for (var i = 0; i < 6; i++) {
        images[i] = new Image();
        if (i == 5 && isLastTexture)
            images[i].onload = initLoop;
        images[i].src = paths[i];
    }
    textureMaps[name] = createTextureMap(textureData, images, currentIndex);
    return ++currentIndex;
}

function initLoop() {
    window.requestAnimFrame(update);
}

function handleCanvasClick() {
    canvas.requestPointerLock();
}

function lockChangeAlert() {
    if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
        document.addEventListener("mousemove", updateMousePosition, false);
    }
    else {
        document.removeEventListener("mousemove", updateMousePosition, false);
    }
}

function getTextContent(elementID) {
    var element = document.getElementById(elementID);
    var node = element.firstChild;
    var str = "";
    while (node) {
        if (node.nodeType == 3) // this is a text node
            str += node.textContent;
        node = node.nextSibling;
    }
    return str;
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    }
    while (currentDate - date < milliseconds);
}

function onresize() {  
    actualPanelWidth = Math.floor(window.innerWidth);
    actualPanelHeight = Math.floor(window.innerHeight);
      
    canvas.width  = actualPanelWidth;
    canvas.height = actualPanelHeight;
    
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function getMousePosition(e) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return vec2(x, y);
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleMouseScroll(event) {
    camera.handleZoom(event.deltaY);
}

function updateMousePosition(e) {
    var currentMousePosition = vec2();
    currentMousePosition[0] = lastMousePosition[0] + e.movementX;
    currentMousePosition[1] = lastMousePosition[1] + e.movementY;

    var xoffset = currentMousePosition[0] - lastMousePosition[0];
    var yoffset = lastMousePosition[1] - currentMousePosition[1];
    camera.handleRotation(xoffset, yoffset);

    currentMousePosition[0] = Math.min(currentMousePosition[0], actualPanelWidth);
    currentMousePosition[0] = Math.max(currentMousePosition[0], 0);
    currentMousePosition[1] = Math.min(currentMousePosition[1], actualPanelHeight);
    currentMousePosition[1] = Math.max(currentMousePosition[1], 0);
    lastMousePosition = currentMousePosition;
}

//#region Math
function createIdentityMatrix() {
    return mat4(vec4(1, 0, 0, 0), vec4(0, 1, 0, 0), vec4(0, 0, 1, 0), vec4(0, 0, 0, 1));
}

function degreeToRadian(degrees) {
    return degrees * Math.PI / 180;
}

function scaleVec3(a, b) {
    var out = [];
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
  
    return out; 
}

function unflatten(matrix) {
    var result = mat4();
    result[0][0] = matrix[0]; result[1][0] = matrix[1]; result[2][0] = matrix[2]; result[3][0] = matrix[3];
    result[0][1] = matrix[4]; result[1][1] = matrix[5]; result[2][1] = matrix[6]; result[3][1] = matrix[7];
    result[0][2] = matrix[8]; result[1][2] = matrix[9]; result[2][2] = matrix[10]; result[3][2] = matrix[11];
    result[0][3] = matrix[12]; result[1][3] = matrix[13]; result[2][3] = matrix[14]; result[3][3] = matrix[15];

    return result;
}

// This function computes the transpose of the inverse of the upperleft part (3X3) of the modelview matrix
function extractNormalMatrix(matrix) { 
    var result = mat3();
    var upperleft = mat3();
    var tmp = mat3();

    upperleft[0][0] = matrix[0][0];  // if no scaling is performed, one can simply use the upper left
    upperleft[1][0] = matrix[1][0];  // part (3X3) of the modelview matrix
    upperleft[2][0] = matrix[2][0];

    upperleft[0][1] = matrix[0][1];
    upperleft[1][1] = matrix[1][1];
    upperleft[2][1] = matrix[2][1];

    upperleft[0][2] = matrix[0][2];
    upperleft[1][2] = matrix[1][2];
    upperleft[2][2] = matrix[2][2];

    tmp = matrixinvert(upperleft);
    result = transpose(tmp);

    return result;
}

function matrixinvert(matrix) {
    var result = mat3();

    var det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) -
              matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
              matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);

    var invdet = 1 / det;

    // inverse of matrix m
    result[0][0] = (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) * invdet;
    result[0][1] = (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) * invdet;
    result[0][2] = (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invdet;
    result[1][0] = (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) * invdet;
    result[1][1] = (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invdet;
    result[1][2] = (matrix[1][0] * matrix[0][2] - matrix[0][0] * matrix[1][2]) * invdet;
    result[2][0] = (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]) * invdet;
    result[2][1] = (matrix[2][0] * matrix[0][1] - matrix[0][0] * matrix[2][1]) * invdet;
    result[2][2] = (matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1]) * invdet;

    return result;
}
//#endregion