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

function createMaterial(ambient, diffuse, specular, shininess){
    var material = {}
    material.ambient = ambient;
    material.diffuse = diffuse;
    material.specular = specular;
    material.shininess = shininess;

    return material;
}

function createTexture(textureData, index = 0, path = "") {
    var texture = {};
    texture.data = textureData;
    texture.index = index;
    texture.glindex = getGlTextureIndex(index);
    texture.path = path;

    return texture;
}

function createTextureMap(textureData, images, index) {
    var textureMap = {};
    textureMap.textureData = textureData;
    textureMap.images = images;
    textureMap.index = index;
    textureMap.glindex = getGlTextureIndex(index);

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

function colorCube() {
    var pointsArray = [];
    var colorsArray = [];
    var texCoordsArray = [];
    var numVertices = 36

    quad(1, 0, 3, 2, pointsArray, colorsArray, texCoordsArray);
    quad(2, 3, 7, 6, pointsArray, colorsArray, texCoordsArray);
    quad(3, 0, 4, 7, pointsArray, colorsArray, texCoordsArray);
    quad(6, 5, 1, 2, pointsArray, colorsArray, texCoordsArray);
    quad(4, 5, 6, 7, pointsArray, colorsArray, texCoordsArray);
    quad(5, 4, 0, 1, pointsArray, colorsArray, texCoordsArray);

    return {
        pointsArray: new Float32Array(pointsArray),
        colorsArray: new Float32Array(colorsArray),
        texCoordsArray: new Float32Array(texCoordsArray),
        numVertices: numVertices
     }
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

function loadBufferedTexture(currentIndex, texture, isLastTexture = false) {
    if (isLastTexture) {
        texture.data.image.onload = initLoop;
    }
    texture.data.image.src = texture.path;
    texture.index = currentIndex;
    texture.glindex = getGlTextureIndex(currentIndex);
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

//#region glIndex

function getGlTextureIndex (index) {
    switch (index) {
        case 0:
            return gl.TEXTURE0;
        case 1:
            return gl.TEXTURE1;
        case 2:
            return gl.TEXTURE2;
        case 3:
            return gl.TEXTURE3;
        case 4:
            return gl.TEXTURE4;
        case 5:
            return gl.TEXTURE5;
        case 6:
            return gl.TEXTURE6;
        case 7:
            return gl.TEXTURE7;
        case 8:
            return gl.TEXTURE8;
        case 9:
            return gl.TEXTURE9;
        case 10:
            return gl.TEXTURE10;
        case 11:
            return gl.TEXTURE11;
        case 12:
            return gl.TEXTURE12;
        case 13:
            return gl.TEXTURE13;
        case 14:
            return gl.TEXTURE14;
        case 15:
            return gl.TEXTURE15;
        case 16:
            return gl.TEXTURE16;
        case 17:
            return gl.TEXTURE17;
        case 18:
            return gl.TEXTURE18;
        case 19:
            return gl.TEXTURE19;
        case 20:
            return gl.TEXTURE20;
        case 21:
            return gl.TEXTURE21;
        case 22:
            return gl.TEXTURE22;
        case 23:
            return gl.TEXTURE23;
        case 24:
            return gl.TEXTURE24;
        case 25:
            return gl.TEXTURE25;
        case 26:
            return gl.TEXTURE26;
        case 27:
            return gl.TEXTURE27;
        case 28:
            return gl.TEXTURE28;
        case 29:
            return gl.TEXTURE29;
        case 30:
            return gl.TEXTURE30;
        case 31:
            return gl.TEXTURE31;
        case 32:
            return gl.TEXTURE32;
        case 33:
            return gl.TEXTURE33;
        case 34:
            return gl.TEXTURE34;
        case 35:
            return gl.TEXTURE35;
        case 36:
            return gl.TEXTURE36;
        case 37:
            return gl.TEXTURE37;
        case 38:
            return gl.TEXTURE38;
        case 39:
            return gl.TEXTURE39;
        case 40:
            return gl.TEXTURE40;
        case 41:
            return gl.TEXTURE41;
        case 42:
            return gl.TEXTURE42;
        case 43:
            return gl.TEXTURE43;
        case 44:
            return gl.TEXTURE44;
        case 45:
            return gl.TEXTURE45;
        case 46:
            return gl.TEXTURE46;
        case 47:
            return gl.TEXTURE47;
        case 48:
            return gl.TEXTURE48;
        case 49:
            return gl.TEXTURE49;
        case 50:
            return gl.TEXTURE50;
        case 51:
            return gl.TEXTURE51;
        case 52:
            return gl.TEXTURE52;
        case 53:
            return gl.TEXTURE53;
        case 54:
            return gl.TEXTURE54;
        case 55:
            return gl.TEXTURE55;
        case 56:
            return gl.TEXTURE56;
        case 57:
            return gl.TEXTURE57;
        case 58:
            return gl.TEXTURE58;
        case 59:
            return gl.TEXTURE59;
        case 60:
            return gl.TEXTURE60;
        case 61:
            return gl.TEXTURE61;
        case 62:
            return gl.TEXTURE62;
        case 63:
            return gl.TEXTURE63;
        case 64:
            return gl.TEXTURE64;
        case 65:
            return gl.TEXTURE65;
        case 66:
            return gl.TEXTURE66;
        case 67:
            return gl.TEXTURE67;
        case 68:
            return gl.TEXTURE68;
        case 69:
            return gl.TEXTURE69;
        case 70:
            return gl.TEXTURE70;
    }
}

//#endregion