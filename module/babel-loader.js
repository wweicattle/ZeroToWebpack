// 进行转换
let babelCore=require("@babel/core");
let babelUtil=require("loader-utils");
function loader(source){
    let options=babelUtil.getOptions(this);
    let cb=this.async();
    babelCore.transform(source,{
        ...options,
        sourceMaps:true,
    },function(err,result){
       console.log(err,result);
       cb(err,result.code,result.map)
    }
    )
    return source;
}
module.exports=loader;