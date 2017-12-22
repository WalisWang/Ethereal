/*
 * File: Particle.js
 * Defines a particle system
 * @author: Rishabh Asthana {asthana4@illinois.edu}
 */


/*
 * This class represents a particle object
 */
class Particle {
  constructor(posX, posY, posZ) {
    this.position = new THREE.Vector3(posX, posY, posZ);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.xBound = window.innerWidth;
    this.yBound = window.innerHeight;
  }
    
  // Getter for the particle position
  pos(){
    return this.position;
  }
    
 /*
  * Apply the given force to this particle
  * @param force: Vector3, force to appy to this particle
 */
  applyForce(force){
      this.acceleration.add(force);
  }
    
  // Euler integration to move the particle
  update(){
      this.velocity.add(this.acceleration);
      this.velocity.clampScalar(-0.3, 0.3);
      this.acceleration.set(0, 0, 0);
      this.position.add(this.velocity);
      this.velocity.multiplyScalar(0.99);
  }
    
}

// Create the particle variables
let particleCount = 20000,
    particleGeom = new THREE.Geometry(),
    pMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.03,
        //map: new THREE.TextureLoader().load('images/particle.png'),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.7,
    });


// Create the particle system
let ParticleSystem = [];
for ( var i = 0; i < particleCount; i ++ ) {
	let particle = new Particle(THREE.Math.randFloatSpread( 20 ), THREE.Math.randFloatSpread( 20 ), 0);
    ParticleSystem.push(particle);
	particleGeom.vertices.push( particle.pos() );
}

// Create Three js object mapping geometry to the material
var systemObject = new THREE.Points( particleGeom, pMaterial );
systemObject.name = 'ParticleSystem';

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

/*
 * This function updates the position of every particle in the system
 */
function updateParticles(){
    
    let systemGeom = systemObject.geometry;
    
    // Locate the screen center.
    let target = new THREE.Vector3(window.innerWidth/2, window.innerHeight/2, 0);
    
    // If there is a beat, allow for negative force to be applied
    let explode = false;
    if(is_playing && curVol > maxVol){
        maxVol = curVol;
        explode = true;
    }
    
    // For every particle in the system
    for (let i = 0; i < particleCount; i ++ ){
        let p = ParticleSystem[i];
        let forceDir = target.sub(p.pos());
        let dist = forceDir.length();
        forceDir.normalize();
        forceDir.multiplyScalar(0.2);

        if(dist > 2)
            ParticleSystem[i].applyForce(forceDir);
        if (explode){    
            //let neg_force = new THREE.Vector3(THREE.Math.randFloatSpread( 200 ), THREE.Math.randFloatSpread( 20 ), 0);
            let neg_force = forceDir.clone().negate();
            ParticleSystem[i].applyForce(neg_force);
        }
        // Update the positions
        ParticleSystem[i].update();
        // Update the geometry to reflect the updated particle positions
        let current_particle = systemGeom.vertices[i];
        current_particle = ParticleSystem[i].pos() ;
    }
    
    systemObject.geometry.verticesNeedUpdate = true;
}
