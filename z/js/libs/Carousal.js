/**
 * Created by Atul on 6/28/2015.
 */
	var rulesadded
var Carousal=Klass("Carousal",{
	list:null,
	currentIndex:-1,
	max:0,
	el:null,
	init:function(){
		this.list=[]
		if(!rulesadded) {
			rulesadded = 1;
			$d.css.addRules("Carousal", {

				})
		}
	},
	setupList:function(list){
		if(list ){
			this.list=list
		}
	},
	nav:function(next){
		var nu,idx = 0
		var currentIndex=this.currentIndex
		if(typeof(next)=="boolean"){
			if(next){currentIndex++}
			else{currentIndex--}

		}
		if(typeof(next)=="number"){
			currentIndex=next
		}
		if(this.currentIndex==currentIndex){return}
		this.currentIndex=currentIndex;
		if(typeof(this.list)=="function"){
			nextItem=this.list(this.currentIndex);
		} else{
			nextItem=this.list[this.currentIndex]
		}
		if(!nextItem){
			return
		}
			var prior=this.$prior(true)
			var next=this.$next(true),nextItem

			if(prior){
 				prior.css("visibility",currentIndex?"visible":"hidden")
 			}
			if(next){
				next.css("visibility",currentIndex<this.max-1?"visible":"hidden")
			}
		var contentel=this.$selection()
		if(typeof(this.itemtemplate)=="string"){
			this.itemtemplate=$d.template(this.itemtemplate)
		}
			if(contentel && typeof(this.itemtemplate)=="function"){
				var content=this.itemtemplate(nextItem)
				if(typeof(content)=="string"){
					$d.html(contentel,content)
				} else {
					$d.clear(contentel)
					$d.insert(contentel,content)
				}
			} else if(contentel && typeof(this.itemrenderer)=="function"){
				this.itemrenderer(nextItem,contentel)
			}
			this.observer.fire("selection",nextItem)

	},
	activateUI:function(flag){
		if(flag==undefined){flag=true}
		this.uiActive=flag;
	},
	$prior:function(geticon){
		return this.el.q(".item-selected-prior"+(geticon?"  .nav-icon":""));
	},
	$next:function(geticon){
		return this.el.q(".item-selected-next"+(geticon?"  .nav-icon":""));
	},
	$selection:function(){
		return this.el.q(".item-selected");
	},
	render:function(){
		if(this.el  && !this.rendered){
			var dvc= 0,_self=this
			this.el.addClass("noselection")

			this.el.on("swipe",function(ev){
				if(ev._consumed ||!_self.uiActive){return}
				if(ev.originalEvent && ev.originalEvent.preventDefault){ev.originalEvent.preventDefault()}
				ev._consumed=1;
				if(ev.dir){
					if(ev.dir.indexOf("left")>=0){this.nav()}
					else if(ev.dir.indexOf("right")>=0){this.nav(true)}
				}
			}.bind(this))
			this.el.on("wheel",function(ev){
				if( !this.uiActive){return}
				var delta=  ev.deltaY||ev.wheeldeltaY
				delta && this.nav(delta>0)
			}.bind(this))

			if(this.$prior()){
				this.$prior().on("click",function(){
					this.nav(false)
				}.bind(this))
			}
			if(this.$next()){
				this.$next().on("click",function(){
					this.nav(true)
				}.bind(this))
			}
			this.onpropertychange("uiActive",function(rec){
				this.$next() && this.$next().toggle(!!rec.value)
				this.$prior() && this.$prior().toggle(!!rec.value)
				this.el && this.el.q(".item-info- seq") && this.el.q(".item-info-seq").toggle(!!rec.value)
			})
			this.rendered=true;
		}
		this.nav();
		return Promise.resolve(this.el)
	}
})

module.exports=Carousal