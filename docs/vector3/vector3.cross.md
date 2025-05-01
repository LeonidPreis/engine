### [Vector3](./vector3.md).cross
#### Description
Calculates a new vector that is perpendicular to the current vector and vector B. The three vectors form a new basis in the right coordinate system (the basis is not orthonormal). The cross product can be computed as the determinant of a three-dimensional matrix with basis vectors i,j,k, current vector $\overline{a}$ and vector $\overline{b}$ as shown in the formula below.

![](/docs/figures/vectors/vector3.cross.formula.png)

#### Signature
```typescript
public cross(vB: Vector3): Vector3
```
#### Parameters
|Parameter|Type|Description|
|:-:|:-:|:-|
|vB|**`Vector3`**|Second vector.|

#### Returns
|Type|Description|
|:-:|:-|
|**`Vector3`**|New vector that is perpendicular to the current vector and vector B.|

#### Examples
![](/docs/figures/vectors/vector.cross.png)
```typescript
const axisX: Vector3 = new Vector3(1, 0, 0);
const axisZ: Vector3 = new Vector3(0, 0, 1);

// Warning! Ordering the vectors is important and affects the result.

const positiveY = axisZ.cross(axisX);
// Expected result: Vector3 {x: 0, y: 1, z: 0}

const negativeY = axisX.cross(axisZ);
// Expected result: Vector3 {x: 0, y:-1, z: 0}
```

#### See also
- [Vector3.dot](./vector3.dot.md)
- [Vector3.angle](./vector3.angle.md)