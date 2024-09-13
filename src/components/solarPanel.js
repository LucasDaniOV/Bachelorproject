import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

import * as THREE from 'three';

const loader = new GLTFLoader();

let solarPanelModel;
let worldup = new THREE.Vector3();

// loader.load(
//   'assets/Solar battery.glb',
//   function (gltf) {
//     solarPanelModel = gltf.scene;
//     scene.add(solarPanelModel);

//     solarPanelModel.position.set(0, 2, 0);
//     solarPanelModel.scale.set(0.01, 0.01, 0.01);

//     console.log(solarPanelModel);

//     const transformControls = new TransformControls(
//       camera,
//       renderer.domElement
//     );
//     transformControls.attach(solarPanelModel);
//     transformControls.setMode('rotate');
//     scene.add(transformControls);

//     // Prevent OrbitControls from interfering with TransformControls
//     transformControls.addEventListener('dragging-changed', function (event) {
//       orbitControls.enabled = !event.value;
//     });

//     // Create a new Box3 instance
//     const boundingBox = new THREE.Box3().setFromObject(solarPanelModel);

//     // Get the size of the bounding box
//     const size = new THREE.Vector3();
//     boundingBox.getSize(size); // size now contains the width, height, depth

//     // Get the center of the bounding box
//     const center = new THREE.Vector3();
//     boundingBox.getCenter(center); // center now contains the coordinates of the center

//     // Log the results
//     // console.log('Bounding Box Min:', boundingBox.min);
//     // console.log('Bounding Box Max:', boundingBox.max);
//     // console.log('Model Size (Width, Height, Depth):', size);
//     // console.log('Model Center:', center);
//   },
//   undefined,
//   function (error) {
//     console.error(error);
//   }
// );

function createSolarPanel() {
  // Step 2: Create the Cylinder (Bone)
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 5, 16); // radiusTop, radiusBottom, height, radialSegments
  const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(0, 2.5, -100);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('assets/SolarPanel003_1K-JPG_Color.jpg');
  const rectangleGeometry = new THREE.PlaneGeometry(4, 4); // width, height
  const rectangleMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);

  rectangle.position.y = 5; // Move rectangle to the top of the cylinder
  rectangle.receiveShadow = true;

  cylinder.add(rectangle); // Attach rectangle tocylinder

  return cylinder;
}

// function createSolarPanel() {
//   const textureLoader = new THREE.TextureLoader();
//   const texture = textureLoader.load('assets/SolarPanel003_1K-JPG_Color.jpg');
//   const geometry = new THREE.BoxGeometry(10, 10, 10);

//   // Assign names for each side (6 faces)
//   const materials = [
//     new THREE.MeshBasicMaterial({ color: 0x00ff00, name: 'front' }), // Back
//     new THREE.MeshStandardMaterial({ map: texture, name: 'back' }), // Front
//     new THREE.MeshBasicMaterial({ color: 0x0000ff, name: 'left' }), // Left
//     new THREE.MeshBasicMaterial({ color: 0xffff00, name: 'right' }), // Right
//     new THREE.MeshBasicMaterial({ color: 0xff00ff, name: 'top' }), // Top
//     new THREE.MeshBasicMaterial({ color: 0x00ffff, name: 'bottom' }), // Bottom
//   ];

//   const materialWithTexture = new THREE.MeshStandardMaterial({ map: texture });

//   // Create mesh with different materials for each side
//   const cube = new THREE.Mesh(geometry, materials);
//   scene.add(cube);
//   cube.position.set(0, 5, 10);
// }

// const timeSlider = document.getElementById('timeSlider');

// timeSlider.addEventListener('input', () => {
//   let timeOfDay = parseFloat(timeSlider.value);
//   updateSunPosition(timeOfDay); // Update the sun's position based on slider value
// });

export { createSolarPanel };
