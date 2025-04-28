### [Vector3](./vector3.md).dot
#### Description
Calculates the dot product (scalar product) of vectors whose numerical value is equal to the cosine of the angle between them. Both vectors must be **normalized**.
```math
\overline{a}\cdot\overline{b}=\cos\angle\overline{a},\overline{b}=\sum_{i=1}^{n}a_{i}b_{i}=a_{x}b_{x}+a_{y}b_{y}+a_{z}b_{z}
```

#### Signature
```typescript
public dot(vB: Vector3): number
```
#### Parameters
|Parameter|Type|Description|
|:-:|:-:|:-|
|vB|**`Vector3`**|Second normalized vector.|

#### Returns
|Type|Description|
|:-:|:-|
|**`number`**|Cosine of angle between current vector and vector B.|

#### Interpretation of the return value
|Return value|Description|
|:-:|:-|
|**1**|Vectors are *collinear* - they either lie on the same line or lie on parallel lines and have the same direction.|
|**-1**|The vectors are *non-collinear* - they have strictly opposite directions.|
|**0**|Vectors are *orthogonal* (perpendicular) to each other.|

#### Examples
```typescript
const vectorA: Vector3 = new Vector3(3, 2, 0).normalize();
const vectorB: Vector3 = new Vector3(2,-1, 0).normalize();
const dotAB: number = vectorA.dot(vectorB);
// Expected result: 0.49613893835683387;
```

#### See also
- [Vector3.angle](./vector3.angle.md)