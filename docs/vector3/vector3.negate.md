### [Vector3](./vector3.md).negate
#### Description
Inverts the direction of the vector by negating each of its components. This operation returns a new vector pointing in the exact opposite direction.
```math
-\overline{a}=\left(-a_{x},-a_{y},-a_{z}\right)
```

#### Signature
```typescript
public negate(): Vector3
```

#### Returns
|Type|Description|
|:-:|:-|
|**`Vector3`**|A new vector whose components are all negated.|

#### Examples
```typescript
const original: Vector3 = new Vector3(1, -2, 3);
const inverted: Vector3 = original.negate();
// Expected result: Vector3(-1, 2, -3).
```

#### See also
- [Vector3.scale]()