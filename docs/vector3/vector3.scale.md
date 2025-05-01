### [Vector3](./vector3.md).scale
#### Description
Multiplies (scales) all components of the current vector by the given scalar value s. This operation preserves the direction of the vector (if the scalar is positive), but changes its length. If the scalar is negative, the vector is flipped in the opposite direction. Does not mutate the original vector — it returns a new scaled vector.
![](/docs/figures/vectors/vector3.scale.formula.png)

#### Signature
```typescript
public scale(s: number): Vector3
```
#### Parameters
|Parameter|Type|Description|
|:-:|:-:|:-|
|s|**`number`**|Scalar value to multiply each component by.|

#### Returns
|Type|Description|
|:-:|:-|
|**`Vector3`**|A new vector whose components are scaled by **`s`**.|

#### Examples
![](/docs/figures/vectors/vector.scale.png)
```typescript
const direction: Vector3 = new Vector3(2, 1, 0);
const negated: Vector3 = direction.scale(-1);
// Expected result: Vector3 { x:-2, y:-1, z:0 }

const doubled: Vector3 = direction.scale(2);
// Expected result: Vector3 { x: 4, y: 2, z:0 }

const normalized: Vector3 = direction.scale(1 / direction.length());
// Expected result: Vector3 {x: 0.8944271909999159, y: 0.4472135954999579, z: 0}
```

#### See also
- [Vector3.normalize](./vector3.normalize.md)
- [Vector3.negate](./vector3.negate.md)