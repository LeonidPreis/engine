import { Color } from "./color";

export interface IAmbient {
    color: Color;
    intensity: number;
}

export class Light {
    type:string;
    attributes: IAmbient;

    constructor(
        type: string,
        attributes: IAmbient
    ) {
        this.type = type;
        this.attributes = attributes;
    }

    static normalizeChannels(color: [number, number, number, number]): [number, number, number, number] {
        return [color[0] / 255, color[1] / 255, color[2] / 255, color[3] / 255];
    }

    static applyAmbient(color:[number, number, number, number], ambient: IAmbient): [number, number, number, number] {
        var ambientColor = Light.normalizeChannels(ambient.color.rgbaArray);
        var intensity = ambient.intensity;
        var color = Light.normalizeChannels(color);
        for (var i = 0; i < 4; i++) {
            color[i] = Math.min((color[i] * ambientColor[i] * intensity) * 255, 255);
        }
        return color;
    }
}