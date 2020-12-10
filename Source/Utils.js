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

function createTexture(textureData, textureIndex) {
    var texture = {};
    texture.data = textureData;
    texture.index = textureIndex;

    return texture;
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


function initTextures() {
    try {
        var textureData = gl.createTexture();
        textureData.image = new Image();
        textureData.image.src = "../Textures/basicTexture.jpg";
        textures["BasicTexture"] = createTexture(textureData, 0);

        textureData = gl.createTexture();
        textureData.image = new Image();
        textureData.image.src = "../Textures/CockpitMetal.jpg";
        textures["CockpitMetal"] = createTexture(textureData, 1);

        textureData = gl.createTexture();
        textureData.image = new Image();
        textureData.image.src = "../Textures/blackTexture.jpg";
        textures["BlackTexture"] = createTexture(textureData, 2);

        textureData = gl.createTexture();
        textureData.image = new Image();
        textureData.image.src = "../Textures/blackTexture2.jpg";
        textures["BlackTexture2"] = createTexture(textureData, 3);

        textureData = gl.createTexture();
        textureData.image = new Image();
        textureData.image.onload = function() {
            handleLoadedTextures();
        }
        textureData.image.src = "../Textures/TextureRouge.jpg";
        textures["RedTexture"] = createTexture(textureData, 4);

        return true;
    }
    catch (e) {
        return false;
    }
}

function initColors() {
    //Emissive colors
    colors["Black"] = createColor(vec4(0.1176, 0.1176, 0.1176, 1.0), vec4(0, 0, 0, 1.0), vec4(0, 0, 0, 1.0), 100);

    //Normal colors(with textures)
    colors["Blue"] = createColor(vec4(0.0, 0.1, 0.3, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    colors["Grey"] = createColor(vec4(0.53, 0.48, 0.46, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    colors["SlightlyGrey"] = createColor(vec4(0.1725, 0.1418, 0.1725, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    colors["LightGrey"] = createColor(vec4(0.3608, 0.3294, 0.3608, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    colors["DarkGrey"] = createColor(vec4(0.3608, 0.3294, 0.3608, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    colors["VeryDarkGrey"] = createColor(vec4(0.1725, 0.1725, 0.1725, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    colors["TextureGrey"] = createColor(vec4(0.4, 0.4, 0.4, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
}


function getTextContent(elementID) {
    var element = document.getElementById(elementID);
    var fsource = "";
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
    } while (currentDate - date < milliseconds);
}

function onresize() {  // ref. https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
    var realToCSSPixels = window.devicePixelRatio;
  
    var actualPanelWidth = Math.floor(window.innerWidth * 0.85);  // note that right panel is 85% of window width 
    var actualPanelHeight = Math.floor(window.innerHeight - 30);
    
    var minDimension = Math.min(actualPanelWidth, actualPanelHeight);
      
     // Ajust the canvas to this dimension (square)
      canvas.width  = minDimension;
      canvas.height = minDimension;
      
      gl.viewport(0, 0, canvas.width, canvas.height);
  
  }

  function unflatten(matrix) {
    var result = mat4();
    result[0][0] = matrix[0]; result[1][0] = matrix[1]; result[2][0] = matrix[2]; result[3][0] = matrix[3];
    result[0][1] = matrix[4]; result[1][1] = matrix[5]; result[2][1] = matrix[6]; result[3][1] = matrix[7];
    result[0][2] = matrix[8]; result[1][2] = matrix[9]; result[2][2] = matrix[10]; result[3][2] = matrix[11];
    result[0][3] = matrix[12]; result[1][3] = matrix[13]; result[2][3] = matrix[14]; result[3][3] = matrix[15];

    return result;
}

function extractNormalMatrix(matrix) { // This function computes the transpose of the inverse of 
    // the upperleft part (3X3) of the modelview matrix (see http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ )

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

function createIdentityMatrix() {
    return mat4(vec4(1, 0, 0, 0), vec4(0, 1, 0, 0), vec4(0, 0, 1, 0), vec4(0, 0, 0, 1));
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function scaleVec3(a, b) {
    var out = [];
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
  
    return out; 
}

function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return vec2(x, y);
}