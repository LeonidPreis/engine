### [Vector3](./vector3.md).orthonormalBasis
#### Description
Computes a **right-handed** orthonormal basis (a set of three mutually orthogonal unit vectors) from the current vector, treating it as a forward direction. The method returns an array with three [normalized](./vector3.normalize.md) vectors (right, up and forward). The forward vector is normalized current vector.

#### Signature
```typescript
public orthonormalBasis(): [Vector3, Vector3, Vector3]
```

#### Returns
|Type|Description|
|:-:|:-|
|**`[Vector3, Vector3, Vector3]`**|An array containing the **right**,**up** and **forward** vectors of the orthonormal basis.|

#### Examples
```typescript
const eye: Vector3 = new Vector3(0, -5, 0);
const target: Vector3 = new Vector3(0, 0, 0);
const direction: Vector3 = target.subtract(eye);// {x: 0, y: 5, z: 0}
const [right, up, forward]: Vector3[] = direction.orthonormalBasis();
// Expected result: 
// right   Vector3 {x: 1, y: 0, z: 0}, 
// up      Vector3 {x: 0, y: 0, z: 1},
// forward Vector3 {x: 0, y: 1, z: 0}.
```
> Since the forward vector is aligned with the world up vector (Y axis), the method tries to preserve the rightward direction instead.

```typescript
const direction: Vector3 = new Vector3(0, 0, 5);
const [right, up, forward]: Vector3[] = direction.orthonormalBasis();
// Expected result: 
// right   Vector3 {x:-1, y: 0, z: 0}, 
// up      Vector3 {x: 0, y: 1, z: 0},
// forward Vector3 {x: 0, y: 0, z: 1}.
```
> Since the forward vector is not aligned with the world up vector (Y axis), the method tries to preserve the upward direction.

#### See also
- [Vector3.cross](./vector3.cross.md)
- [Vector3.angle](./vector3.angle.md)
- [Vector3.dot](./vector3.dot.md)