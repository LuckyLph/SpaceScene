var tieFighter;
var skybox;

var firstMouseCallback = true;
var lastMousePosition = vec2();
var sceneIsLoaded = false;

window.onload = function init() {
    try {
        canvas = document.getElementById("glcanvas");
        initWebGL();
        initShaderPrograms();
        initEvents();
        initColors();
        initTextures()

        camera = createCamera(vec3(0, 0, 30), 0.6, 1.5, MaxZoom);
        tieFighter = createTieFighter(vec3(0, 0, 0));
        skybox = createSkybox(cube(2000), createTransform(camera.position, RotationForward, vec3(1, 1, 1)), textureMaps["skybox"])
        sceneIsLoaded = true;
    }
    catch (e) {
        document.getElementById("message").innerHTML =
             "Could not initialize WebGL: " + e;
        return;
    }
}

function update(currentFrameTime) {
    if (sceneIsLoaded) {
        currentFrameTime = currentFrameTime * 0.001;
        deltaTime = currentFrameTime - lastFrameTime;
        lastFrameTime = currentFrameTime;

        camera.update();
        skybox.update();

        render();
        requestAnimationFrame(update);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    skybox.render();
    tieFighter.render();
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleMouseMovement(event) {
    var mousePosition = getMousePosition(event);
    if (firstMouseCallback) {
        lastMousePosition[0] = mousePosition[0];
        lastMousePosition[1] = mousePosition[1];
        firstMouseCallback = false;
    }
    var xoffset = mousePosition[0] - lastMousePosition[0];
    var yoffset = lastMousePosition[1] - mousePosition[1];
    lastMousePosition = mousePosition;

    camera.handleRotation(xoffset, yoffset);
}

function handleMouseScroll(event) {
    camera.handleZoom(event.deltaY);
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
    window.addEventListener("resize", onresize);
    onresize();

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    canvas.addEventListener('wheel', handleMouseScroll);
    //canvas.addEventListener('mousemove', handleMouseMovement);
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