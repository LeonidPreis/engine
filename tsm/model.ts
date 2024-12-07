import { Polygon, Line } from "./polygon";
import { Vector3 } from "./vector";

export interface IModel {
    vertices: Vector3[];
    polygons: Polygon[] | Line[];
}

export class Model implements IModel {
    vertices: Vector3[];
    polygons: Polygon[] | Line[];

    constructor(
        vertices: Vector3[],
        polygons: Polygon[] | Line[]
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