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
        forward[0] = Math.cos(degreeToRadian(this.yaw)) * Math.cos(degreeToRadian(this.pitch));
        forward[1] = Math.sin(degreeToRadian(this.pitch));
        forward[2] = Math.sin(degreeToRadian(this.yaw)) * Math.cos(degreeToRadian(this.pitch));
        this.forward = normalize(forward);
        this.right = normalize(cross(this.forward, VectorUp));
        this.up = normalize(cross(this.right, this.forward));
    }

    camera.update = function () {
        var speed = this.speed;
        // LeftShift
        if (currentlyPressedKeys[16] == true) {
            speed = speed * 2;
        }

        // A
        if (currentlyPressedKeys[65] == true) {
            this.position = subtract(this.position, scaleVec3(camera.right, speed * deltaTime));
        }
        // D
        if (currentlyPressedKeys[68] == true) {
            this.position = add(this.position, scaleVec3(camera.right, speed * deltaTime));
        }
        // W
        if (currentlyPressedKeys[87] == true) {
            this.position = add(this.position, scaleVec3(this.forward, speed * deltaTime));
        }
        // S
        if (currentlyPressedKeys[83] == true) {
            this.position = subtract(this.position, scaleVec3(this.forward, speed * deltaTime));
        }
        // Q
        if (currentlyPressedKeys[81] == true) {
            this.position = subtract(this.position, scaleVec3(VectorUp, speed * deltaTime));
        }
        // E
        if (currentlyPressedKeys[69] == true) {
            this.position = add(this.position, scaleVec3(VectorUp, speed * deltaTime));
        }
        // Left Arrow
        if (currentlyPressedKeys[37] == true) {
            this.yaw = this.yaw - 100 * (this.sensitivity * deltaTime);
            this.updateVectors();
        }
        // Right Arrow
        if (currentlyPressedKeys[39] == true) {
            this.yaw = this.yaw + 100 * (this.sensitivity * deltaTime);
            this.updateVectors();
        }
        // Up Arrow
        if (currentlyPressedKeys[38] == true) {
            this.pitch = this.pitch + 100 * (this.sensitivity * deltaTime);
            if (this.pitch > PitchCeiling)
                this.pitch = PitchCeiling;
            this.updateVectors();
        }
        // Down Arrow
        if (currentlyPressedKeys[40] == true) {
            this.pitch = this.pitch - 100 * (this.sensitivity * deltaTime);
            if (this.pitch < -PitchCeiling)
                this.pitch = -PitchCeiling;
            this.updateVectors();
        }
    }

    camera.handleRotation = function (xoffset, yoffset, constrainPitch = true) {
        xoffset = xoffset * this.sensitivity * deltaTime;
        yoffset = yoffset * this.sensitivity * deltaTime;

        this.yaw = this.yaw + xoffset;
        this.pitch = this.pitch + yoffset;

        if (constrainPitch)
        {
            this.pitch = Math.min(this.pitch, PitchCeiling);
            this.pitch = Math.max(this.pitch, -PitchCeiling);
        }

        this.updateVectors();
    }

    camera.handleZoom = function (yoffset) {
        this.zoom = this.zoom + yoffset;
        if (this.zoom < MinFov)
            this.zoom = MinFov;
        if (this.zoom > MaxFov)
            this.zoom = MaxFov; 
    }
    
    camera.getViewMatrix = function () {
        return lookAt(this.position, add(this.position, this.forward), this.up);
    }

    camera.getProjectionMatrix = function () {
        return perspective(this.zoom, actualPanelWidth / actualPanelHeight, 0.1, 2000);
    }

    camera.updateVectors();
    return camera;
}
