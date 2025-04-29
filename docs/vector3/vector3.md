### Vector3
Representation of three-dimensional vectors and points. The class contains the necessary methods to perform operations on vectors and points.
#### Constructor parameters
|Name|Type|Description|Default|
|:-:|:-:|:-:|:-:|
|x|**`number`**|X value of vector.|0|
|y|**`number`**|Y value of vector.|0|
|z|**`number`**|Z value of vector.|0|

#### Static properties
|Name|Type|Description|
|:-|:-:|:-|
|Vector3.leftward|**`Vector3`**|Unit vector pointing -X `Vector3(-1, 0, 0)`.|
|Vector3.rightward|**`Vector3`**|Unit vector pointing +X `Vector3(1, 0, 0)`.|
|Vector3.upward|**`Vector3`**|Unit vector pointing +Y `Vector3(0, 1, 0)`.|
|Vector3.downward|**`Vector3`**|Unit vector pointing -Y `Vector3(0,-1, 0)`.|
|Vector3.forward|**`Vector3`**|Unit vector pointing +Z `Vector3(0, 0, 1)`.|
|Vector3.backward|**`Vector3`**|Unit vector pointing -Z `Vector3(0, 0,-1)`.|
|Vector3.zero|**`Vector3`**|Zero vector `Vector3(0, 0, 0)`.|


#### Public methods
|Method|Description|Returns|
|:-|:-|:-:|
|[add](./vector3.add.md)|Adds another vector to this vector.|**`Vector3`**|
|[angle](./vector3.angle.md)|Calculates angle between vectors (radians or degrees).|**`number`**|
|[clone](./vector3.clone.md)|Creates a copy of the vector.|**`Vector3`**|
|[cross](./vector3.cross.md)|Calculates cross product with another vector.|**`Vector3`**|
|[distance](./vector3.distance.md)|Calculates distance between points.|**`number`**|
|[dot](./vector3.dot.md)|Calculates dot product with another vector.|**`number`**|
|[equals](./vector3.equals.md)|Checks equality with another vector (with precision).|**`boolean`**|
|[length](./vector3.length.md)|Calculates vector magnitude.|**`number`**|
|[negate](./vector3.negate.md)|Changes the signs of the components to the opposite.|**`Vector3`**|
|[normalize](./vector3.normalize.md)|Returns normalized (unit-length) vector with same direction.|**`Vector3`**|
|[orthonormalBasis](./vector3.orthonormalBasis.md)|Generates orthonormal basis (right, up, forward).|**`Vector3[]`**|
|[projectionLength](./vector3.projectionLength.md)|Calculates projection length onto another vector.|**`number`**|
|[projectionVector](./vector3.projectionVector.md)|	Calculates projection vector onto another vector.|**`Vector3`**|
|[scale](./vector3.scale.md)|Scales vector by a number.|**`Vector3`**|
|[subtract](./vector3.subtract.md)|Subtracts another vector from this one.|**`Vector3`**|
|[toFloat32Array](./vector3.toFloat32Array.md)|Converts vector to Float32Array.|**`Float32Array`**|

#### Static methods
|Method|Description|Returns|
|:-|:-|:-:|
|[between](./vector3.between.md)|Creates normalized direction vector between two points.|**`Vector3`**|


























