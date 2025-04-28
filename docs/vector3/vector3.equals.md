### [Vector3](./vector3.md).equals

#### Description
Checks if two vectors are approximately equal within a given precision.

#### Signature
```typescript
public equals(vB: Vector3, precision: number = 1e-6): boolean
```

#### Parameters
|Parameter|Type|Description|Default|
|:-:|:-:|:-|:-:|
|vB|**`Vector3`**|Second vector to compare against.|—|
|precision|**`number`**|Maximum allowable difference between corresponding components of vectors.|**`1e-6`**|

#### Returns
|Type|Description|
|:-:|:-|
|**`boolean`**|Returns **`true`** if the vectors are approximately equal within the given precision, otherwise **`false`**.|

#### Examples
```typescript
const expectedDirection: Vector3 = new Vector3(0, 0, 1);
const actualDirection: Vector3 = new Vector3(0, 0, 0.99999);
const withinTolerance: boolean = expectedDirection.equals(actualDirection, 1e-5);
// Expected result: true.
```