import { vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { Node } from '../../common/engine/Node.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

export class Zombie {
    constructor() {
        this.make_zombie();
    }

    async make_zombie(){
        this.loader_zombie = new GLTFLoader();
        await this.loader_zombie.load('../Assets/zombie/zombie_v2.gltf');
        this.zombie_scene = await this.loader_zombie.loadScene(this.loader_zombie.defaultScene);

        this.moveX = 0;
        this.moveY = 0.01;
        this.delayer = Math.floor(Math.random() * (300 - 1 + 1) + 1);
        this.moveZombie = false;

        //this.zombies_array = new Array();
        //let test = this.zombie_scene;
        let x = (Math.random() * 80) - 40;
        let y = (Math.random() * 80) - 40;
        this.zombie_scene.nodes[0].translation = [x, 0, y];
        //console.log(this.zombie_scene);
        //console.log(x+" "+y);
        //this.zombies_array[i] = (test.nodes[0]);

        /*for(let i = 0; i < 20; i++){
            let test = this.zombie_scene;
            let x = (Math.random() * 80) - 40;
            let y = (Math.random() * 80) - 40;
            test.nodes[0].translation = [x, 0, y];
            //console.log(x+" "+y);
            this.zombies_array[i] = (test.nodes[0]);
        }*/

    }


    update(){
        //let rotation = this.zombie_scene.nodes[0].rotation[1] + 0.001;
        //this.zombie_scene.nodes[0].rotation = [0,1,0,0];
        //this.zombie_scene.nodes[0].scale = [1,1,1];
        //console.log(this.zombie_scene);
        this.moveZombie = false;
        this.delayer++;
        if (this.delayer >= 300) {
            this.delayer = Math.floor(Math.random() * (300 - 1 + 1) + 1);
            this.moveZombie = true;
        }

        if (this.moveZombie) {
            const rndInt = Math.floor(Math.random() * 5) + 1

            //spreminjanje koordinat zombijev
            switch (rndInt) {
                case(1):
                    this.moveX = 0.017;
                    this.moveY = 0;
                    break;
                case(2):
                    this.moveX = -0.017;
                    this.moveY = 0;
                    break;
                case(3):
                    this.moveX = 0;
                    this.moveY = 0.017;
                    break;
                case(4):
                    this.moveX = 0;
                    this.moveY = -0.017;
                    break;
                case(5):
                    this.moveX = 0;
                    this.moveY = 0;
            }
        }

        const x = this.zombie_scene.nodes[0].translation[0] + this.moveX;
        const y = this.zombie_scene.nodes[0].translation[2] + this.moveY;

        this.zombie_scene.nodes[0].translation = [x, 0, y];
    }
}