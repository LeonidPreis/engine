### [Vector3](./vector3.md).subtract
#### Description
Subtracts the given vector vB from the current vector and returns the resulting vector. Computes the component-wise difference between the vectors. Does not mutate the original vector — it returns a new Vector3 instance.
![](/docs/figures/vectors/vector3.subtract.formula.png)
#### Signature
```typescript
public subtract(vB: Vector3): Vector3
```
#### Parameters
|Parameter|Type|Description|
|:-:|:-:|:-|
|vB|**`Vector3`**|The vector to subtract from this vector.|

#### Returns
|Type|Description|
|:-:|:-|
|**`Vector3`**|A new vector equal to the current vector minus vB. The original vectors remain unchanged.|

#### Examples
![](/docs/figures/vectors/vector.subtract.png)
```typescript
const vectorA: Vector3 = new Vector3( 2,-3, 0);
const vectorB: Vector3 = new Vector3(-1,-2, 0);
const vectorC: Vector3 = vectorA.subtract(vectorB);
// Expected result: Vector3 {x: 3, y: -1, z: 0}.
```

#### See also
- [Vector3.add](./vector3.add.md)