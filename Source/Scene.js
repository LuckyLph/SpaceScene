var tieFighter;
var skybox;
var sun;
var earth;
var moon;
var sceneObjects = [];

window.onload = function init() {
    try {
        canvas = document.getElementById("glcanvas");
        initWebGL();
        initShaderPrograms();
        initEvents();
        initColors();
        initTextures();
        onresize();

        camera = createCamera(vec3(0, 0, 30), DefaultSpeed, DefaultSensitivity, MaxFov);
        tieFighter = createTieFighter(vec3(0, 0, 0));
        earth = createModel(uvSphere(EarthRadius, SphereSlices * 2, SphereStacks * 2), createTransform(vec3(0, 0, 150), vec3(-90, 0, 0), vec3(1, 1, 1)),
                                     colors["TextureGrey"], textures["earthmap"]);
        skybox = createSkybox(cube(2000), createTransform(camera.position, RotationForward, vec3(1, 1, 1)), textureMaps["skybox"])
    }
    catch (e) {
        document.getElementById("message").innerHTML = "Could not initialize WebGL: " + e;
        return;
    }
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
    earth.transform.rotation[2] = earth.transform.rotation[2] + earthRotationSpeed * deltaTime;
    //tieFighter.move(scaleVec3(vec3(1, 1, 1), deltaTime));
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
    earth.render();
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
    gl.useProgram(progSkybox);

    skyboxVcoordsLoc = gl.getAttribLocation(progSkybox, "vcoords");
    skyboxModelviewLoc = gl.getUniformLocation(progSkybox, "modelview");
    skyboxProjectionLoc = gl.getUniformLocation(progSkybox, "projection");
    textureBoxLoc = gl.getUniformLocation(progSkybox, "textureBox");
    gl.useProgram(prog);
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

function initTextures() {
    var currentIndex = 0
    var skyboxPaths = ["../TextureMaps/Skybox1/1.jpg", "../TextureMaps/Skybox1/2.jpg", "../TextureMaps/Skybox1/3.jpg",
                       "../TextureMaps/Skybox1/4.jpg", "../TextureMaps/Skybox1/5.jpg", "../TextureMaps/Skybox1/6.jpg"];

    currentIndex = loadTexture(currentIndex, "../Textures/basicTexture.jpg", "BasicTexture");
    currentIndex = loadTexture(currentIndex, "../Textures/CockpitMetal.jpg", "CockpitMetal");
    currentIndex = loadTexture(currentIndex, "../Textures/blackTexture.jpg", "BlackTexture");
    currentIndex = loadTexture(currentIndex, "../Textures/blackTexture2.jpg", "BlackTexture2");
    currentIndex = loadTexture(currentIndex, "../Textures/redTexture.jpg", "RedTexture");
    currentIndex = loadTexture(currentIndex, "../Textures/sunmap.jpg", "sunmap");
    currentIndex = loadTexture(currentIndex, "../Textures/superearthmap.jpg", "earthmap");
    currentIndex = loadTexture(currentIndex, "../Textures/moonmap.jpg", "moonmap");

    currentIndex = 0;
    currentIndex = loadTextureMap(currentIndex, skyboxPaths, "skybox", true);
}