import * as THREE from 'three';

import { XRDevice, metaQuest3 } from 'iwer';
import { DevUI } from '@iwer/devui';
import { GamepadWrapper } from 'gamepad-wrapper';
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory";

import { HTMLMesh } from "three/addons/interactive/HTMLMesh";
import Stats from "three/addons/libs/stats.module";

// These definition make it possible to try different version THREE in the package deps
const PlaneGeometry = ("PlaneBufferGeometry" in THREE) ?
    THREE.PlaneBufferGeometry : THREE.PlaneGeometry;

const SphereGeometry = ("SphereBufferGeometry" in THREE) ?
    THREE.SphereBufferGeometry : THREE.SphereGeometry;

let currentSession = null;
let initXRLayers = true;

setTimeout(function init () {

    console.log("Initiate WebXR Layers scene!");

    let camera, renderer, player, video, videoLayerManager;

    const body = document.body;

    const container = document.createElement('div');

    body.appendChild(container);

    const clock = new THREE.Clock();

    const canvas = window.document.createElement('canvas');

    const previewWindow = {
        width: window.innerWidth, // / 2, // 640,
        height: window.innerHeight + 10, // 480,
    };
    container.style = `display: block; background-color: #000; max-width: ${previewWindow.width}px; max-height: ${previewWindow.height}px; overflow: hidden;`;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( previewWindow.width, previewWindow.height);
    // renderer.setClearAlpha( 1 );
    // renderer.setClearColor( new THREE.Color( 0 ), 0 );
    // renderer.setSize( previewWindow.innerWidth, previewWindow.innerHeight );
    // These are deprecated but still work
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.outputEncoding = THREE.LinearEncoding;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');

    container.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 70, previewWindow.width / previewWindow.height, 1, 2000 );
    camera.layers.enable( 1 ); // render left view when no stereo available
    // camera.position.set(0.0, 0.0, 0.0);

    window.addEventListener('resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }, false);

    player = new THREE.Group();

    const scene = new THREE.Scene();
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
            // const handedness = e.data.handedness;
            // controllers[handedness] = null;
            for (const h in controllers) {
                if (controllers[h] !== null) controllers[h] = null;
            }
        });

        player.add(raySpace, gripSpace);
        // raySpace.visible = false;
        // gripSpace.visible = false;
    }

    // Setup Stats
    const stats = new Stats();
    stats.showPanel(0);
    stats.dom.style.maxWidth = "100px";
    stats.dom.style.minWidth = "100px";
    stats.dom.style.backgroundColor = "black";
    document.body.appendChild(stats.dom);

    const statsMesh = new HTMLMesh( stats.dom );
    // statsMesh.position.x = -1.5;
    // statsMesh.position.y = 0.5;
    // statsMesh.position.z = -2.0;
    statsMesh.position.set(-1.5, 0.5, -2.0);
    statsMesh.rotation.y = Math.PI / 4;
    statsMesh.scale.setScalar(4);
    statsMesh.material.colorWrite = true;
    statsMesh.material.transparent = false;

    // video

    const videoWidth = 2064;
    const videoHeight = 2208;
    const videoReducer = 0.090579710;

    video = document.getElementById( 'video' );
    // document.body.appendChild(video);
    // video.loop = true;
    // video.src = 'assets/videos/Lake_Champlain.webm';
    // video.src = 'assets/videos/Lake_Champlain.mp4';
    // video.width = previewWindow.width;
    // video.height = previewWindow.height;
    // video.play();

    container.addEventListener( 'click', function () {
        video.play();
    });

    function setupEnvironment (renderer, scene, videoLayerManager) {

        scene.add(player);

        scene.add(statsMesh);

        videoLayerManager.initVideoLayer(false);

        renderer.setAnimationLoop(function render (t, frame ) {

            const xr = renderer.xr;
            const gl = renderer.getContext();

            Object.values(controllers).forEach((controller) => {
                if (controller?.gamepad) {
                    controller.gamepad.update();
                }
            });

            stats.begin();

            let guiLayer,
                equirectLayer,
                quadLayerPlain,
                quadLayerMips,
                quadLayerVideo;

            if (
                currentSession !== null
                && currentSession.renderState.layers !== undefined
                && currentSession.hasMediaLayer === undefined
                && initXRLayers && (
                    typeof XRWebGLBinding !== 'undefined'
                    && 'createProjectionLayer' in XRWebGLBinding.prototype
                )
            ) {

               currentSession.hasMediaLayer = true;

               console.log("Set media layer to true on currentSession:", currentSession);

               console.log("Make gl context XR compatible: ", gl.makeXRCompatible);

               gl.makeXRCompatible().then(() => {

                  const glBinding = xr.getBinding(); // returns XRWebGLBinding

                   currentSession.requestReferenceSpace('local-floor').then((refSpace) => {

                     // // Create Quad layers for Snellen chart.
                     // const quadLayerConfig = {
                     //    width: snellenConfig.quadWidth,
                     //    height: snellenConfig.quadHeight,
                     //    viewPixelWidth: snellenConfig.textureSizePx,
                     //    viewPixelHeight: snellenConfig.textureSizePx,
                     //    isStatic: true,
                     //    space: refSpace,
                     //    layout: 'mono',
                     //    transform: new XRRigidTransform( {
                     //       x: snellenConfig.x - snellenConfig.widthMeters,
                     //       y: snellenConfig.y + snellenConfig.heightMeters,
                     //       z: snellenConfig.z
                     //    } )
                     // };
                     //
                     // quadLayerPlain = glBinding.createQuadLayer( quadLayerConfig );
                     //
                     // quadLayerConfig.mipLevels = 3;
                     // quadLayerConfig.transform = new XRRigidTransform({
                     //    x: snellenConfig.x + snellenConfig.widthMeters,
                     //    y: snellenConfig.y + snellenConfig.heightMeters,
                     //    z: snellenConfig.z
                     // });
                     // quadLayerMips = glBinding.createQuadLayer( quadLayerConfig );

                     // Create GUI layer.
                     guiLayer = glBinding.createQuadLayer({
                        width: statsMesh.geometry.parameters.width,
                        height: statsMesh.geometry.parameters.height,
                        viewPixelWidth: statsMesh.material.map.image.width,
                        viewPixelHeight: statsMesh.material.map.image.height,
                        space: refSpace,
                        transform: new XRRigidTransform(statsMesh.position, statsMesh.quaternion)
                     });

                     let videoAngle = 96; // 110;
                     let videoLayout = "stereo-left-right";
                     let eqrtRadius = 10;
                     const videoWidth = 2064;
                     const videoHeight = 2208;
                     const videoReducer = 0.00090579710;

                     // Create background EQR video layer.
                     const mediaBinding = new XRMediaBinding(currentSession);

                    //  console.log("Create XREquirectLayer with XRMediaBinding");
                    //  equirectLayer = mediaBinding.createEquirectLayer(
                    //      video,
                    //      {
                    //         // layout: 'stereo-left-right',
                    //         layout: videoLayout,
                    //         viewPixelWidth: videoWidth / (videoLayout === "stereo-left-right" ? 2 : 1),
                    //         viewPixelHeight: videoHeight / (videoLayout === "stereo-top-bottom" ? 2 : 1),
                    //         space: refSpace,
                    //         // // Rotate by 45 deg to avoid stereo conflict with the 3D geometry.
                    //         // transform: new XRRigidTransform(
                    //         //   {},
                    //         //   { x: 0, y: .28, z: 0, w: .96 }
                    //         // )
                    //         transform: new XRRigidTransform(
                    //             {x: 0, y: -5, z: -10},
                    //             // { x: -0.28, y: 0, z: 0, w: .96 }
                    //         )
                    //      }
                    //  );
                    //
                    // equirectLayer.centralHorizontalAngle = Math.PI * videoAngle / 180;
                    // equirectLayer.upperVerticalAngle = (Math.PI * videoAngle / 180) * 0.5; // Math.PI / 2.0 * 0.5;
                    // equirectLayer.lowerVerticalAngle = -(Math.PI * videoAngle / 180) * 0.5; // -Math.PI / 2.0 * 0.5;
                    // equirectLayer.radius = eqrtRadius;

                     console.log("Create XRQuadLayer with XRMediaBinding");
                     quadLayerVideo = mediaBinding.createQuadLayer(
                         video,
                         {
                            layout: 'stereo-left-right',
                            // layout: videoLayout,
                            // width: 3.73913,
                            width: videoWidth * videoReducer * 2,
                            // height: 4.0,
                            height: videoHeight * videoReducer * 2,
                            space: refSpace,
                            // // Rotate by 45 deg to avoid stereo conflict with the 3D geometry.
                            // transform: new XRRigidTransform(
                            //   {},
                            //   { x: 0, y: .28, z: 0, w: .96 }
                            // )
                            transform: new XRRigidTransform(
                                {x: 0, y: (videoHeight * videoReducer) / 2, z: -5},
                                {},
                                // { x: -0.28, y: 0, z: 0, w: .96 },
                                {}
                            )
                         }
                     );

                     currentSession.updateRenderState({
                        layers: (!!currentSession.renderState.layers.length > 0) ? [
                            quadLayerVideo,
                            // quadLayerPlain,
                            // quadLayerMips,
                            // equirectLayer,
                            guiLayer,
                            currentSession.renderState.layers[0]
                        ] : [
                            quadLayerVideo,
                            // equirectLayer,
                            guiLayer
                        ]
                     });

                  })
               });

            }

            // // Copy image to layers as required.
            // // needsRedraw is set on creation or if the underlying GL resources of a layer are lost.
            // if ( session && quadLayerPlain && quadLayerPlain.needsRedraw ) {
            //
            //    const glayer = xr.getBinding().getSubImage( quadLayerPlain, frame );
            //    renderer.state.bindTexture( gl.TEXTURE_2D, glayer.colorTexture );
            //    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
            //    gl.texSubImage2D( gl.TEXTURE_2D, 0,
            //        ( snellenConfig.textureSizePx - snellenConfig.widthPx ) / 2,
            //        ( snellenConfig.textureSizePx - snellenConfig.heightPx ) / 2,
            //        snellenConfig.widthPx, snellenConfig.heightPx,
            //        gl.RGBA, gl.UNSIGNED_BYTE, snellenTexture.image );
            //
            // }
            //
            // // Same as above but also gl.generateMipmap.
            // if ( session && quadLayerMips && quadLayerMips.needsRedraw ) {
            //
            //    const glayer = xr.getBinding().getSubImage( quadLayerMips, frame );
            //    renderer.state.bindTexture( gl.TEXTURE_2D, glayer.colorTexture );
            //    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
            //    gl.texSubImage2D( gl.TEXTURE_2D, 0,
            //        ( snellenConfig.textureSizePx - snellenConfig.widthPx ) / 2,
            //        ( snellenConfig.textureSizePx - snellenConfig.heightPx ) / 2,
            //        snellenConfig.widthPx, snellenConfig.heightPx,
            //        gl.RGBA, gl.UNSIGNED_BYTE, snellenTexture.image );
            //    gl.generateMipmap( gl.TEXTURE_2D );
            //
            // }

            if (currentSession !== null && !!guiLayer && (guiLayer.needsRedraw || guiLayer.needsUpdate)) {

               const glayer = xr.getBinding().getSubImage(guiLayer, frame);
               renderer.state.bindTexture(gl.TEXTURE_2D, glayer.colorTexture);
               gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
               const canvas = statsMesh.material.map.image;
               gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
               guiLayer.needsUpdate = false;

            }

            renderer.render(scene, camera);

            stats.end();

            statsMesh.material.map.update();
            // if (!!guiLayer) guiLayer.needsUpdate = true;
        });
    }

    function createVideoLayerManager (scene, vid) {

        const glVideoLayer = new THREE.Group();
        const xrVideoLayer = null;

        const texture = new THREE.Texture(vid);
        texture.colorSpace = THREE.SRGBColorSpace;

        let textureUpdateInterval = 0;

        let videoLayerInitialized = false;

        /*! TODO:
         * WebXRLayers (XRWebGLBinding, etc.) may not be available when Three.js
         * initializes rendering, so we need to have a way of continuously
         * detecting the environment and swapping out (i.e. GL layers v.s. XR layers)
         * rendering methods as needed at the appropriate time.
         */

        function initVideoLayer(withWebXRLayer = false) {

            if (!withWebXRLayer) {

                if (textureUpdateInterval < 1) {
                    textureUpdateInterval = setInterval(function () {
                        if (vid.readyState >= vid.HAVE_CURRENT_DATA) {
                            texture.needsUpdate = true;
                        }
                    }, 1000 / 24);
                }

                // left

                // const geometry1 = new SphereGeometry( 500, 60, 40 );
                const geometry1 = new PlaneGeometry(5, videoHeight / videoWidth * 5, 60, 40);
                // invert the geometry on the x-axis so that all of the faces point inward
                // geometry1.scale( - 1, 1, 1 );
                geometry1.translate(videoReducer, 0, -5)

                const uvs1 = geometry1.attributes.uv.array;

                for (let i = 0; i < uvs1.length; i += 2) {

                    uvs1[i] *= 0.5;

                }

                const material1 = new THREE.MeshBasicMaterial({map: texture});

                const mesh1 = new THREE.Mesh(geometry1, material1);
                // mesh1.rotation.y = - Math.PI / 2;
                mesh1.layers.set(1); // display in left eye only
                glVideoLayer.add(mesh1);

                // right

                // const geometry2 = new SphereGeometry( 500, 60, 40 );
                const geometry2 = new PlaneGeometry(5, videoHeight / videoWidth * 5, 60, 40);
                // geometry2.scale( - 1, 1, 1 );
                geometry2.translate(-videoReducer, 0, -5)

                const uvs2 = geometry2.attributes.uv.array;

                for (let i = 0; i < uvs2.length; i += 2) {

                    uvs2[i] *= 0.5;

                }

                const material2 = new THREE.MeshBasicMaterial({map: texture});

                const mesh2 = new THREE.Mesh(geometry2, material2);
                // mesh2.rotation.y = - Math.PI / 2;
                mesh2.layers.set(2); // display in right eye only
                glVideoLayer.add(mesh2);

                scene.add(glVideoLayer);

            } else {
            }

            videoLayerInitialized = true;
        }

        function clearVideoLayer (withWebXRLayer = false) {

            videoLayerInitialized = false;

            if (!withWebXRLayer) {
                scene.remove(glVideoLayer);
            }

            if (textureUpdateInterval > 0) {
                clearInterval(textureUpdateInterval);
            }

            textureUpdateInterval = 0;
        }

        return ({
            initVideoLayer,
            clearVideoLayer,
            glVideoLayer,
            xrVideoLayer,
            videoLayerInitialized
        });
    }

    videoLayerManager = createVideoLayerManager(scene, video);

    async function getXRSession (xr) {

        console.log("xr", `${JSON.stringify(xr)}`);

        let session = null;

        const useXRLayers =  initXRLayers && (typeof XRWebGLBinding !== 'undefined' && 'createProjectionLayer' in XRWebGLBinding.prototype);
        try {
            if (!useXRLayers) {
                session = await (xr.requestSession("immersive-vr", {
                    optionalFeatures: [
                        "local-floor"
                    ]
                }));
            } else {
                session = await (xr.requestSession("immersive-ar", {
                    optionalFeatures: [
                        // "bounded-floor",
                        // "hand-tracking",
                        "layers"
                    ],
                    requiredFeatures: [
                        // "webgpu",
                        "local-floor"
                    ]
                }));
            }
        } catch (e) {
            session = await (xr.requestSession("immersive-vr", {
                optionalFeatures: [
                    "local-floor"
                ]
            }));
        } finally {

            previewWindow.width = window.innerWidth;
            previewWindow.height = window.innerHeight;

            renderer.setSize(previewWindow.width, previewWindow.height);

            camera.aspect = previewWindow.width / previewWindow.height;
            camera.updateProjectionMatrix();

            session.requestReferenceSpace("local").then((xrReferenceSpace) => {
                session.requestAnimationFrame((time, xrFrame) => {
                    const viewer = xrFrame.getViewerPose(xrReferenceSpace);

                    const tick = time % 3333;

                    if (tick < 1) try {
                        for (const xrView of viewer.views) {
                            const xrViewport = XRWebGLLayer.getViewport(xrView);
                            console.log({
                                xrReferenceSpace,
                                xrView,
                                xrViewport
                            });
                        }
                    } catch (e) {
                        console.log({
                            error: e
                        });
                    }
                });
            });

            return session;
        }
    }

    async function onSessionStarted (session, config) {
        await renderer.xr.setSession(session, config.useXRLayers);
        currentSession = session;
        currentSession["config"] = config;
        currentSession.addEventListener("end", onSessionEnded);

        if (!!config && config.useXRLayers && !!config.videoLayerManager) { // && config.videoLayerManager.videoLayerInitialized) {
            // Transition to WebXRLayer
            config.videoLayerManager.clearVideoLayer(!config.useXRLayers);
            config.videoLayerManager.initVideoLayer(config.useXRLayers);
            config.videoLayerManager.videoLayerInitialized = true;
        }

        console.log("Init video layer: ", config.videoLayerManager.videoLayerInitialized)

        video.play();
    }

    function onSessionEnded (session) {

        const config = currentSession["config"];

        console.log("Ended WebXR session!", session, config);

        currentSession.removeEventListener("end", onSessionEnded);
        currentSession = null;

        if (videoLayerManager.videoLayerInitialized && !!config.videoLayerManager) {
            // Transition to WebGLLayer
            console.log("Clear video layer");
            config.videoLayerManager.clearVideoLayer(true);
            console.log("Init video layer");
            config.videoLayerManager.initVideoLayer(false);
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

        const useXRLayers =  initXRLayers && (typeof XRWebGLBinding !== 'undefined' && 'createProjectionLayer' in XRWebGLBinding.prototype);

        const session = await getXRSession(navigator.xr);

        await onSessionStarted(session, { useXRLayers, videoLayerManager });

        // Set camera position
        // camera.position.z = 0;
        camera.position.y = 0;

        player.position.z = camera.position.z;
        // player.position.y = camera.position.y;

        const initSceneDataIn = {
            "events": [
                {
                    "action": "play_sounds"
                }
            ]
        }

        // container.style = `display: block; color: #FFF; font-size: 24px; text-align: center; background-color: #000; height: 100vh; max-width: ${previewWindow.width}px; max-height: ${previewWindow.height}px; overflow: hidden;`;
        xr_button.innerHTML = "Reload";
        xr_button.onclick = function () {
            xr_button.disabled = true;
            window.location.reload();
        };
    });

    document.body.appendChild(xr_button);

    xr_button.innerHTML = "Enter XR";
    xr_button.style.opacity = 0.75;
    xr_button.disabled = false;
    delete xr_button.disabled;

    canvas.addEventListener("webglcontextlost", (event) => {
        /* The context has been lost but can be restored */
        event.canceled = true;

        console.log("webglcontextlost");
    });

    /* When the GL context is reconnected, reload the resources for the
       current scene. */
    canvas.addEventListener("webglcontextrestored", (event) => {
        // ... loadSceneResources(currentScene);
        setupEnvironment(renderer, scene, videoLayerManager);

        console.log("webglcontextrestored");
    });

    setupEnvironment(renderer, scene, videoLayerManager);

}, 533);
