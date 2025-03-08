import { Euler, RotationOrder } from "./core/euler"
import {Quaternion} from "./core/quaternion"

const rad = Math.PI / 180;

const euler = new Euler(10*rad, 20*rad, 30*rad, RotationOrder.XYZ, true);

const matrix = euler.rotateXYZ();

const quaternion = Quaternion.fromRotationMatrix(matrix);

console.log(euler)
console.log(quaternion.toEuler(RotationOrder.XYZ, true))