/**
 * Created by atul on 4/8/14.
 */
;( function NUMBER(exports,global ){


    var _cache={},_numformatcache={},defformat={comma:true,neg:"",wrapprefix:false,dec:2,currency:"",prefix:"",zeroAsBlank:true,sep:",",decsymbol:"."},
        pl=function (str,wth,ln) { return String(Array(ln+1).join(trim(wth)||" ") + str).slice(0-ln);}  ,loc
    //cleanprototype
    var iframe = document.createElement('iframe'); var parent = document.body || document.documentElement;
    iframe.style.display = 'none';  parent.appendChild(iframe);
    iframe.src = 'javascript:';
    var NUMBER= iframe.contentWindow.Number
    iframe.parentNode.removeChild(iframe)
    var _isnum=function _isnum(n){var v=parseFloat(n);return (!isNaN(v) && isFinite(n))? Object(v): null;}
    function _parse(num,def){
        var ret,str
        def=+(_isnum(def)||0) ;//        if(ret=_cache[str]){return ret}
        if(num==null ){return def;}
        var v=+_isnum(num),t=typeof(v),nan=isNaN(v)
        if(!nan && isFinite(v) &&  t=="number"){return v}
        if(t=="string"){          //if only 1 and 0 ..and size more than 6 and not 100... then assume its a binary
            if(!nan){ret=(v.length>=6 && !/[^01]/.test(v) && Number(v.substr(1))!==0)?parseInt(v,2):Number(v)}
            //or a hex color
            else if(!/[^0-9A-F]/i.test(v) && /[A-F]/i.test(v)){ret= parseInt(v,16)}
            else {ret=Number(v.trim().replace(/(em|ex|px|in|cm|mm|pt|pc|%)$/,""))}
        }
         if( ret==null || !isFinite(ret)|| isNaN(ret)){return def}
        return 	 ret
    }
    function NUMEXTEND(N, parse){
        N.default=0;
        N.parse=parse
        N.toNumber=parse
        Object.getOwnPropertyNames(Math).filter(function()  {var it=this;return typeof(it)=="function"}).forEach( function(it){N[it]=Math[it].bind(Math)} );
        var hh={
            isPosInt:function(){var n=this, n1=n>>>0;return n==n1?n1:0                  } ,
            isInt   :function(){var n=this, n1=n>>>0;return n==n1?n1:0                  } ,
            round	:function(){var n=this; this.from( (n+((n<0?-1:1)*0.5))>>0      )   } ,
            ceil	:function(){var n=this; this.from( n + (n < 0 ? 0 :.5) >> 0    	)  } ,
            floor	:function(){var n=this; this.from( n  >> 0                      )  	},
            abs		:function(){var n=this; this.from( (n ^ (n >> 31)) - (n >> 31)  )	} ,
            odd		:function(){var n=this; this.from( !((n & 1) === 0)  			)	} ,
            even	:function(){var n=this; this.from( ((n & 1) == 0)   			)	} ,
            mpo		:function(){var n=this; this.from( (n * 2) === (n << 1)   		)	} ,
            div 	:function(){var n=this; this.from( (n / 2) === (n >> 1)   		)	} ,
            swap	:function(b){var n=this;n ^= b;b ^= n;n ^= b;return this.from(n)	} ,
            signum	:function(){var n=this; this.from( n<0    						)	},
           signflip	:function(){var n=this; this.from( (~n + 1)   					)	} ,
            add		:function(b){var n=this;this.from( n+b   						)	} ,
            mul		:function(b){var n=this;this.from( n*b   						)	} ,
            mod		:function(b){var n=this;this.from( n%b  						)	} ,
            eq		:function(b){var n=this;this.from( n==b  						)	} ,
            trunc   :function(b){var n=this;this.from( n+(n<0?-0.5	:+0.5)>>0       )  } ,
            le		:function(b){var n=this;return ( n<b                			)	} ,
            ge		:function(b){var n=this;return ( n>b                			)	}
        };
        for(var k in hh){
            N[k]=hh[k]
        }

        /*N.times=function(n,predi){
         var ret=Array(n),v=predi
         if(predi==null){return ret}
         var isfn=typeOf(v)=="function",i= -1,ln=n
         while(++i<ln){ret[i]=isfn?v(i):v}
         return ret;
         }*/
        N.times =function(fn)       {var n=+this;return N.range(0,n).map($.fnize(fn)) }
        N.minmax=function(a,b)      {var n=+this,r=Math.min(b,Math.max(a,n));return this.from(r)}
        N.is=function(b)            {var n=+this;return n.equals(b)}
        N.equals=function(b)        {var n=+this;return  !N.compare(n,b) }
        N.compare=function(b)       {var n=+this, a=n,b1=parse(b),df= (b==null || isNaN(b1)||n==null || isNaN(a))?-1:a.valueOf() - b1.valueOf(); return df?(df>0?1:-1):0; }
        N.compatible=function(b)    {var n=+this;return !isNaN(Number(b))}
        N.inRange=function(a,b)     {var n=+this;return n  >= a && n <= b }
        N.notInRange=function(a,b)  {var n=this;return !this.inRange.apply(this,arguments) }
        N.toHex = function()        {var n=+this; var hex = "0123456789ABCDEF";  return hex.substr((n >> 4) & 0x0F, 1) + hex.substr(n & 0x0F,1); }
        N.format=function(frmtarg,ashtml){var n=+this;
            if(!n){return ""}
            if(!(frmtarg && ashtml)){
                var arr=String(n).split(/\./),s=arr[0], offst=s.length%3;
                return (s.substr(0,offst)+s.substr(offst).replace(/([\d]{3})/g,",$1")).replace(/^,/,"")     +(arr.length>1?("."+arr[1]):"")
            }
            if(frmtarg=="size"){var size=$n(n),fileSize =""
                if (size > 1024 * 1024){ fileSize = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';}
                else{fileSize = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';}
                return fileSize
            }

            frmtarg=frmtarg||"###,##.##"
            var frmt={},str=frmtarg
            if(typeof(frmtarg)=="string"){
                frmt.decsymbol=/0$/.test(frmtarg)?((frmtarg.match(/[.]0+$/)||[""]).shift()[0]):""
                if(frmtarg[0]!="#"){frmt.prefix=frmtarg[0];frmtarg=frmtarg.substr(1)}
                if(frmt.decsymbol){var idx=frmtarg.lastIndexOf(frmt.decsymbol);str=frmtarg.substr(0,idx);frmt.roundto=frmtarg.substr(idx+1).length}
                var arr=str.split(/[^0#]/);
                frmt.groupsize=arr[0].length
                frmt.lastgroupsize=arr.pop().length
                frmt.sepsymbol=str.substr(frmt.groupsize,1)

            }
            else frmt=frmtarg
            var nustr,str,ints,arr,decs="",num=Number(n), ascurrency        =   frmt.ascurrency,res
            frmt.roundto      =   frmt.roundto||(ascurrency?2:0)
            frmt.decsymbol    =   frmt.decsymbol||"." ;     frmt.sepsymbol=frmt.sepsymbol||","
            frmt.groupsize    =   frmt.groupsize||2 ;       frmt.lastgroupsize= frmt.lastgroupsize||3
            // var gs=frmt.groupsize,arr=num.split(frmt.decsymbol),v=arr.shift(),it=v.length;
            // var ret=((Array(((it%gs)?((it+gs)-(it%gs)):it)-it ).join("0")+v).replace(/(\d\d\d)(?=\d)/g,"$1"+frmt.sepsymbol).replace(/^0+/,"")+  (arr[0]==null?"":(frmt.decsymbol+arr[0])))
            if(isNaN(num)) {return ""}
            num=num.toFixed(frmt.roundto||0)
            str=String(num);
            if(str.length<=(frmt.lastgroupsize||frmt.groupsize)){return str}
            arr=str.split(frmt.decsymbol||"~");ints=arr.shift();decs=arr.pop()||"";//console.log(ints,decs,decs.length)
            var   ln=ints.length,last=ints.substr(ln-frmt.lastgroupsize),wolast=ints.substr(0,ln-frmt.lastgroupsize) ;
            //arr=[],dff=Math.ceil(str.length/frmt.groupsize)*frmt.groupsize-str.length;str=Array(dff+1).join(" ")+str;
            // while(str.length>=frmt.groupsize){arr.push(str.slice(0,frmt.groupsize));str=str.substr(frmt.groupsize)};
            // arr.join(frmt.sepsymbol)
            var lst=(Array( (frmt.groupsize*Math.ceil(wolast.length/frmt.groupsize)) - (wolast.length-1)).join("_")+  wolast).split("")
            res=lst.groupsOf(frmt.groupsize)
                .map(function(it){return it.join("")})
                .join(frmt.sepsymbol)
                .replace(/^[\_]+/,"")
                + (frmt.sepsymbol   + last)
            if(frmt.roundto>decs.length){decs=decs+Array(frmt.roundto-decs.length+1).join("0")}
            else {decs=decs.substr(0,frmt.roundto)}
            if(res[0]==frmt.sepsymbol) {res=res.substr(1)}
            var decpart=(frmt.roundto==0 || decs.length==0)?"":(frmt.decsymbol+ decs )
            if(frmt.prefix){res=frmt.prefix+res}
            return res+decpart
        }


        N.abs= function()           {var n=+this,r= (n + (n >> 31)) ^ (n >> 31);return this.from(r)}
        N.round=function( d)        {var n=+this,r=  d
            ? Math.round(n * (d = Math.pow(10, d))) / d
            : Math.round(n);   return this.from(r)
        }
        N.unformat=function(b)      { }
        N.toDate=function(b)        {return new Date(+this);  }
        N.plus=function(n1)         {var n=this,r=  [].slice.call(arguments).map(_parse).reduce(function(m,it){return m+it},+n);return this.from(r)            }
        N.add=N.plus
        N.minus=function(n1)        {var n=this,r=  [].slice.call(arguments).map(_parse).reduce(function(m,it){return m-it},+n);return this.from(r)          }
        N.mul=function(n1)          {var n=this,r=  [].slice.call(arguments ).map(_parse).reduce(function(m,v){return m*v},+n);return this.from(r)              }
        N.div=function(n1)          {var n=this,r=  [].slice.call(arguments ).map(_parse).reduce( function(m,v){return m/(v||1)},+n);return this.from(r)      }
        N.mod=function(n1)          {var n=+this,r=  n % parse(n1)              }
        N.clamp=
         N.minmax=function( a,b)  { var r=Math.min(b,Math.max(+this,a));return this.from(r)}
        N.between=
         N.inRange=function(a,b)    {var n=this,r= n  >= a && n <= b;return this.from(r);return this.from(r)  }
        N.notInRange=function( b)   {  return !this.inRange.apply(this, arguments) }
        N.timeout=function(fn)      {var n=+this; return setTimeout(fn,n)}
        N.trunc=function()          {var n=+this,r= Math.floor(n);return this.from(r) }
        N.upto=function(end,step)   {  return  this.range(end,step,false)              }
        N.to=function(  end,step)   {  return  this.range(end,step,true)              }
        //draw random=20..times(Math.random).forEach(function(it){console.log(Array(Math.round(it*100)).join("|"),"\n")})
        N.comparator=function(a,b)  {return +a -  +b }
        N.random=function(a)        {var n=+this,r= (a && a>n)?((Math.random()*(a-n))+n):(Math.random()*n);return this.from(r) }
        N.range=function(b,step,inc,precs){
            var n=+this;
            var st=n,end=parse(b),ret=[],abs=Math.abs,signum=b-n;
            if(typeof(inc)!="boolean" && typeof(inc)=="number"){precs=inc;inc=null}
            if(inc==null && typeof(step)=="boolean"){inc=step;step=1}       ;
            step=(parse(step)||1)*(parse(precs)?1.0:1)
            if(b<n){st=b ;end=n; } else {}
            step= abs(step)
            while(st<=end){
                ret.push(st);st+=step
            }

            if(ret.length){
                if(b<n){ret.reverse()}
                var lst=ret[ret.length-1]
                if(!inc && ((lst>0 && lst>=b)||(lst<0 && lst<=b))){ret.pop()}
            }
            if(precs){ret=ret.map(function(it){return NUMBER.from(Number(it).toFixed(precs))})}
            return ret
        }

        return N
    }

    NUMBER.prototype.constructor=NUMBER
    NUMBER.parse=_parse
    NUMEXTEND(NUMBER.prototype,_parse)
     Number.prototype._extend=function(){return NUMBER.from(+this)}
    NUMBER.create=NUMBER.from= NUMBER.toNumber= NUMBER.prototype.from=NUMBER.prototype.toNumber=NUMBER.prototype.parse=  function(n){var ctor=NUMBER;return new ctor(ctor.parse(n))}
     $.n=$.number=NUMBER

        //extendNotive proto

    return NUMBER
} )($,window);