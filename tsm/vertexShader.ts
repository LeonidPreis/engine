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

    constructor(canvas: Canvas, camera: Camera, instances: Instance[]) {
        this.canvas = canvas;
        this.camera = camera;
        this.instances = instances;
        this.cameraView = this.camera.view();
        this.cameraProjection = this.camera.getProjectionMatrix();
        this.xScreenMultiplier = this.canvas.width / this.canvas.aspect;
        this.yScreenMultiplier = this.canvas.height / this.canvas.aspect;
    }

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
}