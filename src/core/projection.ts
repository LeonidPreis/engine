import { Matrix4 } from "./matrix4";

export enum ProjectionType {
    Perspective = 'Perspective',
    Ortographic = 'Ortographic'
}

export interface IProjection<T extends object> {
    type: ProjectionType;
    descriptor: T;
    matrix: Matrix4;
    getProjectionMatrix(): Matrix4;
}

export type ProjectionDescriptor = PerspectiveProjectionDescriptor | OrtographicProjectionDescriptor;

export type PerspectiveProjectionDescriptor = {
    near: number,
    far: number,
    FOVY: number,
    aspect: number
}

export class PerspectiveProjection implements IProjection<PerspectiveProjectionDescriptor> {
    type: ProjectionType.Perspective;
    descriptor: PerspectiveProjectionDescriptor;
    matrix: Matrix4;

    constructor(descriptor: Partial<PerspectiveProjectionDescriptor> = {}) {
        this.type = ProjectionType.Perspective;
        this.descriptor = {
            near: descriptor.near ?? 0.1,
            far: descriptor.far ?? 1000,
            FOVY: descriptor.FOVY ?? 90,
            aspect: descriptor.aspect ?? 1
        };
        this.matrix = this.getProjectionMatrix();
    }

    public getProjectionMatrix(): Matrix4 {
        const near = this.descriptor.near;
        const far = this.descriptor.far;
        const FOVY = this.descriptor.FOVY;
        const aspect = this.descriptor.aspect;
        return new Matrix4(
            1.0 / (Math.tan(FOVY / 2) * aspect), 0,                        0,                    0,
            0,                                   1.0 / Math.tan(FOVY / 2), 0,                    0,
            0,                                   0,                        far / (far - near), -(far * near) / (far - near),
            0,                                   0,                        1,                    0
        );
    }
}

type OrtographicProjectionDescriptor = {
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
    scale: number
}

export class OrtographicProjection implements IProjection<OrtographicProjectionDescriptor> {
    type: ProjectionType.Ortographic;
    descriptor: OrtographicProjectionDescriptor;
    matrix: Matrix4;

    constructor(descriptor: Partial<OrtographicProjectionDescriptor> = {}) {
        this.type = ProjectionType.Ortographic;
        this.descriptor = {
            left: descriptor.left ?? 1,
            right: descriptor.right ?? 1,
            top: descriptor.top ?? 1,
            bottom: descriptor.bottom ?? 1,
            near: descriptor.near ?? 1,
            far: descriptor.far ?? 1,
            scale: descriptor.scale ?? 1,
        };
        this.matrix = this.getProjectionMatrix();
    }

    public getProjectionMatrix(): Matrix4 {
        const [left, right] = [this.descriptor.left, this.descriptor.right];
        const [top, bottom] = [this.descriptor.top, this.descriptor.bottom];
        const [near, far] = [this.descriptor.near, this.descriptor.far];
        const scale = this.descriptor.scale;
        return new Matrix4(
            scale * (2 / (right - left)), 0,                            0,                           scale * (-(right + left) / (right - left)),
            0,                            scale * (2 / (top - bottom)), 0,                           scale * (-(top + bottom) / (top - bottom)),
            0,                            0,                            scale * (-2 / (far - near)), scale * (-(far + near) / (far - near)),
            0,                            0,                            0,                           1
        );
    }
}