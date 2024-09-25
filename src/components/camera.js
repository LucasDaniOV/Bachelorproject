import { PerspectiveCamera } from 'three';

function createCamera() {
    const camera = new PerspectiveCamera(
        75, // fov
        window.innerWidth / window.innerHeight, // aspect ratio
        0.1, // near clipping plane
        1000 // far clipping plane
    );

    camera.position.set(0, 250, 250);
    camera.lookAt(0, 0, 0);

    return camera;
}

export { createCamera };
