### [Vector3](./vector3.md).normalize
#### Description
Returns a new normalized (unit length) vector based on the current vector without modifying the original.
Normalization preserves the direction of the vector but scales its length to exactly 1:
```math
\widehat{a}=\frac{\overline{a}}{\left|\overline{a}\right|}
```

#### Signature
```typescript
public normalize(): Vector3
```

#### Returns
|Type|Description|
|:-:|:-|
|**`Vector3`**|A new vector normalized to unit length, or a zero vector if the original vector has zero length.|

#### Examples
```typescript
const direction: Vector3 = new Vector3(3, 0, 4);
const unitDirection: Vector3 = direction.normalize();
// Expected output: Vector3 {x: 0.6, y: 0, z: 0.8}.
```

#### See also
- [Vector3.scale]