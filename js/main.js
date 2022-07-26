var objIndex = 0;
var zPos = 0.0;
var zPosCamera = 40;
var g_verts = [[]];
var g_transforms = [[]];
var g_colors = [[]];
var g_faces = [[]];

var mode = "normal";

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
var selectedVerts = [];

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

function selectObject(event){
    mode = "normal";
    objIndex = parseInt(event.target.value);


}

function addGuideGrid(){
    var gridSize = 20;
    var gridGap = 2; // TODO: user chooses this
    const linesMat = new THREE.LineBasicMaterial( { color: 0x000000 } );
    for (var j = 0; j <= 2; j += 2){ 
        for(var i = -1*(gridSize / 2); i <= (gridSize / 2); i+=gridGap){
            var p1 = [-1*(gridSize / 2), 0, -1*(gridSize / 2)];
            var p2 = [(gridSize / 2), 0, (gridSize / 2)];
            p1[j] = i;
            p2[j] = i;

            p1 = new THREE.Vector3(p1[0], p1[1], p1[2]);
            p2 = new THREE.Vector3(p2[0], p2[1], p2[2]);

            const lineGeo = new THREE.BufferGeometry().setFromPoints( [p1, p2] );
            const line = new THREE.Line( lineGeo, linesMat );
            scene.add(line);
        }
    }
    
}

function unselectVerts(){
    for(var i = 0; i < selectedVerts.length; i++){
        // TODO: color being desired color
        var color = new THREE.Color();
        color.setRGB(1, 0, 0);
        g_colors[objIndex][selectedVerts[i] * 3 + 0] = color.r;
        g_colors[objIndex][selectedVerts[i] * 3 + 1] = color.g;
        g_colors[objIndex][selectedVerts[i] * 3 + 2] = color.b;
    }
    selectedVerts = [];
}

function updateVertSelect(event){
    onVertSelect = event.target.checked;
    if (!onVertSelect){
        console.log(selectedVerts);
        unselectVerts();
        renderScene();
    }
}

function updateTranslate(val, id){
    if (id == "x-translate"){
        console.log(val);
        g_transforms[objIndex][0][3] = val;
    }
    if (id == "y-translate"){
        g_transforms[objIndex][0][7] = val;
    }
    if (id == "z-translate"){
        g_transforms[objIndex][0][11] = val;
    }
    mode = "modify";
    g_transforms[objIndex][9][0] = mode;
    // TODO: show mode on div
    renderScene();
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
        if (isMouseDown && mouseClass != 'slider-center'){
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
    && mouseHover == ""
    && event.which == 1) { // 1 for left, 2 for wheel and 3 for right
        if (!onVertSelect){
            // if not drag, if on canvas, if left click, not onVertSelect, add a vertex
            pt = mouseToScenePosition(event);

            g_verts[objIndex].push(pt.x);
            g_verts[objIndex].push(pt.y);
            g_verts[objIndex].push(pt.z);

            var color = new THREE.Color();
            color.setRGB(1, 0, 0); // TODO: each object w desired color
            g_colors[objIndex].push(color.r);
            g_colors[objIndex].push(color.g);
            g_colors[objIndex].push(color.b);

            renderScene();
        } else {
            // onVertSelect
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            var direction = raycaster.ray.direction;
            var origin = raycaster.ray.origin;
            
            for (var i = 0; i < g_verts[objIndex].length; i+=3){
                var vert = new THREE.Vector3(
                    g_verts[objIndex][i + 0],
                    g_verts[objIndex][i + 1],
                    g_verts[objIndex][i + 2]
                );
                var u = new THREE.Vector3(vert.x - origin.x, vert.y - origin.y, vert.z - origin.z).normalize();
                var v = direction.normalize();
                var angle = Math.acos(u.dot(v)) * 180 / PI;
                var eps = 1;
                if (Math.abs(angle) <= eps){
                    // click instersects with a vertex
                    selectedVerts.push(i/3);
                    var color = new THREE.Color();
                    color.setRGB(0, 0, 1); // selected to blue
                    g_colors[objIndex][i + 0] = color.r;
                    g_colors[objIndex][i + 1] = color.g;
                    g_colors[objIndex][i + 2] = color.b;
                    console.log("Vertex #" + i/3 + " selected!");
                    console.log(g_colors);
                    break;
                }
            }
            renderScene();
        }
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

function newFace(event){
    if (selectedVerts.length == 3){
        g_faces[objIndex].push(selectedVerts);
        unselectVerts();
        $("#vertSelectCheckbox").prop('checked', false);
        onVertSelect = false;
    }
    renderScene();
}

function newObject(event){
    mode = "normal";
    objIndex += 1;
    g_verts.push([]);
    g_colors.push([]);
    g_faces.push([]);
    initTransforms();

    $("#sidebar").append('<button type="button" class="btn btn-secondary obj-item" onclick = "selectObject(event);" value = ' 
    + (objIndex) + ' id = "' + (objIndex) +'">Object ' + (objIndex + 1) + '</button>');

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

function multiplyMtxPoint3D(mat, point) {
    point = [point[0], point[1], point[2], 1.0];
	var dim = 3;
    var v = [0, 0, 0, 0]
	for (var r = 0; r < dim + 1; r++) {
		v[r] = 0;
		for (var c = 0; c < dim + 1; c++) {
			v[r] += mat.elements[(r * 4) + c] * point[c];
		}
	}
    return v;
}

function applyTransforms(verts, matrices){
    var vertices = new Float32Array(verts);
    var translateMtx = new THREE.Matrix4().fromArray(matrices[0]);
    // TODO: transform matrix
    var transformMtx = translateMtx;
    console.log(verts, transformMtx);
    for(var v = 0; v < vertices.length; v+=3){
        point = [vertices[v + 0], vertices[v + 1], vertices[v + 2]];
        t_point = multiplyMtxPoint3D(transformMtx, point);
        
        vertices[v + 0] = t_point[0];
        vertices[v + 1] = t_point[1]; 
        vertices[v + 2] = t_point[2];
    }
    console.log(vertices);
    return vertices;
}

function renderScene(){
    var pos = getCameraPosition(radius, theta, phi);
    camera.position.set(pos.x, pos.y, pos.z);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateMatrix();

    scene = new THREE.Scene();
    renderer.render(scene, camera);

    // for loop through all objects' vertices
    for (var i = 0; i < g_verts.length; i++){
        if(g_transforms[i][8][0] == "inactive"){
            continue;
        }

        // draw vertices
        //var vertices = new Float32Array(g_verts[i]);
        var vertices = applyTransforms(g_verts[i], g_transforms[i]);
        var colors = new Float32Array(g_colors[i]);
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        const material = new THREE.PointsMaterial( { vertexColors: true } );
        const verts = new THREE.Points( geometry, material );

        scene.add( verts );
    }
    // for loop through all objects' faces
    for (var i = 0; i < g_faces.length; i++){
        if(g_transforms[i][8][0] == "inactive"){
            continue;
        }
        // draw faces
        var faces = []
        // loop through ith object's faces (a face is an array of 3 indices)
        for (var j = 0; j < g_faces[i].length; j++){
            // idx is the ith object's jth face (idx = an array of 3 indices)
            var idx = g_faces[i][j];
            var facePts = []
            for(var k = 0; k < 3; k++){
                // faces pushes xyz (+0, +1, +2) of ith object's vertex at position idx[k]
                var x = g_verts[i][idx[k]*3 + 0];
                var y = g_verts[i][idx[k]*3 + 1];
                var z = g_verts[i][idx[k]*3 + 2];
                faces.push(x,y,z);
                facePts.push(new THREE.Vector3(x, y, z));
            }
            // last point joins vertex 2 and 0
            facePts.push(facePts[0]);
            const linesMat = new THREE.LineBasicMaterial( { color: 0x000000 } );
            const linesGeo = new THREE.BufferGeometry().setFromPoints( facePts );
            const line = new THREE.Line( linesGeo, linesMat );
            scene.add(line);
        }
        // face triangle
        const facesGeo = new THREE.BufferGeometry();
        facesGeo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(faces), 3 ) );
        const facesMat = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
        facesMat.opacity = 0.5;
        facesMat.transparent = true;
        const facesMesh = new THREE.Mesh( facesGeo, facesMat );
        
        scene.add( facesMesh );
        renderer.render(scene, camera);
    }

    var light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    addGuideGrid();
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

    //document.body.appendChild(canvas);
    $("#scene").append(canvas);
    
    var percentage = 100 - (150 / window.innerWidth * 100);
    $("#right-sidebar").css('left', percentage + "%");
    
    window.addEventListener('resize', () => {

        guidePlaneHeight = window.innerHeight * factor;
        guidePlaneWidth = window.innerWidth * factor;

        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        var percentage = 100 - (150 / window.innerWidth * 100);
        $("#right-sidebar").css('left', percentage + "%");
    });
    

    window.addEventListener('mousewheel', mousewheelHandler, false);
    window.addEventListener('mousemove', mousemoveHandler, false);
    window.addEventListener('mousedown', mousedownHandler, false);
    window.addEventListener('mouseup', mouseupHandler, false);

    initTransforms();
    renderScene();
}

main();