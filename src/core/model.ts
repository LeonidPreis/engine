

export interface IModel {
    vertices: Float32Array;
    indices: Uint32Array;
    colors?: Float32Array;
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
    public colors: Float32Array;
    public drawMode: DrawMode;
    public normals: Float32Array;

    constructor(
        vertices: Float32Array,
        indices: Uint32Array,
        colors: Float32Array,
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
        let normals: number[] = [];
        for (let i = 0; i < this.indices.length; i+=3) {
            let A = this.indices[i    ];
            let B = this.indices[i + 1];
            let C = this.indices[i + 2];

            let xA = this.vertices[B * 3    ] - this.vertices[A * 3    ];
            let yA = this.vertices[B * 3 + 1] - this.vertices[A * 3 + 1];
            let zA = this.vertices[B * 3 + 2] - this.vertices[A * 3 + 2];

            let xB = this.vertices[C * 3    ] - this.vertices[A * 3    ];
            let yB = this.vertices[C * 3 + 1] - this.vertices[A * 3 + 1];
            let zB = this.vertices[C * 3 + 2] - this.vertices[A * 3 + 2];

            let xN = yA * zB - yB * zA;
            let yN = -(xA * zB - xB * zA);
            let zN = xA * yB - xB * yA;

            let length = (xN * xN + yN * yN + zN * zN) ** 0.5;
            if (length > 0) xN /= length; yN /= length; zN /= length;

            normals = normals.concat([xN, yN, zN]).concat([xN, yN, zN]).concat([xN, yN, zN]);
        }

        return new Float32Array(normals);
    }
}