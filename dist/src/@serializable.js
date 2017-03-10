"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Serializer_1 = require("./Serializer");
var l = (...args) => { };
//var l:Function = console.log.bind(console);
function serializable(id) {
    l("@serializable: generating decorator function");
    return (constructor) => {
        l("@serializable: executing decorator function for", constructor);
        let data = constructor.prototype["serializerData"] || {
            properties: {},
            type: ""
        };
        data.type = id || constructor.name;
        if (data.type.length > 255) {
            throw new Error("Serializable class name too long:" + data.type);
        }
        constructor.prototype["serializerData"] = data;
        Object.defineProperty(constructor, 'serializedType', {
            get: () => data.type
        });
        if (data.type in Serializer_1.Serializer.constructors) {
            throw new Error("Duplicate serializable class name:" + data.type);
        }
        Serializer_1.Serializer.constructors[data.type] = constructor;
    };
}
exports.serializable = serializable;
//# sourceMappingURL=@serializable.js.map