import * as THREE from "./build/three.module.js";
//---------------------------------------------
export const floorYoffset = 0;
//---------------------------------------------
export const CheraghScale = 0.004;
export const CheraghPosition = {
  x: 0.3,
  y: 0.56 + floorYoffset,
  z: 0.15,
};
export const FlamePositionOffset = {
  x: 0,
  y: 0.4,
  z: -0,
};
export const FlameSpotLightTarget = {
  x: 0,
  y: 0,
  z: 0,
};
export const CheraghFakeFlamePosition = {
  x: CheraghPosition.x + 0,
  y: CheraghPosition.y + 0.17,
  z: CheraghPosition.z + 0,
};
export const CheraghLightShadowMap = Math.pow(2, 10);
export const CheraghLightBaseIntensity = 1;
//-------------------- Camera -----------------
//---------------------------------------------
export const DefaultBookCameraPosition = {
  x: 1,
  y: 2,
  z: 1,
};
//---------------------------------------------
export const LookAtTheBook = new THREE.Vector3(0, 0.66, 0);
//---------------------------------------------
export const FlipBookCameraPosition = {
  x: 0,
  y: 1.1,
  z: 0.5,
};
