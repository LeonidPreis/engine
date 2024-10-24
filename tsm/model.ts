import { Polygon } from "./polygon";
import { Vector } from "./vector";

export interface IModel {
    vertices: Vector[];
    polygons: Polygon[];
}

export class Model implements IModel {
    vertices: Vector[];
    polygons: Polygon[];

    constructor(
        vertices: Vector[],
        polygons: Polygon[]
    ) {
        this.vertices = vertices;
        this.polygons = polygons;
    }

    verticesAmount(): number {
        return this.vertices.length;
    }

    polygonAmount(): number {
        return this.polygons.length;
    }
}