import { Application } from '../../common/engine/Application.js';

import { GUI } from '../../lib/dat.gui.module.js';
import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

import { Node } from '../../common/engine/Node.js';

//import { Renderer } from './Renderer.js';
import { FirstPersonController } from './FirstPersonController.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Zombie } from './Zombie.js';

import { shaders } from './shaders.js';
import { Camera } from './Camera.js';
import { Gun } from './Gun.js';

class App extends Application {

    async start() {
        this.gameTime = performance.now();
        this.loader = new GLTFLoader();
        await this.loader.load('../Assets/map/lab_map.gltf');

        this.timeElement = document.querySelector("#win");
        this.timeNode = document.createTextNode("0s");
        this.timeElement.appendChild(this.timeNode);

        //this.loader_zombie = new GLTFLoader();
        //await this.loader_zombie.load('../Assets/zombie/zombie_v2.gltf');

        //FIRST PERSON CONTROLLER
        const gl = this.gl;

        //this.renderer = new Renderer(gl);

        this.time = performance.now();
        this.startTime = this.time;

        //generating zombies
        //this.zombies = new Zombie();
        this.zombies = new Array();

        //console.log(this.zombies);
        this.gun = new Gun();
        //console.log(this.gun);

        this.root = new Node();

        this.camera = new Node();
        this.camera.translation = [-45, 1, 7];
        this.camera.projection = mat4.create();
        this.root.addChild(this.camera);

        this.gamemode = "easy";

        //FIRST PERSON CONTROLLER
        //this.controller = new FirstPersonController(this.camera, this.canvas, this.scene);
        
        /*this.shadowCamera = new Node();
        this.shadowCamera.projection = mat4.create();
        mat4.perspective(this.shadowCamera.projection, 0.5, 1, 15, 50);
        this.shadowCamera.translation = [0, 0, 20];
        this.shadowCamera.aspect = 0.3;
        this.shadowCamera.near = 15;
        this.shadowCamera.far = 50;*/
        //console.log(this.loader);

        //console.log(this.scene);
        //for(let i = 0; i < this.zombies.)

        //this.camera = await this.loader.loadNode('Camera');
        //console.log(this.camera);

        //FIRST PERSON CONTROLLER
        this.controller = new FirstPersonController(this.camera, this.canvas);

        const positions = [[-20, -7], [-12.5, 1.3], [-5.8, 1.4], [8.1822, -8.53702], [23.248552, 6.727736]];
        //console.log(positions);
        for(let i = 0; i < 5; i++){
            this.zombie = new Zombie(this.controller, positions[i][0], positions[i][1]);
            this.zombies[i] = this.zombie;
        }

        this.scene = await this.loader.loadScene(this.loader.defaultScene);

        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        //adding zombie nodes
        let index = this.scene.nodes.length;
        for(let i = 0; i < this.zombies.length; i++){
            this.scene.nodes[index+i] = this.zombies[i].zombie_scene.nodes[0];
        }
        //adding gun nodes
        index = this.scene.nodes.length;
        for(let i = 0; i < this.gun.gun_scene.nodes.length; i++){
            this.scene.nodes[index+i] = this.gun.gun_scene.nodes[i];
        }

        this.physics = new Physics(this.scene, this.controller, this.zombies);

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);

        //this.renderer.prepareScene(this.zombies.zombies_array[0]);
        //this.renderer.prepareScene(this.scene_zombie);

        //this.renderer.prepareScene(this.scene_gun);
        this.resize();
    }

    /*async load(uri) {
        this.physics = new Physics(this.scene);
    }*/

    render() {
        /*if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }*/
        this.renderer.render(this.scene, this.camera);
        //this.renderer.render(this.scene, this.camera, this.shadowCamera);
    }

    /*resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.camera.aspect = aspectRatio;
            this.camera.camera.updateMatrix();
        }
    }*/
    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspect = w / h;
        const fovy = Math.PI/2.5;
        const near = 0.1;
        const far = 300;

        mat4.perspective(this.camera.projection, fovy, aspect, near, far);
    }

    update() {
        if (this.controller.kills >= 5) {
            //console.log(this.controller.kills);
            this.controller.kills = -999999;
            this.timeNode.nodeValue = ((performance.now() - this.gameTime) / 1000).toFixed(2) + "s";
            document.getElementById("win").classList.remove("hidden");
        }

        this.time = performance.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        this.controller.update(dt);
        this.physics.update(dt);
        
        let time = new Date();
        for(let i = 0; i < this.zombies.length; i++){
            this.zombies[i].update();
            if(this.zombies[i].check_attack(this.camera.translation)){
                this.controller.take_damage(time, this.gamemode);
            }
            else{
                //console.log(document.getElementById("ekran"));
                //document.getElementById("ekran").style.border = "none";
            }
        }

        for(let i = 0; i < this.controller.bullets.length; i++){
            let index = this.scene.nodes.length;
            //console.log(this.scene.nodes);
            if(this.controller.bullets[i].firstSpawn) {
                this.controller.bullets[i].firstSpawn = false;
                this.controller.bullets[i].spawn_bullet();
            }
            //console.log(this.controller.bullets[i].bullet_scene);
            if (this.controller.bullets[i].bullet_scene) {
                this.controller.bullets[i].sceneIndex = index + i;
                this.scene.nodes[index+i] = this.controller.bullets[i].bullet_scene.nodes[0];
                this.renderer.prepareScene(this.scene);
            }
            //this.scene.nodes[index+i] = this.controller.bullets[i].bullet_scene.nodes[0];
            //this.renderer.prepareScene(this.scene);

            this.controller.bullets[i].update(dt);
            if (this.controller.bullets[i].despawn) {
                //this.controller.bullets[i].bullet_scene.nodes[0].translation = [9999, -9999, 9999];
                //console.log(this.controller.bullets[i].sceneIndex);
                this.scene.nodes.splice(this.controller.bullets[i].sceneIndex, 1);
                //this.renderer.prepareScene(this.scene); 
                this.controller.bullets.splice(i, 1);
            }
        }
        
        this.gun.update(this.camera, this.controller.yaw);
    }

}

const canvas = document.querySelector('canvas');
const app = new App(canvas);
await app.init();
document.querySelector('.loader-container').remove();

const gui = new GUI();
gui.add(app.controller, 'pointerSensitivity', 0.0001, 0.01);
//gui.add(app.controller, 'maxSpeed', 0, 10);
