### [Vector3](./vector3.md).cross
#### Description
Calculates a new vector that is perpendicular to the current vector and vector B. The three vectors form a new basis in the right coordinate system (the basis is not orthonormal). The cross product can be computed as the determinant of a three-dimensional matrix with basis vectors i,j,k, current vector $\overline{a}$ and vector $\overline{b}$ as shown in the formula below.

```math
\overline{c}=\begin{vmatrix}
i & j & k \\
\overline{a}_{x} & \overline{a}_{y} & \overline{a}_{z} \\
\overline{b}_{x} & \overline{b}_{y} & \overline{b}_{z}
\end{vmatrix}=\left|a_{y}b_{z}-b_{y}a_{z},\,\,a_{x}b_{z}-b_{x}a_{z},\,\, a_{x}b_{y}-b_{x}a_{y}\right|
```

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
```typescript
const vectorX: Vector3 = new Vector3(1, 0, 0);
const vectorY: Vector3 = new Vector3(0, 1, 0);

// Warning! Ordering the vectors is important and affects the result.
const positiveZ: Vector3 = vectorX.cross(vectorY);
// Expected result: Vector3 {x: 0, y: 0, z: 1}
const negativeZ: Vector3 = vectorY.cross(vectorX);
// Expected result: Vector3 {x: 0, y: 0, z: -1}
```

#### See also
- [Vector3.dot](./vector3.dot.md)
- [Vector3.angle](./vector3.angle.md)