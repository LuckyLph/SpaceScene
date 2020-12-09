function createTieFighter(transform) {
    var model = {};
    model.phongModels = [];
    model.transform = transform;

    var currentCoords;
    
    //Cockpit
    currentCoords = transform.coords;
    createSphere(currentCoords, RotationForward, CockpitScale, colors["LightGrey"], textures["BasicTexture"]);
    currentCoords = add(transform.coords, vec3(0, 0, 2.2));
    createHemisphereInside(currentCoords, vec3(180, 0, 0), CockpitWindowScale, colors["TextureGrey"], textures["BlackTexture2"]);

    //Engine
    currentCoords = add(transform.coords, vec3(0, 0, -3.8));
    createRectangle(currentCoords, RotationForward, EngineSquareScale, CubeFaceLength, colors["VeryDarkGrey"], textures["BasicTexture"])
    currentCoords = add(transform.coords, vec3(0, 0, -4.8));
    createTorus(currentCoords, RotationForward, EngineTorusScale, colors["TextureGrey"], textures["BlackTexture"]);
    currentCoords = add(transform.coords, vec3(0, 0, -2.65));
    createHemisphereOutside(currentCoords, RotationForward, EngineHemisphereScale, colors["TextureGrey"], textures["BasicTexture"]);

    //Arms
    currentCoords = add(transform.coords, vec3(-DistanceBetweenObjects, 0, 0));
    createCylinder(currentCoords, RotationRight, ArmScale, false, false, colors["TextureGrey"], textures["CockpitMetal"]);
    currentCoords = add(transform.coords, vec3(DistanceBetweenObjects, 0, 0));
    createCylinder(currentCoords, RotationRight, ArmScale, false, false, colors["TextureGrey"], textures["CockpitMetal"]);

    currentCoords = add(transform.coords, vec3(DistanceBetweenObjects, 0, DistanceBetweenObjects / 4.5));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 60)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(transform.coords, vec3(DistanceBetweenObjects, DistanceBetweenObjects / 4.5, 0));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 90)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(transform.coords, vec3(DistanceBetweenObjects, 0, -DistanceBetweenObjects / 4.5));
    createPrism(currentCoords, add(RotationRight, transform.coords), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(transform.coords, vec3(DistanceBetweenObjects, -DistanceBetweenObjects / 4.5, 0));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 30)), ArmPrismScale, false, false, colors["LightGrey"], null);

    currentCoords = add(transform.coords, vec3(-DistanceBetweenObjects, 0, DistanceBetweenObjects / 4.5));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 60)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(transform.coords, vec3(-DistanceBetweenObjects, DistanceBetweenObjects / 4.5, 0));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 90)), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(transform.coords, vec3(-DistanceBetweenObjects, 0, -DistanceBetweenObjects / 4.5));
    createPrism(currentCoords, add(RotationRight, transform.coords), ArmPrismScale, false, false, colors["LightGrey"], null);
    currentCoords = add(transform.coords, vec3(-DistanceBetweenObjects, -DistanceBetweenObjects / 4.5, 0));
    createPrism(currentCoords, add(RotationRight, vec3(0, 0, 30)), ArmPrismScale, false, false, colors["LightGrey"], null);

    //Wings
    currentCoords = add(transform.coords, vec3(DistanceBetweenObjects * 1.5, 0, 0));
    createRectangle(currentCoords, RotationForward, WingScale, CubeFaceLength, colors["Black"], null);
    currentCoords = add(transform.coords, vec3(-DistanceBetweenObjects * 1.5, 0, 0));
    createRectangle(currentCoords, RotationForward, WingScale, CubeFaceLength, colors["Black"], null);

    currentCoords = add(transform.coords, vec3(DistanceBetweenObjects * 1.55, 0, 0));
    createRectangle(currentCoords, RotationForward, WingCenterScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(-31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, RotationUp, WingHorizontalRectangleScale, CubeFaceLength, colors["Grey"], null);

    currentCoords = add(model.transform.coords, vec3(DistanceBetweenObjects * 1.45, 0, 0));
    createRectangle(currentCoords, RotationForward, WingCenterScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(-31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, RotationUp, WingHorizontalRectangleScale, CubeFaceLength, colors["Grey"], null);

    currentCoords = add(model.transform.coords, vec3(-DistanceBetweenObjects * 1.55, 0, 0));
    createRectangle(currentCoords, RotationForward, WingCenterScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(-31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, RotationUp, WingHorizontalRectangleScale, CubeFaceLength, colors["Grey"], null);

    currentCoords = add(model.transform.coords, vec3(-DistanceBetweenObjects * 1.45, 0, 0));
    createRectangle(currentCoords, RotationForward, WingCenterScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, vec3(-31.5, 0, 0), WingXScale, CubeFaceLength, colors["Grey"], null);
    createRectangle(currentCoords, RotationUp, WingHorizontalRectangleScale, CubeFaceLength, colors["Grey"], null);

    //Wing Prisms
    currentCoords = add(model.transform.coords, vec3(DistanceBetweenObjects * 1.499, 0, DistanceBetweenObjects * 1.165));
    createPrism(currentCoords, vec3(0, -90, 0), WingPrismScale, false, false, colors["Black"], null);
    currentCoords = add(model.transform.coords, vec3(DistanceBetweenObjects * 1.499, 0, -DistanceBetweenObjects * 1.165));
    createPrism(currentCoords, RotationRight, WingPrismScale, false, false, colors["Black"], null);

    currentCoords = add(model.transform.coords, vec3(-DistanceBetweenObjects * 1.499, 0, DistanceBetweenObjects * 1.165));
    createPrism(currentCoords, vec3(0, -90, 0), WingPrismScale, false, false, colors["Black"], null, null);
    currentCoords = add(model.transform.coords, vec3(-DistanceBetweenObjects * 1.499, 0, -DistanceBetweenObjects * 1.165));
    createPrism(currentCoords, RotationRight, WingPrismScale, false, false, colors["Black"], null);

    //Guns
    currentCoords = add(model.transform.coords, vec3(-DistanceBetweenObjects / 3, -DistanceBetweenObjects / 2.5, DistanceBetweenObjects / 2.5));
    createCylinder(currentCoords, RotationForward, GunScale, false, false, colors["TextureGrey"], textures["RedTexture"]);
    currentCoords = add(model.transform.coords, vec3(DistanceBetweenObjects / 3, -DistanceBetweenObjects / 2.5, DistanceBetweenObjects / 2.5));
    createCylinder(currentCoords, RotationForward, GunScale, false, false, colors["TextureGrey"], textures["RedTexture"]);

    function createSphere(coords, rotation, scale, color, texture) {
        model.phongModels.push(createModel(uvSphere(SphereRadius, SphereSlices, SphereStacks), createTransform(coords, rotation, scale), color, texture));
    }
    
    function createCylinder(coords, rotation, scale, noTop, noBottom, color, texture) {
        model.phongModels.push(createModel(uvCylinder(CylinderRadius, CylinderHeight, CylinderSlices, noTop, noBottom), createTransform(coords, rotation, scale), color, texture));
    }
    
    function createRectangle(coords, rotation, scale, faceLength, color, texture) {
        model.phongModels.push(createModel(cube(faceLength), createTransform(coords, rotation, scale), color, texture));
    }
    
    function createPrism(coords, rotation, scale, noTop, noBottom, color, texture) {
        model.phongModels.push(createModel(uvCylinder(PrismRadius, PrismHeight, PrismSlices, noTop, noBottom), createTransform(coords, rotation, scale), color, texture));
    }
    
    function createTorus(coords, rotation, scale, color, texture) {
        model.phongModels.push(createModel(uvTorus(TorusInnerRadius, TorusOuterRadius, TorusSlices, TorusStacks), createTransform(coords, rotation, scale), color, texture));
    }
    
    function createHemisphereInside(coords, rotation, scale, color, texture) {
        model.phongModels.push(createModel(uvHemisphereInside(HemisphereInsideRadius, HemisphereInsideSlices, HemisphereInsideStacks),
                                           createTransform(coords, rotation, scale), color, texture));
    }
    
    function createHemisphereOutside(coords, rotation, scale, color, texture) {
        model.phongModels.push(createModel(uvHemisphereOutside(HemisphereOutsideRadius, HemisphereOutsideSlices, HemisphereOutsideStacks),
                                           createTransform(coords, rotation, scale), color, texture));
    }

    model.render = function () {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (var i = 0; i < model.phongModels.length; i++)
        {
            model.phongModels[i].render();
        }
    }

    return model;
}