/*
 * File: Render.js
 * THREE.js script
 * @author: Rishabh Asthana {asthana4@illinois.edu}
 */

// Create a new scene and camera
let activeViz = 1;
let last_active = 1;
let switch_visual = false;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

// Create a new renderer and append it to the DOM
var renderer = new THREE.WebGLRenderer();

// Make renderer render to full screen
renderer.setSize( window.innerWidth, window.innerHeight );

// Inject the canvas on to the DOM
document.body.appendChild( renderer.domElement );


// Add lighting to the scene
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
var light = new THREE.PointLight(0xffffff, 1.0); 
light.position.set( 0, 0, 50 );
scene.add(light);

// Position the camera away from the center of the scene
camera.position.z = 5;

// Add the particle system 
scene.add( systemObject );

let composer = new THREE.EffectComposer(renderer);

let renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

//let kaleidoPass = new THREE.ShaderPass(THREE.RGBShiftShader);
//let kaleidoPass = new THREE.ShaderPass(THREE.FilmShader);
//composer.addPass(kaleidoPass);

// Wire in the glitch pass
let glitchPass = new THREE.GlitchPass(1);
glitchPass.goWild = true;
composer.addPass(glitchPass);

// Initially just render the current scene to the screen
renderPass.renderToScreen = true;

/*
 * This function is called every frame and we update the currently active visual here
 */
var animate = function () {
	requestAnimationFrame( animate );
    
    if(data){
        curVol = data.reduce((a, b) => a + b, 0)/data.length;
        // Randomize the visual
        if(curVol > maxVol && switch_visual){
            activeViz = getRandomInt(0, 3);
            changeViz(activeViz);
            switch_visual = false;
        }
        maxVol *= 0.99;
    }
   
    if(activeViz == 0){
        updateLoops();
    }
    else if(activeViz == 1){
        updateParticles();
    }
    else if(activeViz == 2){
        updateWaves();
    }
    
    // Render the scene via composer
    composer.render();
};

animate();

// If user resizes the window, adjust the canvas accordingly
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// Every 10 seconds, the visual is allowed to switch
window.setInterval(function(){
    switch_visual = true;
}, 10000)

/*
 * Returns a random integer between the given range
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/*
 * Map arrow keys to allow switching between visualizers
 */
window.addEventListener('keyup', function(e){
    if(e.keyCode == 38){
        if (activeViz < 2)
            activeViz += 1;
        changeViz(activeViz);
    }
    if(e.keyCode == 40){
        if(activeViz > 0)
            activeViz -= 1;
        changeViz(activeViz);
    }
});

let touch_controller = new Hammer(document.getElementById('bodyTag'));
touch_controller.on('swipeleft', function(){
    if(activeViz > 0)
        activeViz -= 1;
    changeViz(activeViz);
});
touch_controller.on('swiperight', function(){
    if(activeViz < 2)
        activeViz += 1;
    changeViz(activeViz);
});
touch_controller.on('tap', function(){
    setVisible();
});
/*
 * Switch the visualizer
 * @param index: Index of visualizer to switch to
 */
function changeViz(activeViz){
    
    // If no change from last visual, we don't switch at all
    if(activeViz == last_active)
        return;
    last_active = activeViz;
    // Allow screen to gltch
    renderPass.renderToScreen = false;
    glitchPass.renderToScreen = true;
    removeObjects();

    // Switch the visualizer after certain amount of glitching
    setTimeout(function(){
        
        glitchPass.renderToScreen = false;
        renderPass.renderToScreen = true;
        
        if(activeViz == 0){
            scene.add(loop_holder);
        }
        if(activeViz == 1){
            scene.add(systemObject);
        }
        if(activeViz == 2){
            scene.add(wave_holder);
        }
        
    }, 200);

}

/*
 * Removes all objects from the scene
 */
function removeObjects(){
    if(scene.getObjectByName('Waves')){
        scene.remove(wave_holder);
        return;
    }
    if(scene.getObjectByName('ParticleSystem')){
        scene.remove(systemObject);
        return;
    }
    if(scene.getObjectByName('Waveform')){
        scene.remove(loop_holder);
        return;
    }
}