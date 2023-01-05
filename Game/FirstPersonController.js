import { quat, vec3, mat4 } from '../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';
import { Bullet } from './Bullet.js';

export class FirstPersonController extends Node {

    constructor(node, domElement, options = {}) {
        super(options);

        Utils.init(this, this.constructor.defaults, options);

        // The node that this controller controls.
        this.node = node;

        this.aabb.min = [-0.1, -0.8, -0.1];
        this.aabb.max = [0.1, 0.8, 0.1];

        //this.node.mesh.primitives[0].attributes.POSITION.max = [0.2, 0.2, 0.2];
        //this.node.mesh.primitives[0].attributes.POSITION.min = [-0.2, -0.2, -0.2];

        // The activation DOM element.
        this.domElement = domElement;

        // This map is going to hold the pressed state for every key.
        this.keys = {};

        // We are going to use Euler angles for rotation.
        this.pitch = 0;
        this.yaw = 4.71;

        // This is going to be a simple decay-based model, where
        // the user input is used as acceleration. The acceleration
        // is used to update velocity, which is in turn used to update
        // translation. If there is no user input, speed will decay.
        this.velocity = [0, 0, 0];

        // The model needs some limits and parameters.

        // Acceleration in meters per second squared.
        this.acceleration = 20;

        // Maximum speed in meters per second.
        this.maxSpeed = 3;

        // Decay as 1 - log percent max speed loss per second.
        this.decay = 0.99999;

        // Pointer sensitivity in radians per pixel.
        this.pointerSensitivity = 0.002;


        //this.in_game = false;

        //jump parametres
        this.jump = false;
        this.jump_start = 0;
        this.jump_now = 0;
        this.jump_phase = 0;

        this.bullets = new Array(); 

        this.timer = Math.floor(Date.now() / 1000);

        this.initHandlers();
        this.bullets_left = 50;
        this.health = 100;

        this.gunAudio = new Audio('../Assets/sound/gunshotSound.wav');
        this.punchAudio = new Audio('../Assets/sound/punch.mp3');
        
        this.last_taken_damage = 0;
    }

    initHandlers() {
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        const element = this.domElement;
        const doc = element.ownerDocument;

        doc.addEventListener('keydown', this.keydownHandler);
        doc.addEventListener('keyup', this.keyupHandler);
        

        element.addEventListener('click', event => {
            if(event.button == 0 && doc.pointerLockElement === element && this.timer + 5 <= Math.floor(Date.now() / 1000)){
                this.timer = Math.floor(Date.now() / 1000);
                this.shoot()
            } else {
                console.log("Cant shoot");
            }
        });

        element.addEventListener('click', e => element.requestPointerLock());
        doc.addEventListener('pointerlockchange', e => {
            if (doc.pointerLockElement === element) {
                doc.addEventListener('pointermove', this.pointermoveHandler);
            } else {
                doc.removeEventListener('pointermove', this.pointermoveHandler);
            }
        });
    }

    update(dt) {
        // We are essentially solving the system of differential equations
        //
        //   a = dv/dt
        //   v = dx/dt
        //
        // where a is acceleration, v is speed and x is translation.
        // The system can be sufficiently solved with Euler's method:
        //
        //   v(t + dt) = v(t) + a(t) * dt
        //   x(t + dt) = x(t) + v(t) * dt
        //
        // which can be implemented as
        //
        //   v += a * dt
        //   x += v * dt
        //
        // Needless to say, better methods exist. Specifically, second order
        // methods accurately compute the solution to our second order system,
        // whereas there is always going to be some error related to the
        // exponential decay.

        // Calculate forward and right vectors from the y-orientation.
        const cos = Math.cos(this.yaw);
        const sin = Math.sin(this.yaw);
        const forward = vec3.set(vec3.create(), -Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        const right = vec3.set(vec3.create(), Math.cos(this.yaw), 0, -Math.sin(this.yaw));

        
        //48, -48;
        //-48. -48
        //-48, 44
        //48, 44

        // Map user input to the acceleration vector.
        
       
        const acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }
        if (this.keys['Space']){
            if(this.jump == false){
                this.jump_start = Date.now();
                this.jump = true;
            }
        }
        
        //console.log(this.keys);

        // Update velocity based on acceleration (first line of Euler's method).
        vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

        // If there is no user input, apply decay.
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            const decay = Math.exp(dt * Math.log(1 - this.decay));
            vec3.scale(this.velocity, this.velocity, decay);
        }
        // Limit speed to prevent accelerating to infinity and beyond.
        const speed = vec3.length(this.velocity);
        if (speed > this.maxSpeed) {
            vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
        }


        let new_position = vec3.scaleAndAdd(vec3.create(),
                this.node.translation, this.velocity, dt);
        // Update translation based on velocity (second line of Euler's method).
        if(new_position[0] < 48 && new_position[0] > -48 && new_position[2] < 44  && new_position[2] > -44){
            this.node.translation = new_position;
        }

        let x_coordinate = 0;
        if(this.node.translation[0] < -33){
            x_coordinate = 10;
        }
        else if(this.node.translation[0] > 33){
            x_coordinate = 310;
        }
        else{
            x_coordinate = (this.node.translation[0]+34) * 4.4;
        }

        let y_coordinate = 0;
        if(this.node.translation[2] < -19){
            y_coordinate = 10;
        }
        else if(this.node.translation[2] > 19){
            y_coordinate = 210;
        }
        else{
            y_coordinate = (this.node.translation[2]+22) * 4.8;
        }
        
        let x = x_coordinate + "px";
        let y = y_coordinate + "px";
        let map = document.getElementById('dot');
        map.style.left = x;
        map.style.top = y;

        
        document.getElementById("bullets").innerHTML = this.bullets_left;
        document.getElementById("health").innerHTML = this.health;

        //jump translation
        if(this.jump == true){
            this.jump_now =  Date.now()+1;
            let height = 0.02*Math.sin(0.008*this.jump_now - 0.008*this.jump_start);
            //console.log(0.1*Math.sin(0.008*this.jump_now - 0.008*this.jump_start));
            if(height < 0){
                this.jump_phase = -1;
            }
            if(height >= 0 && this.jump_phase == -1){
                this.jump=false;
                this.node.translation = [this.node.translation[0], 1, this.node.translation[2]];
                this.jump_phase = 0;
                return;
            }
            this.node.translation = [this.node.translation[0], this.node.translation[1] + height, this.node.translation[2]];
        }

        // Update rotation based on the Euler angles.
        const rotation = quat.create();
        quat.rotateY(rotation, rotation, this.yaw);
        quat.rotateX(rotation, rotation, this.pitch);
        this.node.rotation = rotation;
    }

    shoot(){
        //console.log("shoot");
        if(this.bullets_left){
            this.gunAudio.play();

            const bullet = new Bullet(this.node.translation, this.yaw, this.pitch, this.node.rotation);

            //const bullet_location = this.node.translation;
            Object.assign(bullet, {yaw: this.yaw});
            Object.assign(bullet, {pitch: this.pitch});

            //const bullet = new Bullet(this.node.translation, this.yaw, this.pitch);
            this.bullets.push(bullet);

            //console.log(this.bullets);
            this.bullets_left--;
        }   

        
        //this.bullets.addChild(this.node.translation, this.yaw, this.pitch);
        //console.log(bullet_location);
    }

    pointermoveHandler(e) {
        // Rotation can be updated through the pointermove handler.
        // Given that pointermove is only called under pointer lock,
        // movementX/Y will be available.

        // Horizontal pointer movement causes camera panning (y-rotation),
        // vertical pointer movement causes camera tilting (x-rotation).
        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.pointerSensitivity;
        this.yaw   -= dx * this.pointerSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        // Limit pitch so that the camera does not invert on itself.
        if (this.pitch > halfpi) {
            this.pitch = halfpi;
        }
        if (this.pitch < -halfpi) {
            this.pitch = -halfpi;
        }

        // Constrain yaw to the range [0, pi * 2]
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    take_damage(time, gamemode){
        let razlika = time - this.last_taken_damage;
        //console.log(razlika);
        if(razlika > 1000){
            switch(gamemode){
                case "easy":
                    this.health -= 10;
                    break;
                case "medium":
                    this.health -= 15;
                    break;
                case "hard":
                    this.health -= 20;
                    break;
                default:
                    console.log("error with gamemode selection");
            }
            //document.getElementById("ekran").style.border = "20px solid #f00";
            this.punchAudio.play();
            if(this.health <= 0){
                //console.log("DEAD");
                window.location.href = "./dead.html";
            }
            this.last_taken_damage = time;
        }
    }

}

FirstPersonController.defaults = {
    aspect           : 1,
    fov              : 1.5,
    near             : 0.01,
    far              : 100,
    velocity         : [0, 0, 0],
    pointerSensitivity : 0.002,
    maxSpeed         : 3,
    friction         : 0.2,
    acceleration     : 20
};