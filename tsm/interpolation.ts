export class Interpolation {
    static linear(xA: number, yA: number, xB: number, yB: number): number[] {
        if (xA == xB) {return [yA];}
        const values = [];
        const k = (yB - yA) / (xB - xA);
        var b = yA;
        for (let i = xA; i <= xB; i++) {values.push(b); b += k;}
        return values;
    }

    static edge(xA: number, yA: number, xB: number, yB: number, xC: number, yC: number): number[][] {
        const ab = Interpolation.linear(yA, xA, yB, xB);
        const bc = Interpolation.linear(yB, xB, yC, xC);
        const ac = Interpolation.linear(yA, xA, yC, xC);
        ab.pop();
        const abc = ab.concat(bc);
        return [ac,abc];
    }
}