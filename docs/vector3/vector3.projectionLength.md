### [Vector3](./vector3.md).projectionLength
#### Description
Projects the current vector onto vector B and returns the scalar magnitude of the projection along that vector.
The method does not return the full projection vector, only its length along the direction of vector B. Neither the source vector nor the target vector need to be normalized.
![](/docs/figures/vectors/vector3.projectionLength.formula.png)

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
![](/docs/figures/vectors/vector.projectionLength.png)
```typescript
const vectorA: Vector3 = new Vector3(3, 2, 0);
const vectorB: Vector3 = new Vector3(5,-1, 0);
const projection: number = vectorA.projectionLength(vectorB);
// Expected result: 2.5495097567963924.
```

#### See also
- [Vector3.length](./vector3.length.md)
- [Vector3.dot](./vector3.dot.md)
- [Vector3.angle](./vector3.angle.md)