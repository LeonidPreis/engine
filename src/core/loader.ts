import { Color } from "./color";
import { Model } from "./model";

export class ModelLoader {
    public static async fromFile(file: File): Promise<Model> {
        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'stl':
                return this.parseSTL(await file.text());
            default:
                throw new Error(`Unsupported file type: ${extension}. Format that you can use is stl (ASCII).`);
        }
    }

    private static fillColorBuffer(verticesAmount: number, color: Color | undefined): Uint8ClampedArray {
        verticesAmount *= 4;
        const colors = new Uint8ClampedArray(verticesAmount);
    
        if (color) {
            const currentColor = color.toArray();
            for (let i = 0; i < verticesAmount; i += 4) {
                colors[i    ] = currentColor[0];    
                colors[i + 1] = currentColor[1];
                colors[i + 2] = currentColor[2];
                colors[i + 3] = currentColor[3];
            }
        } else {
            for (let i = 0; i < verticesAmount; i += 4) {
                const randomColor = Color.random().toArray();
                colors[i    ] = randomColor[0];    
                colors[i + 1] = randomColor[1];
                colors[i + 2] = randomColor[2];
                colors[i + 3] = randomColor[3];
            }
        }
    
        return colors;
    }

    private static parseSTL(stl: string): Model {
        const vertexMap = new Map<string, number>();
        const vertices: number[] = [];
        const indices: number[] = [];

        const facetRegex: RegExp = /facet normal\s+([\d\-.e]+)\s+([\d\-.e]+)\s+([\d\-.e]+)/g;
        const vertexRegex: RegExp = /vertex\s+([\d\-.e]+)\s+([\d\-.e]+)\s+([\d\-.e]+)/g;

        let matchFacet, matchVertex;
        while ((matchFacet = facetRegex.exec(stl)) !== null) {
            let faceIndices: number[] = [];

            for (let i = 0; i < 3; i++) {
                matchVertex = vertexRegex.exec(stl);
                if (!matchVertex) break;

                const vertexKey = `${matchVertex[1]},${matchVertex[2]},${matchVertex[3]}`;
                let index = vertexMap.get(vertexKey);

                if (index === undefined) {
                    index = vertices.length / 3;
                    vertices.push(
                        parseFloat(matchVertex[1]),
                        parseFloat(matchVertex[2]),
                        parseFloat(matchVertex[3])
                    );
                    vertexMap.set(vertexKey, index);
                }
                faceIndices.push(index);
            }

            if (faceIndices.length === 3) {
                indices.push(...faceIndices);
            }
        }

        return new Model(
            new Float32Array(vertices),
            new Uint32Array(indices),
            this.fillColorBuffer(vertices.length, new Color('HEX', '#776F74'))
        );
    }
}