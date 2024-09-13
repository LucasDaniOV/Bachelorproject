import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  TextureLoader,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function createGround() {
  // const geometry = new PlaneGeometry(500, 500);

  // const textureLoader = new TextureLoader();
  // const texture = textureLoader.load('assets/Grass001_1K-JPG_Color.jpg');

  // const material = new MeshStandardMaterial({
  //   map: texture,
  //   side: DoubleSide,
  // });

  // const ground = new Mesh(geometry, material);

  // // Rotate the floor to be horizontal (plane geometries are vertical by default)
  // ground.rotation.x = Math.PI / 2;

  // // Add shadow properties to the floor
  // ground.receiveShadow = true;

  // return ground;

  const loader = new GLTFLoader();
  loader.load(
    'assets/grassland.glb',
    function (gltf) {
      return gltf.scene;
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

export { createGround };
