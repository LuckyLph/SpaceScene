window.onload = function init() {
    try {
        canvas = document.getElementById("glcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            gl = canvas.getContext("experimental-webgl");
        }
        if (!gl) {
            throw "Could not create WebGL context.";
        }

        projection = perspective(70.0, 1.0, 1.0, 200.0);

        // LOAD SHADER (standard texture mapping)
        var vertexShaderSource = getTextContent("vshader");
        var fragmentShaderSource = getTextContent("fshaderTexture");
        textureProg = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(textureProg);

        textureCoordsLoc = gl.getAttribLocation(textureProg, "vcoords");
        textureNormalLoc = gl.getAttribLocation(textureProg, "vnormal");
        textureTexCoordLoc = gl.getAttribLocation(textureProg, "vtexcoord");

        textureModelviewLoc = gl.getUniformLocation(textureProg, "modelview");
        textureProjectionLoc = gl.getUniformLocation(textureProg, "projection");
        textureNormalMatrixLoc = gl.getUniformLocation(textureProg, "normalMatrix");

        gl.uniform4fv(gl.getUniformLocation(textureProg, "lightPosition"), flatten(lightPosition));
		gl.uniformMatrix4fv(textureProjectionLoc, false, flatten(projection));
        textureLoc = gl.getUniformLocation(textureProg, "texture");

        // LOAD SHADER (no texture)
        vertexShaderSource = getTextContent("vshader");
        fragmentShaderSource = getTextContent("fshader");
        noTextureProg = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(noTextureProg);

        noTextureCoordsLoc = gl.getAttribLocation(noTextureProg, "vcoords");
        noTextureNormalLoc = gl.getAttribLocation(noTextureProg, "vnormal");
        noTextureTexCoordLoc = gl.getAttribLocation(noTextureProg, "vtexcoord");

        noTextureModelviewLoc = gl.getUniformLocation(noTextureProg, "modelview");
        noTextureProjectionLoc = gl.getUniformLocation(noTextureProg, "projection");
        noTextureNormalMatrixLoc = gl.getUniformLocation(noTextureProg, "normalMatrix");

        gl.uniform4fv(gl.getUniformLocation(noTextureProg, "lightPosition"), flatten(lightPosition));
		gl.uniformMatrix4fv(noTextureProjectionLoc, false, flatten(projection));

        gl.enable(gl.DEPTH_TEST);
        rotator = new SimpleRotator(canvas, render);
        rotator.setView([0, 0, 1], [0, 1, 0], 40);
        initColors();

        if (!initTextures()) {
            throw "Failed to load textures!";
        }
        createTieFighter();

        window.addEventListener("resize", onresize);
   	    onresize();  // size the canvas to the current window width and height

		document.onkeydown = function (e) {
			switch (e.key) {
				case 'Home':
					// resize the canvas to the current window width and height
					resize(canvas);
					break;
			}
		};

    }
    catch (e) {
        document.getElementById("message").innerHTML =
             "Could not initialize WebGL: " + e;
        return;
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //--- Get the rotation matrix obtained from the displacement of the mouse
    //---  (note: the matrix obtained is already "flattened" by the function getViewMatrix)
    flattenedmodelview = rotator.getViewMatrix();
    modelview = unflatten(flattenedmodelview);	
    var initialmodelview = modelview;

    for (var i = 0; i < models.length; i++)
    {
        modelview = initialmodelview;
        modelview = mult(modelview, translate(models[i].transform.coords));
        modelview = mult(modelview, rotate(models[i].transform.rotation[0], 1, 0, 0));
        modelview = mult(modelview, rotate(models[i].transform.rotation[1], 0, 1, 0));
        modelview = mult(modelview, rotate(models[i].transform.rotation[2], 0, 0, 1));
        normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
        modelview = mult(modelview, scale(models[i].transform.scale));
        models[i].render();
    }
}

function initTextures() {
    try {
        gl.useProgram(textureProg);

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
        textureData.image.src = "../Textures/blackTexture2.png";
        textures["BlackTexture2"] = createTexture(textureData, 3);

        textureData = gl.createTexture();
        textureData.image = new Image();
        textureData.image.onload = function() {
            render();
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

function createSphere(coords, rotation, scale, color, texture) {
    models.push(createModel(uvSphere(SphereRadius, SphereSlices, SphereStacks), createTransform(coords, rotation, scale), color, texture));
}

function createCylinder(coords, rotation, scale, noTop, noBottom, color, texture) {
    models.push(createModel(uvCylinder(CylinderRadius, CylinderHeight, CylinderSlices, noTop, noBottom), createTransform(coords, rotation, scale), color, texture));
}

function createRectangle(coords, rotation, scale, faceLength, color, texture) {
    models.push(createModel(cube(faceLength), createTransform(coords, rotation, scale), color, texture));
}

function createPrism(coords, rotation, scale, noTop, noBottom, color, texture) {
    models.push(createModel(uvCylinder(PrismRadius, PrismHeight, PrismSlices, noTop, noBottom), createTransform(coords, rotation, scale), color, texture));
}

function createTorus(coords, rotation, scale, color, texture) {
    models.push(createModel(uvTorus(TorusInnerRadius, TorusOuterRadius, TorusSlices, TorusStacks), createTransform(coords, rotation, scale), color, texture));
}

function createHemisphereInside(coords, rotation, scale, color, texture) {
    models.push(createModel(uvHemisphereInside(HemisphereInsideRadius, HemisphereInsideSlices, HemisphereInsideStacks), createTransform(coords, rotation, scale), color, texture));
}

function createHemisphereOutside(coords, rotation, scale, color, texture) {
    models.push(createModel(uvHemisphereOutside(HemisphereOutsideRadius, HemisphereOutsideSlices, HemisphereOutsideStacks), createTransform(coords, rotation, scale), color, texture));
}

function createTieFighter() {
    var currentCoords;

    //Cockpit
    currentCoords = vec3(0, 0, 0);
    createSphere(currentCoords, RotationRight, CockpitScale, colors["LightGrey"], textures["BasicTexture"]);
    currentCoords = add(vec3(0, 0, 0), vec3(0, 0, 2.2));
    createHemisphereInside(currentCoords, vec3(180, 0, 0), CockpitWindowScale, colors["TextureGrey"], textures["BlackTexture2"]);

    //Engine
    currentCoords = add(vec3(0, 0, 0), vec3(0, 0, -3.8));
    createRectangle(currentCoords, RotationForward, EngineSquareScale, CubeFaceLength, colors["VeryDarkGrey"], textures["BasicTexture"])
    currentCoords = add(vec3(0, 0, 0), vec3(0, 0, -4.8));
    createTorus(currentCoords, RotationForward, EngineTorusScale, colors["TextureGrey"], textures["BlackTexture"]);
    currentCoords = add(vec3(0, 0, 0), vec3(0, 0, -2.65));
    createHemisphereOutside(currentCoords, RotationForward, EngineHemisphereScale, colors["TextureGrey"], textures["BasicTexture"]);

    //Arms
    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects, 0, 0));
    createCylinder(currentCoords, RotationRight, ArmScale, false, false, colors["TextureGrey"], textures["CockpitMetal"]);
    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects, 0, 0));
    createCylinder(currentCoords, RotationRight, ArmScale, false, false, colors["TextureGrey"], textures["CockpitMetal"]);

    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects, 0, DistanceBetweenObjects / 4.5));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 60)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects, DistanceBetweenObjects / 4.5, 0));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 90)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects, 0, -DistanceBetweenObjects / 4.5));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 0)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects, -DistanceBetweenObjects / 4.5, 0));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 30)), ArmPrismScale, false, false, colors["LightGrey"], null);

    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects, 0, DistanceBetweenObjects / 4.5));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 60)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects, DistanceBetweenObjects / 4.5, 0));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 90)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects, 0, -DistanceBetweenObjects / 4.5));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 0)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects, -DistanceBetweenObjects / 4.5, 0));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 30)), ArmPrismScale, false, false, colors["LightGrey"], null);

    //Wings
    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects * 1.5, 0, 0));
    createRectangle(currentCoords, RotationForward, WingScale, CubeFaceLength, colors["Black"], null);
    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects * 1.5, 0, 0));
    createRectangle(currentCoords, RotationForward, WingScale, CubeFaceLength, colors["Black"], null);

    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects * 1.55, 0, 0));
    createRectangle(currentCoords, RotationForward, WingCenterScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(-31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, RotationUp, WingHorizontalRectangleScale, CubeFaceLength, colors["Grey"], null);

    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects * 1.45, 0, 0));
    createRectangle(currentCoords, RotationForward, WingCenterScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(-31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, RotationUp, WingHorizontalRectangleScale, CubeFaceLength, colors["Grey"], null);

    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects * 1.55, 0, 0));
    createRectangle(currentCoords, RotationForward, WingCenterScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(-31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, RotationUp, WingHorizontalRectangleScale, CubeFaceLength, colors["Grey"], null);

    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects * 1.45, 0, 0));
    createRectangle(currentCoords, RotationForward, WingCenterScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(-31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, RotationUp, WingHorizontalRectangleScale, CubeFaceLength, colors["Grey"], null);

    //Wing Prisms
    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects * 1.499, 0, DistanceBetweenObjects * 1.165));
    createPrism(currentCoords, vec3(0, -90, 0), WingPrismScale, false, false, colors["Black"], null);
    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects * 1.499, 0, -DistanceBetweenObjects * 1.165));
    createPrism(currentCoords, RotationRight, WingPrismScale, false, false, colors["Black"], null);

    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects * 1.499, 0, DistanceBetweenObjects * 1.165));
    createPrism(currentCoords, vec3(0, -90, 0), WingPrismScale, false, false, colors["Black"], null, null);
    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects * 1.499, 0, -DistanceBetweenObjects * 1.165));
    createPrism(currentCoords, RotationRight, WingPrismScale, false, false, colors["Black"], null);

    //Guns
    currentCoords = add(vec3(0, 0, 0), vec3(-DistanceBetweenObjects / 3, -DistanceBetweenObjects / 2.5, DistanceBetweenObjects / 2.5));
    createCylinder(currentCoords, RotationForward, GunScale, false, false, colors["TextureGrey"], textures["RedTexture"]);
    currentCoords = add(vec3(0, 0, 0), vec3(DistanceBetweenObjects / 3, -DistanceBetweenObjects / 2.5, DistanceBetweenObjects / 2.5));
    createCylinder(currentCoords, RotationForward, GunScale, false, false, colors["TextureGrey"], textures["RedTexture"]);
}