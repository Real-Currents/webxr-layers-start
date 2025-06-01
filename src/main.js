import * as THREE from 'three';

import { XRDevice, metaQuest3 } from 'iwer';
import { DevUI } from '@iwer/devui';
import { GamepadWrapper } from 'gamepad-wrapper';
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";

import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRButton } from "three/examples/jsm/webxr/XRButton.js";

// These definition make it possible to try different version THREE in the package deps
const PlaneGeometry = ("PlaneBufferGeometry" in THREE) ?
   THREE.PlaneBufferGeometry : THREE.PlaneGeometry;

const SphereGeometry = ("SphereBufferGeometry" in THREE) ?
   THREE.SphereBufferGeometry : THREE.SphereGeometry;

let currentSession = null;
let initWithLayers = false;

setTimeout(function init () {

   console.log("Initiate WebXR Layers scene!");

   // let camera,
   //     renderer,
   //     scene,
   //     quadLayerPlain,
   //     quadLayerMips,
   //     guiLayer,
   //     quadLayerVideo,
   //     video;
   //
   // const previewWindow = {
   //    width: window.innerWidth, // / 2, // 640,
   //    height: window.innerHeight + 10, // 480,
   // };
   //
   // camera = new THREE.PerspectiveCamera( 50, previewWindow.innerWidth / previewWindow.innerHeight, 0.1, 10 );
   // camera.position.set( 0, 1.6, 3 );
   //
   // scene = new THREE.Scene();
   //
   // const clock = new THREE.Clock();
   //
   // const player = new THREE.Group();
   // scene.add(player);
   //
   // const hemLight = new THREE.HemisphereLight( 0x808080, 0x606060 );
   // const light = new THREE.DirectionalLight( 0xffffff );
   // scene.add( hemLight, light );
   //
   // // const body = document.body,
   // //     container = document.createElement('div');
   // // container.style = `display: block; background-color: #000; max-width: ${previewWindow.width}px; max-height: ${previewWindow.height}px; overflow: hidden;`;
   // // body.appendChild(container);
   // //
   // // console.log(container);
   //
   // const canvas= window.document.createElement('canvas');
   //
   // canvas.addEventListener("webglcontextlost", (event) => {
   //    /* The context has been lost but can be restored */
   //    event.canceled = true;
   //
   //    console.log("webglcontextlost");
   // });
   //
   // /* When the GL context is reconnected, reload the resources for the
   //    current scene. */
   // canvas.addEventListener("webglcontextrestored", (event) => {
   //    // ... loadSceneResources(currentScene);
   //
   //    console.log("webglcontextrestored");
   // });
   //
   // renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
   // renderer.setPixelRatio( window.devicePixelRatio );
   // renderer.setClearAlpha( 1 );
   // renderer.setClearColor( new THREE.Color( 0 ), 0 );
   // renderer.setSize( previewWindow.innerWidth, previewWindow.innerHeight );
   // renderer.outputEncoding = THREE.sRGBEncoding;
   // renderer.xr.enabled = true;
   //
   // renderer.setPixelRatio( window.devicePixelRatio );
   // renderer.setClearAlpha( 1 );
   // renderer.setClearColor( new THREE.Color( 0 ), 0 );
   // renderer.setSize( previewWindow.innerWidth, previewWindow.innerHeight );
   // renderer.outputEncoding = THREE.sRGBEncoding;
   // renderer.xr.enabled = true;
   //
   // renderer.domElement.style.position = "fixed";
   // renderer.domElement.style.top = 0;
   //
   // function onWindowResize() {
   //
   //    camera.aspect = window.innerWidth / window.innerHeight;
   //    camera.updateProjectionMatrix();
   //
   //    renderer.setSize( window.innerWidth, window.innerHeight );
   //
   // }
   //
   // const controllerModelFactory = new XRControllerModelFactory();
   // const controllers = {
   //    left: null,
   //    right: null,
   // };
   //
   // for (let i = 0; i < 2; i++) {
   //    const raySpace = renderer.xr.getController(i);
   //    const gripSpace = renderer.xr.getControllerGrip(i);
   //    const mesh = controllerModelFactory.createControllerModel(gripSpace);
   //
   //    gripSpace.add(mesh);
   //
   //    gripSpace.addEventListener('connected', (e) => {
   //
   //       raySpace.visible = true;
   //       gripSpace.visible = true;
   //       const handedness = e.data.handedness;
   //       controllers[handedness] = {
   //          gamepad: new GamepadWrapper(e.data.gamepad),
   //          raySpace,
   //          gripSpace,
   //          mesh
   //       };
   //    });
   //
   //    gripSpace.addEventListener('disconnected', (e) => {
   //       raySpace.visible = false;
   //       gripSpace.visible = false;
   //       const handedness = e.data.handedness;
   //       controllers[handedness] = null;
   //    });
   //
   //    player.add(raySpace, gripSpace);
   //    // raySpace.visible = false;
   //    // gripSpace.visible = false;
   // }
   //
   // // Setup Stats
   // const stats = new Stats();
   // stats.showPanel(0);
   // stats.dom.style.maxWidth = "100px";
   // stats.dom.style.minWidth = "100px";
   // stats.dom.style.backgroundColor = "black";
   // document.body.appendChild(stats.dom);
   //
   // const statsMesh = new HTMLMesh( stats.dom );
   // // statsMesh.position.x = -1.5;
   // // statsMesh.position.y = 2;
   // // statsMesh.position.z = -1;
   // statsMesh.position.set(-1.0, 1.5, -1.0);
   // statsMesh.rotation.y = Math.PI / 4;
   // // statsMesh.scale.setScalar(8);
   // statsMesh.scale.setScalar(2);
   // statsMesh.material.colorWrite = false;
   // statsMesh.material.transparent = false;
   //
   // scene.add(statsMesh);
   //
   // video = //document.createElement( 'video' );
   //     document.getElementById("video");
   // // video.loop = true;
   // // video.src = 'assets/videos/Lake_Champlain.webm';
   // // // video.src = 'assets/videos/Lake_Champlain.mp4';
   //
   // // video.width = previewWindow.width;
   // // video.height = previewWindow.height;
   // // document.body.appendChild(video);
   //
   // function render (t, frame ) {
   //
   //    const xr = renderer.xr;
   //    const gl = renderer.getContext();
   //
   //    Object.values(controllers).forEach((controller) => {
   //       if (controller?.gamepad) {
   //          controller.gamepad.update();
   //       }
   //    });
   //
   //    stats.begin();
   //
   //    if (
   //        currentSession !== null
   //        && currentSession.renderState.layers !== undefined
   //        && currentSession.hasMediaLayer === undefined
   //        // && video.readyState >= 2
   //    ) {
   //
   //       currentSession.hasMediaLayer = true;
   //
   //       console.log("Set media layer to true on currentSession:", currentSession);
   //
   //       console.log("Make gl context XR compatible: ", gl.makeXRCompatible);
   //
   //       gl.makeXRCompatible().then(() => {
   //
   //          const glBinding = xr.getBinding(); // returns XRWebGLBinding
   //
   //          currentSession.requestReferenceSpace('local-floor').then((refSpace) => {
   //
   //             // // Create Quad layers for Snellen chart.
   //             // const quadLayerConfig = {
   //             //    width: snellenConfig.quadWidth,
   //             //    height: snellenConfig.quadHeight,
   //             //    viewPixelWidth: snellenConfig.textureSizePx,
   //             //    viewPixelHeight: snellenConfig.textureSizePx,
   //             //    isStatic: true,
   //             //    space: refSpace,
   //             //    layout: 'mono',
   //             //    transform: new XRRigidTransform( {
   //             //       x: snellenConfig.x - snellenConfig.widthMeters,
   //             //       y: snellenConfig.y + snellenConfig.heightMeters,
   //             //       z: snellenConfig.z
   //             //    } )
   //             // };
   //             //
   //             // quadLayerPlain = glBinding.createQuadLayer( quadLayerConfig );
   //             //
   //             // quadLayerConfig.mipLevels = 3;
   //             // quadLayerConfig.transform = new XRRigidTransform({
   //             //    x: snellenConfig.x + snellenConfig.widthMeters,
   //             //    y: snellenConfig.y + snellenConfig.heightMeters,
   //             //    z: snellenConfig.z
   //             // });
   //             // quadLayerMips = glBinding.createQuadLayer( quadLayerConfig );
   //
   //             // Create GUI layer.
   //             guiLayer = glBinding.createQuadLayer({
   //                width: statsMesh.geometry.parameters.width,
   //                height: statsMesh.geometry.parameters.height,
   //                viewPixelWidth: statsMesh.material.map.image.width,
   //                viewPixelHeight: statsMesh.material.map.image.height,
   //                space: refSpace,
   //                transform: new XRRigidTransform(statsMesh.position, statsMesh.quaternion)
   //             });
   //
   //             let videoAngle = 96; // 110;
   //             let videoLayout = "stereo-left-right";
   //             let eqrtRadius = 10;
   //             const videoWidth = 2064;
   //             const videoHeight = 2208;
   //             const videoReducer = 0.00090579710;
   //
   //             // Create background EQR video layer.
   //             const mediaBinding = new XRMediaBinding(currentSession);
   //
   //             console.log("Create XREquirectLayer with XRMediaBinding");
   //             const equirectLayer = mediaBinding.createEquirectLayer(
   //                 video,
   //                 {
   //                    // layout: 'stereo-left-right',
   //                    layout: videoLayout,
   //                    viewPixelWidth: videoWidth / (videoLayout === "stereo-left-right" ? 2 : 1),
   //                    viewPixelHeight: videoHeight / (videoLayout === "stereo-top-bottom" ? 2 : 1),
   //                    space: refSpace,
   //                    // // Rotate by 45 deg to avoid stereo conflict with the 3D geometry.
   //                    // transform: new XRRigidTransform(
   //                    //   {},
   //                    //   { x: 0, y: .28, z: 0, w: .96 }
   //                    // )
   //                    transform: new XRRigidTransform(
   //                        {x: 0, y: -5, z: -10},
   //                        // { x: -0.28, y: 0, z: 0, w: .96 }
   //                    )
   //                 }
   //             );
   //
   //             console.log("Create XRQuadLayer with XRMediaBinding");
   //             quadLayerVideo = mediaBinding.createQuadLayer(
   //                 video,
   //                 {
   //                    layout: 'stereo-left-right',
   //                    // layout: videoLayout,
   //                    // width: 3.73913,
   //                    width: videoWidth * videoReducer * 2,
   //                    // height: 4.0,
   //                    height: videoHeight * videoReducer * 2,
   //                    space: refSpace,
   //                    // // Rotate by 45 deg to avoid stereo conflict with the 3D geometry.
   //                    // transform: new XRRigidTransform(
   //                    //   {},
   //                    //   { x: 0, y: .28, z: 0, w: .96 }
   //                    // )
   //                    transform: new XRRigidTransform(
   //                        {x: 0, y: (videoHeight * videoReducer) / 2, z: -5},
   //                        {},
   //                        // { x: -0.28, y: 0, z: 0, w: .96 },
   //                        {}
   //                    )
   //                 }
   //             );
   //
   //             equirectLayer.centralHorizontalAngle = Math.PI * videoAngle / 180;
   //             equirectLayer.upperVerticalAngle = (Math.PI * videoAngle / 180) * 0.5; // Math.PI / 2.0 * 0.5;
   //             equirectLayer.lowerVerticalAngle = -(Math.PI * videoAngle / 180) * 0.5; // -Math.PI / 2.0 * 0.5;
   //             equirectLayer.radius = eqrtRadius;
   //
   //             currentSession.updateRenderState({
   //                layers: (!!currentSession.renderState.layers.length > 0) ? [
   //                   currentSession.renderState.layers[0],
   //                   // equirectLayer,
   //                   quadLayerVideo,
   //                   // quadLayerPlain,
   //                   // quadLayerMips,
   //                   guiLayer
   //                ] : [
   //                   // equirectLayer,
   //                   quadLayerVideo,
   //                   guiLayer
   //                ]
   //             });
   //
   //          })
   //       });
   //
   //    }
   //
   //    // // Copy image to layers as required.
   //    // // needsRedraw is set on creation or if the underlying GL resources of a layer are lost.
   //    // if ( session && quadLayerPlain && quadLayerPlain.needsRedraw ) {
   //    //
   //    //    const glayer = xr.getBinding().getSubImage( quadLayerPlain, frame );
   //    //    renderer.state.bindTexture( gl.TEXTURE_2D, glayer.colorTexture );
   //    //    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
   //    //    gl.texSubImage2D( gl.TEXTURE_2D, 0,
   //    //        ( snellenConfig.textureSizePx - snellenConfig.widthPx ) / 2,
   //    //        ( snellenConfig.textureSizePx - snellenConfig.heightPx ) / 2,
   //    //        snellenConfig.widthPx, snellenConfig.heightPx,
   //    //        gl.RGBA, gl.UNSIGNED_BYTE, snellenTexture.image );
   //    //
   //    // }
   //    //
   //    // // Same as above but also gl.generateMipmap.
   //    // if ( session && quadLayerMips && quadLayerMips.needsRedraw ) {
   //    //
   //    //    const glayer = xr.getBinding().getSubImage( quadLayerMips, frame );
   //    //    renderer.state.bindTexture( gl.TEXTURE_2D, glayer.colorTexture );
   //    //    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
   //    //    gl.texSubImage2D( gl.TEXTURE_2D, 0,
   //    //        ( snellenConfig.textureSizePx - snellenConfig.widthPx ) / 2,
   //    //        ( snellenConfig.textureSizePx - snellenConfig.heightPx ) / 2,
   //    //        snellenConfig.widthPx, snellenConfig.heightPx,
   //    //        gl.RGBA, gl.UNSIGNED_BYTE, snellenTexture.image );
   //    //    gl.generateMipmap( gl.TEXTURE_2D );
   //    //
   //    // }
   //
   //    if (currentSession !== null && !!guiLayer && (guiLayer.needsRedraw || guiLayer.needsUpdate)) {
   //
   //       const glayer = xr.getBinding().getSubImage(guiLayer, frame);
   //       renderer.state.bindTexture(gl.TEXTURE_2D, glayer.colorTexture);
   //       gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   //       const canvas = statsMesh.material.map.image;
   //       gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
   //       guiLayer.needsUpdate = false;
   //
   //    }
   //
   //    renderer.render(scene, camera);
   //
   //    stats.end();
   //
   //    statsMesh.material.map.update();
   //    if (!!guiLayer) guiLayer.needsUpdate = true;
   //
   // }
   //
   // const sessionInit = {
   //    optionalFeatures: [
   //       "local-floor",
   //       // "bounded-floor",
   //       // "hand-tracking",
   //       "layers"
   //    ],
   //    requiredFeatures: [
   //       // "webgpu"
   //    ]
   // };
   //
   // function animate () {
   //
   //    renderer.setAnimationLoop( render );
   //
   // }
   //
   // async function getXRSession (xr) {
   //
   //    console.log("xr", `${JSON.stringify(xr)}`);
   //
   //    let session = null;
   //
   //    try {
   //       session = await (xr.requestSession("immersive-ar", sessionInit));
   //    } catch (e) {
   //       session = await (xr.requestSession("immersive-vr", sessionInit));
   //    } finally {
   //
   //       previewWindow.width = window.innerWidth;
   //       previewWindow.height = window.innerHeight;
   //
   //       renderer.setSize(previewWindow.width, previewWindow.height);
   //
   //       camera.aspect = previewWindow.width / previewWindow.height;
   //       camera.updateProjectionMatrix();
   //
   //       return session;
   //    }
   // }
   //
   // async function onSessionStarted(session) {
   //    await renderer.xr.setSession(session);
   //    currentSession = session;
   //    currentSession.addEventListener("end", onSessionEnded);
   // }
   //
   // function onSessionEnded() {
   //    currentSession.removeEventListener("end", onSessionEnded);
   //    currentSession = null;
   // }
   //
   // const xr_button = document.createElement("button");
   // xr_button.className = "xr-button";
   // xr_button.disabled = true;
   // xr_button.innerHTML = "Preparing...";
   // xr_button.addEventListener('click', async () => {
   //
   //    console.log("XR Button clicked");
   //
   //    const delta = clock.getDelta();
   //    const time = clock.getElapsedTime();
   //
   //    // Does xr object exist?
   //    let nativeWebXRSupport = "xr" in navigator;
   //
   //    try {
   //
   //       if (nativeWebXRSupport) nativeWebXRSupport = (
   //           // Does xr object support sessions?
   //           await navigator.xr.isSessionSupported( 'immersive-ar' ) ||
   //           await navigator.xr.isSessionSupported('immersive-vr') ||
   //           nativeWebXRSupport
   //       )
   //
   //    } catch (e) {
   //       console.log(e.message, navigator);
   //    }
   //
   //    // If no XR/VR available, setup Immersive Web Emulation Runtime (iwer) and emulated XR device (@iwer/devui)
   //    if (!nativeWebXRSupport) {
   //       const xrDevice = new XRDevice(metaQuest3);
   //       xrDevice.installRuntime();
   //       xrDevice.fovy = (75 / 180) * Math.PI;
   //       xrDevice.ipd = 0;
   //       window.xrdevice = xrDevice;
   //       xrDevice.controllers.right.position.set(0.15649, 1.43474, -0.38368);
   //       xrDevice.controllers.right.quaternion.set(
   //           0.14766305685043335,
   //           0.02471366710960865,
   //           -0.0037767395842820406,
   //           0.9887216687202454,
   //       );
   //       xrDevice.controllers.left.position.set(-0.15649, 1.43474, -0.38368);
   //       xrDevice.controllers.left.quaternion.set(
   //           0.14766305685043335,
   //           0.02471366710960865,
   //           -0.0037767395842820406,
   //           0.9887216687202454,
   //       );
   //       new DevUI(xrDevice);
   //
   //    }
   //
   //    const session = await getXRSession(navigator.xr);
   //
   //    await onSessionStarted(session);
   //
   //    // Set camera position
   //    // camera.position.z = 0;
   //    camera.position.y = 0;
   //
   //    player.position.z = camera.position.z;
   //    player.position.y = camera.position.y;
   //
   //    const initSceneDataIn = {
   //       "events": [
   //          {
   //             "action": "play_sounds"
   //          }
   //       ]
   //    }
   //
   //    // updateScene(currentSession, delta, time, initSceneDataIn, null);
   //
   //    video.play();
   //
   //    render(renderer);
   //
   //    // container.style = `display: block; color: #FFF; font-size: 24px; text-align: center; background-color: #000; height: 100vh; max-width: ${previewWindow.width}px; max-height: ${previewWindow.height}px; overflow: hidden;`;
   //    xr_button.innerHTML = "Reload";
   //    xr_button.onclick = function () {
   //       xr_button.disabled = true;
   //       window.location.reload();
   //    };
   // });

   // document.body.appendChild(renderer.domElement );

   // window.addEventListener( 'resize', onWindowResize, false );
   //
   // animate();
   //
   // document.body.appendChild(xr_button);
   //
   // xr_button.innerHTML = "Enter XR";
   // xr_button.style.opacity = 0.75;
   // xr_button.disabled = false;
   // delete xr_button.disabled;

   let camera, clock, scene, renderer, player;

   const videoWidth = 2064;
   const videoHeight = 2208;
   const videoReducer = 0.090579710

   const previewWindow = {
      width: window.innerWidth, // / 2, // 640,
      height: window.innerHeight + 10, // 480,
   };

   const sessionInit = {
      optionalFeatures: [ //(initWithLayers) ? [
      //    "local-floor",
      //    // "bounded-floor",
      //    // "hand-tracking",
      //    "layers"
      // ] :  [
         "local-floor"
      ],
      requiredFeatures: [
         // "webgpu"
      ]
   };

   async function onSessionStarted (session) {
      const useLayers =  initWithLayers && (typeof XRWebGLBinding !== 'undefined' && 'createProjectionLayer' in XRWebGLBinding.prototype);
      await renderer.xr.setSession(session, useLayers);
      currentSession = session;
      currentSession.addEventListener("end", onSessionEnded);
   }

   function onSessionEnded () {
      currentSession.removeEventListener("end", onSessionEnded);
      currentSession = null;
   }

   function onWindowResize () {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

   }

   function animate () {

      renderer.setAnimationLoop( render );

   }

   function render () {

      renderer.render( scene, camera );

   }

   async function getXRSession (xr) {

      console.log("xr", `${JSON.stringify(xr)}`);

      let session = null;

      const useLayers =  initWithLayers && (typeof XRWebGLBinding !== 'undefined' && 'createProjectionLayer' in XRWebGLBinding.prototype);
      try {
         if (!useLayers) {
            session = await (xr.requestSession("immersive-vr", sessionInit));
         } else {
            session = await (xr.requestSession("immersive-ar", sessionInit));
         }
      } finally {

         previewWindow.width = window.innerWidth;
         previewWindow.height = window.innerHeight;

         renderer.setSize(previewWindow.width, previewWindow.height);

         camera.aspect = previewWindow.width / previewWindow.height;
         camera.updateProjectionMatrix();

         return session;
      }
   }


   const xr_button = document.createElement("button");
   xr_button.className = "xr-button";
   xr_button.disabled = true;
   xr_button.innerHTML = "Preparing...";
   xr_button.addEventListener('click', async () => {

      console.log("XR Button clicked");

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();



      // Does xr object exist?
      let nativeWebXRSupport = "xr" in navigator;

      try {

         if (nativeWebXRSupport) nativeWebXRSupport = (
             // Does xr object support sessions?
             await navigator.xr.isSessionSupported( 'immersive-ar' ) ||
             await navigator.xr.isSessionSupported('immersive-vr') ||
             nativeWebXRSupport
         )

      } catch (e) {
         console.log(e.message, navigator);
      }

      // If no XR/VR available, setup Immersive Web Emulation Runtime (iwer) and emulated XR device (@iwer/devui)
      if (!nativeWebXRSupport) {
         const xrDevice = new XRDevice(metaQuest3);
         xrDevice.installRuntime();
         xrDevice.fovy = (75 / 180) * Math.PI;
         xrDevice.ipd = 0;
         window.xrdevice = xrDevice;
         xrDevice.controllers.right.position.set(0.15649, 1.43474, -0.38368);
         xrDevice.controllers.right.quaternion.set(
             0.14766305685043335,
             0.02471366710960865,
             -0.0037767395842820406,
             0.9887216687202454,
         );
         xrDevice.controllers.left.position.set(-0.15649, 1.43474, -0.38368);
         xrDevice.controllers.left.quaternion.set(
             0.14766305685043335,
             0.02471366710960865,
             -0.0037767395842820406,
             0.9887216687202454,
         );
         new DevUI(xrDevice);
      }

      const session = await getXRSession(navigator.xr);

      await onSessionStarted(session);

      // Set camera position
      // camera.position.z = 0;
      camera.position.y = 0;

      player.position.z = camera.position.z;
      player.position.y = camera.position.y;

      const initSceneDataIn = {
         "events": [
            {
               "action": "play_sounds"
            }
         ]
      }

      // updateScene(currentSession, delta, time, initSceneDataIn, null);

      video.play();

      render(renderer);

      // container.style = `display: block; color: #FFF; font-size: 24px; text-align: center; background-color: #000; height: 100vh; max-width: ${previewWindow.width}px; max-height: ${previewWindow.height}px; overflow: hidden;`;
      xr_button.innerHTML = "Reload";
      xr_button.onclick = function () {
         xr_button.disabled = true;
         window.location.reload();
      };
   });

   function init() {

      const body = document.body,
          container = document.createElement('div');
      container.style = `display: block; background-color: #000; max-width: ${previewWindow.width}px; max-height: ${previewWindow.height}px; overflow: hidden;`;
      body.appendChild(container);

      console.log(container);

      const canvas= window.document.createElement('canvas');

      canvas.addEventListener("webglcontextlost", (event) => {
         /* The context has been lost but can be restored */
         event.canceled = true;

         console.log("webglcontextlost");
      });

      /* When the GL context is reconnected, reload the resources for the
         current scene. */
      canvas.addEventListener("webglcontextrestored", (event) => {
         // ... loadSceneResources(currentScene);

         console.log("webglcontextrestored");
      });


      // const container = document.getElementById( 'container' );
      container.addEventListener( 'click', function () {

         video.play();

      } );

      clock = new THREE.Clock();

      camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
      camera.layers.enable( 1 ); // render left view when no stereo available

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( previewWindow.width, previewWindow.height);
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType( 'local' );
      container.appendChild( renderer.domElement );

      window.addEventListener( 'resize', onWindowResize, false );

      // video

      const video = document.getElementById( 'video' );
      // video.play();

      const texture = new THREE.Texture( video );

      setInterval( function () {

         if ( video.readyState >= video.HAVE_CURRENT_DATA ) {

            texture.needsUpdate = true;

         }

      }, 1000 / 24 );

      scene = new THREE.Scene();
      // scene.background = new THREE.Color( 0x101010 );

      player = new THREE.Group();
      scene.add(player);

      const controllerModelFactory = new XRControllerModelFactory();
      const controllers = {
         left: null,
         right: null,
      };

      for (let i = 0; i < 2; i++) {
         const raySpace = renderer.xr.getController(i);
         const gripSpace = renderer.xr.getControllerGrip(i);
         const mesh = controllerModelFactory.createControllerModel(gripSpace);

         gripSpace.add(mesh);

         gripSpace.addEventListener('connected', (e) => {

            raySpace.visible = true;
            gripSpace.visible = true;
            const handedness = e.data.handedness;
            controllers[handedness] = {
               gamepad: new GamepadWrapper(e.data.gamepad),
               raySpace,
               gripSpace,
               mesh
            };
         });

         gripSpace.addEventListener('disconnected', (e) => {
            raySpace.visible = false;
            gripSpace.visible = false;
            const handedness = e.data.handedness;
            controllers[handedness] = null;
         });

         player.add(raySpace, gripSpace);
         // raySpace.visible = false;
         // gripSpace.visible = false;
      }

      // left

      // const geometry1 = new SphereGeometry( 500, 60, 40 );
      const geometry1 = new PlaneGeometry( 5, videoHeight / videoWidth * 5, 60, 40 );
      // invert the geometry on the x-axis so that all of the faces point inward
      // geometry1.scale( - 1, 1, 1 );
      geometry1.translate(videoReducer, 0, -5)

      const uvs1 = geometry1.attributes.uv.array;

      for ( let i = 0; i < uvs1.length; i += 2 ) {

         uvs1[ i ] *= 0.5;

      }

      const material1 = new THREE.MeshBasicMaterial( { map: texture } );

      const mesh1 = new THREE.Mesh( geometry1, material1 );
      // mesh1.rotation.y = - Math.PI / 2;
      mesh1.layers.set( 1 ); // display in left eye only
      scene.add( mesh1 );

      // right
 
      // const geometry2 = new SphereGeometry( 500, 60, 40 );
      const geometry2 = new PlaneGeometry( 5, videoHeight / videoWidth * 5, 60, 40 );
      // geometry2.scale( - 1, 1, 1 );
      geometry2.translate(-videoReducer, 0, -5)

      const uvs2 = geometry2.attributes.uv.array;

      for ( let i = 0; i < uvs2.length; i += 2 ) {

         uvs2[ i ] *= 0.5;
         uvs2[ i ] += 0.5;

      }

      const material2 = new THREE.MeshBasicMaterial( { map: texture } );

      const mesh2 = new THREE.Mesh( geometry2, material2 );
      // mesh2.rotation.y = - Math.PI / 2;
      mesh2.layers.set( 2 ); // display in right eye only
      scene.add( mesh2 );

      // document.body.appendChild( VRButton.createButton( renderer ) );
      // document.body.appendChild( XRButton.createButton( renderer ) );
      document.body.appendChild(xr_button);

      xr_button.innerHTML = "Enter XR";
      xr_button.style.opacity = 0.75;
      xr_button.disabled = false;
      delete xr_button.disabled;

   }

   init();
   animate();

}, 533);
