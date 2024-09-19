import {
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
} from 'three';

const radius = 300;

function createSunLight() {
  const sunLight = new DirectionalLight(0xffffff, 1);
  sunLight.position.set(radius, 0, 0);
  return sunLight;
}

function createSunMesh() {
  const sunGeometry = new SphereGeometry(10, 32, 32);
  const sunMaterial = new MeshBasicMaterial({ color: 0xffdd44 });
  const sunMesh = new Mesh(sunGeometry, sunMaterial);
  sunMesh.position.set(radius, 0, 0);
  return sunMesh;
}

function updateSunPosition(sunLight, sunMesh, timeOfDay) {
  const angle = Math.PI * timeOfDay; // calculate angle based on time of day (0 - 2)

  // Update sun position in the sky (circular arc)
  const sunX = radius * Math.cos(angle); // x-axis (left to right movement)
  const sunY = radius * Math.sin(angle); // y-axis (up and down movement)

  sunLight.position.set(sunX, sunY, 100);
  sunMesh.position.set(sunX, sunY, 100);

  const intensity = Math.max(0.1, sunY / radius); // max intensity at noon, 0.1 at lowest
  sunLight.intensity = intensity;
}

export { createSunLight, createSunMesh, updateSunPosition };
