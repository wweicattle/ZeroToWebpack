let path=require("path");
let config =require("./webpack.config");
let compiler=require("./Compiler");
let sonCompiler=new compiler(config);
sonCompiler.run();  
