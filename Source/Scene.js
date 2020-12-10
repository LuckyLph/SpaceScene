var tieFighter;

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

        window.addEventListener("resize", onresize);
        onresize();  // size the canvas to the current window width and height

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
        canvas.addEventListener('wheel', handleMouseScroll);
        //canvas.addEventListener('mousemove', handleMouseMovement);

        camera = createCamera(vec3(0, 0, 30), 0.6, 1.5, MaxZoom);

        // load shaders
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

        gl.enable(gl.DEPTH_TEST);

        initColors();

        if (!initTextures()) {
            throw "Failed to load textures!";
        }
        tieFighter = createTieFighter(vec3(0, 0, 0));
    }
    catch (e) {
        document.getElementById("message").innerHTML =
             "Could not initialize WebGL: " + e;
        return;
    }
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

function update(currentFrameTime) {
    currentFrameTime = currentFrameTime * 0.001;
    deltaTime = currentFrameTime - lastFrameTime;
    lastFrameTime = currentFrameTime;

    camera.update();

    render();
    requestAnimationFrame(update);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    tieFighter.render();
}

function handleLoadedTextures(){
    requestAnimationFrame(update);
}