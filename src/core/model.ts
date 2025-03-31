

export interface IModel {
    vertices: Float32Array;
    indices: Uint32Array;
    colors?: Uint8ClampedArray;
    normals?: Float32Array;
    drawMode: DrawMode;
}

export enum DrawMode {
    polygon = 'polygon',
    line = 'line'
}

export class Model implements IModel {
    public vertices: Float32Array;
    public indices: Uint32Array;
    public colors: Uint8ClampedArray;
    public drawMode: DrawMode;
    public normals: Float32Array;

    constructor(
        vertices: Float32Array,
        indices: Uint32Array,
        colors: Uint8ClampedArray,
        drawMode: DrawMode = DrawMode.polygon
    ) {
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
        this.drawMode = drawMode;
        this.normals = this.calculateNormals();
    }

    public verticesAmount(): number {
        return this.vertices.length;
    }

    public polygonAmount(): number {
        return this.indices.length / 3;
    }

    public calculateNormals(): Float32Array {
        const normals = new Float32Array(this.vertices.length);
        const vertexCount = this.vertices.length / 3;
        
        for (let i = 0; i < this.indices.length; i += 3) {
            const i0 = this.indices[i    ] * 3;
            const i1 = this.indices[i + 1] * 3;
            const i2 = this.indices[i + 2] * 3;
    
            const A = this.vertices.subarray(i0, i0 + 3);
            const B = this.vertices.subarray(i1, i1 + 3);
            const C = this.vertices.subarray(i2, i2 + 3);

            const AB = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
            const AC = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];

            const N = [
                AB[1] * AC[2] - AB[2] * AC[1],
                AB[2] * AC[0] - AB[0] * AC[2],
                AB[0] * AC[1] - AB[1] * AC[0]
            ];

            const length = Math.sqrt(N[0] ** 2 + N[1] ** 2 + N[2] ** 2);
            if (length > 0) { N[0] /= length; N[1] /= length; N[2] /= length; }

            for (const index of [i0, i1, i2]) {
                normals[index    ] += N[0];
                normals[index + 1] += N[1];
                normals[index + 2] += N[2];
            }
        }

        for (let i = 0; i < vertexCount; i++) {
            const ni = i * 3;
            const nx = normals[ni    ];
            const ny = normals[ni + 1];
            const nz = normals[ni + 2];
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            if (len > 0) {
                normals[ni] /= len;
                normals[ni + 1] /= len;
                normals[ni + 2] /= len;
            }
        }
    
        return normals;
    }
}