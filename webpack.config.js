var path = require("path");
var testPlugin=require("./plugin/test");


module.exports = {
    mode: "development",
    entry:"./src/index.js",
    output: {
        filename: "build.js",
        path: path.resolve(__dirname, "build"),
    },
    devtool: "source-map",
    resolveLoader: {
        modules: ["node_modules", path.resolve(__dirname, "module")]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    }
                ]
            },
            {    
                test:/\.png$/,
                use:[{
                    loader:"file-loader"
                }]
            }
        ]
    },
    
    plugins:[new testPlugin()]
    // new 

}