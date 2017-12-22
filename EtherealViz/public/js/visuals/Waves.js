/*
 * File: Waves.js
 * Defines a waves system
 * @author: Rishabh Asthana {asthana4@illinois.edu}
 */

// Loop visualizer parameters
let wave_holder = new THREE.Group();
wave_holder.name = 'Waves';
let waves = [];
let wave_count = 160;
// Create a loop geometry comprising of 256 points, same number as our bucket
let wave_geometry = new THREE.Geometry();
wave_geometry.vertices.push(
    new THREE.Vector3( rad * Math.cos(angle_sep),  rad * Math.sin(angle_sep) , 0 ),
    new THREE.Vector3( 6 * rad * Math.cos(angle_sep),  6 * rad * Math.sin(angle_sep) , 0 ),
);

// Create several loops using the same geometry
sc = 0.02;
angle_sep = (2 * Math.PI)/wave_count;

for(let index = 0; index < wave_count; index += 1){
    
    // Create material for all the loops
    let waveMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, opacity : 0.7,
				blending : THREE.AdditiveBlending,
				depthTest : false,
				transparent : true } );

    let waveLoop = new THREE.Line(wave_geometry, waveMaterial);
    waveLoop.scale.x = waveLoop.scale.y = 1;
    waveLoop.rotation.z = angle_sep * (index+0.001);
    sc += 0.03;
    wave_holder.add(waveLoop);
    waves.push(waveLoop);
}

/*
 * This function updates the configuration of every loop.
 */
function updateWaves(){
    
    // Add a new average volume onto the list
    let sum = 0;
    for(var i = 0; i < 256; i++) {
        sum += freqByteData[i];
    }
    var aveLevel = sum / 256;
    var scaled_average = (aveLevel / 256) * 2; //256 is the highest a level can be

    // Create propogating impulse
    for(let count = 0; count < wave_count; count += 1){
        var ringId = wave_count - count - 1;
        if(typeof waves[count] == undefined) continue;
        waves[count].scale.x = waves[count].scale.y = timeByteData[count]/256 + 0.01; 
      
    }
}