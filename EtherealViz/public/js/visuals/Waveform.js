/*
 * File: Waveform.js
 * Defines a waveform loop system
 * @author: Rishabh Asthana {asthana4@illinois.edu}
 */

// Loop visualizer parameters
let loop_holder = new THREE.Group();
loop_holder.name = 'Waveform';
let maxVol = curVol = 0;
let levels = [];
let rings = [];


// Create a loop geometry comprising of 256 points, same number as our bucket
let line_geometry = new THREE.Geometry();
let angle_sep = (Math.PI * 2)/256;
let rad = 2;
for(let count = 0; count < 256; count += 1){
    line_geometry.vertices.push(
        new THREE.Vector3( rad * Math.cos(count * angle_sep),  rad * Math.sin(count * angle_sep) , 0 ),
    );
}

// Create several loops using the same geometry
let sc = 0.01;
for(let index = 0; index < 160; index += 1){
    
    // Create material for all the loops
    let lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, opacity : 0.7,
				blending : THREE.AdditiveBlending,
				depthTest : false,
				transparent : true } );

    let lineLoop = new THREE.LineLoop(line_geometry, lineMaterial);
    lineLoop.scale.x = lineLoop.scale.y = sc;
    lineLoop.rotation.x = -Math.PI/3;
    sc += 0.03;
    loop_holder.add(lineLoop);
    rings.push(lineLoop);
    levels.push(0);

}

/*
 * This function updates the configuration of every loop.
 */
function updateLoops(){
    
    // Add a new average volume onto the list
    let sum = 0;
    for(var i = 0; i < 256; i++) {
        sum += freqByteData[i];
    }
    var aveLevel = sum / 256;
    var scaled_average = (aveLevel / 256) * 2; //256 is the highest a level can be
    levels.push(scaled_average);
    levels.shift(1);

    // Map the waveform onto the loop geometry, this automatically affects all the rings
    for(let count = 0; count < 256; count += 1){
        let point = line_geometry.vertices[count];
        point.z = timeByteData[count]/255;
    }

    // Create propogating impulse
    for(let count = 0; count < 160; count += 1){
        var ringId = 160 - count - 1;
        if(typeof rings[count] == undefined) continue;
        var normLevel = levels[ringId] + 0.01; //avoid scaling by 0
        rings[count].material.opacity = normLevel;
        rings[count].scale.z = normLevel;
    }


     // Tell context that line geometry needs to be updated
     line_geometry.verticesNeedUpdate = true;

}