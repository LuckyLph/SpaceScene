//#region Variables
var gl;              //The webgl context.
var canvas;          //The web canvas
var prog;            //Shader program
var progSkybox;
var camera;

var coordsLoc;
var normalLoc;
var texCoordLoc;
var projectionLoc;
var modelviewLoc;
var normalMatrixLoc;
var textureIndexLoc;

var skyboxVcoordsLoc;
var skyboxModelviewLoc;
var skyboxProjectionLoc;
var textureBoxLoc;

var colors = [];
var textures = [];
var textureMaps = [];

var lightPosition = vec4(20.0, 20.0, 100.0, 1.0);
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var deltaTime = 0;
var lastFrameTime = 0;
var timeElapsed = 0;
var fps;

var firstMouseCallback = true;
var lastMousePosition = vec2();
var earthRotationSpeed = 2;

var actualPanelWidth;
var actualPanelHeight;

var currentlyPressedKeys = [];

//#endregion

//#region Constants
const CylinderRadius = 5;
const CylinderHeight = 20;
const CylinderSlices = 25;

const PrismRadius = 5;
const PrismHeight = 15;
const PrismSlices = 3;

const TorusOuterRadius = 4;
const TorusInnerRadius = 2;
const TorusSlices = 25;
const TorusStacks = 25;

const SphereRadius = 8;
const SphereSlices = 25;
const SphereStacks = 25;
const CubeFaceLength = 10;
const EarthRadius = 60;

const HemisphereInsideRadius = 5;
const HemisphereInsideSlices = 25;
const HemisphereInsideStacks = 25;

const HemisphereOutsideRadius = 5;
const HemisphereOutsideSlices = 25;
const HemisphereOutsideStacks = 25;

const DistanceBetweenObjects = 6;

const CockpitScale = vec3(0.5, 0.5, 0.5);
const CockpitWindowScale = vec3(0.5, 0.5, 0.5);
const ArmScale = vec3(0.3, 0.3, 0.3);
const WingScale = vec3(0.05, 2.0, 1.2);
const WingPrismScale = vec3(0.4, 2.3, 0.0345)
const WingCenterScale = vec3(0.05, 0.3, 0.35);
const WingXScale = vec3(0.05, 2, 0.1);
const WingHorizontalRectangleScale = vec3(0.05, 1.7, 0.1);
const GunScale = vec3(0.06, 0.06, 0.06);
const ArmPrismScale = vec3(0.1, 0.1, 0.4);
const EngineSquareScale = vec3(0.2, 0.2, 0.2);
const EngineTorusScale = vec3(0.2, 0.2, 0.2);
const EngineHemisphereScale = vec3(0.4, 0.4, 0.4);

const RotationForward = vec3(0, 0, 0);
const RotationUp = vec3(90, 0, 0);
const RotationRight = vec3(0, 90, 0);

const MaxFov = 90;
const MinFov = 30;
const PitchCeiling = 70;
const DefaultSpeed = 25;
const DefaultSensitivity = 0.6;

const VectorUp = vec3(0, 1, 0);
//#endregion