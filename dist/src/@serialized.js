"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var l = (...args) => { };
//var l:Function = console.log.bind(console);
function serialized(type) {
    l("@serialized: generating decorator function");
    return (target, propertyKey) => {
        l("@serialized: executing decorator function for", propertyKey);
        var data = target["serializerData"] || {
            properties: {},
            type: ""
        };
        l("@serialized: adding", propertyKey, "to serialized properties");
        data.properties[propertyKey] = type || "";
        target["serializerData"] = data;
    };
}
exports.serialized = serialized;
//# sourceMappingURL=@serialized.js.map