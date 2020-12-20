function createModel(modelData, transform, material, texture) {

	var model = {};
	
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.textureBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    model.transform = transform;
    model.material = material;
    model.texture = texture;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTextureCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

    model.render = function () {
        var ambientProduct = mult(lightAmbient, this.material.ambient);
        var diffuseProduct = mult(lightDiffuse, this.material.diffuse);
        var specularProduct = mult(lightSpecular, this.material.specular);
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

        gl.uniformMatrix4fv(modelviewLoc, false, flatten(modelview));
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(this.transform.getNormalMatrix()));
        gl.uniformMatrix4fv(projectionLoc, false, flatten(camera.getProjectionMatrix()));
        gl.uniform4fv(gl.getUniformLocation(prog, "ambientProduct"), flatten(ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(prog, "diffuseProduct"), flatten(diffuseProduct));
        gl.uniform4fv(gl.getUniformLocation(prog, "specularProduct"), flatten(specularProduct));
        gl.uniform1f(gl.getUniformLocation(prog, "shininess"), this.material.shininess);

        if (this.texture != null) {
            gl.enableVertexAttribArray(texCoordLoc);    // we need texture coordinates 
            gl.uniform1i(renderingOptionLoc, 2);        // assign "2" to renderingOption in fragment shader (texture and Phong model)

            gl.uniform1i(textureIndexLoc, this.texture.index);
            gl.activeTexture(this.texture.glindex);

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
	
    return model;
}

function createModelFromObjFile(ptr, transform) {	
    var i = 0;
    var j = 0;
    var model = {};
	
	model.numberofelements = ptr.numberofelements;
	model.coordsBuffer = [];
	model.normalBuffer = [];
	model.textureBuffer = [];
	model.indexBuffer = [];
	model.count = [];
    model.materials = [];
    model.textures = [];
    model.transform = transform;
	
	for(i=0; i < ptr.numberofelements; i++){
	
		model.coordsBuffer.push(gl.createBuffer());
		model.normalBuffer.push(gl.createBuffer());
		model.textureBuffer.push(gl.createBuffer());
		model.indexBuffer.push(gl.createBuffer());
		model.count.push(ptr.list[i].indices.length);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, ptr.list[i].vertexPositions, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, ptr.list[i].vertexNormals, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, ptr.list[i].vertexTextureCoords, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer[i]);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ptr.list[i].indices, gl.STATIC_DRAW);
        
        var ambient = vec4(ptr.list[i].material.Ka, 1);
        var diffuse = vec4(ptr.list[i].material.Kd, 1);
        var specular = vec4(ptr.list[i].material.Ks, 1);
        model.materials.push(createMaterial(ambient, diffuse, specular, ptr.list[i].material.Ns))
		
		if(ptr.list[i].material.map != "") {
            var textureData = gl.createTexture();
            textureData.image = new Image();
            bufferedTextures[j] = createTexture(textureData, 0, ptr.list[i].material.map);
            model.textures[i] = bufferedTextures[j];
            j++;
        }
        else {
            model.textures[i] = null;
        }
    }
    
    model.render = function () {
		for (i = 0; i < this.numberofelements; i++){
            var ambientProduct = mult(lightAmbient, this.materials[i].ambient);
            var diffuseProduct = mult(lightDiffuse, this.materials[i].diffuse);
            var specularProduct = mult(lightSpecular, this.materials[i].specular);
            var modelview = mult(camera.getViewMatrix(), this.transform.getModelMatrix());

			gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer[i]);
			gl.vertexAttribPointer(coordsLoc, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer[i]);
			gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer[i]);
			gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer[i]);

			gl.uniformMatrix4fv(modelviewLoc, false, flatten(modelview));
            gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(this.transform.getNormalMatrix()));
            gl.uniformMatrix4fv(projectionLoc, false, flatten(camera.getProjectionMatrix()));
			gl.uniform4fv(gl.getUniformLocation(prog, "ambientProduct"), flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(prog, "diffuseProduct"), flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(prog, "specularProduct"), flatten(specularProduct));
            gl.uniform1f(gl.getUniformLocation(prog, "shininess"), this.materials[i].shininess);

			if (this.textures[i] != null) {
				gl.enableVertexAttribArray(texCoordLoc);    // we need texture coordinates 
                gl.uniform1i(renderingOptionLoc, 2);        // assign "2" to renderingOption in fragment shader (texture and Phong model)

                gl.uniform1i(textureIndexLoc, this.textures[i].index);
                gl.activeTexture(this.textures[i].glindex);

                gl.bindTexture(gl.TEXTURE_2D, this.textures[i].data);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textures[i].data.image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                
                gl.drawElements(gl.TRIANGLES, this.count[i], gl.UNSIGNED_SHORT, 0);
                gl.bindTexture(gl.TEXTURE_2D, null);
			}
			else {
				gl.disableVertexAttribArray(texCoordLoc);           // we do not need texture coordinates
                gl.uniform1i(renderingOptionLoc, 0);                // assign "0" to renderingOption in fragment shader (no texture, only Phong model)
                gl.drawElements(gl.TRIANGLES, this.count[i], gl.UNSIGNED_SHORT, 0);		
			}
		}
	}
	
    return model;
}