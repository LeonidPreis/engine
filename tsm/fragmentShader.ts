import { Canvas } from "./canvas";
import { IFragment } from "./rasterizer";

export class FragmentShader {
    canvas: Canvas;

    constructor (
        canvas: Canvas,
    ) {
        this.canvas = canvas;
    }

    insert(fragments: IFragment[]) {
        for (var i = 0; i < fragments.length; i++) {
            var fragment = fragments[i];
            for (var j = 0; j < fragment.screenCoordinates.length; j++) {
                var color;
                if (fragment.colors.length === 1) {
                    color = fragment.colors[0];
                } else {
                    color = fragment.colors[j];
                }
                this.canvas.putPixel(fragment.screenCoordinates[j][0], fragment.screenCoordinates[j][1], color);
            }
        }
    }
}
