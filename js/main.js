var objIndex = 0;
var zPos = 1.0;
var g_verts = [[]];
var g_transforms = [[]];

var mode = "normal";

function getNewTransformMatrix(){
    var transformMatrix = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);
    return transformMatrix;
}

function initTransforms(){
    g_transforms.push([]);
    // for an objIndex, init all its inside matrices
    for(var i = 0; i < 7; i++){
        g_transforms[objIndex].push(getNewTransformMatrix());
    }
    g_transforms[objIndex].push([0, 0, 0]);
    g_transforms[objIndex].push(["active"]); // for erasing option
    g_transforms[objIndex].push(["normal"]); // mode
}

function newObject(event){
    mode = "normal";
    objIndex += 1;
    g_verts.push([]);
    initTransforms();
    console.log("New Object #" + objIndex);
}

function canvasClick(ev, canvas, camera, renderer){
    /*
    var x = ev.pageX;
    var y = ev.pageY;
    var z = parseFloat(zPos);

    var rect = ev.target.getBoundingClientRect();
    console.log(rect.top);

    x = ((x) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y))/(canvas.height/2);*/
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    ev.preventDefault();
    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (ev.clientY / window.innerHeight) * 2 + 1;

    var z = parseFloat(zPos);
    raycaster.setFromCamera(mouse, camera);

    g_verts[objIndex].push(mouse.x);
    g_verts[objIndex].push(mouse.y);
    g_verts[objIndex].push(z);

    renderScene(camera, renderer);
}

function renderScene(camera, renderer){
    var scene = new THREE.Scene();
    renderer.render(scene, camera);

    // for loop through all object's vertices
    for (var i = 0; i < g_verts.length; i++){
        if(g_transforms[i][8][0] == "inactive"){
            continue;
        }
        var vertices = new Float32Array(g_verts[i]);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        const material = new THREE.PointsMaterial( { color: 0xff0000 } );
        const verts = new THREE.Points( geometry, material );

        scene.add( verts );
    }
    var light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    renderer.render(scene, camera);
}

function main(){
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#e5e5e5");
    renderer.setSize(window.innerWidth, window.innerHeight);
    var canvas = renderer.domElement;
    canvas.setAttribute('id', 'canvas');
    document.body.appendChild(canvas);
    
    canvas.onclick = function(ev){
        console.log('canvas clicked!');
        canvasClick(ev, canvas, camera, renderer);
    }

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    initTransforms();
    renderScene(camera, renderer);
    /*
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
    var canvas = renderer.domElement;
    canvas.setAttribute('id', 'canvas');
    document.body.appendChild(canvas);
    
    canvas.onclick = function(ev){
        console.log('canvas clicked!');
        canvasClick(ev, canvas);
    }


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
    */
}

main();