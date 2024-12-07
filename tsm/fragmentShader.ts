import { Canvas } from "./canvas";
import { Light, IAmbient, IPointLight } from "./light";
import { Polygon, Line } from "./polygon";
import { IFragment } from "./rasterizer";
import { Vector3 } from "./vector";

export class FragmentShader {
    canvas: Canvas;

    constructor (
        canvas: Canvas,
    ) {
        this.canvas = canvas;
    }

    insert(fragments: IFragment[], light: Light, vertices: Vector3[], polygons: (Polygon | Line)[]) {
        for (var i = 0; i < fragments.length; i++) {
            var fragment = fragments[i];
            for (var j = 0; j < fragment.screenCoordinates.length; j++) {
                var color;
                if (fragment.colors.length === 1) {
                    color = fragment.colors[0];
                } else {
                    color = fragment.colors[j];
                }
                if (light.type === "POINT") {
                    //color = Light.applyPointLight(color, light.attributes as IPointLight, vertices, polygons, fragment.polygonIndex);
                }
                this.canvas.putPixel(fragment.screenCoordinates[j][0], fragment.screenCoordinates[j][1], color);
            }
        }
    }
}

