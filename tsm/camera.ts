import { Vector } from './vector'
import { Matrix } from './matrix'
import { Canvas } from './canvas'
import { Render } from './render';

export class Camera {
    static coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    private canvas: Canvas;
    private target: Vector;
    private position: Vector;
    private near: number = 1e-2;
    private far: number = 1e3;
    private aspect: number;
    private fovY: number = 90;
    private fovX: number;
    private projectionPlaneZ: number;
    private projectionType: string;
    public forward: Vector;
    private right: Vector;
    private up: Vector;
    private radius: number;
    private azimuth: number;
    private elevation: number;
    private lastMouseX: number;
    private lastMouseY: number;
    private isRotating: boolean;

    constructor(
        canvas: Canvas,
        target: Vector,
        position: Vector,
        near: number,
        far: number,
        fovY: number,
    ) {
        this.canvas = canvas;
        this.target = target;
        this.position = position;
        this.near = near;
        this.far = far;
        this.aspect = canvas.aspect;
        this.fovY = fovY*Math.PI/180;
        this.fovX = this.aspect*this.fovY;
        this.projectionPlaneZ = 1;
        this.projectionType = 'ONE POINT';
        this.forward = Vector.subtract(this.target, this.position).normalize();
        this.right = Vector.cross(new Vector([0,1,0,1]), this.forward).normalize();
        this.up = Vector.cross(this.forward, this.right);
        this.radius = this.distance();
        this.azimuth = Math.atan2(this.position.z - this.target.z, this.position.x - this.target.x);
        this.elevation = Math.asin((this.position.y - this.target.y) / this.radius);
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isRotating = true;
        this.canvas.canvas.addEventListener('wheel', this.handleScroll.bind(this), false);
        this.canvas.canvas.addEventListener('mousedown', this.startRotation.bind(this), false);
        window.addEventListener('keydown', this.handleKeyDown.bind(this), false);
    }

    distance(): number {
        return Vector.subtract(this.position,this.target).length();
    }

    handleScroll(event) {
        const delta = event.deltaY;
        const increment = delta < 0 ? 1.1 : 0.9;
        this.radius *= increment;
        this.updateCameraPosition();
        Render.main();
    }

    moveCamera(increment) {
        this.radius *= increment;
        this.updateCameraPosition();
        Render.main();
    }

    startRotation(event) {
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.isRotating = true;
        const onMouseMove = this.rotateCamera.bind(this);
        const onMouseUp = () => {
            this.isRotating = false;
            this.canvas.canvas.removeEventListener('mousemove', onMouseMove);
            this.canvas.canvas.removeEventListener('mouseup', onMouseUp);
        };
        this.canvas.canvas.addEventListener('mousemove', onMouseMove, false);
        this.canvas.canvas.addEventListener('mouseup', onMouseUp, false);
    }

    rotateCamera(event) {
        if (!this.isRotating) return;
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        const rotateSpeed = 0.005;
        this.azimuth -= deltaX * rotateSpeed;
        this.elevation += deltaY * rotateSpeed;
        this.elevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.elevation));
        this.updateCameraPosition();
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        Render.main();
    }

    updateCameraPosition() {
        this.position.x = this.target.x + this.radius * Math.cos(this.elevation) * Math.cos(this.azimuth);
        this.position.y = this.target.y + this.radius * Math.sin(this.elevation);
        this.position.z = this.target.z + this.radius * Math.cos(this.elevation) * Math.sin(this.azimuth);
        this.forward = Vector.subtract(this.target, this.position).normalize();
        this.right = Vector.cross(new Vector([0,1,0,1]), this.forward).normalize();
        this.up = Vector.cross(this.forward, this.right);
    }

    scale() {
        this.canvas.canvas.addEventListener('wheel', onmousewheel,false);
        this.canvas.canvas.addEventListener("DOMMouseScroll", onmousewheel, false);
        console.log('scale()')
        function onmousewheel(event) {
            var mouseX = event.clientX*2;
            var mouseY = event.clientY*2;
            var delta = event.type === 'wheel' ? event.wheelDelta : -event.detail;
            var increment = delta > 0 ? 1.1 : 0.9;
            console.log(mouseX, mouseY, delta, increment)
        }
    }
    
    handleKeyDown(event) {
        const moveSpeed = 0.1; // Скорость перемещения
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.position = Vector.add(this.position, Vector.multiply.scalar(this.up, moveSpeed));
                this.target = Vector.add(this.target, Vector.multiply.scalar(this.up, moveSpeed));
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.position = Vector.subtract(this.position, Vector.multiply.scalar(this.up, moveSpeed));
                this.target = Vector.subtract(this.target, Vector.multiply.scalar(this.up, moveSpeed));
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.position = Vector.subtract(this.position, Vector.multiply.scalar(this.right, moveSpeed));
                this.target = Vector.subtract(this.target, Vector.multiply.scalar(this.right, moveSpeed));
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.position = Vector.add(this.position, Vector.multiply.scalar(this.right, moveSpeed));
                this.target = Vector.add(this.target, Vector.multiply.scalar(this.right, moveSpeed));
                break;
        }
    
        this.updateCameraPosition();
        Render.main();
    }

    view() {
        return new Matrix([
            [this.right.x,   this.right.y,   this.right.z,   -Vector.dot(this.right, this.position)  ],
            [this.up.x,      this.up.y,      this.up.z,      -Vector.dot(this.up, this.position)     ],
            [this.forward.x, this.forward.y, this.forward.z, -Vector.dot(this.forward, this.position)],
            [0,              0,              0,               1                                      ]
        ]);
    }

    viewToScreen(vertex) {
        if (this.canvas.width > this.canvas.height) {
            return new Vector(
                [vertex.x*this.canvas.width/this.canvas.ratio.x|0,
                vertex.y*this.canvas.height/this.canvas.ratio.x|0,
                vertex.z,
                vertex.w]
            );
        } else {
            return new Vector(
                [vertex.x*this.canvas.width/this.canvas.ratio.y|0,
                vertex.y*this.canvas.height/this.canvas.ratio.y|0,
                vertex.z,
                vertex.w]
            );
        }
    }

    perspectiveDivision(vertex) {
        if (vertex.w === 0) {
            throw Error("W component of the vector is 0.")
        }
        const x = vertex.x/vertex.w;
        const y = vertex.y/vertex.w;
        const z = vertex.z/vertex.w;
        return this.viewToScreen(new Vector([x, y, z, 1]));
    }

    setProjection(type) {
        this.projectionType = type;
    }

    getProjectionMatrix() {
        switch (this.projectionType) {
            case 'ONE POINT':
                return new Matrix([
                    [1/(Math.tan(this.fovY/2)*this.aspect),     0,                  0,                  0],
                    [0,   1/Math.tan(this.fovY/2),              0,                                      0],
                    [0,   0,  (this.far)/(this.far-this.near), -(this.far*this.near)/(this.far-this.near)],
                    [0,                                         0,                  1,                  0]
                ]);
            default:
                throw new Error(`Unknown projection type: ${this.projectionType}`);
        }
    }
}