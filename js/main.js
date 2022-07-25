var scene = new THREE.Scene();
// camera params: fov, aspect, near plane, far plane
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// renderer (webGL) params: anti alias
var renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setClearColor("#e5e5e5"); // light gray
renderer.setSize(window.innerWidth, window.innerWidth);

// create a canvas with prev settings
document.body.appendChild(renderer.domElement);

// listen to window resize event
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerWidth);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectMatrix();
});

renderer.render(scene, camera);