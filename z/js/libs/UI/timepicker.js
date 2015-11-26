/**
 * Created by Atul on 6/11/2015.
 */
function ff(){
	var outer=document.querySelector(".outer-time"),activeel
	function setActive(target){
		if(!target || target.querySelector(".time-part")){return};
		[].forEach.call(outer.querySelectorAll(".active"),function(el){el.classList.remove("active")});
		var part=target
		while(!part.classList.contains("time-part")){
			part=part.parentNode
			if(!part || part===document.body || !part.classList){break;}
		}
		if(part && part.classList.contains("time-part")){
			part.classList.add("active")
			activeel=part.querySelector("input")
			return part
		}

	}
	function roll(delta) {
		if(!activeel || !delta){return false}
		var curr=Number(activeel.value),max=Number(activeel.getAttribute("max"));
		if((delta>0 && curr>=max) || (delta<0 && curr<=1)){return false}
		activeel.value = Math.max(1,Math.min(max,curr+delta))
	}
	function MouseWheelHandler(e) {
		// cross-browser wheel delta
		var e = window.event || e; // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
		roll(delta)
	}
	outer.addEventListener("mousewheel", MouseWheelHandler, false);
	outer.addEventListener("DOMMouseScroll", MouseWheelHandler, false)
	outer.addEventListener("mouseover",function(ev){
		setActive(ev.target)

	})
	outer.addEventListener("mousedown",function(ev){
		if(ev.target.nodeName=="input"){return}
		var delta=0
		if(setActive(ev.target) && (ev.target.classList.contains("arr"))){
			delta=ev.target.classList.contains("arr-top")?1:-1;
		}
		if(!delta){return}
		(function(){
			var timer=0,interval=300,mup=function mup(){
				if(timer){clearTimeout(timer);timer=0 }
				outer.removeEventListener("mouseup", mup)
			},proc=function proc(){
				if(roll(delta)===false){ mup()}
				else {interval=Math.max(50,interval-5);
					timer=setTimeout(proc,interval)
				}
			}

			setTimeout(function(){
				outer.addEventListener("mouseup",mup)
				proc()
			},0);
		})();

	})

}
/*
 div class="outer">&bigcirc;


 </div>
 <div class="outer-time">
 <div class="time-part time-part-hr">
 <div class="arr arr-top"></div>
 <input max="12" placeholder="hr"/>
 <div class="arr arr-bottom"></div>
 </div><div class="time-part time-part-min">
 <div class="arr arr-top"></div>
 <input max="60" placeholder="min"/>
 <div class="arr arr-bottom"></div>
 </div><div class="time-part time-part-ap">
 <div class="arr arr-am">AM</div>
 <div class="arr arr-pm">PM</div>
 </div>


 </div>
 */