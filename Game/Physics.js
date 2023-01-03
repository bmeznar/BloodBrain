import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

export class Physics {

    constructor(scene, controller, zombies) {
        this.scene = scene;
        this.controller = controller;
        this.zombies = zombies;
    }

    update(dt) {
        const node = this.controller.node;
        
        // Move every node with defined velocity.
        //vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
        //node.updateMatrix();

        // After moving, check for collision with every other node.
        this.scene.traverse(other => {
            if (node !== other && other.mesh && other.extras.colider) {
                this.resolveCollision(this.controller.node, other, this.getTransformedAABBForFirstPersonController(this.controller), this.getTransformedAABB(other));
                for(let i = 0; i < this.zombies.length; i++) {
                    //console.log(this.zombies[i]);
                    this.resolveCollision(this.zombies[i].zombie_scene.nodes[0], other, this.getTransformedAABB(this.zombies[i].zombie_scene.nodes[0].children[0]), this.getTransformedAABB(other));
                    //this.resolveCollision(this.controller.node, this.zombies[i].zombie_scene.nodes[0], this.getTransformedAABBForFirstPersonController(this.controller), this.getTransformedAABB(this.zombies[i].zombie_scene.nodes[0].children[0]));
                }
            }
        });
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    getTransformedAABB(node) {
        // Transform all vertices of the AABB from local to global space.
        const transform = node.getGlobalTransform();
        const { min, max } = node.mesh.primitives[0].attributes.POSITION;
        const vertices = [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ].map(v => vec3.transformMat4(v, v, transform));

        // Find new min and max by component.
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
        return { min: newmin, max: newmax };
    }

    getTransformedAABBForFirstPersonController(node) {
        // Transform all vertices of the AABB from local to global space.
        const transform = node.node.getGlobalTransform();
        const { min, max } = node.aabb;
        const vertices = [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ].map(v => vec3.transformMat4(v, v, transform));

        // Find new min and max by component.
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
        return { min: newmin, max: newmax };
    }

    resolveCollision(a, b, aBox, bBox) {
        // Get global space AABBs.
        //const aBox = this.getTransformedAABB(a);
        //const bBox = this.getTransformedAABB(b);
        // Check if there is collision.
        const isColliding = this.aabbIntersection(aBox, bBox);
        if (!isColliding) {
            return;
        }

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
        const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        //vec3.add(a.translation, a.translation, minDirection);
        //a.updateMatrix();
        a.translation = vec3.add(vec3.create(), a.translation, minDirection);
    }

}
