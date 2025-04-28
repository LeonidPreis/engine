### [Vector3](./vector3.md).between
#### Description
Calculates the direction between two points and returns a new **normalized** vector.

#### Signature
```typescript
public static between(from: Vector3, to: Vector3): Vector3
```
#### Parameters
|Parameter|Type|Description|
|:-:|:-:|:-|
|from|**`Vector3`**|Start point of vector as *Vector3*.|
|to|**`Vector3`**|End point of vector as *Vector3*.|

#### Returns
|Type|Description|
|:-:|:-|
|**`Vector3`**|A vector describing the direction from the start point to the end point.|
>The returned vector is **normalized**.

#### Examples
```typescript
const vectorA: Vector3 = new Vector3(1, 2, 3);
const vectorB: Vector3 = new Vector3(4, 5, 6);
const direction: Vector3 = Vector3.between(vectorA, vectorB);
// Expected result: Vector3 {x: 0.577350, y: 0.577350, z: 0.577350}.
```

#### See also
- [Vector3.subtract](./)
- [Vector3.normalize](./)