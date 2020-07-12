let loaderUtil=require("loader-utils");
module.exports=function(source){
    let filename=loaderUtil.interpolateName(this,"[hash].[ext]",{content:source});
    this.emitFile(filename,source)
    return `module.exports="${filename}"`;
}
module.exports.raw=true;