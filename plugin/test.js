class TestPlugin{
    constructor(){
        this.name="Wuwei";
    };
    apply(complier){
        complier.hooks.emit.tap("emiat",function(a){
            console.log("emit");
        });
    }
};
module.exports=TestPlugin;