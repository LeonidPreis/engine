### [Vector3](./vector3.md).negate
#### Description
Inverts the direction of the vector by negating each of its components. This operation returns a new vector pointing in the exact opposite direction.

![](/docs/figures/vectors/vector3.negate.formula.png)

#### Signature
```typescript
public negate(): Vector3
```

#### Returns
|Type|Description|
|:-:|:-|
|**`Vector3`**|A new vector whose components are all negated.|

#### Examples
![](/docs/figures/vectors/vector.negate.png)
```typescript
const original: Vector3 = new Vector3(3, 2, 0);
const inverted: Vector3 = original.negate();
// Expected result: Vector3(-3, 2, 0).
```

#### See also
- [Vector3.scale]()