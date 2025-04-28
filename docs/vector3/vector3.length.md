### [Vector3](./vector3.md).length
#### Description
Calculates the length (magnitude) of the current vector. The length represents the distance from the origin to the point defined by the vector.
```math
\left|\overline{a}\right|=\sqrt{a_{x}^2+a_{y}^2+a_{z}^2}
```

#### Signature
```typescript
public length(): number
```

#### Returns
|Type|Description|
|:-:|:-|
|**`number`**|The Euclidean length (magnitude) of the vector.|

#### Example
```typescript
const length: number = new Vector3(3, 4, 12).length();
// Expected result: 13.
```

#### See also
- [Vector3.normalize]