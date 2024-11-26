import { Canvas } from "./canvas";
import { Camera } from "./camera";
import { Instance } from "./instance";
import { Vector4, Vector3 } from "./vector";
import { Matrix4 } from "./matrix";
import { Polygon } from "./polygon";

export class VertexShader {
    coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    private cameraDirection: Vector4 = this.coordinatesSystem === 'RHS' ? new Vector4(0, 0, -1) : new Vector4(0, 0, 1);
    private backFaceCullingEnabled: boolean = true;
    canvas: Canvas;
    camera: Camera;
    instances: Instance[];
    cameraView: Matrix4;
    cameraProjection: Matrix4;
    xScreenMultiplier: number;
    yScreenMultiplier: number;

    // constructor(canvas: Canvas, camera: Camera, instances: Instance[]) {
    //     this.canvas = canvas;
    //     this.camera = camera;
    //     this.instances = instances;
    //     this.cameraView = this.camera.view();
    //     this.cameraProjection = this.camera.getProjectionMatrix();
    //     this.xScreenMultiplier = this.canvas.width / this.canvas.aspect;
    //     this.yScreenMultiplier = this.canvas.height / this.canvas.aspect;
    // }

    backfaceCulling(normal: Vector4): boolean {
        return normal.dot(this.cameraDirection) > 0;
    }

    localToGlobal(local: Vector4, transformation: Matrix4): Vector4 {
        return transformation.multiplyVector(new Vector4(local.x, local.y, local.z, 1));
    }

    globalToView(global: Vector4): Vector4 {
        return this.cameraView.multiplyVector(global);
    }

    viewToNDC(view: Vector4): Vector4 {
        return this.cameraProjection.multiplyVector(view);
    }

    NDCToClip(ndc: Vector4): Vector3 | null{
        if (ndc.w !== 0) {
            const x = ndc.x / ndc.w;
            const y = ndc.y / ndc.w;
            const z = ndc.z / ndc.w;
            return new Vector3(x, y, z);
        }
        console.error("W component of the vector is 0.")
        return null;
    }

    clipToScreen(clip: Vector3) {
        return new Vector3(
            (clip.x * this.xScreenMultiplier) | 0,
            (clip.y * this.yScreenMultiplier) | 0,
            clip.z
        );
    }

    getScreenVertices(instance: Instance) {
        const viewCoordinates: Vector4[] = [];
        const screenVertices: Vector3[] = [];
        const polygons: Polygon[] = [];

        for (var i = 0; i < instance.model.vertices.length; i++) {
            const vector: Vector3 = instance.model.vertices[i];
            const global: Vector4 = this.localToGlobal(new Vector4(vector.x, vector.y, vector.z, 1), instance.transformation);
            const view: Vector4 = this.globalToView(global);
            viewCoordinates.push(view);
        }

        for (var i = 0; i < instance.model.polygons.length; i++) {
            const polygon: Polygon = instance.model.polygons[i];
            const normal: Vector4 = polygon.calculateNormal(viewCoordinates);
            var cullPolygon: boolean = false;

            if (this.backfaceCulling(normal)) {
                polygon.normalView = normal;
                cullPolygon = true;
            }

            if (!this.backFaceCullingEnabled || cullPolygon) {
                const NDCA: Vector4 = this.viewToNDC(viewCoordinates[polygon.vA]);
                const NDCB: Vector4 = this.viewToNDC(viewCoordinates[polygon.vB]);
                const NDCC: Vector4 = this.viewToNDC(viewCoordinates[polygon.vC]);
                const clipA: Vector3 = this.NDCToClip(NDCA);
                const clipB: Vector3 = this.NDCToClip(NDCB);
                const clipC: Vector3 = this.NDCToClip(NDCC);

                polygons.push(polygon);
                screenVertices.push(
                    this.clipToScreen(clipA),
                    this.clipToScreen(clipB),
                    this.clipToScreen(clipC)
                );         
            }
        }
        return [screenVertices, polygons];
    }

    getOutCode(vNDC: Vector4): number {
        const x = vNDC.x, y = vNDC.y, z = vNDC.z;
        let code = 0;
        if (x < -1) code |= 0b100000; 
        if (x >  1) code |= 0b010000;
        if (y < -1) code |= 0b001000;
        if (y >  1) code |= 0b000100;
        if (z < -1) code |= 0b000010;
        if (z >  1) code |= 0b000001;
        return code;     
    }

    clippLine(vANDC: Vector4, vBNDC: Vector4): Vector4[] | null {
        const aCode = this.getOutCode(vANDC);
        const bCode = this.getOutCode(vBNDC);

        if ((aCode & bCode) !== 0) return null; // completely outside

        const xA = vANDC.x, xB = vBNDC.x;
        const yA = vANDC.y, yB = vBNDC.y;
        const zA = vANDC.z, zB = vBNDC.z;
        const xMin = -1, xMax = 1;
        const yMin = -1, yMax = 1;
        const zMin = -1, zMax = 1;
        var tIn = 0, tOut = 1;
        var intersections = [];

        const p = [
            -(xB - xA), xB - xA,
            -(yB - yA), yB - yA,
            -(zB - zA), zB - zA
        ];

        const q = [
            xA - xMin, xMax - xA, 
            yA - yMin, yMax - yA, 
            zA - zMin, zMax - zA
        ];

        for (let i = 0; i < 6; i++) {
            const t = q[i] / p[i];
            if (p[i] < 0) {
                tIn = Math.max(tIn, t);
            } else {
                tOut = Math.min(tOut, t);
            }
            if (tIn > tOut) return null;
        }

        var vA = new Vector4(xA + tIn * (xB - xA), yA + tIn * (yB - yA), zA + tIn * (zB - zA));
        var vB = new Vector4(xA + tOut * (xB - xA),yA + tOut * (yB - yA),zA + tOut * (zB - zA));

        if (!vA.equal(vANDC)) intersections.push(vA); else intersections.push(null);
        if (!vB.equal(vBNDC)) intersections.push(vB); else intersections.push(null);
    
        return intersections;
    }

    polygonIntersection(vA: Vector4, vB: Vector4, vC: Vector4) {
        var [a, b] = this.clippLine(vA, vB) || [null, null];
        var [c, d] = this.clippLine(vB, vC) || [null, null];
        var [e, f] = this.clippLine(vC, vA) || [null, null];

        if (this.getOutCode(vA) !== 0) vA = null;
        if (this.getOutCode(vB) !== 0) vB = null;
        if (this.getOutCode(vC) !== 0) vC = null;

        var vertices: Vector4[] = [vA,a,b,vB,c,d,vC,e,f];
        vertices = vertices.filter(vertex => vertex !== null);
        var polygons: Polygon[] = [];
        var indexes: number[] = [];

        for (var i = 0; i < vertices.length; i++) {
            indexes.push(i);
            if (indexes.length === 3) {
                polygons.push(new Polygon(indexes[0], indexes[1], indexes[2]));
                indexes = [i];
            }
        }
        if (indexes.length === 2) {
            polygons.push(new Polygon(indexes[0], indexes[1], 0));
        }
        if (vertices.length === 6) polygons.push(new Polygon(0, 2, 4));
        return [vertices, polygons];
    }
}


var a = new Vector4(-0.5, -1.5, 1);
var b = new Vector4(1.5, 0.5, -1.5);
var c = new Vector4(0, 1.5, 0.5);


console.log(new VertexShader().polygonIntersection(a,b,c));






















 