import * as LIGHT from './LightSetup.js';
import * as SCENE from './Init3D.js';
import * as CAMERA from './CameraSetup.js';
import * as THREE from './build/three.module.js';
import * as GVARS from './GlobalVars.js';
//import * as FLAME from './Assets/Models/FlameShader.js';

//***************************************************************************************************************
var clock = new THREE.Clock();
//***************************************************************************************************************
var time = 0;
var delta = 0;
export function animate() {
    //------ timing --------
    delta = clock.getDelta();
    time = time + delta;
    //------------------------------
    //------ candle -------------
    LIGHT.candleSpotLightAni.position.x = (Math.sin(time * Math.PI * 0.3) * 0.005) + GVARS.CheraghPosition.x + GVARS.FlamePositionOffset.x;
    LIGHT.candleSpotLightAni.position.y = (Math.cos(time * Math.PI * 0.3 + Math.random() * .1) * .005) + GVARS.CheraghPosition.y + GVARS.FlamePositionOffset.y;
    LIGHT.candleSpotLightAni.position.z = (Math.cos(time * Math.PI * 0.3) * .005) + GVARS.CheraghPosition.z - + GVARS.FlamePositionOffset.z;
    LIGHT.candleSpotLightAni.intensity = ((2 + Math.sin(time * Math.PI * 2) * Math.cos(time * Math.PI * 1.5)) * .1) + GVARS.CheraghLightBaseIntensity;
    //FLAME.flameMaterials[0].uniforms.time.value = time;
    //FLAME.flameMaterials[1].uniforms.time.value = time;
    //----------------------------------------
    CAMERA.cubeCamera.position.copy(CAMERA.camera.position);
    CAMERA.cubeCamera.update(SCENE.renderer, SCENE.scene);
    //----------------------------------------
    SCENE.render();
    requestAnimationFrame(animate);
    SCENE.stats.update();
};
