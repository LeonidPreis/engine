import { Canvas } from "./canvas";
import { Interpolation } from "./interpolation";
import { Polygon } from "./polygon";
import { Vector4, Vector3 } from "./vector";

export interface IFragment {
    screenCoordinates: number[];
    colors: [number, number, number, number][] | [number, number, number, number];
    normals?: Vector4[];
}

export class Rasterizer {
    canvas: Canvas;
    depthEnabled: boolean;

    constructor(
        canvas: Canvas,
    ) {
        this.canvas = canvas;
        this.depthEnabled = true;
    }

    fillPolygon(vertices: Vector3[], polygon: Polygon) {
        var vA = vertices[polygon.vA];
        var vB = vertices[polygon.vB];
        var vC = vertices[polygon.vC];

        if (vB.y < vA.y) {[vA,vB] = [vB,vA];}
        if (vC.y < vA.y) {[vA,vC] = [vC,vA];}
        if (vC.y < vB.y) {[vB,vC] = [vC,vB];}

        var [xac, xabc] = Interpolation.edge(vA.x, vA.y, vB.x, vB.y, vC.x, vC.y);
        var [zac, zabc] = Interpolation.edge(vA.z, vA.y, vB.z, vB.y, vC.z, vC.y);
        
        var xm = (xabc.length / 2) | 0;
        if (xac[xm] < xabc[xm]) {
            var [xl, xr] = [xac, xabc], [zl, zr] = [zac, zabc];
        } else {
            var [xl, xr] = [xabc, xac], [zl, zr] = [zabc, zac];
        }

        var screenCoordinates = [];
        for (var y = vA.y; y <= vC.y; y++) {
            var XL = xl[y-vA.y] | 0;
            var XR = xr[y-vA.y] | 0;
            var z = Interpolation.linear(XL, zl[y-vA.y], XR, zr[y-vA.y]);
            for (var x = XL; x <= XR; x++) {
                if (this.depthEnabled && !this.canvas.updateNearestZ(x, y, z[x-XL])) {
                    continue;
                }
                screenCoordinates.push([x, y]);
            }
        }

        return {
            screenCoordinates: screenCoordinates,
            colors: polygon.cA.rgbaArray
        } as IFragment;
    }

    gradientPolygon(vertices: Vector3[], polygon: Polygon) {
        var vA = vertices[polygon.vA];
        var vB = vertices[polygon.vB];
        var vC = vertices[polygon.vC];
        var cA = polygon.cA.rgbaArray;
        var cB = polygon.cB.rgbaArray;
        var cC = polygon.cC.rgbaArray;

        if (vB.y < vA.y) {[vA,vB] = [vB,vA]; [cA,cB] = [cB,cA];}
        if (vC.y < vA.y) {[vA,vC] = [vC,vA]; [cA,cC] = [cC,cA];}
        if (vC.y < vB.y) {[vB,vC] = [vC,vB]; [cB,cC] = [cC,cB];}

        var [xac, xabc] = Interpolation.edge(vA.x,  vA.y, vB.x,  vB.y, vC.x,  vC.y);
        var [zac, zabc] = Interpolation.edge(vA.z,  vA.y, vB.z,  vB.y, vC.z,  vC.y);
        var [rac, rabc] = Interpolation.edge(cA[0], vA.y, cB[0], vB.y, cC[0], vC.y);
        var [gac, gabc] = Interpolation.edge(cA[1], vA.y, cB[1], vB.y, cC[1], vC.y);
        var [bac, babc] = Interpolation.edge(cA[2], vA.y, cB[2], vB.y, cC[2], vC.y);
        var [aac, aabc] = Interpolation.edge(cA[3], vA.y, cB[3], vB.y, cC[3], vC.y);
        
        var xm = (xabc.length / 2) | 0;
        if (xac[xm] < xabc[xm]) {
            var [xl, xr] = [xac, xabc], [zl, zr] = [zac, zabc];
            var [rl, rr] = [rac, rabc], [gl, gr] = [gac, gabc];
            var [bl, br] = [bac, babc], [al, ar] = [aac, aabc];
        } else {
            var [xl, xr] = [xabc, xac], [zl, zr] = [zabc, zac];
            var [rl, rr] = [rabc, rac], [gl, gr] = [gabc, gac];
            var [bl, br] = [babc, bac], [al, ar] = [aabc, aac];
        }

        var screenCoordinates = [];
        var colors = [];
        for (var y = vA.y; y <= vC.y; y++) {
            var XL = xl[y - vA.y] | 0;
            var XR = xr[y - vA.y] | 0;
            var z = Interpolation.linear(XL, zl[y - vA.y], XR, zr[y - vA.y]);
            var r = Interpolation.linear(XL, rl[y - vA.y], XR, rr[y - vA.y]);
            var g = Interpolation.linear(XL, gl[y - vA.y], XR, gr[y - vA.y]);
            var b = Interpolation.linear(XL, bl[y - vA.y], XR, br[y - vA.y]);
            var a = Interpolation.linear(XL, al[y - vA.y], XR, ar[y - vA.y]);
            for (var x = XL; x <= XR; x++) {
                var color:[number,number,number,number] = [
                    r[x - XL],
                    g[x - XL],
                    b[x - XL],
                    a[x - XL]
                ]
                if (this.depthEnabled && !this.canvas.updateNearestZ(x, y, z[x-XL])) {
                    continue;
                }
                screenCoordinates.push([x, y]);
                colors.push(color);
            }
        }
        
        return {
            screenCoordinates: screenCoordinates,
            colors: colors
        } as IFragment;
    }
}