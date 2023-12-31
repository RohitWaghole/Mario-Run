import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const jumpSound = new Audio("/sounds/jump.mp3");
const bgSound = new Audio("/sounds/bgMusic.mp3");
const gameOver = new Audio("/sounds/gameOver.mp3");
const click = new Audio("/sounds/click.mp3");

const init = () => {
  let isPaused = false;
  const cubeTexture = new THREE.CubeTextureLoader();
  const textureLoader = new THREE.TextureLoader();
  const gltfLoader = new GLTFLoader();

  document.getElementById("counter").style.display = "block";

  let mixer;
  let loadedModel;
  // gltfLoader.load("/models/glTF/Fox.gltf", (gltf) => {
  gltfLoader.load("/models/mario.glb", (gltf) => {
    loadedModel = gltf.scene;
    loadedModel.scale.set(0.16, 0.18, 0.18);
    loadedModel.position.x = -10;
    loadedModel.position.y = 0.01;
    loadedModel.rotation.y = Math.PI * 0.5;

    loadedModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });

    mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
    scene.add(gltf.scene);
  });

  // let first = true;
  // window.addEventListener("click", () => {
  //   if (first) {
  //     bgSound.loop = true;
  //     bgSound.play();
  //     first = false;
  //   }
  // });

  const jumpNow = () => {
    if (loadedModel && loadedModel.position.y <= 0.2) {
      jumpSound.volume = 0.7;
      jumpSound.currentTime = 0;
      jumpSound.play();
      gsap.to(loadedModel.position, { duration: 0.4, delay: 0, y: 3.5 });
      gsap.to(loadedModel.position, { duration: 0.4, delay: 0.4, y: 0 });
    }
  };

  const envMap = cubeTexture.load([
    "./environment/px.png",
    "./environment/nx.png",
    "./environment/py.png",
    "./environment/ny.png",
    "./environment/pz.png",
    "./environment/nz.png",
  ]);

  const groundColorTexture = textureLoader.load("/textures/ground/color.png");
  const groundAmbientOcclusionTexture = textureLoader.load(
    "/textures/ground/ao.png"
  );
  const groundHeightTexture = textureLoader.load(
    "/textures/ground/displacement.png"
  );
  const groundNormalTexture = textureLoader.load("/textures/ground/normal.png");
  const groundRoughnessTexture = textureLoader.load(
    "/textures/ground/roughness.png"
  );

  groundColorTexture.repeat.set(8, 8);
  groundAmbientOcclusionTexture.repeat.set(8, 8);
  groundNormalTexture.repeat.set(8, 8);
  groundRoughnessTexture.repeat.set(8, 8);
  groundColorTexture.wrapS = THREE.RepeatWrapping;
  groundAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
  groundNormalTexture.wrapS = THREE.RepeatWrapping;
  groundRoughnessTexture.wrapS = THREE.RepeatWrapping;
  groundColorTexture.wrapT = THREE.RepeatWrapping;
  groundAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
  groundNormalTexture.wrapT = THREE.RepeatWrapping;
  groundRoughnessTexture.wrapT = THREE.RepeatWrapping;

  const GUIControls = () => {
    const gui = new dat.GUI();

    // Camera
    gui
      .add(camera.position, "x")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("CameraPositionX");
    gui
      .add(camera.position, "y")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("CameraPositionY");
    gui
      .add(camera.position, "z")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("CameraPositionZ");

    // Diano
    gui
      .add(diano.position, "x")
      .min(-10)
      .max(15)
      .step(0.01)
      .name("DianoPositionX");
    gui
      .add(diano.position, "y")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("DianoPositionY");
    gui
      .add(diano.position, "z")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("DianoPositionZ");

    gui
      .add(myObj, "directionalLightStrength")
      .min(0)
      .max(4)
      .step(0.001)
      .name("DirectionalLightStrength")
      .onChange((value) => {
        directionalLight.intensity = value;
      });

    gui
      .add(myObj, "pointLightStrength")
      .min(0)
      .max(4)
      .step(0.001)
      .name("PointLightStrength")
      .onChange((value) => {
        pointLight.intensity = value;
      });

    gui
      .add(pointLight.position, "y")
      .min(0)
      .max(10)
      .step(0.01)
      .name("PointPosition");
  };

  // Cursor coordinates
  const cursor = {
    x: 0,
    y: 0,
  };

  window.addEventListener("mousemove", (event) => {
    cursor.x = -(event.clientX / sizes.width - 0.5);
    cursor.y = event.clientY / sizes.height - 0.5;
  });

  // Canvas
  const canvas = document.querySelector("canvas.webgl");

  // Scene
  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x87ceeb);

  const foggyBackground = () => {
    // scene.background = envMap;
    // scene.environment = envMap;
    const fogColor = new THREE.Color(0xf2f8f7); // Color of the fog
    // const fogColor = new THREE.Color(0x000033); // Color of the fog
    const fog = new THREE.Fog(fogColor, 30, 50);
    // const fog = new THREE.Fog(fogColor);
    // fog.far = 60;
    scene.fog = fog;
    // const fogDensity = 0.05; // Adjust this value to control the fog density
    // scene.background = fogColor;

    // scene.fog = new THREE.FogExp2(fogColor, fogDensity);
  };

  // Sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  let mesh = null;
  let meshPos = -3;
  // Creating a platform for the game
  const platform = () => {
    const material = new THREE.MeshStandardMaterial({
      map: groundColorTexture,
      transparent: true,
      aoMap: groundAmbientOcclusionTexture,
      displacementMap: groundHeightTexture,
      displacementScale: 0.1,
      normalMap: groundNormalTexture,
      roughnessMap: groundRoughnessTexture,
    });
    // material.color = new THREE.Color(0xff00ff);
    mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(130, 130), material);
    mesh.rotation.x = -Math.PI * 0.5;
    // mesh.rotation.z = Math.PI * 0.3;
    mesh.position.set(-3, -0.1, -30);
    mesh.receiveShadow = true;
    scene.add(mesh);
  };

  // Adding the dinosaur
  let diano;
  let box1;
  const dianosaur = () => {
    const material = new THREE.MeshStandardMaterial({ color: "#0000ff" });
    diano = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, 2), material);
    diano.position.x = -10;
    diano.position.y = 1.0001;
    diano.castShadow = true;
    // scene.add(diano);
  };

  const jumpOnClick = (event) => {
    if (event.keyCode === 32) {
      jumpNow();
    }
    // if (event.keyCode === 32 && diano.position.y <= 1.1) {
    // gsap.to(diano.position, { duration: 0.5, delay: 0, y: 6 });
    // gsap.to(diano.position, { duration: 0.9, delay: 0.4, y: 1.0001 });
    // }
    // console.log(x);
  };
  window.addEventListener("keydown", jumpOnClick);

  let bush = "/models/trees/glb/Standard/Bush.glb";
  let cactus = "/models/trees/glb/Standard/Cactus.glb";
  let spruce = "/models/trees/glb/Standard/Spruce.glb";
  let palm = "/models/trees/glb/Standard/Palm.glb";
  let tree = "/models/trees/glb/Standard/tree.glb";
  const arrayOfStrings = [bush, cactus];

  const target = new THREE.Object3D();
  target.position.x = -9;
  scene.add(target);

  // Wrap the createObstacle function in a promise
  const createObstacle = (x, y) => {
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        y,
        (gltf) => {
          const obst = gltf.scene;
          // obst.position.y = 0.5;
          obst.position.x = x;
          obst.scale.set(0.7, 0.7, 0.7);
          obst.receiveShadow = true;
          obst.visible = false;
          scene.add(obst);
          resolve(obst);
        },
        undefined,
        reject
      );
    });
  };

  const obstacles = [];
  let currentX = 60;

  // Create an array of promises for loading obstacles
  const obstaclePromises = [];

  for (let i = 0; i < 10; i++) {
    // Generate a random index
    const randomIndex = Math.floor(Math.random() * arrayOfStrings.length);

    // Use the random index to select a random element
    const y = arrayOfStrings[randomIndex];
    obstaclePromises.push(createObstacle(i * 15 + 60, y));
  }
  Promise.all(obstaclePromises)
    .then((obstacleObjects) => {
      // All obstacles have been loaded and added to the scene
      obstacles.push(...obstacleObjects);
    })
    .catch((error) => {
      console.error("Error loading obstacles:", error);
    });

  // Background objects
  let bgObjects = [];
  const backgroundObjects = () => {
    // let objs = [spruce, palm, spruce, spruce, palm];
    let objs = [
      spruce,
      palm,
      spruce,
      spruce,
      palm,
      spruce,
      palm,
      palm,
      spruce,
      palm,
      spruce,
    ];
    for (let i = 0; i < objs.length; i++) {
      // make threejs objects from it and add to bgObjects
      gltfLoader.load(objs[i], (gltf) => {
        gltf.scene.position.x = Math.random() * 120 - 60;
        // gltf.scene.position.x = 25 - 10 * Math.random() * Math.random();
        gltf.scene.position.z = -5 * Math.random() * 7 - 3;
        gltf.scene.visible = false;

        gltf.scene.scale.y = 1 + Math.random();
        bgObjects.push(gltf.scene);
        console.log(gltf.scene.scale);
        scene.add(gltf.scene);
      });
    }
  };
  backgroundObjects();
  // console.log(bgObjects);

  // Lights
  let myObj = { directionalLightStrength: 0.859, pointLightStrength: 2.636 };
  // let myObj = { directionalLightStrength: 0.165, pointLightStrength: 1 };
  let directionalLight;
  let pointLight;
  const lights = () => {
    const ambientLight = new THREE.AmbientLight();
    ambientLight.color = new THREE.Color(0xffffff);
    ambientLight.intensity = 0.4;
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(
      "#ffffff",
      myObj.directionalLightStrength
    );
    directionalLight.castShadow = true;
    directionalLight.position.set(-10, 5, -2);

    directionalLight.target.position.copy(target.position);
    directionalLight.target.updateMatrixWorld();

    pointLight = new THREE.PointLight("#ffffff", myObj.pointLightStrength, 5);
    pointLight.position.set(-9.5, 3.12, 2);

    scene.add(directionalLight, pointLight);
  };

  const Helper = (light) => {
    const lightHelper = new THREE.DirectionalLightHelper(light);
    const axesHelper = new THREE.AxesHelper();
    scene.add(lightHelper, axesHelper);

    lightHelper.visible = false;
    axesHelper.visible = false;
  };
  let clouds;
  const addClouds = () => {
    const skyGeometry = new THREE.SphereGeometry(70, 32, 32); // Adjust the radius and segments as needed
    const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb }); // White color for the sky
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    const cloudTexture = new THREE.TextureLoader();
    const cloudTex = cloudTexture.load("/textures/cloud/cloud1.png");
    const cloudAlpha = cloudTexture.load("/textures/cloud/cloud.png");

    const cloudGeometry = new THREE.BufferGeometry();
    const cloudMaterial = new THREE.PointsMaterial({
      size: 15, // Adjust the size of the clouds
      map: cloudTex,
      transparent: true,
      depthWrite: false,
      // alphaMap: cloudAlpha,
    });

    const cloudCount = 500; // Number of clouds
    const cloudPositions = [];

    for (let i = 0; i < cloudCount; i++) {
      const x = Math.random() * 100 - 50 * Math.random(); // Random x position within the sky sphere
      const y = 10 + Math.random() * 50; // Random y position within the sky sphere
      const z = Math.random() * 100 - 50 * Math.random(); // Random z position within the sky sphere

      cloudPositions.push(x, y, z);
    }

    cloudGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(cloudPositions, 3)
    );

    clouds = new THREE.Points(cloudGeometry, cloudMaterial);
    sky.add(clouds); // Add the cloud particle system to the sky sphere
  };
  // foggyBackground();
  platform();
  lights();
  dianosaur();
  Helper(directionalLight);
  addClouds();
  // Adding resizer for window width changes
  window.addEventListener("resize", () => {
    // Updating the sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Updating camera aspects
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Updating renderer
    renderer.setSize(sizes.width, sizes.height);

    // Limiting the pixel ratios
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Making full screen by listening to double click event
  window.addEventListener("dblclick", () => {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  const camera = new THREE.PerspectiveCamera(
    60,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.set(
    -13.957898269207469,
    1.7511648611840926,
    10.807500813044665
  );
  // camera.position.set(
  //   -12.31767822798404,
  //   4.612303161761068,
  //   11.903488518262558
  // );

  scene.add(camera);
  // window.addEventListener("click", () => {
  //   console.log(camera.position);
  // });

  //Ordbit controllers controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  // Limiting the pixel ratios
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 3;

  // Orbit control to the camera

  const clock = new THREE.Clock();
  let previousTime = 0;
  let obstacle;
  let bgObj;
  let countScore = 0;
  let increaser = 0;
  const tick = () => {
    if (!isPaused) {
      clouds.position.x -= 0.01;
      increaser = increaser + 0.1;
      if (increaser >= 1) {
        increaser = 0;
        countScore++;
      }
      document.getElementById("counter").innerHTML = countScore;
      for (let i = 0; i < obstacles.length; i++) {
        obstacle = obstacles[i];
        if (obstacle.position.x < 50) {
          obstacle.visible = true;
        } else {
          obstacle.visible = false;
        }

        obstacle.position.x -= 0.22; // Adjust the speed as needed
        // Check if the cube has reached its destination
        if (obstacle.position.x < -70 || i === obstacles.length - 1) {
          // Remove the cube from the scene
          obstacle.position.x = 60;
        }
        if (loadedModel) {
          const box1 = new THREE.Box3().setFromObject(loadedModel);
          const box2 = new THREE.Box3().setFromObject(obstacle);
          if (box1.intersectsBox(box2)) {
            // console.log("Collision detected!");
            bgSound.pause();
            gameOver.currentTime = 0;
            gameOver.play();
            isPaused = true;
            document.getElementById("counter").style.display = "none";
            document.getElementById("myscore").innerHTML =
              "Score: " + countScore;

            const getCanvas = document.getElementsByClassName("webgl");
            const gameOverScreen = document.getElementById("closingContainer");
            gameOverScreen.style.display = "block";
          }
        }
      }
      for (let i = 0; i < bgObjects.length; i++) {
        bgObj = bgObjects[i];

        if (bgObj.position.x < 70) {
          bgObj.visible = true;
        } else {
          bgObj.visible = false;
        }
        bgObj.position.x -= 0.09;
        if (bgObj.position.x < -30) {
          bgObj.position.x = 60;
          bgObj.scale.y = 1 + Math.random();
          bgObj.position.z = -3 * Math.random() * 10 - 3;
        }
      }

      mesh.position.x = meshPos;
      meshPos -= 0.09;
      // if (meshPos < -15.55) {
      if (meshPos < -19.25) {
        meshPos = -3;
      }

      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      if (mixer) {
        mixer.update(deltaTime);
      }

      // Update controls
      controls.update();
      // Renderer
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }
  };
  controls.enableRotate = false;

  tick();
  // GUIControls();
};

// init();

const btnOpen = document.querySelector("#button");
btnOpen.addEventListener("click", () => {
  click.play();
  const container = document.getElementById("container");
  container.style.display = "none";
  bgSound.loop = true;
  bgSound.play();
  init();
});

const btnClose = document.querySelector("#btn");
btnClose.addEventListener("click", () => {
  click.play();
  const container = document.getElementById("closingContainer");
  container.style.display = "none";
  gameOver.pause();
  bgSound.currentTime = 0;
  bgSound.loop = true;
  bgSound.play();
  init();
});
