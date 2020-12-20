var tieFighter;
var arc170;
var skybox;
var mars;
var earth;
var moon;
var cube;

var distanceBetweenMoonAndEarth;

window.onload = function init() {
    try {
        canvas = document.getElementById("glcanvas");
        initWebGL();
        initShaderPrograms();
        initEvents();
        initMaterials();
        initModels();
        initTextures();
        onresize();

        camera = createCamera(vec3(0, 0, 250), DefaultSpeed, DefaultSensitivity, MaxFov);
        tieFighter = createTieFighter(vec3(30, 80, 0));
        earth = createModel(uvSphere(EarthRadius, SphereSlices * 2, SphereStacks * 2), createTransform(vec3(0, 0, 0), vec3(-90, 0, 0), DefaultScale),
                                     materials["TextureGrey"], textures["earthmap"]);
        moon = createModel(uvSphere(MoonRadius, SphereSlices * 2, SphereStacks * 2), createTransform(vec3(180, 0, 0), vec3(-90, 0, 0), DefaultScale),
                                     materials["TextureGrey"], textures["moonmap"]);
        mars = createModel(uvSphere(MarsRadius, SphereSlices * 2, SphereStacks * 2), createTransform(vec3(-200, 0, -200), vec3(-90, 0, 0), DefaultScale),
                                    materials["TextureGrey"], textures["marsmap"]);
        skybox = createSkybox(cube(2000), createTransform(camera.position, RotationForward, DefaultScale), textureMaps["skybox"])
        cube = createTranslucidCube(colorCube(), createTransform(0, 0, 80), textures["cubesig"]);

        distanceBetweenMoonAndEarth = Math.sqrt( Math.pow((earth.transform.coords[0] - moon.transform.coords[0]), 2) +
                                      Math.pow((earth.transform.coords[2] - moon.transform.coords[2]), 2));
    }
    catch (e) {
       document.getElementById("message").innerHTML = "Could not initialize WebGL: " + e;
       return;
    }
}

function initModels() {
    arc170 = createModelFromObjFile(ExtractDataFromOBJ("star-wars-arc-170-pbr.obj"), createTransform(vec3(-30, 80, 0), RotationForward, Arc170Scale));
}

function update(currentFrameTime) {
    updateDeltaTime(currentFrameTime);

    updateScene();

    render();
    window.requestAnimFrame(update);
}

function updateScene() {
    camera.update();
    skybox.update();
    earth.transform.rotation[2] = (earth.transform.rotation[2] + EarthRotationSpeed * deltaTime) % 360;
    moon.transform.rotation[2] = (moon.transform.rotation[2] + MoonRotationSpeed * deltaTime) % 360;
    mars.transform.rotation[2] = (mars.transform.rotation[2] + EarthRotationSpeed * deltaTime) % 360;

    moonAngle = (moonAngle + MoonOrbitSpeed * deltaTime) % 360;

    var x = Math.cos(moonAngle) * distanceBetweenMoonAndEarth;
    var z = Math.sin(moonAngle) * distanceBetweenMoonAndEarth;
    moon.transform.coords = vec3(x, moon.transform.coords[1], z);
}

function updateDeltaTime(currentFrameTime) {
    currentFrameTime = currentFrameTime * 0.001;
    deltaTime = currentFrameTime - lastFrameTime;
    lastFrameTime = currentFrameTime;
    fps = Math.round(1 / deltaTime);

    timeElapsed = timeElapsed + deltaTime;
    if (timeElapsed > 1) {
        console.log("fps : " + fps);
        timeElapsed = 0;
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    skybox.render();
    tieFighter.render();
    arc170.render();
    earth.render();
    moon.render();
    mars.render();
    cube.render();
}

function initShaderPrograms() {
    // load shaders (for the phong models)
    var vertexShaderSource = getTextContent("vshader");
    var fragmentShaderSource = getTextContent("fshader");
    prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(prog);

    renderingOptionLoc = gl.getUniformLocation(prog, "renderingOption");
    coordsLoc = gl.getAttribLocation(prog, "vcoords");
    normalLoc = gl.getAttribLocation(prog, "vnormal");
    texCoordLoc = gl.getAttribLocation(prog, "vtexcoord");
    modelviewLoc = gl.getUniformLocation(prog, "modelview");
    projectionLoc = gl.getUniformLocation(prog, "projection");
    normalMatrixLoc = gl.getUniformLocation(prog, "normalMatrix");
    textureIndexLoc = gl.getUniformLocation(prog, "texture");

    gl.uniform4fv(gl.getUniformLocation(prog, "lightPosition"), flatten(lightPosition));

    // load shaders (for the skybox)
    vertexShaderSource = getTextContent("vshaderskybox");
    fragmentShaderSource = getTextContent("fshaderskybox");
    progSkybox = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    skyboxVcoordsLoc = gl.getAttribLocation(progSkybox, "vcoords");
    skyboxModelviewLoc = gl.getUniformLocation(progSkybox, "modelview");
    skyboxProjectionLoc = gl.getUniformLocation(progSkybox, "projection");
    textureBoxLoc = gl.getUniformLocation(progSkybox, "textureBox");

    // load shaders (for the translucid cube)
    vertexShaderSource = getTextContent("vshadertranscube");
    fragmentShaderSource = getTextContent("fshadertranscube");
    progCube = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    cubeModelViewLoc = gl.getUniformLocation(progCube, "modelView");
    cubeProjectionLoc = gl.getUniformLocation(progCube, "projection");
    cubeAlphaLoc = gl.getUniformLocation(progCube, "alpha");
    cubeVColorLoc = gl.getAttribLocation(progCube, "vColor");
    cubeVPositionLoc = gl.getAttribLocation(progCube, "vPosition");
    cubeVTexCoordLoc = gl.getAttribLocation(progCube, "vTexCoord");
    cubeTextureLoc = gl.getUniformLocation(progCube, "texture");
}

function initEvents() {
    // pointer lock object forking for cross browser
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

    canvas.onclick = handleCanvasClick;
    canvas.addEventListener('wheel', handleMouseScroll);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    // Hook pointer lock state change events for different browsers
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    window.addEventListener("resize", onresize);
}

function initWebGL() {
    gl = canvas.getContext("webgl");
    if (!gl) {
        gl = canvas.getContext("experimental-webgl");
    }
    if (!gl) {
        throw "Could not create WebGL context.";
    }
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
}

function initMaterials() {
    //Emissive materials
    materials["Black"] = createMaterial(vec4(0.1176, 0.1176, 0.1176, 1.0), vec4(0, 0, 0, 1.0), vec4(0, 0, 0, 1.0), 100);

    //Normal materials(with textures)
    materials["Blue"] = createMaterial(vec4(0.0, 0.1, 0.3, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    materials["Grey"] = createMaterial(vec4(0.53, 0.48, 0.46, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    materials["SlightlyGrey"] = createMaterial(vec4(0.1725, 0.1418, 0.1725, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    materials["LightGrey"] = createMaterial(vec4(0.3608, 0.3294, 0.3608, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    materials["DarkGrey"] = createMaterial(vec4(0.3608, 0.3294, 0.3608, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    materials["VeryDarkGrey"] = createMaterial(vec4(0.1725, 0.1725, 0.1725, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
    materials["TextureGrey"] = createMaterial(vec4(0.4, 0.4, 0.4, 1.0), vec4(0.48, 0.55, 0.69, 1.0), vec4(0.48, 0.55, 0.69, 1.0), 100);
}

function initTextures() {
    var currentIndex = 0
    var skyboxPaths = ["../TextureMaps/Skybox1/1.jpg", "../TextureMaps/Skybox1/2.jpg", "../TextureMaps/Skybox1/3.jpg",
                       "../TextureMaps/Skybox1/4.jpg", "../TextureMaps/Skybox1/5.jpg", "../TextureMaps/Skybox1/6.jpg"];

    currentIndex = loadTexture(currentIndex, "../Textures/basicTexture.jpg", "BasicTexture");
    currentIndex = loadTexture(currentIndex, "../Textures/CockpitMetal.jpg", "CockpitMetal");
    currentIndex = loadTexture(currentIndex, "../Textures/blackTexture.jpg", "BlackTexture");
    currentIndex = loadTexture(currentIndex, "../Textures/blackTexture2.jpg", "BlackTexture2");
    currentIndex = loadTexture(currentIndex, "../Textures/redTexture.jpg", "RedTexture");
    currentIndex = loadTexture(currentIndex, "../Textures/superearthmap.jpg", "earthmap");
    currentIndex = loadTexture(currentIndex, "../Textures/moonmap.jpg", "moonmap");
    currentIndex = loadTexture(currentIndex, "../Textures/2kmars.jpg", "marsmap");
    currentIndex = loadTexture(currentIndex, "../Textures/SA2011_black.gif", "cubesig");

    for (var i = 0; i < bufferedTextures.length; i++) {
        currentIndex = loadBufferedTexture(currentIndex, bufferedTextures[i]);
    }

    currentIndex = 0;
    currentIndex = loadTextureMap(currentIndex, skyboxPaths, "skybox", true);
}