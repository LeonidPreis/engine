### [Vector3](./vector3.md).clone
#### Description

Returns copy of the current vector.

#### Signature
```typescript
public clone(): Vector3
```

#### Returns
|Type|Description|
|:-:|:-|
|**`Vector3`**|Copy of the current vector.|

#### Examples
```typescript
const vectorA: Vector3 = new Vector3(1, 2, 3);
const vectorB: Vector3 = vectorA.clone();
// Vector B is Vector3 {x: 1, y: 2, z: 3}.
```