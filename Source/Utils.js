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

// The following function is used to create an "object" (called "model") containing all the informations needed
// to draw a particular element (sphere, cylinder, cube,...). 
// Note that the function "model.render" is defined inside "createModel" but it is NOT executed.
// That function is only executed when we call it explicitly in render().

function createModel(modelData, transform, color, texture) {

	// the next line defines an "object" in Javascript
	// (note that there are several ways to define an "object" in Javascript)
	var model = {};
	
	// the following lines defines "members" of the "object"
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.textureBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    model.transform = transform;
    model.color = color;
    model.texture = texture;

	// the "members" are then used to load data from "modelData" in the graphic card
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTextureCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

	// The following function is NOT executed here. It is only DEFINED to be used later when we
	// call the ".render()" method.
    model.render = function () {
        var ambientProduct = mult(lightAmbient, this.color.ambient);
        var diffuseProduct = mult(lightDiffuse, this.color.diffuse);
        var specularProduct = mult(lightSpecular, this.color.specular);

        if (this.texture != null) {
            gl.useProgram(textureProg);
            
            gl.enableVertexAttribArray(textureCoordsLoc);
            gl.enableVertexAttribArray(textureNormalLoc);
            gl.enableVertexAttribArray(textureTexCoordLoc);  // we need texture coordinates

            gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
            gl.vertexAttribPointer(textureCoordsLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(textureNormalLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
            gl.vertexAttribPointer(textureTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            gl.uniformMatrix4fv(textureModelviewLoc, false, flatten(modelview));    //--- load flattened modelview matrix
            gl.uniformMatrix3fv(textureNormalMatrixLoc, false, flatten(normalMatrix));  //--- load flattened normal matrix
            gl.uniform4fv(gl.getUniformLocation(textureProg, "ambientProduct"), flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(textureProg, "diffuseProduct"), flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(textureProg, "specularProduct"), flatten(specularProduct));
            gl.uniform1f(gl.getUniformLocation(textureProg, "shininess"), this.color.shininess);

            switch (this.texture.index) {
                case 0:
                    gl.activeTexture(gl.TEXTURE0);
                    gl.uniform1i(textureLoc, 0);
                    break;
                case 1:
                    gl.activeTexture(gl.TEXTURE1);
                    gl.uniform1i(textureLoc, 1);
                    break;
                case 2:
                    gl.activeTexture(gl.TEXTURE2);
                    gl.uniform1i(textureLoc, 2);
                    break;
                case 3:
                    gl.activeTexture(gl.TEXTURE3);
                    gl.uniform1i(textureLoc, 3);
                    break;
                case 4:
                    gl.activeTexture(gl.TEXTURE4);
                    gl.uniform1i(textureLoc, 4);
                    break;
            }

            gl.bindTexture(gl.TEXTURE_2D, this.texture.data);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.data.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);  
            
            gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        else {
            gl.useProgram(noTextureProg);

            gl.enableVertexAttribArray(noTextureCoordsLoc);
            gl.enableVertexAttribArray(noTextureNormalLoc);
            gl.disableVertexAttribArray(noTextureTexCoordLoc);  // we do not need texture coordinates

            gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
            gl.vertexAttribPointer(noTextureCoordsLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(noTextureNormalLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
            gl.vertexAttribPointer(textureTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            gl.uniformMatrix4fv(noTextureModelviewLoc, false, flatten(modelview));    //--- load flattened modelview matrix
            gl.uniformMatrix3fv(noTextureNormalMatrixLoc, false, flatten(normalMatrix));  //--- load flattened normal matrix

            gl.uniform4fv(gl.getUniformLocation(noTextureProg, "ambientProduct"), flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(noTextureProg, "diffuseProduct"), flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(noTextureProg, "specularProduct"), flatten(specularProduct));
            gl.uniform1f(gl.getUniformLocation(noTextureProg, "shininess"), this.color.shininess);
            gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        }
    }
	
	// we now return the "object".
    return model;
}

function createTransform(coords, rotation, scale){
    var transform = {};
    transform.coords = coords;
    transform.rotation = rotation;
    transform.scale = scale;

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