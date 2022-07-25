var scene = new THREE.Scene();
// camera params: fov, aspect, near plane, far plane
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// set camera position on the z axis
camera.position.z = 5;
// renderer (webGL) params: anti alias
var renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setClearColor("#e5e5e5"); // light gray
renderer.setSize(window.innerWidth, window.innerHeight);

// create a canvas with prev settings
document.body.appendChild(renderer.domElement);

// listen to window resize event
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

var geometry = new THREE.SphereGeometry(1, 100, 100);
var material = new THREE.MeshLambertMaterial({color: 0xFFCC00});
var mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);
renderer.render(scene, camera);