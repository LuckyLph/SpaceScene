function createCamera(position, speed, sensitivity, zoom) {
    var camera = {};
    camera.position = position;
    camera.speed = speed;
    camera.sensitivity = sensitivity;
    camera.zoom = zoom;
    camera.yaw = -90;
    camera.pitch = 0;
    camera.target = vec3();
    camera.forward = vec3();
    camera.up = vec3();
    camera.right = vec3();

    camera.updateVectors = function () {
        var forward = vec3();
        forward[0] = Math.cos(degToRad(this.yaw)) * Math.cos(degToRad(this.pitch));
        forward[1] = Math.sin(degToRad(this.pitch));
        forward[2] = Math.sin(degToRad(this.yaw)) * Math.cos(degToRad(this.pitch));
        this.forward = normalize(forward);
        this.right = normalize(cross(this.forward, VectorUp));
        this.up = normalize(cross(this.right, this.forward));
    }

    camera.update = function () {
        var velocity = this.speed * deltaTime;

        // A
        if (currentlyPressedKeys[65] == true) {
            this.position = subtract(this.position, normalize(scaleVec3(camera.right, velocity)));
        }
        // D
        if (currentlyPressedKeys[68] == true) {
            this.position = add(this.position, normalize(scaleVec3(camera.right, velocity)));
        }
        // W
        if (currentlyPressedKeys[87] == true) {
            this.position = add(this.position, normalize(scaleVec3(this.forward, velocity)));
        }
        // S
        if (currentlyPressedKeys[83] == true) {
            this.position = subtract(this.position, normalize(scaleVec3(this.forward, velocity)));
        }
        // Q
        if (currentlyPressedKeys[81] == true) {
            this.position = subtract(this.position, normalize(scaleVec3(VectorUp, velocity)));
        }
        // E
        if (currentlyPressedKeys[69] == true) {
            this.position = add(this.position, normalize(scaleVec3(VectorUp, velocity)));
        }
        // Left Arrow
        if (currentlyPressedKeys[37] == true) {
            this.yaw = this.yaw - sensitivity;
            this.updateVectors();
        }
        // Right Arrow
        if (currentlyPressedKeys[39] == true) {
            this.yaw = this.yaw + sensitivity;
            this.updateVectors();
        }
        // Up Arrow
        if (currentlyPressedKeys[38] == true) {
            this.pitch = this.pitch + sensitivity;
            if (this.pitch > PitchCeiling){
                this.pitch = PitchCeiling;
            }
            this.updateVectors();
        }
        // Down Arrow
        if (currentlyPressedKeys[40] == true) {
            this.pitch = this.pitch - sensitivity;
            if (this.pitch < -PitchCeiling) {
                this.pitch = -PitchCeiling;
            }
            this.updateVectors();
        }
    }

    camera.handleRotation = function (xoffset, yoffset, constrainPitch = true) {
        xoffset = xoffset * this.sensitivity;
        yoffset = yoffset * this.sensitivity;

        this.yaw = this.yaw + xoffset;
        this.pitch = this.pitch + yoffset;

        if (constrainPitch)
        {
            if (this.pitch > PitchCeiling){
                this.pitch = PitchCeiling;
            }
            if (this.pitch < -PitchCeiling) {
                this.pitch = -PitchCeiling;
            }
        }

        this.updateVectors();
    }

    camera.handleZoom = function (yoffset) {
        this.zoom = this.zoom + yoffset;
        if (this.zoom < MinZoom) {
            this.zoom = MinZoom;
        }
        if (this.zoom > MaxZoom) {
            this.zoom = MaxZoom; 
        }
    }
    
    camera.getViewMatrix = function () {
        return lookAt(this.position, add(this.position, this.forward), this.up);
    }

    camera.updateVectors();
    return camera;
}
