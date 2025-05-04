export interface IModel {
    vertices: Float32Array;
    indices: Uint32Array;
    colors?: Float32Array;
    normals?: Float32Array | null;
    primitive: PrimitiveType;
}

export enum PrimitiveType {
    polygon = 'polygon',
    line = 'line',
    axis = 'axis'
}

export class Model implements IModel {
    public vertices: Float32Array;
    public indices: Uint32Array;
    public colors: Float32Array;
    public primitive: PrimitiveType;
    public normals: Float32Array;

    constructor(
        vertices: Float32Array,
        indices: Uint32Array,
        colors: Float32Array,
        primitive: PrimitiveType = PrimitiveType.polygon
    ) {
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
        this.primitive = primitive;
        this.normals = primitive === PrimitiveType.axis ? new Float32Array([]) : this.calculateNormals();
    }

    public clone(): Model {
        return new Model(this.vertices, this.indices, this.colors, this.primitive);
    }

    public verticesAmount(): number {
        return this.vertices.length;
    }

    public polygonAmount(): number {
        return this.indices.length / 3;
    }

    public calculateNormals(): Float32Array {
        let sourcePrimitive = this.primitive;
        if (this.primitive === PrimitiveType.line) this.setPrimitive(PrimitiveType.polygon);
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
        this.setPrimitive(sourcePrimitive);
        return new Float32Array(normals);
    }

    public smoothNormals(): void {
        let sourcePrimitive = this.primitive;

        if (this.primitive === PrimitiveType.axis) return;
        if (this.primitive === PrimitiveType.line) this.setPrimitive(PrimitiveType.polygon)

        let normals = new Map<number, number[]>();
    
        for (let i = 0; i < this.indices.length; i++) {
            const index = this.indices[i];
            const normal = [
                this.normals![i * 3    ],
                this.normals![i * 3 + 1],
                this.normals![i * 3 + 2]
            ];
            if (!normals.has(index)) {
                normals.set(index, normal);
            } else {
                normals.set(index, normals!.get(index)!.concat(normal));
            }
        }
        
        normals.forEach((value, key) => {
            if (value.length > 3) {
                let x = 0, y = 0, z = 0, amount = value.length / 3;
                for (let i = 0; i < value.length; i += 3) {
                    x += value[i    ];
                    y += value[i + 1];
                    z += value[i + 2];
                }
                for (let i = 0; i < value.length; i += 3) {
                    value[i    ] = x / amount;
                    value[i + 1] = y / amount;
                    value[i + 2] = z / amount;
                }
            }
        });
        
        normals.forEach((value, key) => {
            if (value.length > 3) normals.set(key, value.slice(0, 3));
        });
        
        let smoothedNormals = [];
        for (let i = 0; i < this.indices.length; i++) {
            smoothedNormals.push(...normals.get(this.indices[i])!);
        }
        this.setPrimitive(sourcePrimitive);
        this.normals = new Float32Array(smoothedNormals);
    }

    public setPrimitive(primitive: PrimitiveType): void {
        if (this.primitive === primitive || primitive === PrimitiveType.axis) return;
        
        function* primitiveConverter(
            primitive: PrimitiveType,
            indices: Uint32Array
            ): Generator<number, void, unknown> {
            if (primitive === PrimitiveType.line) {
                for (let i = 0; i < indices.length; i += 6) {
                    yield indices[i]; yield indices[i + 2]; yield indices[i + 4];
                } 
            } else if (primitive === PrimitiveType.polygon) {
                for (let i = 0; i < indices.length; i += 3) {
                    const [a, b, c] = [indices[i], indices[i + 1], indices[i + 2]];
                    yield a; yield b; yield b; yield c; yield c; yield a;
                }
            }
        }
        let indices = [...primitiveConverter(this.primitive, this.indices)];
        this.primitive = primitive;
        this.indices = new Uint32Array(indices);
    }
}