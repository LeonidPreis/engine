### [Vector3](./vector3.md).angle
#### Description
Calculates the angle between the current vector and vector B and returns the angle value in radians or degrees. As the dot product can be calculated as the product of the lengths of the vectors with the cosine of the angle between them, the angle can be expressed from this as shown in the formulas below. The vectors may not be normalized.
![](/docs/figures/vectors/vector3.angle.formula.png)

#### Signature
```typescript
public angle(vB: Vector3, degrees: boolean = false): number
```
#### Parameters
|Parameter|Type|Description|Default|
|:-:|:-:|:-|:-:|
|vB|**`Vector3`**|Second vector.|—|
|degrees|**`boolean`**|Optional flag to select the units of measure to be returned.|**`false`**|

#### Returns
|Type|Description|
|:-:|:-|
|**`number`**|The angle between the vectors, which is in the range $\varphi\in\left[0,\pi\right]$ radians, which is equivalent $\varphi\in\left[0^\circ,180^\circ\right]$ degrees.|
> If one of the vectors has **zero length**, 0 is returned.

#### Examples
![](/docs/figures/vectors/vector.angle.png)
```typescript
const vectorA: Vector3 = new Vector3(3, 2, 0);
const vectorB: Vector3 = new Vector3(2,-1, 0);
const angleAB: number = vectorA.angle(vectorB, true);
// Expected result: 60.25511870305777 degrees.
```

#### See also
- [Vector3.dot](./vector3.dot.md)
- [Vector3.length](./vector3.length.md)