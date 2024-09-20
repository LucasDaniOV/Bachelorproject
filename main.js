import { GUI } from 'dat.gui';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createCamera } from './src/components/camera';
import { createScene } from './src/components/scene';
import {
  createSunLight,
  createSunMesh,
  updateSunPosition,
} from './src/components/sun';

const scene = createScene();
const camera = createCamera();
const renderer = new THREE.WebGLRenderer();

const controls = new MapControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.maxDistance = 500;
controls.minDistance = 50;
controls.maxTargetRadius = 500;

const gltfLoader = new GLTFLoader();
const fontLoader = new FontLoader();
const textureLoader = new THREE.TextureLoader();

const gui = new GUI();

let info = {
  latitude: 50,
  longitude: 5,
};

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

function loadGrassland() {
  gltfLoader.load(
    'assets/models/grassland.glb',
    function (gltf) {
      let ground = gltf.scene;
      ground.scale.set(7.5, 7.5, 7.5);

      scene.add(ground);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function loadNavigation() {
  fontLoader.load('fonts/Roboto_Regular.json', function (font) {
    // Define the text geometries

    const size = 25;

    const geometries = {
      N: new TextGeometry('N', {
        font: font,
        size: size,
        depth: 5, // Optional: Adds depth to the text
        curveSegments: 12, // Optional: For smooth curves
        bevelEnabled: true, // Optional: Adds a bevel to the text
        bevelThickness: 2, // Optional: Bevel thickness
        bevelSize: 1, // Optional: Bevel size
        bevelOffset: 0, // Optional: Bevel offset
        bevelSegments: 5, // Optional: Bevel segments
      }),
      E: new TextGeometry('E', {
        font: font,
        size: size,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5,
      }).rotateY(-Math.PI / 2),
      S: new TextGeometry('S', {
        font: font,
        size: size,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5,
      }).rotateY(Math.PI),
      W: new TextGeometry('W', {
        font: font,
        size: size,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5,
      }).rotateY(Math.PI / 2),
    };

    // Define a material
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

    // Create and position each text mesh
    const positions = {
      N: new THREE.Vector3(-size / 2, 50, -300),
      E: new THREE.Vector3(300, 50, -size / 2),
      S: new THREE.Vector3(size / 2, 50, 300),
      W: new THREE.Vector3(-300, 50, size / 2),
    };

    Object.keys(geometries).forEach((key) => {
      const textMesh = new THREE.Mesh(geometries[key], material);
      textMesh.position.copy(positions[key]);
      scene.add(textMesh);
    });
  });
}

function loadHouse() {
  gltfLoader.load(
    'assets/models/modern_house_low_poly.glb',
    function (gltf) {
      let model = gltf.scene;
      model.scale.set(15, 15, 15);
      model.rotateY(-Math.PI / 2);
      model.position.y += 1;
      scene.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function addRoofSolarPanel() {
  const colorTexture = textureLoader.load(
    'assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_Color.jpg'
  );
  const normalTexture = textureLoader.load(
    'assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_NormalDX.jpg'
  ); // or NormalGL
  const roughnessTexture = textureLoader.load(
    'assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_Roughness.jpg'
  );
  const metalnessTexture = textureLoader.load(
    'assets/textures/solar_panel_poly/SolarPanel001_1K-JPG_Metalness.jpg'
  );

  const panelMaterial = new THREE.MeshStandardMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    metalnessMap: metalnessTexture,
    roughness: 0.5,
    metalness: 0.5,
  });

  const cubeGeometry = new THREE.BoxGeometry(50, 75, 5);

  const cubeMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Right face (positive x)
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Left face (negative x)
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Top face (positive y)
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Bottom face (negative y)
    panelMaterial,
    new THREE.MeshStandardMaterial({ color: 0x808080 }), // Back face (negative z)
  ];
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
  cube.castShadow = true;
  cube.receiveShadow = true;

  const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 30, 32);
  const cylinderMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

  cylinder.position.set(40, 100, -45);
  cylinder.add(cube);
  cube.position.set(0, 17, 0);
  cube.rotateX(-Math.PI / 2);

  cylinder.castShadow = true;
  cylinder.receiveShadow = true;

  scene.add(cylinder);

  let params = {
    tilt: 0,
    azimuth: 0,
  };

  const panelFolder = gui.addFolder('Solar Panel');
  panelFolder
    .add(params, 'tilt', 0, 90)
    .name('Tilt Angle')
    .onChange((value) => {
      params.tilt = value;
      cube.rotation.x = -Math.PI / 2 - THREE.MathUtils.degToRad(value);
    });

  panelFolder
    .add(params, 'azimuth', 0, 360)
    .name('Azimuth Angle')
    .onChange((value) => {
      params.azimuth = value;
      cylinder.rotation.y = -THREE.MathUtils.degToRad(value);
    });
}

function createSun() {
  const sunLight = createSunLight();
  const sunMesh = createSunMesh();
  scene.add(sunLight);
  scene.add(sunMesh);
  updateSunPosition(sunLight, sunMesh, 0);

  const sunFolder = gui.addFolder('Time');
  const params = {
    hour: 0,
  };
  sunFolder
    .add(params, 'hour', 0, 24)
    .name('Hour')
    .onChange((value) => {
      updateSunPosition(sunLight, sunMesh, value);
    });
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      info.latitude = position.coords.latitude;
      info.longitude = position.coords.longitude;
    });
  }

  const locationFolder = gui.addFolder('Location');
  locationFolder
    .add(info, 'latitude')
    .name('Latitude')
    .listen()
    .onChange((value) => {
      info.latitude = value;
    });
  locationFolder
    .add(info, 'longitude')
    .name('Longitude')
    .listen()
    .onChange((value) => {
      info.longitude = value;
    });
}

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  getLocation();
  createSun();
  loadGrassland();
  loadNavigation();
  loadHouse();
  addRoofSolarPanel();

  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);
}

init();
