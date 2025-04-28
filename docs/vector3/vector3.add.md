### [Vector3](./vector3.md).add
#### Description
Adds vector B to the current vector and returns their sum. The operation does not mutate the original vector and returns a new vector.
```math
\bar{c}=\bar{a}+\bar{b}=(a_{x}+b_{x},a_{y}+b_{y},a_{z}+b_{z})
```

#### Signature
```typescript
public add(vB: Vector3): Vector3
```
#### Parameters
|Parameter|Type|Description|
|:-:|:-:|:-:|
|vB|**`Vector3`**|Second vector.|

#### Returns
|Type|Description|
|:-:|:-:|
|**`Vector3`**|Sum of vectors.|

#### Example
```typescript
const vectorA: Vector3 = new Vector3(1, 2, 3);
const vectorB: Vector3 = new Vector3(4, 5, 6);
const result:  Vector3 = vectorA.add(vectorB);
// Expected result: Vector3 {x: 5, y: 7, z: 9}.
```