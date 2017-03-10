
# Binary Serialization for TypeScript objects

## Installation

`npm install git://glikker/serialize-ts`

## Usage

```TypeScript
import { Serializer, serializable, serialized } from 'serialize-ts';

@serializable()
class SerializedClass
{
	constructor()
	{

	}

	@serialized() serializedProperty:string;
	@serialized(int) serializedInt:number;
	nonSerializedProperty:boolean;
}

let serializedObject:SerializedClass = new SerializedClass();

let buffer:Buffer = Serializer.toBuffer(serializedObject);

let deserializedObject:SerialiedClass = Serializer.fromBuffer(buffer);
```

If you decorate your class with `@serializable()`, only properties decorated
with `@serialized()` are serialized.  If you don't decorate any properties,
then no properties will be serialized.

You can include a string in `@serializable('className')`, to prevent class name
collisions among `@serializable` classes.

The use of the decorators is optional.  Anonymous objects work just great, and
all properties (that are not of type `function`) will be serialized:

```TypeScript
let obj:Object = { x:5, y:[0,1,2], z:"Z" };

let buffer:Buffer = Serializer.toBuffer(obj);

let copyOfObj:Object = Serializer.fromBuffer(buffer);
```

If you serialize an object of a class that is not `@serializable`, the resulting
deserialized object will lose class data and be an instance of Object, but with
all properties that are returned by `Object.keys()` that are not of type `function`.

The parameter to `@serialized` can be used to specify the data type of the property.
If not included, the `typeof` operator will be used, and `number` properties will
be serialized as `double` values.  Here are the available types: `float` (32-bits),
`double` (64-bits), `int` (32-bits), `uint` (32-bits), `int8`, `uint8`, `int16`,
`uint16`, `int32`, `uint32`. These are in addition to the built-in types: `string`,
`boolean` and `number`.

If the property type is an array, you can add `[]` to the type name, e.g.: `int[]`,
or `string[]`.  If your array is of mixed types, do not specify this parameter.
Unfortunately, this limits mixed arrays to built-in types.

## Use with JavaScript

If you don't use TypeScript, you can still make your class serializable:

```JavaScript
var serialize = require('serialize-ts');
function SerializableClass()
{
	this.numberProperty = 42;
	this.stringProperty = "Hello";
	this.notSerialized = true;
}
serialize.serialized('int')(SerializableClass.prototype, "numberProperty");
serialize.serialized()(SerializableClass.prototype, "stringProperty");
serialize.serializable()(SerializableClass);
```
