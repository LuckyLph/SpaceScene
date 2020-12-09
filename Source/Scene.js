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

        camera = createCamera(createTransform(vec3(0, 0, 30), RotationForward, vec3(1, 1, 1)), 1, 1, MaxZoom);

        // LOAD SHADER (standard texture mapping)
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
        tieFighter = createTieFighter(createTransform(vec3(0, 0, 0), vec3(0, 0, 0), vec3(1, 1, 1)));

        window.addEventListener("resize", onresize);
   	    onresize();  // size the canvas to the current window width and height

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
        canvas.addEventListener('wheel', handleMouseScroll);
        //canvas.addEventListener('mousemove', handleMouseMovement);
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

    render();
    requestAnimationFrame(update);
}

function render() {
    projection = perspective(camera.zoom, 1, 0.1, 200.0);
    camera.update();
    tieFighter.render();
}

function handleLoadedTextures(){
    requestAnimationFrame(update);
}