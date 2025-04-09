import { Vector3 } from "./vector3";
import { Model, PrimitiveType } from "./model";
import { Color} from "./color";
import { Instance } from "./instance";
    
export class Mesh {
    static defaultColor = new Color('HEX', '#776F74');

    public static cube(
        width: number = 1, 
        height: number = 1, 
        length: number = 1, 
        widthSegments: number = 1, 
        heightSegments: number = 1, 
        lengthSegments: number = 1,
        color: Color = Mesh.defaultColor
        ): Model {

        const xStart = -width / 2;
        const xStep = width / widthSegments;
        const yStart = -height / 2;
        const yStep = height / heightSegments;
        const zStart = -length / 2;
        const zStep = length / lengthSegments;

        const vertices: number[] = [];
        const indices: number[] = [];

        for (let xi = 0; xi <= widthSegments; xi++) {
            for (let yi = 0; yi <= heightSegments; yi++) {
                for (let zi = 0; zi <= lengthSegments; zi++) {
                    const x = xStart + xi * xStep;
                    const y = yStart + yi * yStep;
                    const z = zStart + zi * zStep;
                    vertices.push(x, y, z);
                }
            }
        }

        function getVertexIndex(x: number, y: number, z: number): number {
            return z + (lengthSegments + 1) * (y + (heightSegments + 1) * x);
        }

        for (let xi = 0; xi < widthSegments; xi++) {
            for (let yi = 0; yi < heightSegments; yi++) {
                for (let zi = 0; zi < lengthSegments; zi++) {                    
                    if (xi === 0) {
                        const a = getVertexIndex(xi, yi, zi);
                        const b = getVertexIndex(xi, yi + 1, zi);
                        const c = getVertexIndex(xi, yi + 1, zi + 1);
                        const d = getVertexIndex(xi, yi, zi + 1);
                        indices.push(c, b, a);
                        indices.push(d, c, a);
                    }
                    
                    if (yi === 0) {
                        const a = getVertexIndex(xi, yi, zi);
                        const b = getVertexIndex(xi + 1, yi, zi);
                        const c = getVertexIndex(xi + 1, yi, zi + 1);
                        const d = getVertexIndex(xi, yi, zi + 1);
                        indices.push(c, a, b);
                        indices.push(d, a, c);
                    }
                    
                    if (zi === 0) {
                        const a = getVertexIndex(xi, yi, zi);
                        const b = getVertexIndex(xi + 1, yi, zi);
                        const c = getVertexIndex(xi + 1, yi + 1, zi);
                        const d = getVertexIndex(xi, yi + 1, zi);
                        indices.push(c, b, a);
                        indices.push(d, c, a);
                    }
                    
                    if (xi === lengthSegments - 1) {
                        const a = getVertexIndex(xi + 1, yi, zi);
                        const b = getVertexIndex(xi + 1, yi + 1, zi);
                        const c = getVertexIndex(xi + 1, yi + 1, zi + 1);
                        const d = getVertexIndex(xi + 1, yi, zi + 1);
                        indices.push(c, a, b);
                        indices.push(d, a, c);
                    }
                    
                    if (yi === widthSegments - 1) {
                        const a = getVertexIndex(xi, yi + 1, zi);
                        const b = getVertexIndex(xi + 1, yi + 1, zi);
                        const c = getVertexIndex(xi + 1, yi + 1, zi + 1);
                        const d = getVertexIndex(xi, yi + 1, zi + 1);
                        indices.push(a, c, b);
                        indices.push(a, d, c);
                    }
                    
                    if (zi === heightSegments - 1) {
                        const a = getVertexIndex(xi, yi, zi + 1);
                        const b = getVertexIndex(xi + 1, yi, zi + 1);
                        const c = getVertexIndex(xi + 1, yi + 1, zi + 1);
                        const d = getVertexIndex(xi, yi + 1, zi + 1);
                        indices.push(c, a, b);
                        indices.push(d, a, c);
                    }
                }
            }
        }
        return new Model(new Float32Array(vertices), new Uint32Array(indices), color.toFloat32Array());
    }

    public static plane(
        width: number = 1,
        height: number = 1,
        widthSegments: number = 1,
        heightSegments: number = 1,
        color: Color = Mesh.defaultColor 
        ): Model {
            
        const xStart = -width / 2;
        const xStep = width / widthSegments;
        const yStart = -height / 2;
        const yStep = height / heightSegments;
        const vertices: number[] = [];
        const indices: number[] = [];

        for (let yi = 0; yi <= heightSegments; yi++) {
            for (let xi = 0; xi <= widthSegments; xi++) {
                const x = xStart + xi * xStep;
                const y = yStart + yi * yStep;
                vertices.push(x, y, 0);
            }
        }

        function getVertexIndex(x: number, y: number) {
            return y * (widthSegments + 1) + x;
        }

        for (let yi = 0; yi < heightSegments; yi++) {
            for (let xi = 0; xi < widthSegments; xi++) {
                const a = getVertexIndex(xi, yi);
                const b = getVertexIndex(xi + 1, yi);
                const c = getVertexIndex(xi + 1, yi + 1);
                const d = getVertexIndex(xi, yi + 1);
                indices.push(a, c, b);
                indices.push(a, d, c);
            }
        }
        return new Model(new Float32Array(vertices), new Uint32Array(indices), color.toFloat32Array());
    }

    public static disc(
        innerDiameter: number = 0,
        outerDiameter: number = 0,
        discSegments: number = 5,
        rotationSegments: number = 10,
        startAngle: number = 0,
        endAngle: number = 360,
        color: Color = Mesh.defaultColor
        ): Model {
        
        discSegments = discSegments + 1;
        const radians = Math.PI / 180;
        const innerRadius = innerDiameter / 2;
        const outerRadius = outerDiameter / 2;
        const radiusStep = (outerRadius - innerRadius) / discSegments;
        const angleStep = (endAngle - startAngle) / rotationSegments;
        const vertices: number[] = [];
        const indices: number[] = [];
        
        for (var i = radiusStep; i <= outerRadius; i += radiusStep) {
            for (var j = startAngle; j < endAngle; j += angleStep) {
                vertices.push(i * Math.cos(j * radians), i * Math.sin(j * radians), 0);
            }
        }

        discSegments = discSegments - 1;

        for (var i = 0; i < rotationSegments; i++) {
            for (var j = 0; j < discSegments; j++) {
                var transition = ((i * (discSegments) + j) + rotationSegments + 1);
                var a = i * (discSegments) + j;
                var b = a + rotationSegments;
                var c = b + 1;
                var d = a;
                var e = c;
                var f = a + 1;      
                if (transition % rotationSegments == 0) {
                    var c = f;
                    var e = f;
                    var f = f - rotationSegments;
                }
                indices.push(a, b, c);
                indices.push(d, e, f);           
            }
        }

        if (innerDiameter === 0) {
            vertices.push(0,0,0);
            var c = vertices.length - 1;
            for (var i = 0; i < rotationSegments; i++) {
                var a = i;
                var b = a + 1;
                if (a + 1 == rotationSegments) {b = 0}
                indices.push(a, b, c);
            }
        }
        return new Model(new Float32Array(vertices), new Uint32Array(indices), color.toFloat32Array());
    }

    public static sphere(
        diameter: number = 1,
        sectors: number = 10,
        stacks: number = 10,
        color: Color = Mesh.defaultColor
        ): Model {

        const vertices: number[] = [];
        const indices: number[] = [];
        const radius = diameter / 2;
        const stackStep = Math.PI / stacks;
        const sectorStep = 2 * Math.PI / sectors;

        for (let i = 0; i <= stacks; i++) {
            const phi = Math.PI / 2 - i * stackStep
            const y = radius * Math.sin(phi);
            const r = radius * Math.cos(phi);
            for (let j = 0; j <= sectors; j++) {
                const theta = j * sectorStep;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);
                vertices.push(x, y, z);
            }
        }
    
        for (let i = 0; i < stacks; i++) {
            for (let j = 0; j < sectors; j++) {
                const a = i * (sectors + 1) + j;
                const b = a + sectors + 1;
                if (i !== 0) {
                    indices.push(a, a + 1, b);
                }
                if (i !== stacks - 1) {
                    indices.push(b, a + 1, b + 1);
                }
            }
        }
        return new Model(new Float32Array(vertices), new Uint32Array(indices), color.toFloat32Array());
    }

    public static torus(
        torusDiameter: number = 10,
        tubeDiameter: number = 5,
        stecks: number = 30,
        sectors: number = 20,
        color: Color = Mesh.defaultColor
    ): Model {

        const torusRadius = torusDiameter / 2;
        const baseRadius = tubeDiameter / 2;
        const stackStep = 2 * Math.PI / sectors;
        const sectorStep = 2 * Math.PI / stecks;
        const vertices: number[] = [];
        const indices: number[] = [];

        for (var i = 0; i <= sectors; i++) {
            var phi = Math.PI - i * stackStep;
            var xy = baseRadius * Math.cos(phi);
            var z = baseRadius * Math.sin(phi);
            for (var j = 0; j <= stecks; j++) {
                var theta = j * sectorStep;
                var x = xy * Math.cos(theta) + torusRadius * Math.cos(theta);
                var y = xy * Math.sin(theta) + torusRadius * Math.sin(theta);
                vertices.push(x, y, z);
            }
        }

        for (let i = 0; i < sectors; ++i) {
            var a = i * (stecks + 1);
            var b = a + stecks + 1;
            for (let j = 0; j < stecks; ++j, ++a, ++b) {
                indices.push(a, b, a + 1);
                indices.push(a + 1, b, b + 1);
            }
        }
        return new Model(new Float32Array(vertices), new Uint32Array(indices), color.toFloat32Array());
    }

    public static cone(
        diameter: number = 1,
        height: number = 2,
        sectors: number = 16,
        color: Color = Mesh.defaultColor
    ): Model {
        const radius = diameter / 2;
        const sectorStep = 2 * Math.PI / sectors;
        const vertices: number[] = [0, 0, 0, 0, 0, height];
        const indices: number[] = [];

        for (let i = 0; i <= sectors; i++) {
            const theta = i * sectorStep;
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            vertices.push(x, 0, z);
        }

        for (let i = 0; i < sectors; i++) {
            const current = 2 + i;
            const next = 2 + (i + 1) % sectors;
            indices.push(0, current, next, 1, next, current);
        }

        return new Model(new Float32Array(vertices), new Uint32Array(indices), color.toFloat32Array());
    }

    public static getNormals(
        instance: Instance,
        distance: number = 0.1,
        color: Color = Mesh.defaultColor
        ): Instance | null {
        let model = instance.model;
        let sourcePrimitive = model.primitive;
        if (model.primitive === PrimitiveType.axis) return null;
        if (model.primitive === PrimitiveType.line) model.setPrimitive(PrimitiveType.polygon);
        let normals: number[] = [];
        let indices: number[] = [];
        for (let i = 0; i < model.indices.length; i++) {
            const vertexIndex = model.indices[i];
            let xStart = model.vertices[vertexIndex * 3    ];
            let yStart = model.vertices[vertexIndex * 3 + 1];
            let zStart = model.vertices[vertexIndex * 3 + 2];
            normals.push(xStart);
            normals.push(yStart);
            normals.push(zStart);
            let xN = model.normals![i * 3    ];
            let yN = model.normals![i * 3 + 1];
            let zN = model.normals![i * 3 + 2]; 
            let xEnd = xStart + distance * xN;
            let yEnd = yStart + distance * yN;
            let zEnd = zStart + distance * zN;
            normals.push(xEnd);
            normals.push(yEnd);
            normals.push(zEnd);
        }
        
        for (let i = 0; i < normals.length / 3; i++) indices.push(i);
        model.setPrimitive(sourcePrimitive);

        return new Instance(
            new Model(
                new Float32Array(normals),
                new Uint32Array(indices),
                new Float32Array(color.toFloat32Array()),
                PrimitiveType.axis
            ),
            instance.transformation
        )
    }
}