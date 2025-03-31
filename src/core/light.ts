import { Color } from "./color";
import { Vector3 } from "./vector3";

export class PointLight {
    public position: Vector3;
    public color: Color;
    public intensity: number;

    constructor(position: Vector3, color: Color, intensity: number = 1.0) {
        this.position = position;
        this.color = color;
        this.intensity = intensity;
    }

    public getLightData(): [Float32Array, Uint8ClampedArray, number] {
        return [
            this.position.toFloat32Array(),
            this.color.toUint8ClampedArray(),
            this.intensity
        ];
    }
}
