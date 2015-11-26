
     function autoscale(canvas){
        var ctx = canvas.getContext('2d');
        var ratio = window.devicePixelRatio || 1;
        if (1 != ratio) {
            canvas.style.width = canvas.width + 'px';
            canvas.style.height = canvas.height + 'px';
            canvas.width *= ratio;
            canvas.height *= ratio;
            ctx.scale(ratio, ratio);
        }
        return canvas;
    };

    function rgb(r,g,b) {
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    /** RGBA util.   */

    function rgba(r,g,b,a) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }

    /** Mouse position util. */

    function localPos(e) {
        var offset = e.target.getBoundingClientRect();
        return {
            x: e.pageX - offset.left,
            y: e.pageY - offset.top
        };
    }
    function addCSSRule(sheet, selector, rules, index) {
        try{
        if(sheet.insertRule) {
            sheet.insertRule(selector + "{" + rules + "}", index||0);
        }
        else {
            sheet.addRule(selector, rules, index||0);
        }
        } catch(e){}
    }
    /**
     * Initialize a new `ColorPicker`.
     * Emits:  `change` with the given color object
     */

    function ColorPicker(onselect,onchange,currval) {
        this._colorPos = {};
        var div=document.createElement("div");
        div.innerHTML='' +
            '<div class="color-picker" style="height:185px;">' +
                '<div class="color-picker-canvas" style="height:165px;text-align:center;white-space:nowrap;position: relative;">' +
                    '<canvas class="main"></canvas><canvas style="position:absolute;top:0;left:205px;text-align:center;white-space:nowrap" class="spectrum"></canvas>' +
                '</div>' +
                '<div class="color-picker-named" style="text-align:center;">' +
                    '<select class="color-picker-named-list" style="width:150px"><option value="0">-named colors-</option></select>' +
                    '<span class="named-sel-prev" style="display:inline-block;width:20px;margin:0 3px;">&nbsp;</span>' +
                '</div><div  style="text-align:center;margin-top:4px;"><button class="ui-button named-sel blue">OK</button></div>' +
            '</div>'
        this.el =  div.removeChild(div.firstChild)
        var sheet=document.styleSheets[0],css={".color-picker canvas":"border: 1px solid #888;display:inline-block;",".color-picker canvas.main:hover":"cursor: crosshair;",".color-picker canvas.spectrum:hover":"cursor: row-resize;",".color-picker canvas:active":"cursor: none;"}
        Object.keys(css).forEach(function(k){addCSSRule(sheet, k, css[k])});

        if(onselect){this.on("select",onselect)}
        if(onchange){this.on("change",onchange)}
        var sellist=this.el.querySelector(".color-picker-named-list")
        if(sellist && sellist.options.length<2){
            var colors=webcolors.slice();
            colors.sort(function(a,b){return String(a[0]+" ").charCodeAt(0) - String(b[0]+" ").charCodeAt(0) });
              for(var i= 0, ln=colors.length;i<ln;i++){
                var nm=colors[i][0]||"";if(!nm){continue;}
                var id=nm.toLowerCase(),label=nm.replace(/([A-Z])/g," $1").trim();

                var opt=document.createElement("option")
                opt.text = label
                opt.setAttribute && opt.setAttribute("value", id);
                typeof(sellist.add)=="function"?sellist.add(opt):sellist.appendChild(opt);
            }
            sellist.onchange=function(){
                var prev=this.parentNode.querySelector(".named-sel-prev")
                if(prev){ prev.style.backgroundColor=this.value}
            }
            this.el.querySelector(".named-sel").addEventListener("click",function(){
                onchange(new Color(sellist.value))
            });

        }


    }

    ColorPicker.prototype.activate=function(anchor,color,container){
        this.container=$d(container);
        if(!this.container){
            var popupview=$.require("PopupView")
            this._vw=new popupview({anchor:anchor,title:"Color Picker" , width:240,minHeight:230,destroyonhide:true });
            this._vw.show()
            this.container=this._vw.contentWrap
        }
        this.el=$d(this.container.append(this.el))
        this.main = this.el.q('.main');
        this.spectrum = this.el.q('.spectrum');
        this.hue(rgb(255, 0, 0));
        this.spectrumEvents(); this.mainEvents();
        this.w = 200;  this.h = 160;
        this.render();
        //this._vw.setConfig("anchor",anchor).layout().show(anchor);
        var sellist=this.container.q(".color-picker-named-list")
        if(sellist){
            if(color){
                sellist.value=String(color).toLowerCase()
            } else {
                sellist.value="0"
                this.container.q(".named-sel-prev").css({backgroundColor:"white"})
            }
        }
    }
    ColorPicker.prototype.on=function(type,fn){this._listeners||(this._listeners={});this._listeners[type]||(this._listeners[type]=[]);
        if(typeof(fn)=="function"){this._listeners[type].push(fn)}
    };
    ColorPicker.prototype.emit=function(type){var a=[].slice.call(arguments,1);
        this._listeners&&this._listeners[type]&&this._listeners[type].forEach(function(it){it.apply(this,a)},this)
    };

    /**
     * Spectrum related events.
     * @api private
     */

    ColorPicker.prototype.spectrumEvents = function(){
        var self = this , canvas =  this.spectrum , down;

        function update(e) {
            var offsetY = localPos(e).y;
            var color = self.hueAt(offsetY - 4);
            self.hue(color.toString());
            if (!((e.which&&e.which == 3)||(e.button&&e.button== 2))){}
            //self.emit('change', color);
            self._huePos = offsetY;
            self.render();
        }

        canvas.addEventListener("mousedown",function(e){
            if ((e.which&&e.which == 3)||(e.button&&e.button== 2)){return}
            e.preventDefault();
            down = true;
            update(e);
        });

        canvas.addEventListener("mousemove",function(e){
            if (down) update(e);
        });

        canvas.addEventListener("mouseup",function(e){
            if ((e.which&&e.which == 3)||(e.button&&e.button== 2)){return}
            down = false;
        });
    };

    /**
     * Hue / lightness events.
     * @api private
     */

    ColorPicker.prototype.mainEvents = function(){
        var self = this , canvas =  this.main , down;
        function update(e,onmove) {
            var color;
            self._colorPos = localPos(e);
            color = self.colorAt(self._colorPos.x, self._colorPos.y);
            self.color(color.toString());
            if(!onmove){
                self._selected=color;
                self.emit('change', new Color(color))
            }
            self.render();
        }

        canvas.addEventListener("mousedown",function(e){
            if ((e.which&&e.which == 3)||(e.button&&e.button== 2)){return}
            e.preventDefault();
            down = true;
            update(e);
        });

        canvas.addEventListener("mousemove",function(e){
            if (down) update(e,true);
        });

        canvas.addEventListener("mouseup",function(e){
            if ((e.which&&e.which == 3)||(e.button&&e.button== 2)){return}
            down = false;
        });
    };

    /**
     * Get the RGB color at `(x, y)`.
     *
     * @param {Number} x
     * @param {Number} y
     * @return {Object}
     * @api private
     */

    ColorPicker.prototype.colorAt = function(x, y){
        var data = this.main.getContext('2d').getImageData(x, y, 1, 1).data;

        return {
            r: data[0],  g: data[1],  b: data[2],
            toString: function(){   return rgb(this.r, this.g, this.b);  }
        };
    };

    /**
     * Get the RGB value at `y`.
     *
     * @param {Type} name
     * @return {Type}
     * @api private
     */

    ColorPicker.prototype.hueAt = function(y){
        var data = this.spectrum.getContext('2d').getImageData(0, y, 1, 1).data;
        return {
            r: data[0], g: data[1],    b: data[2],
            toString: function(){   return rgb(this.r, this.g, this.b);   }
        };
    };

    /**
     * Get or set `color`.
     *
     * @param {String} color
     * @return {String|ColorPicker}
     * @api public
     */

    ColorPicker.prototype.color = function(color){
        if (0 == arguments.length) return this._color;
        this._color = color;
        return this;
    };

    /**
     * Get or set hue `color`.
     *
     * @param {String} color
     * @return {String|ColorPicker}
     * @api public
     */

    ColorPicker.prototype.hue = function(color){
        // TODO: update pos
        if (0 == arguments.length) return this._hue;
        this._hue = color;
        return this;
    };
    ColorPicker.prototype.hide = function(){
           this._vw&&this._vw.hide()
    }
    /**
     * Render with the given `options`.
     *
     * @param {Object} options
     * @api public
     */

    ColorPicker.prototype.render = function(options){
        options = options || {};
        this.renderMain(options);
        this.renderSpectrum(options);

    };

    /**
     * Render spectrum.
     *
     * @api private
     */

    ColorPicker.prototype.renderSpectrum = function(options){
        var el = this.el  , canvas = this.spectrum , ctx = canvas.getContext('2d') , pos = this._huePos
            , w = this.w * .12    , h = this.h;

        canvas.width = w;  canvas.height = h;
        canvas.style.left=(this.w+2)+"px"
        autoscale(canvas);

        var grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, rgb(255, 0, 0));
        grad.addColorStop(.15, rgb(255, 0, 255));
        grad.addColorStop(.33, rgb(0, 0, 255));
        grad.addColorStop(.49, rgb(0, 255, 255));
        grad.addColorStop(.67, rgb(0, 255, 0));
        grad.addColorStop(.84, rgb(255, 255, 0));
        grad.addColorStop(1, rgb(255, 0, 0));

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // pos
        if (!pos) return;
        ctx.fillStyle = rgba(0,0,0, .5);
        ctx.fillRect(0, pos, w, 1);
        ctx.fillStyle = rgba(255,255,255, .7);
        ctx.fillRect(0, pos + 1, w, 1);
    };

    /**
     * Render hue/luminosity canvas.
     * @api private
     */

    ColorPicker.prototype.renderMain = function(options){
        var el = this.el  , canvas = this.main   , ctx = canvas.getContext('2d')
            , w = this.w     , h = this.h
            , x = (this._colorPos.x || w) + .5  , y = (this._colorPos.y || 0) + .5;
        canvas.width = w; canvas.height = h;
        autoscale(canvas);

        var grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, rgb(255, 255, 255));
        grad.addColorStop(1, this._hue);

        ctx.fillStyle = grad;  ctx.fillRect(0, 0, w, h);

        grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, rgba(255, 255, 255, 0));
        grad.addColorStop(1, rgba(0, 0, 0, 1));

        ctx.fillStyle = grad;   ctx.fillRect(0, 0, w, h);

        // pos
        var rad = 10;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;

        // outer dark
        ctx.strokeStyle = rgba(0,0,0,.5);
        ctx.arc(x, y, rad / 2, 0, Math.PI * 2, false);
        ctx.stroke();

        // outer light
        ctx.strokeStyle = rgba(255,255,255,.5);
        ctx.arc(x, y, rad / 2 - 1, 0, Math.PI * 2, false);
        ctx.stroke();

        ctx.beginPath();
        ctx.restore();
    }


    var webcolors=     
        [
    ["Pink","FFC0CB",[  255,192,203]],
	["LightPink","FFB6C1",[  255,182,193]],
	["HotPink","FF69B4",[  255,105,180]],
	["DeepPink","FF1493",[  255,20,147]],
	["PaleVioletRed","DB7093",[  219,112,147]],
	["MediumVioletRed","C71585",[  199,21,133]],
	["LightSalmon","FFA07A",[  255,160,122]],
	["Salmon","FA8072",[  250,128,114]],
	["DarkSalmon","E9967A",[  233,150,122]],
	["LightCoral","F08080",[  240,128,128]],
	["IndianRed","CD5C5C",[  205,92,92]],
	["Crimson","DC143C",[  220,20,60]],
	["FireBrick","B22222",[  178,34,34]],
	["DarkRed","8B0000",[  139,0,0]],
	["Red","FF0000",[  255,0,0]],
	["OrangeRed","FF4500",[  255,69,0]],
	["Tomato","FF6347",[  255,99,71]],
	["Coral","FF7F50",[  255,127,80]],
	["DarkOrange","FF8C00",[  255,140,0]],
	["Orange","FFA500",[  255,165,0]],
	["Yellow","FFFF00",[  255,255,0]],
	["LightYellow","FFFFE0",[  255,255,224]],
	["LemonChiffon","FFFACD",[  255,250,205]],
	["LightGoldenrodYellow","FAFAD2",[  250,250,210]],
	["PapayaWhip","FFEFD5",[  255,239,213]],
	["Moccasin","FFE4B5",[  255,228,181]],
	["PeachPuff","FFDAB9",[  255,218,185]],
	["PaleGoldenrod","EEE8AA",[  238,232,170]],
	["Khaki","F0E68C",[  240,230,140]],
	["DarkKhaki","BDB76B",[  189,183,107]],
	["Gold","FFD700",[  255,215,0]],
	["Cornsilk","FFF8DC",[  255,248,220]],
	["BlanchedAlmond","FFEBCD",[  255,235,205]],
	["Bisque","FFE4C4",[  255,228,196]],
	["NavajoWhite","FFDEAD",[  255,222,173]],
	["Wheat","F5DEB3",[  245,222,179]],
	["BurlyWood","DEB887",[  222,184,135]],
	["Tan","D2B48C",[  210,180,140]],
	["RosyBrown","BC8F8F",[  188,143,143]],
	["SandyBrown","F4A460",[  244,164,96]],
	["Goldenrod","DAA520",[  218,165,32]],
	["DarkGoldenrod","B8860B",[  184,134,11]],
	["Peru","CD853F",[  205,133,63]],
	["Chocolate","D2691E",[  210,105,30]],
	["SaddleBrown","8B4513",[  139,69,19]],
	["Sienna","A0522D",[  160,82,45]],
	["Brown","A52A2A",[  165,42,42]],
	["Maroon","800000",[  128,0,0]],
[  "DarkOliveGreen","556B2F",[  85,107,47]],
[  "Olive","808000",[  128,128,0]],
[  "OliveDrab","6B8E23",[  107,142,35]],
[  "YellowGreen","9ACD32",[  154,205,50]],
[  "LimeGreen","32CD32",[  50,205,50]],
[  "Lime","00FF00",[  0,255,0]],
[  "LawnGreen","7CFC00",[  124,252,0]],
[  "Chartreuse","7FFF00",[  127,255,0]],
[  "GreenYellow","ADFF2F",[  173,255,47]],
[  "SpringGreen","00FF7F",[  0,255,127]],
[  "MediumSpringGreen","00FA9A",[  0,250,154]],
[  "LightGreen","90EE90",[  144,238,144]],
[  "PaleGreen","98FB98",[  152,251,152]],
[  "DarkSeaGreen","8FBC8F",[  143,188,143]],
[  "MediumSeaGreen","3CB371",[  60,179,113]],
[  "SeaGreen","2E8B57",[  46,139,87]],
[  "ForestGreen","228B22",[  34,139,34]],
[  "Green","008000",[  0,128,0]],
[  "DarkGreen","006400",[  0,100,0]],
[  "MediumAquamarine","66CDAA",[  102,205,170]],
[  "Aqua","00FFFF",[  0,255,255]],
[  "Cyan","00FFFF",[  0,255,255]],
[  "LightCyan","E0FFFF",[  224,255,255]],
[  "PaleTurquoise","AFEEEE",[  175,238,238]],
[  "Aquamarine","7FFFD4",[  127,255,212]],
[  "Turquoise","40E0D0",[  64,224,208]],
[  "MediumTurquoise","48D1CC",[  72,209,204]],
[  "DarkTurquoise","00CED1",[  0,206,209]],
[  "LightSeaGreen","20B2AA",[  32,178,170]],
[  "CadetBlue","5F9EA0",[  95,158,160]],
[  "DarkCyan","008B8B",[  0,139,139]],
[  "Teal","008080",[  0,128,128]],
[  "LightSteelBlue","B0C4DE",[  176,196,222]],
[  "PowderBlue","B0E0E6",[  176,224,230]],
[  "LightBlue","ADD8E6",[  173,216,230]],
[  "SkyBlue","87CEEB",[  135,206,235]],
[  "LightSkyBlue","87CEFA",[  135,206,250]],
[  "DeepSkyBlue","00BFFF",[  0,191,255]],
[  "DodgerBlue","1E90FF",[  30,144,255]],
[  "CornFlowerBlue","6495ED",[  100,149,237]],
[  "SteelBlue","4682B4",[  70,130,180]],
[  "RoyalBlue","4169E1",[  65,105,225]],
[  "Blue","0000FF",[  0,0,255]],
[  "MediumBlue","0000CD",[  0,0,205]],
[  "DarkBlue","00008B",[  0,0,139]],
[  "Navy","000080",[  0,0,128]],
[  "MidnightBlue","191970",[  25,25,112]],
[  "Lavender","E6E6FA",[  230,230,250]],
[  "Thistle","D8BFD8",[  216,191,216]],
[  "Plum","DDA0DD",[  221,160,221]],
[  "Violet","EE82EE",[  238,130,238]],
[  "Orchid","DA70D6",[  218,112,214]],
[  "Fuchsia","FF00FF",[  255,0,255]],
[  "Magenta","FF00FF",[  255,0,255]],
[  "MediumOrchid","BA55D3",[  186,85,211]],
[  "MediumPurple","9370DB",[  147,112,219]],
[  "BlueViolet","8A2BE2",[  138,43,226]],
[  "DarkViolet","9400D3",[  148,0,211]],
[  "DarkOrchid","9932CC",[  153,50,204]],
[  "DarkMagenta","8B008B",[  139,0,139]],
[  "Purple","800080",[  128,0,128]],
[  "Indigo","4B0082",[  75,0,130]],
[  "DarkSlateBlue","483D8B",[  72,61,139]],
[  "SlateBlue","6A5ACD",[  106,90,205]],
[  "MediumSlateBlue","7B68EE",[  123,104,238]],
[  "White","FFFFFF",[  255,255,255]],
[  "Snow","FFFAFA",[  255,250,250]],
[  "Honeydew","F0FFF0",[  240,255,240]],
[  "MintCream","F5FFFA",[  245,255,250]],
[  "Azure","F0FFFF",[  240,255,255]],
[  "AliceBlue","F0F8FF",[  240,248,255]],
[  "GhostWhite","F8F8FF",[  248,248,255]],
[  "WhiteSmoke","F5F5F5",[  245,245,245]],
[  "Seashell","FFF5EE",[  255,245,238]],
[  "Beige","F5F5DC",[  245,245,220]],
[  "OldLace","FDF5E6",[  253,245,230]],
[  "FloralWhite","FFFAF0",[  255,250,240]],
[  "Ivory","FFFFF0",[  255,255,240]],
[  "AntiqueWhite","FAEBD7",[  250,235,215]],
[  "Linen","FAF0E6",[  250,240,230]],
[  "LavenderBlush","FFF0F5",[  255,240,245]],
[  "MistyRose","FFE4E1",[  255,228,225]],
[  "Gainsboro","DCDCDC",[  220,220,220]],
[  "LightGrey","D3D3D3",[  211,211,211]],
[  "Silver","C0C0C0",[  192,192,192]],
[  "DarkGray","A9A9A9",[  169,169,169]],
[  "Gray","808080",[  128,128,128]],
[  "DimGray","696969",[  105,105,105]],
[  "LightSlateGray","778899",[  119,136,153]],
[  "SlateGray","708090",[  112,128,144]],
[  "DarkSlateGray","2F4F4F",[  47,79,79]],
[  "Black","000000",[  0,0,0]
    ]
        ];


  //  To calculate the web-safe values (0, 3, 6, 9, C and F), the integer values (0 to 255) are divided by 51, rounded to whole numbers and the multiplied with 3.
    //To calculate the short hex values (0 to 9 and A to F), the integer values (0 to 255)    are divided by 17 and then rounded to whole numbers.

    //To calculate the percentage values (0% to 100%), the integer values (0 to 255) are divided by 2.55 and then rounded to whole numbers.
    var Color=function(val){
        this.r=0;this.g=0;this.b=0;this.o=1;this.name=1;this.hex=1;
        this.parse.apply(this,arguments)

    }
    Color._masks={b:0xFF0000, g:0xFF00, r:0xFF};
    Color.prototype.parse=function parse(val){
        if(val==null){return null}
        if(arguments.length>=3) {
            this.fromArray([].slice.call(arguments))
        } else if(!isNaN(val)&& (+val)>=0){
                var m=Color._masks,bgrValue=+val
                this.b=Math.max(0,((bgrValue & m.b) >> 16))||0
                this.g=Math.max(0,((bgrValue & m.g) >> 8))||0
                this.r=Math.max(0,((bgrValue & m.r)))||0;

        } else if(typeof(val)=="string"){val=val.trim()
                if(val.indexOf("rgb")==0){
                    this.fromArray(val)
                } else{
                    if(val.indexOf("#")==0){val=val.substr(1)}
                    var lc=val.toLowerCase();
                    var rs=webcolors.filter(function(it){return it[0].toLowerCase()==lc||it[1].toLowerCase()==lc})[0]

                    if(rs){
                        this.r=rs[2][0];this.g=rs[2][1];this.b=rs[2][2]
                        this.name=rs[0]
                        this.hex=rs[1]
                    }
                    else if(val && /^[0-9a-f]+$/i.test(val)){
                        var r,g,b,arr=[];
                        if (String(val).length == 3){arr=String(val).split("");
                            arr =[arr[0]+arr[0],arr[1]+arr[1],arr[2]+arr[2]];
                        } else {
                            arr =String(val).match(/[0-9a-f]{2}/ig)||[]
                        }
                        this.r = parseInt(arr[0], 16);  this.g = parseInt(arr[1], 16); this.b = parseInt(arr[2], 16);
                        if(arr[3]!=null){this.o=arr[3]}

                    }
                }
            }  else if(val && val.length&&val.length>=3){
                this.fromArray(val)
            }else if(val && typeof(val)=="object"){
                this.fromArray([val.r,val.g,val.b])
            }

    }
    Color.prototype.fromArray=function fromArray(arr0) {
        var arr=arr0.map(Number)
        this.r= arr[0]
        this.g= arr[1]
        this.b= arr[2]
        if(arr[3]!=null){this.o=arr[3]}
    }
    Color.prototype.toRgb=function toRgb(hex_string) {
        return "rgb("+([this.r,this.g,this.b].join(","))+")"
    }
    Color.prototype.fromNumber=function toNumber(num) {
        var m=Color._masks
        this.b=((bgrValue & m.b) >> 16)
        this.g=((bgrValue & m.g) >> 8)
        this.r=((bgrValue & m.r));
        return this

    }
    Color.prototype.getColorName=function getColorName() {
        var hex
        if(!this.name){
              hex=this.toHex(false);
            this.name = webcolors.filter(function(it){return it[1]==hex})[0]
        }
        return this.name==1?"":this.name;
    }
    Color.prototype.sub=Color.prototype.minus=function minus(val,mutate) {
        if(mutate){
            this.parse(this.toNumber()-Color.from(val).toNumber())
        }
        return Color.from(this.toNumber()-Color.from(val).toNumber())
    }
    Color.prototype.toString= function() {
        return JSON.stringify(this.toMap())
    }
    Color.prototype.toMap= function() {
        return {r:this.r,g:this.g,b:this.b};
    }
    Color.prototype.plus=Color.prototype.add=function add(val,mutate) {
        if(mutate){
              this.parse(Color.from(val).toNumber()+this.toNumber())
        }
        return Color.from(Color.from(val).toNumber()+this.toNumber())
    }
    Color.prototype.toNumber=function toNumber() {
        if(this.r){
            return  (this.b << 16) + (this.g << 8) + r;
        }
     }
    Color.prototype.valueOf=function valueOf() {
        return this.toNumber();
    }
    Color.prototype.toHex=function toHex(includeHash) {
        var hex = this.hex
        if (!hex || hex === 1) {
            hex = [(this.r || 0  ).toString(16), (this.g  || 0).toString(16), (this.b||0).toString(16)].map(function (r) {
                return (r.length == 1 ? "0" : "") + r
            }).join("");
        }
        return (((includeHash||includeHash===undefined) ? '#' : '') + hex ).toUpperCase();
    }
    Color.from=function(val){
        if(!val){return new Color()}
        return new Color(val)
    }
    var inst=null
    Color.colorPicker= ColorPicker
    Color.names=webcolors.reduce(function(m,k){m[k[0]]=k[1];return m},{});
    Color.webcolors=webcolors
    var _addNamedColorRulesadded=0
    Color.isNamedColor=function(k){
        return Color.getNamedColorMap()[String(k).toLowerCase()]

    }
    var _namedColorMap=null
    Color.getNamedColorMap=function(){
        if(!_namedColorMap) {
            _namedColorMap = {}
            webcolors.forEach(function (it) {
                if (!(it[0] && typeof(it[0]) == "string")) {
                    return
                }
                var k = it[0]
                _namedColorMap[k.toLowerCase()] = {hex: "#" + it[1], rgb: it[2]}
                if (k.indexOf("gray") >= 0) {
                    _namedColorMap[k.replace( "gray","grey").toLowerCase()] = {hex: "#" + it[1], rgb: it[2]}
                }
            })
        }
        return _namedColorMap
    }
    Color.addNamedColorRules=function(){
        if(_addNamedColorRulesadded){return}
        var m =Color.getNamedColorMap() ,map={}
        Object.keys(m).forEach(function(it){
            var k=it.toLowerCase().trim()
            map["color_"+k]=m[it].hex
        })
        webcolors.forEach(function(it){
            var k=String(it[0]).trim().replace(/\W+/g,"_").toLowerCase().trim()
            if(!map["color_"+k]){map["color_"+k.toLowerCase()]="#"+it[1]}
        })

        $d.css.addRules("webcolors",map)

        _addNamedColorRulesadded=1
    }
    ColorPicker.Color=Color
    try{
        $.Color=Color;
    } catch(e){}

module.exports=ColorPicker
