### Vector3.angle
#### Description
Calculates the angle between the current vector and vector B and returns the angle value in radians or degrees. As the dot product can be calculated as the product of the lengths of the vectors with the cosine of the angle between them, the angle can be expressed from this as shown in the formulas below.
```math
\overline{a}\cdot\overline{b}=\left|\overline{a}\right|\cdot\left|\overline{b}\right|\cdot\cos(\varphi)
```
```math
\cos(\varphi)=\frac{\overline{a}\cdot\overline{b}}{\left|\overline{a}\right|\cdot\left|\overline{b}\right|}
```
```math
\varphi=\cos^{-1}\left(\frac{a_{x}b_{x}+a_{y}b_{y}+a_{z}b_{z}}
{\sqrt{a_{x}^{2}+a_{y}^{2}+a_{z}^{2}}\cdot\sqrt{b_{x}^{2}+b_{y}^{2}+b_{z}^{2}}}\right)
```

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
```typescript
const vectorA: Vector3 = new Vector3(3, 2, 0);
const vectorB: Vector3 = new Vector3(2,-1, 0);
const angleAB: number = vectorA.angle(vectorB, true);
// Expected result: 60.25511870305777 degrees.

const vectorX = new Vector3(1, 0, 0);
const vectorY = new Vector3(0, 1, 0);
const angleXY = vectorX.angle(vectorY);
// Expected result: 1.5707963267948966 radians or 90 degrees.
```

#### See also
- Vector3.dot
- Vector3.length