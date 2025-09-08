import * as THREE from "three";

import plane from "../objects/plane";
import rotatingCube from "../objects/rotatingCube";

// import defaultVertexShader from '../shaders/default/vertexShader.glsl';
// import portalFragmentShader from '../shaders/portal/fragmentShader.glsl';

function propagateClippingPlanes (object, clippingPlanes) {
    if (object.hasOwnProperty("material")) {
        // console.log("Apply clipping planes to ", object);
        object.material.clippingPlanes = [
            ...clippingPlanes
        ];
    }
    if (object.hasOwnProperty("traverse")) {
        object.traverse(function (child) {
            propagateClippingPlanes(child, clippingPlanes);
        });
    } else if (object.hasOwnProperty("children")) for (let child of object.children) {
        propagateClippingPlanes(child, clippingPlanes);
    }
}

export default async function setupScene (scene, camera, controllers, player, videoLayer) {

    // Set player view
    player.add(camera);

    const sceneGroup = new THREE.Group();

    let sceneX = 0.0;
    let sceneY = -0.5;
    let sceneZ = -2.5;

    sceneGroup.translateX(sceneX);
    sceneGroup.translateY(sceneY);
    sceneGroup.translateZ(sceneZ);

    scene.add(sceneGroup);

    // Place objects
    plane.translateY(-1);
    sceneGroup.add(plane);
    sceneGroup.add(rotatingCube);

    // Get rayspace from controller object and update position relative to plane (floor)
    if (controllers.hasOwnProperty("right") && controllers.right !== null) {

        const { gamepad, raySpace } = controllers.right;

        raySpace.getWorldPosition(plane.position);
        raySpace.getWorldQuaternion(plane.quaternion);
    }

    return function (currentSession, delta, time, sceneDataIn, sceneDataOut, clippingPlanes) {

        const data_out = {};

        if (typeof sceneDataIn === "object" && sceneDataIn != null) {
            console.log("sceneDataIn:", sceneDataIn);
        }

        rotatingCube.rotX(0.01);
        rotatingCube.rotY(0.01);

        // if (!!clippingPlanes && clippingPlanes !== null && clippingPlanes.length > 0) {
        //     propagateClippingPlanes (sceneGroup, clippingPlanes);
        // }

        if (typeof sceneDataOut === "function") {
            sceneDataOut(data_out);
        }
    }
}
