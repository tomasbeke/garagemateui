var PopupView= $.require("PopupView");
var popup,activeel,outer,model=null,onchange=null, ipList=[],
	fragment='<div class="time-selector"> '+
		'<div class="time-part time-part-hr">'+
			'<div class="arr arr-top"></div>'+
			'<span class="time-part-ip" data-key="hr" readonly="true"  max="12" placeholder="hr"></span>'+
			'<div class="arr arr-bottom"></div>'+
		'</div>' +
	    '<div class="time-part time-part-min">'+
			'<div class="arr arr-top"></div>'+
			'<span class="time-part-ip" data-key="min"   max="60" readonly="true" step="5" placeholder="min"></span>'+
			'<div class="arr arr-bottom"></div>'+
		'</div>' +
		'<div class="time-part time-part-ap">'+
			'<label class="arr arr-am"><input type="radio" name="time-part-ap" data-key="ap" value="am"/><div>AM</div></label>'+
			'<label class="arr arr-pm"><input type="radio" name="time-part-ap" data-key="ap" value="pm"/><div>PM</div><label>'+
		'</div>' +
	'</div>'

function hasClass(el,klass){
	return el && el.classList && el.classList.contains(klass)
}
function pad(val){if(val==null){return ""}
	return (String(val).length==1?"0":"")+val
}
function getIpList(){
	if(!ipList.length){
		ipList=[].slice.call(outer.querySelectorAll("input,.time-part-ip"))
		ipList.forEach(function(el){
			if(!el.type){return}
			el.addEventListener("change",function(ev){
				var k=$d.domdata(ev.target,"key");
				if(!k){return}
				if(ev.target.type=="radio"  ){
					ev.target.checked && model.set(k,ev.target.value)
					return
				}
				model.set(k,Number(ev.target.value));
			});
		});
	}
	return ipList;
}
function setup(anchor){
	model= new $.simpleModel({hr:null,min:null,ap:null,curr:null})
	popup=new PopupView({width:"auto",content:fragment,anchor:anchor})
	outer=popup.contentWrap
	popup.el.addClass("time-selector-wrap")

	popup.el.append('<div class="ok-link">&#x02713;</div><div  class="cancel-link">&#x02717;</div>')
	popup.el.q(".ok-link").on("click",function(){
		popup.hide();
	})
	popup.el.q(".cancel-link").on("click",function(){
		model.clearValues();
		popup.hide();
	})
 	model.onchange("*",function(rec){
		if(rec.value==null || rec.name=="curr"){return}
		if(!this.curr){
			this.curr=$.date()
		}
		if(rec.name=="ap"||rec.name=="hr"){
			var tt=String((rec.name=="ap"?rec.value:this.ap)||"").toLowerCase()
			if(tt=="pm"){
				this.curr.set("H",this.hr+12)
			} else {
				this.curr.set("H",this.hr)
			}
		}
		else if(rec.name=="min"){
			this.curr.set("n",Number(rec.value))
		}
 	})
	popup.on("hide", onselect  )
		//outer.on("wheel DOMMouseScroll", MouseWheelHandler);
	outer.on("wheel", MouseWheelHandler);
	outer.on("keyup", function(ev){
		var nm=$.eventUtil.getKeyName(ev)
		if(nm=="up"){ roll(-1) }
		else if(nm=="home"){ roll(-100) }
		else if(nm=="down"){ roll(1) }
		else if(nm=="end"){ roll(100) }

	});
	//outer.addEventListener("mousewheel", MouseWheelHandler, false)
	//outer.addEventListener("DOMMouseScroll", MouseWheelHandler, false)
	outer.on("mouseover",setActive);

	outer.on("mousedown",function(ev,el){
		var el=ev.target;
 		var delta=0
		if(setActive(el)){
			delta=hasClass(el,"arr-top")?-1:(hasClass(el,"arr-bottom")?1:0);
		}
		if(!delta){return};
		(function(){
			var timer=0,interval=300,
				mup=function(){
					if(timer){clearTimeout(timer);timer=0 }
					outer.removeEventListener("mouseup", mup)
				},
				proc=function proc(){
					if(roll(delta)===false || !timer){ mup()}
					else {
						interval=Math.max(50,interval-5);
						timer=setTimeout(proc,interval)
					}
				}
			setTimeout(function(){
				outer.addEventListener("mouseup",mup)
				proc()
			},5);
		})();

	},".arr-top,.arr-bottom")
}
function oninputchange(config){
	if(model && model.curr){
 	}

}
function onselect(config){
	if(model.curr){
		onchange && onchange($.date.asTime(+model.curr))
	}

}

	function setActive(target){
		if(!target){return}
		if(target.target){target=target.target}
		if($d.down(target,".time-part")){return};
		var part= $d.selfOrUp(target,".time-part")
		if(!part){return}
		part.up().qq(".active").removeClass("active");
		part.addClass("active")
		activeel=part.down("input,.time-part-ip")

		return part


	}
	function roll(delta) {
		if(!activeel || !delta){return false}
		var curr=Number($d.val(activeel))||0,max=Number(activeel.getAttribute("max")),step=Number(activeel.getAttribute("step"))||1;
		var nu=curr
		if(delta==100){nu=max}
		else if(delta==-100){nu=0}
		else{
			if(delta && step){nu=curr+(delta*step)}
		}
		if(nu==curr || (delta>0 && curr>=max) || (delta<0 && curr<=0)){
			return false
		}
		var val=Math.max(0,Math.min(max,nu))
		$d.val(activeel,val);
		if(val==54){$d.val(activeel,55); }
		var k=$d.domdata(activeel,"key");
		k && model.set(k,val)
	}
	function MouseWheelHandler(ev) {
 		var e = window.event || ev;  // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
		roll(delta)
	}


var TimeSelector={
	show:function (anchor,callback,val){
		onchange=null;
		if(!outer){setup(anchor)}
		typeof(callback)=="function" && (onchange=callback);
		popup.config.options.anchor=anchor;
		popup.show()
 		var tim= (val&&$.date.asTime(val))||$.date()
        model.update({"hr":Number(tim.hh),"ap":String(tim.tt||"").toLowerCase(),"min":Number(tim.n)});
		getIpList().forEach(function(el){
            var k=$d.domdata(el,"key"),val=model.getItem(k);
			if(el.type=="radio"){
				el.checked=(String(val).toLowerCase()==String(el.value||"").toLowerCase())}
			else {$d.val(el,pad(val))}
		});

 		return popup;
	},
	hide:function (anchor){
		model.clearValues();
		popup && popup.hide();
	},
	getVal:function(){
		return model.curr
	},
	setVal:function(){

	}
}

module.exports = TimeSelector