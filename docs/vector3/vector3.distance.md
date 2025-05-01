### [Vector3](./vector3.md).distance
#### Description
Calculates the distance between two points defined as **`Vector3`**.
![](/docs/figures/vectors/vector3.distance.formula.png)

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