var PARSER=(function(){
    var doLog= 1,util=null;
    var pushall=Array.prototype.push
    var _emptyTags = {
        area: 1  , base: 1  , basefont: 1  , br: 1 , col: 1  , frame: 1 , hr: 1 , img: 1 , input: 1  , isindex: 1 , link: 1 , meta: 1  , param: 1 , embed: 1 , '?xml': 1
    };

    //HTML parser

    var i= 0,tabarrr=[],indent="";
    while(++i<40){indent=indent+".\t"
        tabarrr.push(indent)
    }

    var CharQueue=function(string){
        var _que=this,origlen=string.length
        var _savedStrings=[],_comments=[]
        _que.string=string
        //to speed up collapse all WS ?? - may have some sideeffects
        string=string.replace(/\s+/gm," ")
        _que.stringClean=string

        /*_que.stringClean=string.replace(/\\['"]/g," ").replace(/(['"])([^\1]*)\1/g,function(a,b,c){
         if(!c){return a}
         var idx=_savedStrings.indexOf(c);
         if(idx<0){idx=_savedStrings.push(c)-1}
         return b+'`'+idx+b
         });*/
        //_que.stringClean=string;
        var A=_que.stringClean.split(""),strlen=string.length,remaining= strlen,len=remaining,pointer= 0,_top=A[pointer]

        function _error(str,msg,thr){if(str && typeof(str)=="object"){str=str.t+" "+str.v}
            if(thr){
                throw new Error(msg+"\n"+ this.index() +"  "+str)
            }
        }
        _que.error=_error
        _que.at=function(offset){
            return string[offset]
        }
        _que.take=function(n){
            if(remaining<=0){return null}
            var ret=string[pointer++]||""
            if(n>1){
                while(n>1){n--
                    ret+=string[pointer++]
                }

                //ret=A.splice(0,n).join("")
            }
            _top=string[pointer];
            remaining=strlen-pointer;

            return ret
        }
        _que.size= function(){return remaining}
        _que.index= function(){return pointer}
        _que.isIDStart=function(){var c=this.first()
            return remaining>0 && ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c=='_')
        }
        _que.isNumStart=function(){var c=this.first()
            return remaining>0 && ((c >= '0' && c <= '9') || c == "." || c == "-")
        }
        _que.isQuote=function(){var c=this.first()
            return remaining>0 && (c === '"' || c==="'")
        }
        _que.isWS=function(){
            return remaining>0 && _top<=' '
        }

        _que.isEq=function(){
            return remaining>0 && _top==='='
        }

        _que.hasMore=function(){
            return remaining>0
        }
        _que.isWord=function(w,caseInsensitive){
            var idx=len-remaining,s=this.stringClean
            return (remaining>0&&idx>=0) && (s.indexOf(w, idx ) === idx || (caseInsensitive && s.substr(idx, w.length).toLowerCase() === w.toLowerCase()))

        }
        _que.advance=function(n){
            return this.take(n)
        }
        _que.takeWS=function(){
            var cs=""
            while(remaining>0 && _top<=' '){
                cs+=this.take()
            }
            return cs
        }
        _que.skipWS=function(){
            while(remaining>0 && _top<=' '){
                this.take()
            }
            return this
        }


        _que.first=function(){
            return _top//A[0];
        }
        _que.peek=function(n){
            n=n>0?n:0
            if(remaining<=n){return null}
            return this.at(n);
        }

        _que.takeUntil=function(str,include){
            var idx=len-remaining,nu=-1
            idx=pointer
            if(remaining<=0||idx<1){return null}

            if(str instanceof RegExp){
                this.stringClean.substr(idx).replace(str,function(a){
                    nu=idx+arguments[arguments.length-2]
                    if(include){nu+= a.length}
                })
            }
            else{
                nu=this.stringClean.indexOf(str,idx )
                if(nu>idx && include){nu+= str.length}
            }
            if(nu > idx){
                return this.take(nu-idx)
            }

            return null
        }


        _que.is=function(k,takeiftrue){
            if(!remaining){return null}
            var f=this.first(),t=typeof(k);
            if(t==="string"){return f===k?(takeiftrue===true?this.take():f):false}
            if(t==="function"){return f.call(this,k)?(takeiftrue===true?this.take():f):false}
            if(f && t==="object" && t instanceof RegExp){return f.test(util.reEscape(k))?(takeiftrue===true?this.take():f):false}
            return f===k?(takeiftrue===true?this.take():f):false
        }

        _que.getId=function getId(){
            var _que=this;
            if(!_que.isIDStart()){return}
            var str  = "";

            for (;;) {
                var c = _top;
                if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
                    (c >= '0' && c <= '9') || c === '_'|| c === '-') {
                    str += _que.take();
                } else {
                    break;
                }
            }

            return str
        }
        this.getWord=function getWord(){
            var _que=this;
            var str  = "";
            while(remaining>0 && _top>' '   && _top!=="<"  ){
                str += _que.take();
            }
            return str
        }
        this.getAttribName=function getAttribName(){var _que=this;
            if(!_que.isIDStart()){return}
            var str  = "";

            for (;;) {
                var c = _top;
                if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
                    (c >= '0' && c <= '9') || c === '_'|| c === '-'|| c === ':') {
                    str += _que.take();
                } else {
                    break;
                }
            }

            return str
        }
        this.getNumber=function getNumber(){
            var _que=this;
            var str = "",c;
            // Look for more digits.

            for (;;) {
                c = _top;
                if (c < '0' || c > '9') {
                    break;
                }
                str += _que.take();
            }

// Look for a decimal fraction part.
            c=_top
            if (c === '.') {
                str += _que.take();
                for (;;) {
                    c = _top;
                    if (c < '0' || c > '9') {
                        break;
                    }
                    str += _que.take();
                }
            }

// Look for an exponent part.
            c=_top
            if (c === 'e' || c === 'E') {
                str += _que.take();c=_top
                if (c === '-' || c === '+') {
                    str += _que.take();
                }
                if (c < '0' || c > '9') {
                    _error(str,"Bad exponent");
                    return
                }
                do {
                    str += _que.take();
                } while (_top >= '0' && _top <= '9');
            }

// Make sure the next character is not a letter.
            c=_que.first()
            if (c >= 'a' && c <= 'z') {
                str += _que.take();
                _error(str,"Bad number",true);
                return
            }

// Convert the string value to a number. If it is finite, then it is a good
// token.

            var n = +str;
            if (isFinite(n)) {
                return n;
            } else {
                _error(str,"Bad number");
            }
        }

        this.getString=function getString(){
            var _que=this;
            if(!_que.isQuote()){return}
            var q = _que.take(),str = '';
            for (;;) {
                var c = _que.take();
                if (c < ' ') {
                    _error(str,c === '\n' || c === '\r' || c === '' ?  "Unterminated string." :   "Control character in string.", true);
                }
                // Look for the closing quote.
                if (c === q) {    break;   }
                // Look for escapement.
                if (c === '\\') {
                    if (!remaining) {
                        _error(str,"Unterminated string", true);
                    }
                    c = _que.take();
                    switch (c) {
                        case 'b':   c = '\b';  break;
                        case 'f':  c = '\f';  break;
                        case 'n':  c = '\n';   break;
                        case 'r':  c = '\r';   break;
                        case 't':   c = '\t';  break;
                        case 'u':
                            if (!remaining) {
                                _error(str,"Unterminated string", true);
                            }
                            c = parseInt(_que.take(4), 16);
                            if (!isFinite(c) || c < 0) {
                                _error(str,"Unterminated string", true);
                            }
                            c = String.fromCharCode(c);

                            break;
                    }
                }
                str += c;
            }

            return str
        }
    }
//tagque maintains the current context in the last element

    function _parse(string,log){
        util=DOMImpl();
        doLog=!!log;
        console.time("parse")
        var _comments=[]
        //replace comments with placeholders
        string=string.trim()
        var i=-1 ;
        while((i=string.indexOf("<!"))>=0){
            var i1=string.indexOf("-->",i)
            if(i1<0){
                throw "unclosed comments";
            }
            i1=i1+3
            var c=string.substr(i,(i1-i) )
            var idx=_comments.indexOf(c);
            if(idx<0){idx=_comments.push(c)-1}
            string=string.substr(0,i).trim()+'!'+idx+'!'+string.substr(i1).trim()
        }

        var i=0,ln=string.length,  _que=new CharQueue(string);

        var state= 2,states={TAG:1,CONTENT:2,OTHER:0}
        var tagque=[util.makeToken("root")]
        tagque.last=function(){return this.length?this[this.length-1]:null}
        tagque.popQue=function(tag){
            var ln=this.length,nu,l=this[ln-1]
            if(!l || l.tag=="root"){
                //ignore
                _que.error(l.tag,"unexpected tag end",true)
            }
            if( l && tag && l.tag!=tag){
                //ignore
                _que.error(tag," expected tag "+ l.tag +" @"+JSON.stringify(l.attr).replace(/[{}'"]/g,"")+" but got "+ tag+"\n",true)
            }
            _que.skipWS();
            if(doLog) {
                if (l &&  l.ch && l.ch.length) {

                    console.log(tabarrr[l.lvl] + "/" + (l.tag||"tag"))
                }
            }
            return this.pop();

        }
        tagque.addChild=function(tag,istext){
            var ln=this.length,nu,l=this[ln-1]
            if(istext){
                var txtch=l.ch[l.ch.length-1]||{}
                if(txtch.text==null){
                    l.ch.push(txtch=util.makeToken("#text",l))
                }
                if(!txtch.text){txtch.text=""}
                txtch.text+=tag
                txtch.lvl= l.lvl+1,
                    nu=txtch;
            } else {
                l.ch.push(nu=util.makeToken(tag,l))
                tagque.push(nu)

            }
            return nu
        }
        tagque.addText=function(y){

            return this.addChild(y,true)
        }

        function extractAttribs(cntr) {
            cntr=cntr||0
            if(cntr>100){
                _que.error(_que.first(),"attr looped "+cntr)
                return
            }
            _que.skipWS();
            if(!_que.hasMore() || _que.is(">")|| _que.isWord("/>")){
                return
            }

            var l = tagque.last(), ret, c = _que.first()
            if (_que.isIDStart()) {

                var str = _que.getAttribName()
                l.attr[str] = ""
                _que.skipWS();

                if (_que.is("=", true)) {
                    _que.skipWS();
                    if (_que.isQuote()) {
                        l.attr[str] = _que.getString()
                    } else if (_que.isNumStart() || _que.isIDStart()) {
                        l.attr[str] = _que.getWord()
                    }
                } else {
                    l.attr[str] = str;
                }
                extractAttribs(cntr+1)
            }  else {
                _que.error(c,"expecting attr key",true)
            }
        }
        function getTextContent(){
            var txt=_que.takeUntil("<")
            return txt
        }
        function nextToken(){
            if(!_que.hasMore()){  return  }
            var str,c=_que.first()
            if ( _que.is('<',true)) {
                if(_que.isWord('!DOCTYPE',true)){
                    tagque[0].DOCTYPE= _que.takeUntil(">",true)
                    return
                }
                var slash= 0,tagtoken
                if(_que.is('/',true)){
                    tagtoken = _que.getId()
                    _que.skipWS();
                    _que.is('>',true)

                    tagque.popQue(tagtoken)
                    return
                }
                tagtoken = _que.getId();

                if(!(tagtoken  )){
                    _que.error(tagtoken,"expected tagname "+_que.getWord( ),true)
                }
                var nu=tagque.addChild(tagtoken)
                extractAttribs()
                if(doLog) {

                    console.log(tabarrr[nu.lvl] + nu.tag+ " @" + JSON.stringify(nu.attr).replace(/[{}'"]/g, ""))
                }
                _que.skipWS();
                if(_que.is('>')){//nocontent tags
                    _que.take()
                    if(_emptyTags[tagtoken]){
                        tagque.popQue(tagtoken)
                        return
                    }
                } else if(_que.isWord('/>')){
                    _que.take(2)
                    tagque.popQue(tagtoken)
                    return
                } else {
                    _que.error(tagtoken,"expected tag close - "+_que.first(),true)
                }
                if(tagtoken=="script"||tagtoken=="style"){
                    var txt=_que.takeUntil("<"+"/"+tagtoken+">")||""
                    var nu=tagque.addText(txt)
                    if(doLog) {
                        console.log(tabarrr[nu.lvl] +   (txt.length>100?(txt.substr(0,100)+"... ("+(txt.length)+")"):txt ))
                    }
                    _que.take(tagtoken.length+3)
                    tagque.popQue()
                    return
                }
                if(_que.isWS()){
                    _que.skipWS();
                }
             } else if (state==states.CONTENT){
                if(tagque.last().tag=="root" ){
                    _que.skipWS()
                }
                var txt=getTextContent()||""
                if(txt.trim()){
                    var nu=tagque.addText(txt )
                    if(doLog) {
                        console.log(tabarrr[nu.lvl]  + (txt.length>100?(txt.substr(0,100)+"... ("+(txt.length)+")"):txt) )
                    }
                }
             }
        }

        _que.skipWS()
        while(_que.hasMore()){
            var curr=_que.size()
            nextToken()
            if(_que.size() && curr===_que.size()){
                console.log("ahh something went   bad",_que.first(),_que.size(),tagque.last())
                _que.advance();
            }
        }
        console.timeEnd("parse")
        //return root element

        var body,head,root= tagque[0]
        if(root && root.ch&& root.ch.length){
            if(root.ch.filter(function(a){return a.tag=="head"||a.tag=="body"}).length) {
                root.tag = "html"
                body = root.ch.filter(function (a) {
                    return a.tag == "body"
                })[0]
                head = root.ch.filter(function (a) {
                    return a.tag == "head"
                })[0]
            } else {
                body=root;
                root.tag="body"
            }
        }
        var rootel =util.makeNode(root) ;
        if(body && body!==root){
            util.makeNode(body) ;
        }
        if(head){
            util.makeNode(head) ;
        }
        return rootel
    }
    return {
        parse:_parse
    }
})();

// bb - parse: 74641.205ms
//   no splice - parse: 10119.479ms
//                       1682.601ms