### [Vector3](./vector3.md).projectionLength
#### Description
Projects the current vector onto vector B and returns the scalar magnitude of the projection along that vector.
The method does not return the full projection vector, only its length along the direction of vector B. Neither the source vector nor the target vector need to be normalized.

```math
\text{Projection}_{\overline{b}}\overline{a}=\left|\overline{a}\right|\cos\angle(\overline{a},\overline{b})=\left|\overline{a}\right|\frac{\overline{a}\cdot\overline{b}}{\left|\overline{a}\right|\left|\overline{b}\right|}=\frac{\overline{a}\cdot\overline{b}}{\left|\overline{b}\right|}
```
```math
\text{Projection}_{\overline{b}}\overline{a}=\frac{a_{x}b_{x}+a_{y}b_{y}+a_{z}b_{z}}{\sqrt{b_{x}^2+b_{y}^2+b_{z}^2}}
```

#### Signature
```typescript
public projectionLength(vB: Vector3): number
```
#### Parameters
|Parameter|Type|Description|
|:-:|:-:|:-|
|vB|**`Vector3`**|	The vector onto which the current vector is projected.|

#### Returns
|Type|Description|
|:-:|:-|
|**`number`**|The **scalar magnitude** of the projection of the current vector onto vB.|
> Returns zero If one of the vectors has **zero length** or the angle between the vectors is **90 degrees**.

#### Examples
```typescript
const vectorA: Vector3 = new Vector3(3, 2, 0);
const vectorB: Vector3 = new Vector3(2,-1, 0);
const projection: number = vectorA.projectionLength(vectorB);
// Expected result: 1.7888543819998317.
```

#### See also
- [Vector3.length](./vector3.length.md)
- [Vector3.dot](./vector3.dot.md)
- [Vector3.angle](./vector3.angle.md)