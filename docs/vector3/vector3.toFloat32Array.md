### [Vector3](./vector3.md).toFloat32Array
#### Description
Converts the current vector into a Float32Array of 3 elements: [x, y, z]. This format is commonly used in WebGPU programming to transfer data to the GPU buffers efficiently and in the correct binary layout.

#### Signature
```typescript
public toFloat32Array(): Float32Array
```

#### Returns
|Type|Description|
|:-:|:-|
|**`Float32Array`**|A typed array representing the vector components.|

#### Examples
```typescript
const typedVector: Float32Array = new Vector3(1, 2, 3).toFloat32Array();
// Expected result: Float32Array(3) [1, 2, 3].
```