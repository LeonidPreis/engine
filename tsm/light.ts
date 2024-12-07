import { Color } from "./color";
import { Polygon } from "./polygon";
import { Vector3, Vector4 } from "./vector";

export interface IAmbient {
    color: Color;
    intensity: number;
}

export interface IPointLight {
    color: Color;
    intensity: number;
    position: Vector3;
    constantAttenuation: number;
    linearAttenuation: number;
    exponentialAttenuation: number;
}

export class Light {
    type: 'AMBIENT' | 'POINT';
    attributes: IAmbient;

    constructor(
        type: 'AMBIENT' | 'POINT',
        attributes: IAmbient
    ) {
        this.type = type;
        this.attributes = attributes;
    }

    static normalizeChannels(color: [number, number, number, number]): [number, number, number, number] {
        return [color[0] / 255, color[1] / 255, color[2] / 255, color[3] / 255];
    }

    static applyAmbientLight(color:[number, number, number, number], ambientLight: IAmbient): [number, number, number, number] {
        var ambientColor = Light.normalizeChannels(ambientLight.color.rgbaArray);
        var intensity = ambientLight.intensity;
        var color = Light.normalizeChannels(color);
        for (var i = 0; i < 4; i++) {
            color[i] = Math.min((color[i] * ambientColor[i] * intensity) * 255, 255);
        }
        return color;
    }

    static applyPointLight(color:[number, number, number, number], pointLight: IPointLight, vertices: Vector3[], polygons: Polygon[], index: number) {
        var polygon = polygons[index];
        var distance = polygon.distanseToPoint(vertices, pointLight.position);
        var effectiveIntensity = pointLight.intensity / (
            pointLight.constantAttenuation + 
            pointLight.linearAttenuation * distance + 
            pointLight.exponentialAttenuation * distance * distance);
        var direction = pointLight.position.subtract(vertices[polygon.vA]).normalize();
        var normal = new Vector3(polygon.nA.x, polygon.nA.y, polygon.nA.z);
        var angularFactor = Math.max(0, normal.dot(direction));
        var lightColor = Light.normalizeChannels(pointLight.color.rgbaArray);
        var color = Light.normalizeChannels(color);
        for (var i = 0; i < 4; i++) {
            color[i] = Math.min((color[i] * lightColor[i] * angularFactor * effectiveIntensity) * 255, 255);
        }
        return color;
    }
}