### [Vector3](./vector3.md).add
#### Description
Adds vector B to the current vector and returns their sum. The operation does not mutate the original vector and returns a new vector.
![](/docs/figures/vectors/vector3.add.formula.png)

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
![](/docs/figures/vectors/vector.add.png)
```typescript
const vectorA: Vector3 = new Vector3(3, 2, 0);
const vectorB: Vector3 = new Vector3(2,-1, 0);
const result:  Vector3 = vectorA.add(vectorB);
// Expected result: Vector3 {x: 5, y: 1, z: 0}.
```