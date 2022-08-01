var objIndex = 0;
var zPos = 1.0;
var zPosCamera = 40;
var g_verts = [[]];
var g_transforms = [[]];
var scene;
var camera;
var renderer;
const PI = 3.141592;

var radius = zPosCamera;
var theta = 45;
var phi = 30;
var isMouseDown = false;
var mouseDownPos = new THREE.Vector2(0, 0);
var mouseUpPos = new THREE.Vector2(0, 0);
var mouseDownTheta, mouseDownPhi;
// https://mrdoob.com/projects/voxels/#A/adjUhYhUheleW

var onVertSelect = false;
var mouseHover = '';

var mode = "normal";
var factor = 0.01;
var guidePlaneWidth = window.innerWidth * factor;
var guidePlaneHeight = window.innerHeight * factor;
var guidePlaneVerts = new Float32Array( [
    -guidePlaneWidth/2.0, -guidePlaneHeight/2.0, zPos,
    guidePlaneWidth/2.0, -guidePlaneHeight/2.0, zPos,
    guidePlaneWidth/2.0, guidePlaneHeight/2.0, zPos,

    guidePlaneWidth/2.0, guidePlaneHeight/2.0, zPos,
    -guidePlaneWidth/2.0, guidePlaneHeight/2.0, zPos,
    -guidePlaneWidth/2.0, -guidePlaneHeight/2.0, zPos
] );

function updateTextInput(val) {
    zPos = parseFloat(val);
    document.getElementById('textInput').value = val;

    renderScene();
}

function updateVertSelect(event){
    onVertSelect = event.target.checked;
    console.log(onVertSelect);
}

function getCameraPosition(radius, theta, phi){
    var x = radius * Math.cos(phi * PI / 360.0) * Math.sin(theta * PI / 360.0);
    var y = radius * Math.sin(phi * PI / 360.0); 
    var z = radius * Math.cos(phi * PI / 360.0) * Math.cos(theta * PI / 360.0);
    return new THREE.Vector3(x, y , z);
}

function mousewheelHandler(event){

    radius -= event.wheelDeltaY * 0.05;
    var pos = getCameraPosition(radius, theta, phi);
    camera.position.x = pos.x;
    camera.position.y = pos.y;
    camera.position.z = pos.z;
    
    camera.updateMatrix();
    renderScene();

}

function mousemoveHandler(event){
    var mouseClass = event.target.className;
    mouseHover = mouseClass;
    if (mouseClass == 'form-range'){
        var val = document.getElementById("depth-range").value;
        updateTextInput(val);
    }else {
        if (isMouseDown){
            currPos = new THREE.Vector2(event.clientX, event.clientY);
            prevPos = new THREE.Vector2(mouseDownPos.x, mouseDownPos.y);
            deltaX = currPos.x - prevPos.x;
            deltaY = currPos.y - prevPos.y;
            theta -= deltaX * 0.005;
            phi += deltaY * 0.005;

            var pos = getCameraPosition(radius, theta, phi);
            camera.position.x = pos.x;
            camera.position.y = pos.y;
            camera.position.z = pos.z;

            camera.updateMatrix();
            renderScene();
        }
    }
}

function mousedownHandler(event){
    isMouseDown = true;
    mouseDownPos.x = event.clientX;
    mouseDownPos.y = event.clientY;
    mouseDownPhi = phi;
    mouseDownTheta = theta;
    console.log("mouse down!");
}

function mouseupHandler(event){
    isMouseDown = false;
    mouseUpPos.x = event.clientX;
    mouseUpPos.y = event.clientY;
    if ((mouseDownPos.x == mouseUpPos.x && mouseDownPos.y == mouseUpPos.y)
    && mouseHover == "") {
        console.log("class" + mouseHover);
        // if not drag, add a vertex
        pt = mouseToScenePosition(event);

        g_verts[objIndex].push(pt.x);
        g_verts[objIndex].push(pt.y);
        g_verts[objIndex].push(pt.z);

        renderScene();
    }
    
}

function addBaseVectors(){
    var xyzMat = [new THREE.LineBasicMaterial({color: 0xFF0000}), new THREE.LineBasicMaterial({color: 0x00FF00}), new THREE.LineBasicMaterial({color: 0x0000FF})];
    var xyzVerts = [
        [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(10, 0, 0),
        ],
        [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 10, 0),
        ],
        [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 10),
        ]
    ]
    
    var xyzPos = [new Float32Array(xyzVerts[0].length * 3), new Float32Array(xyzVerts[1].length * 3), new Float32Array(xyzVerts[2].length * 3)];
    
    for (var v = 0; v < 3; v++){
        for (var i = 0; i < xyzVerts[0].length; i++) {
            xyzPos[v][i * 3] = xyzVerts[v][i].x;
            xyzPos[v][i * 3 + 1] = xyzVerts[v][i].y;
            xyzPos[v][i * 3 + 2] = xyzVerts[v][i].z;
        }
    }
    
    indices = [0, 1];
    
    var xGeo = new THREE.BufferGeometry();
    xGeo.setAttribute('position', new THREE.BufferAttribute(xyzPos[0], 3));
    xGeo.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
    var xLine = new THREE.LineSegments(xGeo, xyzMat[0]);

    var yGeo = new THREE.BufferGeometry();
    yGeo.setAttribute('position', new THREE.BufferAttribute(xyzPos[1], 3));
    yGeo.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
    var yLine = new THREE.LineSegments(yGeo, xyzMat[1]);

    var zGeo = new THREE.BufferGeometry();
    zGeo.setAttribute('position', new THREE.BufferAttribute(xyzPos[2], 3));
    zGeo.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
    var zLine = new THREE.LineSegments(zGeo, xyzMat[2]);

    scene.add(xLine);
    scene.add(yLine);
    scene.add(zLine);
}

function addGuidePlane(){
    const guidePlaneGeo = new THREE.BufferGeometry();
    var start = 2;
    numVerts = 6;
    for (var i = start; i < numVerts * 3; i+= 3){
        guidePlaneVerts[i] = zPos;
    }

    guidePlaneGeo.setAttribute( 'position', new THREE.BufferAttribute( guidePlaneVerts, 3 ) );
    const guidePlaneMat = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    guidePlaneMat.opacity = 0.3;
    guidePlaneMat.transparent = true;
    const guidePlaneMesh = new THREE.Mesh( guidePlaneGeo, guidePlaneMat );

    scene.add( guidePlaneMesh );
    renderer.render(scene, camera);
}

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

function mouseToScenePosition(ev){
    // normalized pos of the cursor
    const mouse = new THREE.Vector2();
    // coords for the pos where the ray intersects with the plane
    const intersection = new THREE.Vector3();
    // dir of the plane ( normal )
    const planeNormal = new THREE.Vector3();
    // plane created every time cursor moves
    const plane = new THREE.Plane();
    const raycaster = new THREE.Raycaster();

    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    // unit normal vector as normal of the plane
    // get two coplanar vectors of the guidePlane
    // v1 goes from vet 0 to vert 1
    var v1 = new THREE.Vector3(
        guidePlaneVerts[1 * 3 + 0] - guidePlaneVerts[0 * 3 + 0],
        guidePlaneVerts[1 * 3 + 1] - guidePlaneVerts[0 * 3 + 1],
        guidePlaneVerts[1 * 3 + 2] - guidePlaneVerts[0 * 3 + 2]
    );
    // v2 goes from vert 0 to vert 2
    var v2 = new THREE.Vector3(
        guidePlaneVerts[2 * 3 + 0] - guidePlaneVerts[0 * 3 + 0],
        guidePlaneVerts[2 * 3 + 1] - guidePlaneVerts[0 * 3 + 1],
        guidePlaneVerts[2 * 3 + 2] - guidePlaneVerts[0 * 3 + 2]
    );
    // get normal vector of the guidePlane
    var n = v1.cross(v2);
    console.log(v1);
    planeNormal.copy(n).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, new THREE.Vector3(0, 0, zPos));
    // raycast from camera to mouse
    raycaster.setFromCamera(mouse, camera);
    // store objects in 2nd param
    raycaster.ray.intersectPlane(plane, intersection);

    return intersection;
}

function canvasClick(ev){
    pt = mouseToScenePosition(ev);

    g_verts[objIndex].push(pt.x);
    g_verts[objIndex].push(pt.y);
    g_verts[objIndex].push(pt.z);

    renderScene();
}

function renderScene(){
    var pos = getCameraPosition(radius, theta, phi);
    camera.position.set(pos.x, pos.y, pos.z);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateMatrix();

    scene = new THREE.Scene();
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

    addBaseVectors();
    addGuidePlane();

    renderer.render(scene, camera);
}

function main(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    //camera.position.set(0, 0, zPosCamera);
    var pos = getCameraPosition(radius, theta, phi);
    camera.position.set(pos.x, pos.y, pos.z);
    camera.updateMatrix();
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#e5e5e5");
    renderer.setSize(window.innerWidth, window.innerHeight);
    var canvas = renderer.domElement;
    canvas.setAttribute('id', 'canvas');
    canvas.style.zIndex = 1;

    document.body.appendChild(canvas);
    /*
    canvas.onclick = function(ev){
        console.log('canvas clicked!');
        canvasClick(ev, );
    }
    */
    window.addEventListener('resize', () => {

        guidePlaneHeight = window.innerHeight * factor;
        guidePlaneWidth = window.innerWidth * factor;

        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    window.addEventListener('mousewheel', mousewheelHandler, false);
    window.addEventListener('mousemove', mousemoveHandler, false);
    window.addEventListener('mousedown', mousedownHandler, false);
    window.addEventListener('mouseup', mouseupHandler, false);

    initTransforms();
    renderScene();
}

main();