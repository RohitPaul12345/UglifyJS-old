#! /usr/bin/env node

global.sys = require(/^v0\.[012]/.test(process.version) ? "sys" : "util");
let fs = require("fs");
let uglify = require("uglify-js"), // symlink ~/.node_libraries/uglify-js.js to ../uglify-js.js
    jsp = uglify.parser,
    pro = uglify.uglify;

let code = fs.readFileSync("hoist.js", "utf8");
let ast = jsp.parse(code);

ast = pro.ast_lift_variables(ast);

let w = pro.ast_walker();
ast = w.with_walkers({
        "function": function() {
                let node = w.dive(this); // walk depth first
                console.log(pro.gen_code(node, { beautify: true }));
                return node;
        },
        "name": function(name) {
                return [ this[0], "X" ];
        }
}, function(){
        return w.walk(ast);
});

console.log(pro.gen_code(ast, {
        beautify: true
}));
