$.cloner = (function (O) {'use strict';

	var

	// constants
		VALUE   = 'value',
		PROTO   = '__proto__', // to avoid jshint complains

	// shortcuts
		create  = O.create,
		dPs     = O.defineProperties,
		gOPD    = O.getOwnPropertyDescriptor,
		gOPN    = O.getOwnPropertyNames,
		gOPS    = O.getOwnPropertySymbols ||
			function (o) { return Array.prototype; },
		gPO     = O.getPrototypeOf ||
			function (o) { return o[PROTO]; },
		hOP     = O.prototype.hasOwnProperty,
		oKs     = (typeof Reflect !== typeof oK) &&
			Reflect.ownKeys ||
			function (o) { return gOPS(o).concat(gOPN(o)); },

	// used to avoid recursions in deep copy
		index   = -1,
		known   = null,
		blown   = null,
		clean   = function () { known = blown = null; },

	// utilities

	// deep copy and merge
		deepCopy = function deepCopy(source) {
			var result = create(gPO(source));
			known = [source];
			blown = [result];
			deepDefine(result, source);
			clean();
			return result;
		},
		deepMerge = function (target) {
			known = [];
			blown = [];
			for (var i = 1; i < arguments.length; i++) {
				known[i - 1] = arguments[i];
				blown[i - 1] = target;
			}
			merge.apply(true, arguments);
			clean();
			return target;
		},

	// shallow copy and merge
		shallowCopy = function shallowCopy(source) {
			clean();
			for (var
				     key,
				     descriptors = {},
				     keys = oKs(source),
				     i = keys.length; i--;
			     descriptors[key] = gOPD(source, key)
			) key = keys[i];
			return create(gPO(source), descriptors);
		},
		shallowMerge = function () {
			clean();
			return merge.apply(false, arguments);
		},

	// internal methods
		isObject = function isObject(value) {
			/*jshint eqnull: true */
			return value != null && typeof value === 'object';
		},
		shouldCopy = function shouldCopy(value) {
			/*jshint eqnull: true */
			index = -1;
			if (isObject(value)) {
				if (known == null) return true;
				index = known.indexOf(value);
				if (index < 0) return 0 < known.push(value);
			}
			return false;
		},
		deepDefine = function deepDefine(target, source) {
			for (var
				     key, descriptor,
				     descriptors = {},
				     keys = oKs(source),
				     i = keys.length; i--;
			) {
				key = keys[i];
				descriptor = gOPD(source, key);
				if (VALUE in descriptor) deepValue(descriptor);
				descriptors[key] = descriptor;
			}
			dPs(target, descriptors);
		},
		deepValue = function deepValue(descriptor) {
			var value = descriptor[VALUE];
			if (shouldCopy(value)) {
				descriptor[VALUE] = create(gPO(value));
				deepDefine(descriptor[VALUE], value);
				blown[known.indexOf(value)] = descriptor[VALUE];
			} else if (-1 < index && index in blown) {
				descriptor[VALUE] = blown[index];
			}
		},
		merge = function merge(target) {
			for (var
				     source,
				     keys, key,
				     value, tvalue,
				     descriptor,
				     deep = this.valueOf(),
				     descriptors = {},
				     i, a = 1;
			     a < arguments.length; a++
			) {
				source = arguments[a];
				keys = oKs(source);
				for (i = 0; i < keys.length; i++) {
					key = keys[i];
					descriptor = gOPD(source, key);
					if (hOP.call(target, key)) {
						if (VALUE in descriptor) {
							value = descriptor[VALUE];
							if (shouldCopy(value)) {
								descriptor = gOPD(target, key);
								if (VALUE in descriptor) {
									tvalue = descriptor[VALUE];
									if (isObject(tvalue)) {
										merge.call(deep, tvalue, value);
									}
								}
							}
						}
					} else {
						if (deep && VALUE in descriptor) {
							deepValue(descriptor);
						}
						descriptors[key] = descriptor;
					}
				}
			}
			return dPs(target, descriptors);
		}
		;

	return {
		deep: {
			copy: deepCopy,
			merge: deepMerge
		},
		shallow: {
			copy: shallowCopy,
			merge: shallowMerge
		}
	};

}(Object));