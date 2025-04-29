### [Vector3](./vector3.md).scale
#### Description
Multiplies (scales) all components of the current vector by the given scalar value s. This operation preserves the direction of the vector (if the scalar is positive), but changes its length. If the scalar is negative, the vector is flipped in the opposite direction. Does not mutate the original vector — it returns a new scaled vector.
```math
s\overline{v}=\left(s\cdot v_x, s\cdot v_y, s\cdot v_z\right)
```

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
```typescript
const direction: Vector3 = new Vector3(1, 2, 3);
const doubled: Vector3 = direction.scale(2);
// Expected result: Vector3 { x: 2, y: 4, z: 6 }
const negated: Vector3 = direction.scale(-1);
// Expected result: Vector3 { x:-1, y:-2, z:-3 }
const normalized: Vector3 = direction.scale(1 / direction.length());
// Expected result: Vector3 {x: 0.2672612419124244, y: 0.5345224838248488, z: 0.8017837257372732}
```

#### See also
- [Vector3.normalize](./vector3.normalize.md)
- [Vector3.negate](./vector3.negate.md)