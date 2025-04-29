### [Vector3](./vector3.md).projectionVector
#### Description
Projects the current vector onto vector vB and returns the full projection vector (not just its scalar length). The result is a vector lying in the vB direction and having a length equal to the [length of the projection](./vector3.projectionLength.md) of the current vector onto vector B. Neither the current vector nor vB needs to be normalized.

```math
\text{Projection}_{\overline{b}}\overline{a}=\overline{b}\left(\frac{\overline{a}\cdot\overline{b}}{\left|\overline{b}\right|^2}\right)
```
```math
\lambda=\frac{\overline{a}\cdot\overline{b}}{\left|\overline{b}\right|^2}=\frac{a_{x}b_{x}+a_{y}b_{y}+a_{z}b_{z}}{\left(\sqrt{b_{x}^2+b_{y}^2+b_{z}^2}\right)^2}
```
```math
\text{Projection}_{\overline{b}}\overline{a}=\lambda\overline{b}=\left(\lambda b_{x}, \lambda b_{y}, \lambda b_{z}\right)
```

#### Signature
```typescript
public projectionVector(vB: Vector3): Vector3
```
#### Parameters
|Parameter|Type|Description|
|:-:|:-:|:-|
|vB|**`Vector3`**|The vector onto which the current vector is projected.|

#### Returns
|Type|Description|
|:-:|:-|
|**`Vector3`**|The vector projection of the current vector onto vB.|
> Returns a **zero-length** vector if the length of any of the two vectors is zero.

#### Example
```typescript
const vectorA = new Vector3(3, 2, 0);
const vectorB = new Vector3(4,-1, 0);
const vectorC = vectorA.projectionVector(vectorB);
// Expected result: Vector3 {x: 2.3529411764705883, y: -0.5882352941176471, z: 0}
```

#### See also
- [Vector3.dot](./vector3.dot.md)
- [Vector3.angle](./vector3.angle.md)
- [Vector3.length](./vector3.length.md)
- [Vector3.projectionLength](./vector3.projectionLength.md)