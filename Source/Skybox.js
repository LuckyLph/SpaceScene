function createSkybox(modelData, transform, textureMap) {
    gl.useProgram(progSkybox);

    var skybox = {};
    skybox.coordsBuffer = gl.createBuffer();
    skybox.indexBuffer = gl.createBuffer();
    skybox.count = modelData.indices.length;
    skybox.transform = transform;
    skybox.textureMap = textureMap;

    gl.bindBuffer(gl.ARRAY_BUFFER, skybox.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skybox.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);


    skybox.render = function () {
        gl.useProgram(progSkybox);
        gl.enableVertexAttribArray(skyboxVcoordsLoc);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureMap.textureData);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        var targets = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        for (var i = 0; i < 6; i++) {
            gl.texImage2D(targets[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureMap.images[i]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        var modelview = mult(camera.getViewMatrix(), this.transform.getModelMatrix());
        gl.uniformMatrix4fv(skyboxModelviewLoc, false, flatten(modelview));
        gl.uniformMatrix4fv(skyboxProjectionLoc, false, flatten(camera.getProjectionMatrix()));

        handleTextureIndex(textureMap.index);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(skyboxVcoordsLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        gl.useProgram(prog);
    }

    skybox.update = function () {
        this.transform.coords = camera.position;
    }

    function handleTextureIndex(index) {
        switch (index) {
            case 0:
                gl.activeTexture(gl.TEXTURE0);
                gl.uniform1i(textureBoxLoc, index);
                break;
        }
    }

    gl.useProgram(prog);
    return skybox;
}