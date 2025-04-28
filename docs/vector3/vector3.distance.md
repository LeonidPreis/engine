### [Vector3](./vector3.md).distance
#### Description
Calculates the distance between two points defined as **`Vector3`**.
```math
d = \sqrt{\left|b_{x}-a_{x}\right|^{2}+\left|b_{y}-a_{y}\right|^{2}+\left|b_{z}-a_{z}\right|^{2}}
```

#### Signature
```typescript
public distance(vB: Vector3): number
```
#### Parameters
|Parameter|Type|Description|
|:-:|:-:|:-|
|vB|**`Vector3`**|Second point.|

#### Returns
|Type|Description|
|:-:|:-|
|**`number`**|Distance between two points.|

#### Examples
```typescript
const pointA = new Vector3(1, 2, 3);
const pointB = new Vector3(4, 5, 6);
const distance = pointA.distance(pointB);
// Expected result: 5.196152422706632.
```

#### See also
- [Vector3.length]()