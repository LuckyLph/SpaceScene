var cubeTexCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var cubeVertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var cubeVertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // white
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

function quad(a, b, c, d, pointsArray, colorsArray, texCoordsArray) {
    pointsArray.push(cubeVertices[a]);
    colorsArray.push(cubeVertexColors[a]);
    texCoordsArray.push(cubeTexCoord[1]);

    pointsArray.push(cubeVertices[b]);
    colorsArray.push(cubeVertexColors[a]);
    texCoordsArray.push(cubeTexCoord[0]);

    pointsArray.push(cubeVertices[c]);
    colorsArray.push(cubeVertexColors[a]);
    texCoordsArray.push(cubeTexCoord[3]);

    pointsArray.push(cubeVertices[a]);
    colorsArray.push(cubeVertexColors[a]);
    texCoordsArray.push(cubeTexCoord[1]);

    pointsArray.push(cubeVertices[c]);
    colorsArray.push(cubeVertexColors[a]);
    texCoordsArray.push(cubeTexCoord[3]);

    pointsArray.push(cubeVertices[d]);
    colorsArray.push(cubeVertexColors[a]);
    texCoordsArray.push(cubeTexCoord[2]);
}

function createTranslucidCube(cubeData, transform, texture) {
	var cube = {};
	
    cube.cBuffer = gl.createBuffer();
    cube.vBuffer = gl.createBuffer();
    cube.tBuffer = gl.createBuffer();
    cube.numVertices = cubeData.numVertices;
    cube.transform = transform;
    cube.texture = texture;

    gl.bindBuffer(gl.ARRAY_BUFFER, cube.cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeData.colorsArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeData.pointsArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeData.texCoordsArray, gl.STATIC_DRAW);

    cube.render = function () {
        gl.useProgram(progCube);
        gl.enableVertexAttribArray(cubeVColorLoc);
        gl.enableVertexAttribArray(cubeVPositionLoc);
        gl.enableVertexAttribArray(cubeVTexCoordLoc);

        var modelview = mult(camera.getViewMatrix(), this.transform.getModelMatrix());
        gl.uniformMatrix4fv(cubeModelViewLoc, false, flatten(modelview));
        gl.uniformMatrix4fv(cubeProjectionLoc, false, flatten(camera.getProjectionMatrix()));
        gl.uniform1f(cubeAlphaLoc, 0.5);
   
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.depthMask(false);

        gl.uniform1i(cubeTextureLoc, this.texture.index);
        gl.activeTexture(this.texture.glindex);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.data);

        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
        gl.disable(gl.BLEND);
        gl.depthMask(true);  // ne pas oublier car on ne pourra pas effacer le tampon de profondeur lors de la prochaine itération
        gl.useProgram(prog);
    }
	
    return cube;
}