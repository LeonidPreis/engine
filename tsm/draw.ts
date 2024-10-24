import { Interpolation } from './interpolation';
import { Canvas } from './canvas';
import { Vector } from './vector';
import { Color } from './color';

export class Draw {
    private static canvas: Canvas;
    private static depthBuffer: boolean = true;
    constructor(canvas: Canvas) {
        Draw.canvas = canvas;
    }

    public set depthBufferConsideration(b: boolean) {
        Draw.depthBuffer = b;
    }

    public get depthBufferConsideration(): boolean {
        return Draw.depthBuffer;
    }

    static line = class {
        static filled(vA: Vector, vB: Vector, cA: [number, number, number, number]) {
            if (Math.abs(vB.x - vA.x) > Math.abs(vB.y - vA.y)) {
                if (vA.x > vB.x) {[vA, vB] = [vB, vA];}
                var yi = Interpolation.linear(vA.x, vA.y, vB.x, vB.y);
                if (Draw.depthBuffer) {
                    var zi = Interpolation.linear(vA.x, vA.z, vB.x, vB.z);
                }
                for (var x = vA.x; x <= vB.x; x++) {
                    var y = yi[(x - vA.x) | 0];
                    if (Draw.depthBuffer && !Draw.canvas.updateNearestZ(x, y, zi[(x - vA.x) | 0])) {
                        continue;
                    }
                    Draw.canvas.putPixel(x, y, cA);
                }
            } else {
                if (vA.y > vB.y) {[vA, vB] = [vB, vA];}
                var xi = Interpolation.linear(vA.y, vA.x, vB.y, vB.x);
                if (Draw.depthBuffer) {
                    var zi = Interpolation.linear(vA.y, vA.z, vB.y, vB.z);
                }
                for (var y = vA.y; y <= vB.y; y++) {
                    var x = xi[(y - vA.y) | 0];
                    if (Draw.depthBuffer && !Draw.canvas.updateNearestZ(x, y, zi[(y - vA.y) | 0])) {
                        continue;
                    }
                    Draw.canvas.putPixel(x, y, cA);
                }
            }
        }

        static gradient(vA: Vector, vB: Vector, cA: [number, number, number, number], cB: [number, number, number, number]) {
            if (Math.abs(vB.x - vA.x) > Math.abs(vB.y - vA.y)) {
                if (vA.x > vB.x) {[vA, vB] = [vB, vA];}
                var yi = Interpolation.linear(vA.x, vA.y, vB.x, vB.y);
                var ri = Interpolation.linear(vA.x, cA[0], vB.x, cB[0]);
                var gi = Interpolation.linear(vA.x, cA[1], vB.x, cB[1]);
                var bi = Interpolation.linear(vA.x, cA[2], vB.x, cB[2]);
                var ai = Interpolation.linear(vA.x, cA[3], vB.x, cB[3]);
                if (Draw.depthBuffer) {
                    var zi = Interpolation.linear(vA.x, vA.z, vB.x, vB.z);
                }
                for (var x = vA.x; x <= vB.x; x++) {
                    var y = yi[(x - vA.x) | 0];
                    var color: [number, number, number, number] = [
                        ri[(x - vA.x) | 0],
                        gi[(x - vA.x) | 0],
                        bi[(x - vA.x) | 0],
                        ai[(x - vA.x) | 0]
                    ];
                    if (Draw.depthBuffer && !Draw.canvas.updateNearestZ(x, y, zi[(x - vA.x) | 0])) {
                        continue;
                    }
                    Draw.canvas.putPixel(x, y, color);
                }
            } else {
                if (vA.y > vB.y) {[vA, vB] = [vB, vA];}
                var xi = Interpolation.linear(vA.y, vA.x, vB.y, vB.x);
                var ri = Interpolation.linear(vA.y, cA[0], vB.y, cB[0]);
                var gi = Interpolation.linear(vA.y, cA[1], vB.y, cB[1]);
                var bi = Interpolation.linear(vA.y, cA[2], vB.y, cB[2]);
                var ai = Interpolation.linear(vA.y, cA[3], vB.y, cB[3]);
                if (Draw.depthBuffer) {
                    var zi = Interpolation.linear(vA.y, vA.z, vB.y, vB.z);
                }
                for (var y = vA.y; y <= vB.y; y++) {
                    var x = xi[(y - vA.y) | 0];
                    var color: [number, number, number, number] = [
                        ri[(y - vA.y) | 0],
                        gi[(y - vA.y) | 0],
                        bi[(y - vA.y) | 0],
                        ai[(y - vA.y) | 0]
                    ];
                    if (Draw.depthBuffer && !Draw.canvas.updateNearestZ(x, y, zi[(x - vA.x) | 0])) {
                        continue;
                    }
                    Draw.canvas.putPixel(x, y, color);
                }
            }
        }
    }
    
    static triangle = class {
        static wireframe(vA: Vector, vB: Vector, vC: Vector, cA: [number, number, number, number]) {
            Draw.line.filled(vA, vB, cA);
            Draw.line.filled(vB, vC, cA);
            Draw.line.filled(vC, vA, cA);
        }

        static filled(vA: Vector, vB: Vector, vC: Vector, cA: [number, number, number, number]) {
            if (vB.y < vA.y) {[vA,vB] = [vB,vA];}
            if (vC.y < vA.y) {[vA,vC] = [vC,vA];}
            if (vC.y < vB.y) {[vB,vC] = [vC,vB];}
            var [xac, xabc] = Interpolation.edge(vA.x, vA.y, vB.x, vB.y, vC.x, vC.y);
            var [zac, zabc] = Interpolation.edge(vA.z, vA.y, vB.z, vB.y, vC.z, vC.y);
            var xm = (xabc.length/2)|0;
            if (xac[xm] < xabc[xm]) {
                var [xl,xr] = [xac,xabc];
                var [zl,zr] = [zac,zabc];
            } else {
                var [xl,xr] = [xabc,xac];
                var [zl,zr] = [zabc,zac];
            }
            for (var y = vA.y; y <= vC.y; y++) {
                var XL = xl[y-vA.y]|0;
                var XR = xr[y-vA.y]|0;
                var zs = Interpolation.linear(XL, zl[y-vA.y], XR, zr[y-vA.y]);
                for (var x = XL; x <= XR; x++) {
                    if (Draw.depthBuffer && !Draw.canvas.updateNearestZ(x, y, zs[x-XL])) {
                        continue;
                    }
                    Draw.canvas.putPixel(x, y, cA);
                }
            }
        }

        static gradient(vA: Vector, vB: Vector, vC: Vector, cA: [number, number, number, number], cB: [number, number, number, number], cC: [number, number, number, number]) {
            if (vB.y < vA.y) {[vA,vB] = [vB,vA];[cA,cB] = [cB,cA];}
            if (vC.y < vA.y) {[vA,vC] = [vC,vA];[cA,cC] = [cC,cA];}
            if (vC.y < vB.y) {[vB,vC] = [vC,vB];[cB,cC] = [cC,cB];}
            
            var [xac, xabc] = Interpolation.edge(vA.x, vA.y, vB.x, vB.y, vC.x, vC.y);
            var [zac, zabc] = Interpolation.edge(vA.z, vA.y, vB.z, vB.y, vC.z, vC.y);
            var [rac, rabc] = Interpolation.edge(cA[0], vA.y, cB[0], vB.y, cC[0], vC.y);
            var [gac, gabc] = Interpolation.edge(cA[1], vA.y, cB[1], vB.y, cC[1], vC.y);
            var [bac, babc] = Interpolation.edge(cA[2], vA.y, cB[2], vB.y, cC[2], vC.y);
            var [aac, aabc] = Interpolation.edge(cA[3], vA.y, cB[3], vB.y, cC[3], vC.y);
            
            var xm = (xabc.length / 2) | 0;
            if (xac[xm] < xabc[xm]) {
                var [xl, xr] = [xac, xabc];
                var [zl, zr] = [zac, zabc];
                var [rl, rr] = [rac, rabc];
                var [gl, gr] = [gac, gabc];
                var [bl, br] = [bac, babc];
                var [al, ar] = [aac, aabc];
            }
            else {
                var [xl, xr] = [xabc, xac];
                var [zl, zr] = [zabc, zac];
                var [rl, rr] = [rabc, rac];
                var [gl, gr] = [gabc, gac];
                var [bl, br] = [babc, bac];
                var [al, ar] = [aabc, aac];
            }
            for (var y = vA.y; y <= vC.y; y++) {
                var XL = xl[y - vA.y] | 0;
                var XR = xr[y - vA.y] | 0;
                var zs = Interpolation.linear(XL, zl[y - vA.y], XR, zr[y - vA.y]);
                var rs = Interpolation.linear(XL, rl[y - vA.y], XR, rr[y - vA.y]);
                var gs = Interpolation.linear(XL, gl[y - vA.y], XR, gr[y - vA.y]);
                var bs = Interpolation.linear(XL, bl[y - vA.y], XR, br[y - vA.y]);
                var as = Interpolation.linear(XL, al[y - vA.y], XR, ar[y - vA.y]);
                for (var x = XL; x <= XR; x++) {
                    var color:[number,number,number,number] = [
                        rs[x - XL],
                        gs[x - XL],
                        bs[x - XL],
                        as[x - XL]
                    ]
                    if (Draw.depthBuffer && !Draw.canvas.updateNearestZ(x, y, zs[x-XL])) {
                        continue;
                    }
                    Draw.canvas.putPixel(x, y, color);
                }
            }
        }
    }
}