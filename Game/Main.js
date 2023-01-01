import { Application } from '../../common/engine/Application.js';

import { GUI } from '../../lib/dat.gui.module.js';
import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

import { Node } from '../../common/engine/Node.js';

//import { Renderer } from './Renderer.js';
import { FirstPersonController } from './FirstPersonController.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';

import { shaders } from './shaders.js';
import { Camera } from './Camera.js';

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('../Assets/map/lab_map.gltf');

        //FIRST PERSON CONTROLLER
        const gl = this.gl;

        //this.renderer = new Renderer(gl);

        this.time = performance.now();
        this.startTime = this.time;

        this.root = new Node();

        this.camera = new Node();
        this.camera.translation = [0, 1, 0];
        this.camera.projection = mat4.create();
        this.root.addChild(this.camera);

        //FIRST PERSON CONTROLLER
        this.controller = new FirstPersonController(this.camera, this.canvas);
        
        this.shadowCamera = new Node();
        this.shadowCamera.projection = mat4.create();
        mat4.perspective(this.shadowCamera.projection, 0.5, 1, 15, 50);
        this.shadowCamera.translation = [0, 0, 20];
        this.shadowCamera.aspect = 0.3;
        this.shadowCamera.near = 15;
        this.shadowCamera.far = 50;

        this.scene = await this.loader.loadScene(this.loader.defaultScene);

        //this.camera = await this.loader.loadNode('Camera');
        //console.log(this.camera);

        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        this.physics = new Physics(this.scene, this.controller);

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
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
        this.time = performance.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        this.controller.update(dt);
        this.physics.update(dt);
    }

}

const canvas = document.querySelector('canvas');
const app = new App(canvas);
await app.init();
document.querySelector('.loader-container').remove();

const gui = new GUI();
gui.add(app.controller, 'pointerSensitivity', 0.0001, 0.01);
gui.add(app.controller, 'maxSpeed', 0, 10);
