var SimpleView= $.require("SimpleView")
var Starz=$.widget.create("$.widget.starz",function(){
    $d.css.addRules("widget.starz",
        {
            ".starz" : "display: inline-block;position:relative;min-height:28px;height:28px;min-width:120px;text-align:center;",
            ".starz .starz-icon" : "cursor:pointer;display:inline-block;  color: #bbb;font-size: 2.5rem;margin: 0 5px; text-shadow: 2px 2px 2px #999;font-weight: bold;",
            ".starz .starz-icon.active" : "color: goldenrod;",
            ".starz output" : "display:block",
        })
    var ell=$d("<div class='starz'>" +
        "<span class='starz-icon'>&#9733;</span>" +
        "<span class='starz-icon'>&#9733;</span>" +
        "<span class='starz-icon'>&#9733;</span>" +
        "<span class='starz-icon'>&#9733;</span>" +
        "<span class='starz-icon'>&#9733;</span>" +
        "<output></output></div>")
//&sext;&bigstar;&starf;"<div class='star-icon star-icon-shadow'></div>
    var ths=this;
     ell.addEventListener("click",function(ev){
         if(!ev.target.classList.contains("starz-icon")){return}
         var ch=[].slice.call(ev.target.parentNode.querySelectorAll(".starz-icon")),
             curr=ch.indexOf(ev.target),
             val=curr+1;
         for(var i= 0,ln=ch.length;i<ln;i++){
            ch[i].classList[ i<=curr?"add":"remove"]("active")
         }
         ths.fire("modified",val)
         this.querySelector("output").textContent=val.toFixed(1)
    })
    return ell
})

module.exports=Starz