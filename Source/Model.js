// The following function is used to create an "object" (called "model") containing all the informations needed
// to draw a particular element (sphere, cylinder, cube,...). 
// Note that the function "model.render" is defined inside "createModel" but it is NOT executed.
// That function is only executed when we call it explicitly in render().

function createModel(modelData, transform, color, texture) {

	var model = {};
	
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.textureBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    model.transform = transform;
    model.color = color;
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

        gl.uniformMatrix4fv(modelviewLoc, false, flatten(modelview));
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(this.transform.getNormalMatrix()));
        gl.uniformMatrix4fv(projectionLoc, false, flatten(camera.getProjectionMatrix()));
        gl.uniform4fv(gl.getUniformLocation(prog, "ambientProduct"), flatten(ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(prog, "diffuseProduct"), flatten(diffuseProduct));
        gl.uniform4fv(gl.getUniformLocation(prog, "specularProduct"), flatten(specularProduct));
        gl.uniform1f(gl.getUniformLocation(prog, "shininess"), this.color.shininess);

        if (this.texture != null) {
            gl.enableVertexAttribArray(texCoordLoc);    // we need texture coordinates 
            gl.uniform1i(renderingOptionLoc, 2);        // assign "2" to renderingOption in fragment shader (texture and Phong model)

            handleTextureIndex(this.texture.index);

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

    function handleTextureIndex(index) {
        switch (index) {
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
    }
	
    return model;
}

function createModelFromObjFile(ptr) {
	
	var i;
    var model = {};
	
	model.numberofelements = ptr.numberofelements;
	model.coordsBuffer = [];
	model.normalBuffer = [];
	model.textureBuffer = [];
	model.indexBuffer = [];
	model.count = [];
	model.Ka = [];
	model.Kd = [];
	model.Ks = [];
	model.Ns = [];
	model.textureFile = [];
	model.texId = [];

	
	for(i=0; i < ptr.numberofelements; i++){
	
		model.coordsBuffer.push( gl.createBuffer() );
		model.normalBuffer.push( gl.createBuffer() );
		model.textureBuffer.push( gl.createBuffer() );
		model.indexBuffer.push( gl.createBuffer() );
		model.count.push( ptr.list[i].indices.length );
	
		gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, ptr.list[i].vertexPositions, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, ptr.list[i].vertexNormals, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, ptr.list[i].vertexTextureCoords, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer[i]);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ptr.list[i].indices, gl.STATIC_DRAW);
		
		model.Ka.push(ptr.list[i].material.Ka);
		model.Kd.push(ptr.list[i].material.Kd);
		model.Ks.push(ptr.list[i].material.Ks);
		model.Ns.push(ptr.list[i].material.Ns);  // shininess
		
		// if a texture file has been defined for this element
		if(ptr.list[i].material.map != ""){
			
			// Check if the filename is present in the texture list
			var texindex = model.textureFile.indexOf(ptr.list[i].material.map);
			if( texindex > -1){ // texture file previously loaded
				// store the texId of the previously loaded file
				model.texId.push(model.texId[texindex]);
			}
			else { // new texture file to load
				// store current texture counter (will be used when rendering the scene)
				model.texId.push(texcounter);
			
				// add a new image buffer to the texture list
				texturelist.push(gl.createTexture());
				if(texcounter < 70){
					texturelist[texcounter].image = new Image();
					
					if(texcounter == 0){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,0)
						}
					}
					else if(texcounter == 1){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,1)
						}
					}
					else if(texcounter == 2){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,2)
						}
					}
					else if(texcounter == 3){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,3)
						}
					}
					else if(texcounter == 4){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,4)
						}
					}
					else if(texcounter == 5){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,5)
						}
					}
					else if(texcounter == 6){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,6)
						}
					}
					else if(texcounter == 7){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,7)
						}
					}
					else if(texcounter == 8){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,8)
						}
					}
					else if(texcounter == 9){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,9)
						}
					}
					else if(texcounter == 10){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,10)
						}
					}
					else if(texcounter == 11){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,11)
						}
					}
					else if(texcounter == 12){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,12)
						}
					}
					else if(texcounter == 13){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,13)
						}
					}
					else if(texcounter == 14){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,14)
						}
					}
					else if(texcounter == 15){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,15)
						}
					}
					else if(texcounter == 16){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,16)
						}
					}
					else if(texcounter == 17){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,17)
						}
					}
					else if(texcounter == 18){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,18)
						}
					}
					else if(texcounter == 19){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,19)
						}
					}
					else if(texcounter == 20){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,20)
						}
					}
					else if(texcounter == 21){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,21)
						}
					}
					else if(texcounter == 22){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,22)
						}
					}
					else if(texcounter == 23){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,23)
						}
					}
					else if(texcounter == 24){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,24)
						}
					}
					else if(texcounter == 25){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,25)
						}
					}
					else if(texcounter == 26){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,26)
						}
					}
					else if(texcounter == 27){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,27)
						}
					}
					else if(texcounter == 28){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,28)
						}
					}
					else if(texcounter == 29){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,29)
						}
					}
					else if(texcounter == 30){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,30)
						}
					}
					else if(texcounter == 31){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,31)
						}
					}
					else if(texcounter == 32){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,32)
						}
					}
					else if(texcounter == 33){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,33)
						}
					}
					else if(texcounter == 34){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,34)
						}
					}
					else if(texcounter == 35){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,35)
						}
					}
					else if(texcounter == 36){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,36)
						}
					}
					else if(texcounter == 37){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,37)
						}
					}
					else if(texcounter == 38){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,38)
						}
					}
					else if(texcounter == 39){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,39)
						}
					}
					else if(texcounter == 40){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,40)
						}
					}
					else if(texcounter == 41){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,41)
						}
					}
					else if(texcounter == 42){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,42)
						}
					}
					else if(texcounter == 43){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,43)
						}
					}
					else if(texcounter == 44){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,44)
						}
					}
					else if(texcounter == 45){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,45)
						}
					}
					else if(texcounter == 46){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,46)
						}
					}
					else if(texcounter == 47){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,47)
						}
					}
					else if(texcounter == 48){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,48)
						}
					}
					else if(texcounter == 49){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,49)
						}
					}
					else if(texcounter == 50){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,50)
						}
					}
					else if(texcounter == 51){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,51)
						}
					}
					else if(texcounter == 52){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,52)
						}
					}
					else if(texcounter == 53){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,53)
						}
					}
					else if(texcounter == 54){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,54)
						}
					}
					else if(texcounter == 55){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,55)
						}
					}
					else if(texcounter == 56){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,56)
						}
					}
					else if(texcounter == 57){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,57)
						}
					}
					else if(texcounter == 58){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,58)
						}
					}
					else if(texcounter == 59){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,59)
						}
					}
					else if(texcounter == 60){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,60)
						}
					}
					else if(texcounter == 61){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,61)
						}
					}
					else if(texcounter == 62){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,62)
						}
					}
					else if(texcounter == 63){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,63)
						}
					}
					else if(texcounter == 64){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,64)
						}
					}
					else if(texcounter == 65){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,65)
						}
					}
					else if(texcounter == 66){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,66)
						}
					}
					else if(texcounter == 67){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,67)
						}
					}
					else if(texcounter == 68){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,68)
						}
					}
					else if(texcounter == 69){  // associate a FIXED callback function to each texture Id
						texturelist[texcounter].image.onload = function () {
							handleLoadedTextureFromObjFile(texturelist,69)
						}
					}
					
					if(texcounter < 70){
						texturelist[texcounter].image.src = ptr.list[i].material.map;
						ntextures_tobeloaded++;					
					}

					// increment counter
					texcounter ++;
				} // if(texcounter<70)
			} // else				
		} // if(ptr.list[i].material.map != ""){
		else { // if there is no texture file associated to this element
			// store a null value (it will NOT be used when rendering the scene)
			model.texId.push(null);
		}
			
		// store the filename for every element even if it is empty ("")
		model.textureFile.push(ptr.list[i].material.map);		
		
	} // for(i=0; i < ptr.numberofelements; i++){
	
	model.render = function () {
		for(i=0; i < this.numberofelements; i++){
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer[i]);
			gl.vertexAttribPointer(CoordsLoc, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer[i]);
			gl.vertexAttribPointer(NormalLoc, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer[i]);
			gl.vertexAttribPointer(TexCoordLoc, 2, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer[i]);

			gl.uniformMatrix4fv(ModelviewLoc, false, flatten(modelview));    //--- load flattened modelview matrix
			gl.uniformMatrix3fv(NormalMatrixLoc, false, flatten(normalMatrix));  //--- load flattened normal matrix

			ambientProduct = mult(lightAmbient, vec4(this.Ka[i],1.0));
			diffuseProduct = mult(lightDiffuse, vec4(this.Kd[i],1.0));
			specularProduct = mult(lightSpecular, vec4(this.Ks[i],1.0));
			materialShininess = this.Ns[i];

			gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
			gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
			gl.uniform4fv(specularProductLoc, flatten(specularProduct));
			gl.uniform1f(shininessLoc, materialShininess);

			if(this.textureFile[i] != ""){
				gl.enableVertexAttribArray(TexCoordLoc);				
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texturelist[model.texId[i]]);
			
				// Send texture number to sampler
				gl.uniform1i(textureLoc, 0);
				
				// assign "2" to renderingoption in fragment shader
				gl.uniform1i(renderingoptionLoc, 2);
			}
			else{
				gl.disableVertexAttribArray(TexCoordLoc);
				// assign "0" to renderingoption in fragment shader
				gl.uniform1i(renderingoptionLoc, 0);				
			}
			
			gl.drawElements(gl.TRIANGLES, this.count[i], gl.UNSIGNED_SHORT, 0);
		}
	}
	
    return model;
}

function handleLoadedTextureFromObjFile(texturelist,Id) {
    gl.bindTexture(gl.TEXTURE_2D, texturelist[Id]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texturelist[Id].image);
	gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );

	ntextures_loaded++;
    render();  // Call render function when the image has been loaded (to insure the model is displayed)

    gl.bindTexture(gl.TEXTURE_2D, null);
}