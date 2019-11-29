"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generator_1 = require("./generator");
exports.format = generator_1.format;
var noop = function (s) { return s; };
function generate(args) {
    noop(JSON.stringify(args));
    return 'Reason code scaffolder is not yet implmented';
}
exports.generate = generate;
//# sourceMappingURL=scaffolder.js.map