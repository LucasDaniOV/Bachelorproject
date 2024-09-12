import { AmbientLight } from 'three';

function createLight() {
  const light = new AmbientLight();
  return light;
}

export { createLight };
