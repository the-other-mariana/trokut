var scene = new THREE.Scene();
// camera params: fov, aspect, near plane, far plane
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// set camera position on the z axis
// the higher in z, the further it goes
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

const geometry = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
const vertices = new Float32Array( [
	-1.0, -1.0,  1.0,
	 1.0, -1.0,  1.0,
	 1.0,  1.0,  1.0,

	 1.0,  1.0,  1.0,
	-1.0,  1.0,  1.0,
	-1.0, -1.0,  1.0
] );

// itemSize = 3 because there are 3 values (components) per vertex
geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const mesh = new THREE.Mesh( geometry, material );

scene.add(mesh);

const vertices2 = [];

for ( let i = 0; i < 10000; i ++ ) {

	const x = randFloatSpread( 2000 );
	const y = randFloatSpread( 2000 );
	const z = randFloatSpread( 2000 );

	vertices2.push( x, y, z );

}

const geometry2 = new THREE.BufferGeometry();
geometry2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices2, 3 ) );

const material2 = new THREE.PointsMaterial( { color: 0x888888 } );

const points = new THREE.Points( geometry2, material2 );

scene.add( points );

// in order to see colors, we need light
// light params: color, intensity, distance
var light = new THREE.PointLight(0xFFFFFF, 1, 500);
// (x, y, z)
light.position.set(10, 0, 25);
scene.add(light);

renderer.render(scene, camera);