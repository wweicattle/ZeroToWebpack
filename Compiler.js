var path = require("path");
let fs = require("fs");
let babylon = require("babylon");
let travese = require("@babel/traverse").default;
let generator = require("@babel/generator").default;
const type = require("@babel/types");
let ejs = require("ejs");
var {SyncHook}=require("tapable");
debugger;
module.exports = class {
    constructor(params) {
        this.config = params;
        this.entryId;
        // 所有模块的源码parse
        this.modules = {}
        this.entry = this.config.entry;
        this.root = path.resolve(__dirname);
        this.hooks={
            entryOption:new SyncHook(),
            complier:new SyncHook(),
            afterComplier:new SyncHook(),
            afterPlugins:new SyncHook(),
            run:new SyncHook(),
            emit:new SyncHook(),
            done:new SyncHook(),
        };
        this.hooks.emit.tap("afterComplier",function(){
            console.log("afterComplier");
        });
        let plugins=this.config.plugins;
        if(Array.isArray(plugins)){
            plugins.forEach(val=>{
                val.apply(this)
            })
        }
    };
    parse(source, parentPath) {
        // 解析语法树开始啦，重点来了。
        let ast = babylon.parse(source);
        let dependencies = [];
        travese(ast, {
            CallExpression(p) {
                let node = p.node;
                if (node.callee.name == "require") {
                    node.callee.name = " __webpack_require__";
                    let moduleName = node.arguments[0].value;
                    moduleName = moduleName + (path.extname(moduleName) ? '' : '.js');
                    moduleName =  "./"+path.join(parentPath,moduleName);
                    dependencies.push(moduleName);
                    node.arguments = [type.stringLiteral(moduleName)];
                }
            }
        })
        let sourceCode = generator(ast).code;
        return { sourceCode, dependencies }

    }
    getSource(moduleName) {
        let content = fs.readFileSync(moduleName, "utf-8");
        return content;
    };
    buildModule(moduleName, isEntry) {
        let source = this.getSource(moduleName);
        let modulePath = "./" + path.relative(this.root, moduleName);
        if (isEntry) {
            this.entryId = modulePath;
        }
        //需要对源码进行解析。转化为抽线语法树，并且traverse进行更新节点，generator进行ast转回源代码字符串。
        let { sourceCode, dependencies } = this.parse(source, path.dirname(modulePath))
        this.modules[modulePath] = sourceCode
        dependencies.forEach(element => {
            this.buildModule(path.join(this.root, element), false);
        });
    };
    emitFile() {
        let template = `(function(modules) { 
            var installedModules = {};
            function __webpack_require__(moduleId) {
                if(installedModules[moduleId]) {
                    return installedModules[moduleId].exports;
                }
               var module = installedModules[moduleId] = {
                    i: moduleId,
                    l: false,
                    exports: {}
                };
                modules[moduleId].call({}, module, __webpack_require__);
                return module.exports;
            }
        
            
            // Load entry module and return exports
            return __webpack_require__(__webpack_require__.s = "<%-entry%>");
        })
        ({
            <%for(let key in modules){%>
                "<%-key%>":
                (function(module,__webpack_require__){
                    eval(\`<%-modules[key]%>\`);
                }),
            <%}%>
        });`
        var entry = this.entry;
        var modules = this.modules;
        for(let i in modules){
            modules[i]= modules[i].replace(/\\\\/g,"/");
            let j=i.replace(/\\/,"/");
            modules[j]=modules[i];
            delete modules[i]
        }
        var output = path.resolve(this.config.output.path, this.config.output.filename)
        let result = ejs.render(template, {
            entry, modules
        })
        fs.writeFileSync(output, result);
    };
    run() {
        this.buildModule(path.resolve(this.root, this.entry), true);
        this.emitFile();
        console.log("编译成功!");
        this.hooks.emit.call();
    }
}
