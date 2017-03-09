
import { SerializedBuffer } from './SerializedBuffer';
import { Token } from './Token';

var l:Function = (...args) => {};
//var l:Function = console.log.bind(console);

export interface SerializerData
{
	properties:{ [key:string]:string };
	type:string;
}

export interface Serializable
{
	serializerData:SerializerData;
	serializedSize():number;
}

export interface SimpleConstructorClass
{
	new ():Object;
}

export class Serializer
{
	static blockSize:number = 1024;

	static toBuffer(object:Object):Buffer
	{
		var sb:SerializedBuffer = new SerializedBuffer(Serializer.blockSize);
		serializeObject(object, sb);
		return sb.toBuffer();
	}

	static fromBuffer(buffer:Buffer):Object
	{
		var sb:SerializedBuffer = new SerializedBuffer(buffer);
		return deserializeObject(sb);
	}

	static constructors:{ [key:string]:SimpleConstructorClass } = {
		'object': Object
	};
}

function serializeObject(object:Object, b:SerializedBuffer)
{
	var data:SerializerData;
	if (object['serializerData'])
	{
		data = object['serializerData'];
	}
	else if (Array.isArray(object))
	{
		serializeArray(object, "", b);
		return;
	}
	else if (object)
	{
		data = {
			type: 'object',
			properties: {}
		};

		Object.keys(object).forEach((prop) => {
			var t:string = typeof(object[prop]);
			if (t !== 'function' &&
				t !== 'undefined')
			{ data.properties[prop] = ""; }
		});
	}
	else
	{
		throw new Error("Don't know how to seralize object: " + object);
	}

	l("Serializing object: ", data);

	b.putToken(Token.OBJECT_START);
	b.putIdentifier(data.type);

	Object.keys(data.properties).forEach((prop:string) => {
		let o:any = object[prop];
		let t:string = data.properties[prop] || typeof(o);

		serializeProperty(prop, o, t, b);
	});
	b.putToken(Token.OBJECT_END);
}

function serializeArray(a:any[], t:string, b:SerializedBuffer)
{
	b.putToken(Token.ARRAY);
	b.putSize16(a.length);

	if (a.length > 0xFFFF)
	{ throw new Error("Array size too large."); }

	a.forEach((item:any, index:number) => {
		var it:string = t || typeof(item);

		serializeProperty(index, item, it, b);
	})
}

function serializeProperty(id:string | number, o:any, t:string, b:SerializedBuffer)
{
	if (typeof(id) === 'string')
	{
		b.putToken(Token.OBJECT_PROPERTY);
		b.putIdentifier(id);
	}
	else
	{ b.putSize16(id); }

	if (t.endsWith("[]"))
	{
		serializeArray(o, t.substr(0, t.length-2), b);
	}
	else if (t === 'object' && Array.isArray(o))
	{
		serializeArray(o, "", b);
	}
	else if (t === 'object')
	{
		if (o)
		{ serializeObject(o, b); }
		else
		{ b.putToken(Token.NULL); }
	}
	else
	{
		switch (t)
		{
			case 'string':
				b.putString(<string>o);
				break;
			case 'boolean':
				b.putBoolean(<boolean>o);
				break;
			case 'uint8':
				b.putUInt8(<number>o);
				break;
			case 'int8':
				b.putInt8(<number>o);
				break;
			case 'uint16':
				b.putUInt16(<number>o);
				break;
			case 'int16':
				b.putInt16(<number>o);
				break;
			case 'uint32':
				b.putUInt32(<number>o);
				break;
			case 'int32':
			case 'int':
				b.putInt32(<number>o);
				break;
//			case 'uint64':
//				b.putUInt64(<number>o);
//				break;
//			case 'int64':
//				b.putInt64(<number>o);
//				break;
			case 'float':
				b.putFloat(<number>o);
				break;
			case 'double':
			case 'number':
				b.putDouble(<number>o);
				break;

			case 'undefined':
				b.putToken(Token.NULL);
				break;

			default:
				throw new Error("Unrecognized type: " + t);
		}
	}
}

function deserializeObject(b:SerializedBuffer):Object
{
	if (b.peekToken() == Token.OBJECT_START)
	{
		var o:Object;

		b.getToken();
		var t:string = b.getIdentifier();

		if (t in Serializer.constructors)
		{
			o = new (Serializer.constructors[t])();

			while (b.peekToken() === Token.OBJECT_PROPERTY)
			{
				b.getToken();
				o[b.getIdentifier()] = deserializeProperty(b);
			}
		}
		else
		{ throw new Error("Constructor for serialized object not found."); }

		if (b.getToken() !== Token.OBJECT_END)
		{ throw new Error("Expected end of object not found."); }

		return o;
	}
	else if (b.peekToken() == Token.ARRAY)
	{
		return deserializeArray(b);
	}
	else
	{ return undefined; }
}

function deserializeArray(b:SerializedBuffer):any[]
{
	var a:any[] = [];
	if (b.getToken() == Token.ARRAY)
	{
		var len:number = b.getSize16();

		for (var i:number = 0; i < len; ++i)
		{
			if (b.getSize16() == i)
			{
				a.push(deserializeProperty(b));
			}
			else
			{ throw new Error("Expected next index not found"); }
		}
	}
	else
	{
		throw new Error("Array not found");
	}
	return a;
}

function deserializeProperty(b:SerializedBuffer):any
{
	var t:Token = b.peekToken();

	switch(t)
	{
		case Token.NULL: b.getToken(); return null;
		case Token.TRUE: b.getToken(); return true;
		case Token.FALSE: b.getToken(); return false;
		case Token.STRING: return b.getString();
		case Token.UINT8: return b.getUInt8();
		case Token.INT8: return b.getInt8();
		case Token.UINT16: return b.getUInt16();
		case Token.INT16: return b.getInt16();
		case Token.UINT32: return b.getUInt32();
		case Token.INT32: return b.getInt32();
//		case Token.UINT64: return b.getUInt64();
//		case Token.INT64: return b.getInt64();
		case Token.FLOAT: return b.getFloat();
		case Token.DOUBLE: return b.getDouble();

		case Token.ARRAY: return deserializeArray(b);

		case Token.OBJECT_START: return deserializeObject(b);
	}
}
