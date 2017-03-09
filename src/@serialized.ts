
import { SerializerData } from './Serializer';

var l:Function = (...args) => {};
//var l:Function = console.log.bind(console);

export function serialized(type?:string)
{
	l("@serialized: generating decorator function");
	return (target:any, propertyKey:string) => {
		l("@serialized: executing decorator function for", propertyKey);
		var data:SerializerData = target["serializerData"] || {
			properties: {},
			type: ""
		};

		l("@serialized: adding", propertyKey, "to serialized properties");
		data.properties[propertyKey] = type || "";

		target["serializerData"] = data;
	};
}
