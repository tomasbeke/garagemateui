/**
 * Created by Atul on 8/19/2015.
 */
function zSelectorFactory(self,document){
	var _cache={};

	//util fns
	function wrapExpr(start, end) {
		var regex = rules.inner.source
			.replace(/</g, start)
			.replace(/>/g, end);

		return new RegExp(regex);
	}

	function next(el) {
		while ((el = el.nextSibling)  && el.nodeType !== 1);
		return el;
	}

	function prior(el) {
		while ((el = el.previousSibling)  && el.nodeType !== 1);
		return el;
	}

	function firstChild(el) {
		if (el = el.firstChild) {
			while (el.nodeType !== 1  && (el = el.nextSibling));
		}
		return el;
	}

	function lastChild(el) {
		if (el = el.lastChild) {
			while (el.nodeType !== 1 && (el = el.previousSibling));
		}
		return el;
	}
	function unquote(str) {
		if (!str) return str;
		var ch = str[0];
		return ch === '"' || ch === '\''  ? str.slice(1, -1)  : str;
	}
	function replaceStr(regex, name, val) {
		regex = regex.source;
		regex = regex.replace(name, val.source || val);
		return new RegExp(regex);
	}
	function truncateUrl(url, num) {
		return url
			.replace(/^(?:\w+:\/\/|\/+)/, '')
			.replace(/(?:\/+|\/*#.*?)$/, '')
			.split('/', num)
			.join('/');
	}
//----------------------------------------------------------------
// Handle nth Selectors

	function parseNthSelector(sel, test) {
		var sel = sel.replace(/\s+/g, '')  , cap;

		if (sel === 'even') {
			sel = '2n+0';
		} else if (sel === 'odd') {
			sel = '2n+1';
		} else if (!~sel.indexOf('n')) {
			sel = '0n' + sel;
		}

		cap = /^([+-])?(\d+)?n([+-])?(\d+)?$/.exec(sel);

		return {
			group: cap[1] === '-'
				? -(cap[2] || 1)
				: +(cap[2] || 1),
			offset: cap[4]
				? (cap[3] === '-' ? -cap[4] : +cap[4])
				: 0
		};
	}

	function nthSelector(sel, test, last) {
		var sel = parseNthSelector(sel)
			, group = sel.group
			, offset = sel.offset
			, find = !last ? firstChild : lastChild
			, advance = !last ? next : prior;

		return function(el) {
			if (el.parentNode.nodeType !== 1) return;

			var rel = find(el.parentNode)
				, pos = 0;

			while (rel) {
				if (test(rel, el)) pos++;
				if (rel === el) {
					pos -= offset;
					return group && pos
						? !(pos % group) && (pos < 0 === group < 0)
						: !pos;
				}
				rel = advance(rel);
			}
		};
	}
//------------------------------------------
//selector part handlers

	var selectors = {
		'*': (function() {
			if (function() {
					var el = document.createElement('div');
					el.appendChild(document.createComment(''));
					return !!el.getElementsByTagName('*')[0];
				}()) {
				return function(el) {
					if (el.nodeType === 1) return true;
				};
			}
			return function() {
				return true;
			};
		})(),
		'type': function(type) {
			type = type.toLowerCase();
			return function(el) {
				return el.nodeName.toLowerCase() === type;
			};
		},
		'attr': function(key, op, val, i) {
			op = operators[op];
			return function(el) {
				var attr;
				switch (key) {
					case 'for':
						attr = el.htmlFor;
						break;
					case 'class':
						// className is '' when non-existent
						// getAttribute('class') is null
						attr = el.className;
						if (attr === '' && el.getAttribute('class') == null) {
							attr = null;
						}
						break;
					case 'href':
						attr = el.getAttribute('href', 2);
						break;
					case 'title':
						// getAttribute('title') can be '' when non-existent sometimes?
						attr = el.getAttribute('title') || null;
						break;
					case 'id':
						if (el.getAttribute) {
							attr = el.getAttribute('id');
							break;
						}
					default:
						attr = el[key] != null
							? el[key]
							: el.getAttribute && el.getAttribute(key);
						break;
				}
				if (attr == null) return;
				attr = attr + '';
				if (i) {
					attr = attr.toLowerCase();
					val = val.toLowerCase();
				}
				return op(attr, val);
			};
		},
		//psuedo

		':first-child': function(el) {
			return !prior(el)
		},
		':last-child': function(el) {
			return !next(el)  ;
		},
		':only-child': function(el) {
			return !prior(el) && !next(el)
				&& el.parentNode.nodeType === 1;
		},
		':nth-child': function(sel, last) {
			return nthSelector(sel, function() {
				return true;
			}, last);
		},
		':nth-last-child': function(sel) {
			return selectors[':nth-child'](sel, true);
		},
		':root': function(el) {
			return  el.ownerDocument.documentElement === el;
		},
		':empty': function(el) {
			return !el.firstChild;
		},
		':not': function(sel) {
			var test = compileSelector(sel);
			return function(el) {
				return !test(el);
			};
		},
		':first-of-type': function(el) {
			if (el.parentNode.nodeType !== 1) return;
			var type = el.nodeName;
			while (el = prior(el)) {
				if (el.nodeName === type) return;
			}
			return true;
		},
		':last-of-type': function(el) {
			if (el.parentNode.nodeType !== 1) return;
			var type = el.nodeName;
			while (el = next(el)) {
				if (el.nodeName === type) return;
			}
			return true;
		},
		':only-of-type': function(el) {
			return selectors[':first-of-type'](el)
				&& selectors[':last-of-type'](el);
		},
		':nth-of-type': function(sel, last) {
			return nthSelector(sel, function(rel, el) {
				return rel.nodeName === el.nodeName;
			}, last);
		},
		':nth-last-of-type': function(sel) {
			return selectors[':nth-of-type'](sel, true);
		},
		':checked': function(el) {
			return !!(el.checked || el.selected);
		},
		':indeterminate': function(el) {
			return !selectors[':checked'](el);
		},
		':enabled': function(el) {
			return !el.disabled && el.type !== 'hidden';
		},
		':disabled': function(el) {
			return !!el.disabled;
		},
		':target': function(el) {
			return el.id === location.hash.substring(1);
		},
		':focus': function(el) {
			return false //el === el.ownerDocument.activeElement;
		},
		':matches': function(sel) {
			return compileSelector(sel);
		},
		':nth-match': function(sel, last) {
			var args = sel.split(/\s*,\s*/)
				, arg = args.shift()
				, test = compileSelector(args.join(','));

			return nthSelector(arg, test, last);
		},
		':nth-last-match': function(sel) {
			return selectors[':nth-match'](sel, true);
		},
		':links-here': function(el) {
			return el + '' === location + '';
		},
		':lang': function(sel) {
			return function(el) {
				while (el) {
					if (el.lang) return el.lang.indexOf(sel) === 0;
					el = el.parentNode;
				}
			};
		},
		':dir': function(sel) {
			return function(el) {
				while (el) {
					if (el.dir) return el.dir === sel;
					el = el.parentNode;
				}
			};
		},
		':scope': function(el, con) {
			var context = con || el.ownerDocument;
			if (context.nodeType === 9) {
				return el === context.documentElement;
			}
			return el === context;
		},
		':any-link': function(el) {
			return typeof el.href === 'string';
		},
		':local-link': function(el) {
			if (el.nodeName) {
				return el.href && el.host === location.host;
			}
			var sel = +el + 1;
			return function(el) {
				if (!el.href) return;

				var url = location + ''  , href = el + '';

				return truncateUrl(url, sel) === truncateUrl(href, sel);
			};
		},
		':default': function(el) {
			return !!el.defaultSelected;
		},
		':valid': function(el) {
			return el.willValidate || (el.validity && el.validity.valid);
		},
		':invalid': function(el) {
			return !selectors[':valid'](el);
		},
		':in-range': function(el) {
			return el.value > el.min && el.value <= el.max;
		},
		':out-of-range': function(el) {
			return !selectors[':in-range'](el);
		},
		':required': function(el) {
			return !!el.required;
		},
		':optional': function(el) {
			return !el.required;
		},
		':read-only': function(el) {
			if (el.readOnly) return true;

			var attr = el.getAttribute('contenteditable')
				, prop = el.contentEditable
				, name = el.nodeName.toLowerCase();

			name = name !== 'input' && name !== 'textarea';

			return (name || el.disabled) && attr == null && prop !== 'true';
		},
		':read-write': function(el) {
			return !selectors[':read-only'](el);
		},
		':hover': function() {
			throw new Error(':hover is not supported.');
		},
		':active': function() {
			throw new Error(':active is not supported.');
		},
		':link': function() {
			throw new Error(':link is not supported.');
		},
		':visited': function() {
			throw new Error(':visited is not supported.');
		},
		':column': function() {
			throw new Error(':column is not supported.');
		},
		':nth-column': function() {
			throw new Error(':nth-column is not supported.');
		},
		':nth-last-column': function() {
			throw new Error(':nth-last-column is not supported.');
		},
		':current': function() {
			throw new Error(':current is not supported.');
		},
		':past': function() {
			throw new Error(':past is not supported.');
		},
		':future': function() {
			throw new Error(':future is not supported.');
		},
		//  for compatibility purposes.
		':contains': function(sel) {
			return function(el) {
				var text = el.innerText || el.textContent || el.value || '';
				return !!~text.indexOf(sel);
			};
		},
		':has': function(sel) {
			return function(el) {
				return matchSelector(sel, el).length > 0;
			};
		},
		':visible': function(sel) {
			return function(el) {
				if(el && el.offsetHeight && el.offsetWidth && document.defaultView.getComputedStyle(el).visibility!="hidden"){
					var r=el.getBoundingClientRect()
					if(r.bottom>0 && r.right>0 && r.top<self.innerHeight && r.left<self.innerWidth){
						return true
					}
				}
				return false
			};
		}
		// @TODO add more pseudo selectors
	};
//----------------------------------------------------------

	//-----------------------------------------------------
	//Attribute Operators

	var operators = {
		'-': function() {
			return true;
		},
		'=': function(attr, val) {
			return attr === val;
		},
		'*=': function(attr, val) {
			return attr.indexOf(val) !== -1;
		},
		'~=': function(attr, val) {
			var i = attr.indexOf(val)
				, f
				, l;

			if (i === -1) return;
			f = attr[i - 1];
			l = attr[i + val.length];

			return (!f || f === ' ') && (!l || l === ' ');
		},
		'|=': function(attr, val) {
			var i = attr.indexOf(val)
				, l;

			if (i !== 0) return;
			l = attr[i + val.length];

			return l === '-' || !l;
		},
		'^=': function(attr, val) {
			return attr.indexOf(val) === 0;
		},
		'$=': function(attr, val) {
			return attr.indexOf(val) + val.length === attr.length;
		},
		// non-standard
		'!=': function(attr, val) {
			return attr !== val;
		}
	};
//----------------------------------------------------------

	//-----------------------------------------------------
	//Combinators

	var combinators = {
		' ': function(test) {
			return function(el) {
				while (el = el.parentNode) {
					if (test(el)) return el;
				}
			};
		},
		'<': function(test) { //get all parents
			return function(el) {
				el = el.firstElementChild
				while (el) {
					if (test(el)) return el;
					el= el.nextElementSibling
				}
 			};
		},
		'>': function(test) {
			return function(el) {
				return test(el = el.parentNode) && el;
			};
		},
		'+': function(test) {
			return function(el) {
				return test(el = prior(el)) && el;
			};
		},
		'~': function(test) {
			return function(el) {
				while (el = prior(el)) {
					if (test(el)) return el;
				}
			};
		},
		'noop': function(test) {
			return function(el) {
				return test(el) && el;
			};
		},
		'ref': function(test, name) {
			var node;

			function ref(el) {
				var doc = el.ownerDocument
					, nodes = doc.getElementsByTagName('*')
					, i = nodes.length;

				while (i--) {
					node = nodes[i];
					if (ref.test(el)) {
						node = null;
						return true;
					}
				}

				node = null;
			}

			ref.combinator = function(el) {
				if (!node || !node.getAttribute) return;

				var attr = node.getAttribute(name) || '';
				if (attr[0] === '#') attr = attr.substring(1);

				if (attr === el.id && test(node)) {
					return node;
				}
			};

			return ref;
		}
	};

//----------------------------------------------------------

	//-----------------------------------------------------
	// Grammar

	var rules = {
		qname: /^ *([\w\-]+|\*)/,
		simple: /^(?:([.#][\w\-]+)|pseudo|attr)/,
		ref: /^ *\/([\w\-]+)\/ */,
		combinator: /^(?: +([^ \w*]) +|( )+|([^ \w*]))(?! *$)/,
		attr: /^\[([\w\-]+)(?:([^\w]?=)(inner))?\]/,
		pseudo: /^(:[\w\-]+)(?:\((inner)\))?/,
		inner: /(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|<[^"'>]*>|\\["'>]|[^"'>])*/
	};

	rules.inner = replaceStr(rules.inner, '[^"\'>]*', rules.inner);
	rules.attr = replaceStr(rules.attr, 'inner', wrapExpr('\\[', '\\]'));
	rules.pseudo = replaceStr(rules.pseudo, 'inner', wrapExpr('\\(', '\\)'));
	rules.simple = replaceStr(rules.simple, 'pseudo', rules.pseudo);
	rules.simple = replaceStr(rules.simple, 'attr', rules.attr);

	/**
	 * Compiling
	 */

	var compile = function(sel) {
		var sel = sel.replace(/^\s+|\s+$/g, '')
			, test  , filter = []  , buff = []  , subject   , qname  , cap  , op  , ref;

		while (sel) {
			if (cap = rules.qname.exec(sel)) {
				sel = sel.substring(cap[0].length);
				qname = cap[1];
				buff.push(makeToken(qname, true));
			} else if (cap = rules.simple.exec(sel)) {
				sel = sel.substring(cap[0].length);
				qname = '*';
				buff.push(makeToken(qname, true));
				buff.push(makeToken(cap));
			} else {
				throw new Error('Invalid selector.');
			}

			while (cap = rules.simple.exec(sel)) {
				sel = sel.substring(cap[0].length);
				buff.push(makeToken(cap));
			}

			if (sel[0] === '!') {
				sel = sel.substring(1);
				subject = make();
				subject.qname = qname;
				buff.push(subject.simple);
			}

			if (cap = rules.ref.exec(sel)) {
				sel = sel.substring(cap[0].length);
				ref = combinators.ref(makeSimple(buff), cap[1]);
				filter.push(ref.combinator);
				buff = [];
				continue;
			}

			if (cap = rules.combinator.exec(sel)) {
				sel = sel.substring(cap[0].length);
				op = cap[1] || cap[2] || cap[3];
				if (op === ',') {
					filter.push(combinators.noop(makeSimple(buff)));
					break;
				}
			} else {
				op = 'noop';
			}

			filter.push(combinators[op](makeSimple(buff)));
			buff = [];
		}

		test = makeTest(filter);
		test.qname = qname;
		test.sel = sel;

		if (subject) {
			subject.lname = test.qname;

			subject.test = test;
			subject.qname = subject.qname;
			subject.sel = test.sel;
			test = subject;
		}

		if (ref) {
			ref.test = test;
			ref.qname = test.qname;
			ref.sel = test.sel;
			test = ref;
		}

		return test;
	};

	var makeToken = function(cap, qname) {
		// qname
		if (qname) {
			return cap === '*'
				? selectors['*']
				: selectors.type(cap);
		}

		// class/id
		if (cap[1]) {
			return cap[1][0] === '.'
				? selectors.attr('class', '~=', cap[1].substring(1))
				: selectors.attr('id', '=', cap[1].substring(1));
		}

		// pseudo-name
		// inner-pseudo
		if (cap[2]) {
			if(!cap[3]){
				if(typeof(selectors[cap[2]])=="function"){
					return selectors[cap[2]]( )
				} else{
					return selectors[cap[2]]
				}
			}
			return selectors[cap[2]](unquote(cap[3]))
		}

		// attr name
		// attr op
		// attr value
		if (cap[4]) {
			var i;
			if (cap[6]) {
				i = cap[6].length;
				cap[6] = cap[6].replace(/ +i$/, '');
				i = i > cap[6].length;
			}
			return selectors.attr(cap[4], cap[5] || '-', unquote(cap[6]), i);
		}

		throw new Error('Unknown Selector.');
	};

	var makeSimple = function(func) {
		var l = func.length , i;
		// Potentially make sure  `el` is truthy.
		if (l < 2) return func[0];

		return function(el) {
			if (!el) return;
			for (i = 0; i < l; i++) {
				if (!func[i](el)) return;
			}
			return true;
		};
	};

	var makeTest = function(func) {
		if (func.length < 2) {
			return function(el) {
				return !!func[0](el);
			};
		}
		return function(el) {
			var i = func.length;
			while (i--) {
				if (!(el = func[i](el))) return;
			}
			return true;
		};
	};

	var make = function() {
		var target;

		function subject(el) {
			var node = el.ownerDocument
				, scope = node.getElementsByTagName(subject.lname)
				, i = scope.length;

			while (i--) {
				if (subject.test(scope[i]) && target === el) {
					target = null;
					return true;
				}
			}

			target = null;
		}

		subject.simple = function(el) {
			target = el;
			return true;
		};

		return subject;
	};

	var compileSelector = function(sel) {
		var test = compile(sel)
			, tests = [ test ];

		while (test.sel) {
			test = compile(test.sel);
			tests.push(test);
		}

		if (tests.length < 2) return test;

		return function(el) {
			var l = tests.length
				, i = 0;

			for (; i < l; i++) {
				if (tests[i](el)) return true;
			}
		};
	};

	/**
	 * Selection
	 */
	var maxNum=Number.MAX_SAFE_INTEGER||Number.MAX_VALUE||999999
	var pushall=Array.prototype.push
	var matchSelector = function(sel, node,count) {
		node=node||document
		var results = []    , test = compile(sel) , scope = node.getElementsByTagName(test.qname)    , i = 0  , el;
		if(typeof(count)!=="number"){count=maxNum}
		while (el = scope[i++]) {
			if (test(el)) results.push(el);
		}

		if (test.sel) {
			while (test.sel) {
				test = compile(test.sel);
				scope = node.getElementsByTagName(test.qname);
				i = 0;
				while (el = scope[i++]) {
					if (test(el) && !~results.indexOf(el)) {
						if(results.push(el)>=count ){break}

					}
				}
				if(results.length>=count ){break}
			}
			results.sort(function(a, b) { return a.compareDocumentPosition(b) & 2 ? 1 : -1; });
		}

		return results;
	};
	function queryAll(selector,parent,holder,count){
		if(typeof(holder)==="number"){count=holder;holder=null}
		if(typeof(count)!=="number"){count=maxNum}
		holder=holder||[]
		selector=selector.trim()
		if(selector.indexOf(",")>0){
			for(var i= 0,l=selector.split(","),ln= l.length;i<ln;i++){
				queryAll(l[i],parent,holder)
				if(holder.length>=count ){break}
			}
			return holder
		}
		var first=selector.charAt(0)
		if(selector==="*"){
			holder= parent.getElementsByTagName(selector)
		}
		else if(/^[\.#]?[\w\-\$]+$/.test(selector)) {//simple
			try {
				if (first == ".") {
					pushall.apply(holder, parent.getElementsByClassName(selector.substr(1)))
				} else if (first == "#") {
					pushall.apply(holder, parent.getElementById(selector.substr(1)))
				} else {
					pushall.apply(holder, parent.getElementsByTagName(selector))
				}
				return holder
			} catch (e) { }
		}
		pushall.apply(holder, matchSelector(selector,parent,count)||[]);
		return holder
	}
	var onmutation_attached=false
	function onmutation(ev){
		_cache={};
 		ev.stopPropagation && ev.stopPropagation();
		document.removeEventListener ("DOMSubtreeModified", onmutation );
		document.removeEventListener("DOMNodeInsertedIntoDocument", onmutation );
		onmutation_attached=false
	}
	function query(selector,parent,count){
		parent=parent||document
		/*var id=parent.id;
		if(!id && parent.body && parent===document){id="document"}
		 if(id && _cache[id+"___"+selector]){
			  return _cache[id+"___"+selector]
		 }*/
		if(typeof(count)!=="number"){count=maxNum}
		var holder=[]
		selector=selector.trim()
		if(selector.indexOf(",")>0){
			for(var i= 0,l=selector.split(","),ln= l.length;i<ln;i++){
				queryAll(l[i],parent,holder,count)
				if(holder.length>=count ){break}
			}

		} else{
			queryAll(selector,parent,holder,count)
		}
		 /*if(id){
			 _cache[id+"___"+selector]=holder;
			 if(!onmutation_attached){onmutation_attached=true;
				 document.addEventListener ("DOMSubtreeModified", onmutation );
				 document.addEventListener ("DOMNodeInsertedIntoDocument", onmutation );
			 }

		 }*/
		if(holder &&  holder.length>count){
			return holder.slice(0,count);
		}
		return holder
	}


	return {
		query:query,
		find:matchSelector,
		matches:function(node,sel){
			var test = compile(sel)
			return test && test(node)
		},
		addPsuedo:function(nm,fn){
			selectors[":"+nm]=fn;
		},
		clearCache:function(){
			_cache={};
		}
	};
}
var zSelector= {
	engine: null,
	getEngine: function () {
		if (!this.engine) {
			this.engine = zSelectorFactory( arguments[0]||self,arguments[1]||self.document)
		}
		return this.engine;
	}
}
module.exports=zSelector
