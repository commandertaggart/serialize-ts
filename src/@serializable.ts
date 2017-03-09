
import { Serializer, SerializerData, SimpleConstructorClass } from './Serializer';

var l:Function = (...args) => {};
//var l:Function = console.log.bind(console);

export function serializable(id?:string)
{
	l("@serializable: generating decorator function");
	return (constructor: SimpleConstructorClass) =>
	{
		l("@serializable: executing decorator function for", constructor);
		let data:SerializerData = constructor.prototype["serializerData"] || {
			properties: {},
			type: ""
		};

		data.type = id || constructor.name;

		if (data.type.length > 255)
		{ throw new Error("Serializable class name too long:" + data.type); }

		constructor.prototype["serializerData"] = data;

		if (data.type in Serializer.constructors)
		{ throw new Error("Duplicate serializable class name:" + data.type); }

		Serializer.constructors[data.type] = constructor;

	}
}
