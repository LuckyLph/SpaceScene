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
        var modelview = mult(camera.getViewMatrix(), this.transform.getModelMatrix());

        gl.enableVertexAttribArray(coordsLoc);
        gl.enableVertexAttribArray(normalLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(coordsLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniformMatrix4fv(modelviewLoc, false, flatten(modelview));    //--- load flattened modelview matrix
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(this.transform.getNormalMatrix()));  //--- load flattened normal matrix
        gl.uniformMatrix4fv(projectionLoc, false, flatten(camera.getProjectionMatrix()));
        gl.uniform4fv(gl.getUniformLocation(prog, "ambientProduct"), flatten(ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(prog, "diffuseProduct"), flatten(diffuseProduct));
        gl.uniform4fv(gl.getUniformLocation(prog, "specularProduct"), flatten(specularProduct));
        gl.uniform1f(gl.getUniformLocation(prog, "shininess"), this.color.shininess);

        if (this.texture != null) {
            gl.enableVertexAttribArray(texCoordLoc);    // we need texture coordinates 
            gl.uniform1i(renderingOptionLoc, 2);        // assign "2" to renderingOption in fragment shader (texture and Phong model)

            switch (this.texture.index) {
                case 0:
                    gl.activeTexture(gl.TEXTURE0);
                    gl.uniform1i(textureIndexLoc, 0);
                    break;
                case 1:
                    gl.activeTexture(gl.TEXTURE1);
                    gl.uniform1i(textureIndexLoc, 1);
                    break;
                case 2:
                    gl.activeTexture(gl.TEXTURE2);
                    gl.uniform1i(textureIndexLoc, 2);
                    break;
                case 3:
                    gl.activeTexture(gl.TEXTURE3);
                    gl.uniform1i(textureIndexLoc, 3);
                    break;
                case 4:
                    gl.activeTexture(gl.TEXTURE4);
                    gl.uniform1i(textureIndexLoc, 4);
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
            gl.disableVertexAttribArray(texCoordLoc);           // we do not need texture coordinates
            gl.uniform1i(renderingOptionLoc, 0);                // assign "0" to renderingOption in fragment shader (no texture, only Phong model)
            gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        }
    }
	
	// we now return the "object".
    return model;
}