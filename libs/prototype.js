/*
 * prototype.js
 * Enhances various prototype objects
 */

(function(){

var regex = {
	all_whitespace: /\s+/g,
	css_declaration: /\s*([\w-]+)\s*:\s*([^;]*);/g,
	whitespace: /\s+/
};

function log(msg) {
	console.log("prototype.js: "+msg);
}

function warn(msg) {
	console.warn("prototype.js: "+msg);
}

function error(msg) {
	console.error("prototype.js: "+msg);
}

function getCssPropertyName(prop) {
	return prop.replace(/[A-Z]/g, function(letter) { return "-"+letter.toLowerCase() });
}

function getVisibleProperty(el, prop) {
	var value
	if ( el.getCssStyle("display") === "none" ) {
		var display = el.style.display;
		var visibility = el.style.visibility;
		el.setStyle("visibility", "hidden");
		el.setStyle("display", "block");
		value = typeof(prop) === "string" ? el[prop] : prop();
		el.setStyle("display", display);
		el.setStyle("visibility", visibility);
	} else {
		value = typeof(prop) === "string" ? el[prop] : prop();
	}
	return value;
}

function enhancePrototype(classNames, methods) {
	if ( typeof(classNames) === "string" ) classNames = [classNames]
	for ( var i = 0, l = classNames.length; i < l; i++ ) {
		var className = classNames[i]
		
		var key,
			object = window[className],
			prototype = object && object.prototype || object;
		
		if ( prototype && typeof(prototype) === "object" ) {
			for ( key in methods ) {
				if ( methods.hasOwnProperty(key) ) {
					if ( prototype[key] !== undefined ) {
						warn(className+".prototype already has method "+key);
					} else {
						log("Adding method "+key+" to "+className+".prototype");
						prototype[key] = methods[key];
					}
				}
			}
		} else {
			throw new Error(className+" has no prototype and is not an object")
		}
	}
}

// -- Array ------------------------------------------------------------------------------------------------------------

enhancePrototype("Array", {
	reverseForEach: function(func) {
		for ( var i = this.length - 1; i >= 0; i-- ) {
			func.call(arguments[1], this[i], i, this);
		}
	}
});

// -- Document ---------------------------------------------------------------------------------------------------------

enhancePrototype("Document", {
	getLeft: function(rel) {
		return 0 - ((rel && rel.getLeft()) || 0);
	},
	getTop: function(rel) {
		return 0 - ((rel && rel.getTop()) || 0);
	}
})

// -- Document & HTMLElement -------------------------------------------------------------------------------------------

enhancePrototype(["Document", "HTMLElement"], {
	getElementByClassName: function(classNames) {
		var el = this.getElementsByClassName(classNames)
		if ( el && el.length > 0 ) return el[0]
		return null
	},
	getElementByTagName: function(tagName) {
		var el = this.getElementsByTagName(tagName)
		if ( el && el.length > 0 ) return el[0]
		return null
	},
})

// -- HTMLCollection ---------------------------------------------------------------------------------------------------

enhancePrototype("HTMLCollection", {
	forEach: Array.prototype.forEach,
	reverseForEach: Array.prototype.reverseForEach
});

// -- HTMLElement ------------------------------------------------------------------------------------------------------

enhancePrototype("HTMLElement", {
	addClass: function(value) {
		if ( !this.className || this.className.trim().length === 0 ) {
			this.className = value;
		} else {
			var class_list = value.split(regex.whitespace),
				class_string = ' ' + (this.className || '') + ' ',
				new_class, i, l;
			for ( i = 0, l = class_list.length; i < l; i++ ) {
				new_class = class_list[i];
				if ( class_string.indexOf(' ' + new_class + ' ') === -1 ) {
					class_string += new_class + ' ';
				}
			}
			this.className = class_string.replace(regex.all_whitespace, ' ').trim();
		}
	},
	getBottom: function(rel) {
		return this.getTop(rel) + getVisibleProperty(this, "offsetHeight");
	},
	getBoundaries: function(rel) {
		var top = this.getTop(rel),
			left = this.getLeft(rel)
		return {
			top: top,
			left: left,
			right: left + getVisibleProperty(this, "offsetWidth"),
			bottom: top + getVisibleProperty(this, "offsetHeight")
		}
	},
	getCssStyle: function(prop, format) {
		var css = window.getComputedStyle(this)
		if ( !prop ) {
			var stylesheet = {},
				cssText = css.cssText
			while ( (result = regex.css_declaration.matches(cssText, [1,2])) != null ) {
				stylesheet[result[0].trim()] = result[1].trim()
			}
			return stylesheet
		}
		
		prop = getCssPropertyName(prop)
		
		if ( format ) {
			var val = css.getPropertyCSSValue(prop)
			var key = "get"+format+"Value"
			if ( val[key] ) {
				try {
					return val[key]()
				} catch(e) {
					error("Unable to call "+key+" on css property value for "+prop)
				}
			} else {
				error("Invalid css format for property "+prop+": "+format)
			}
		}
		
		return css.getPropertyValue(prop)
	},
	getHeight: function(where) {
		var extra = 0;
		if ( where === 'outer' ) {
			extra += parseInt(this.getCssStyle("margin-top")) || 0;
			extra += parseInt(this.getCssStyle("margin-bottom")) || 0;
		} else {
			if ( where === 'inner' || where === 'content' ) {
				extra -= parseInt(this.getCssStyle("border-top-width")) || 0;
				extra -= parseInt(this.getCssStyle("border-bottom-width")) || 0;
			}
			if ( where === 'content' ) {
				extra -= parseInt(this.getCssStyle("padding-top")) || 0;
				extra -= parseInt(this.getCssStyle("padding-bottom")) || 0;
			}
		}
		return getVisibleProperty(this, "offsetHeight") + extra;
	},
	getLeft: function(rel) {
		var parent = this.getParent();
		return getVisibleProperty(this, "offsetLeft")
			+ ((parent && parent.getLeft()) || 0)
			- ((rel && rel.getLeft()) || 0);
	},
	getNextElement: function() {
		var child = this.firstElementChild
		if ( child ) return child
		return this.getNextNonChildElement()
	},
	getNextNonChildElement: function() {
		var sibling = this.nextElementSibling
		if ( sibling ) return sibling
		
		var parent = this.parentNode
		if ( !parent || parent.nodeType !== parent.ELEMENT_NODE ) return null
		
		return parent.getNextNonChildElement()
	},
	getParent: function() {
		return getVisibleProperty(this, "offsetParent");
	},
	getRight: function(rel) {
		return this.getLeft(rel) + getVisibleProperty(this, "offsetWidth");
	},
	getSize: function(where) {
		return { width: this.getWidth(where), height: this.getHeight(where) };
	},
	getTop: function(rel) {
		var parent = this.getParent();
		return getVisibleProperty(this, "offsetTop")
			+ ((parent && parent.getTop()) || 0)
			- ((rel && rel.getTop()) || 0);
	},
	getWidth: function(where) {
		var extra = 0;
		if ( where === 'outer' ) {
			extra += parseInt(this.getCssStyle("margin-left")) || 0;
			extra += parseInt(this.getCssStyle("margin-right")) || 0;
		} else {
			if ( where === 'inner' || where === 'content' ) {
				extra -= parseInt(this.getCssStyle("border-left-width")) || 0;
				extra -= parseInt(this.getCssStyle("border-right-width")) || 0;
			}
			if ( where === 'content' ) {
				extra -= parseInt(this.getCssStyle("padding-left")) || 0;
				extra -= parseInt(this.getCssStyle("padding-right")) || 0;
			}
		}
		return getVisibleProperty(this, "offsetWidth") + extra;
	},
	hasClass: function(value) {
		if ( typeof(value) !== "string" || value.trim().length == 0 ) return
		if ( !this.className || this.className.trim().length === 0 ) {
			return false
		}
		var values = this.className.split(regex.whitespace)
		var classes = this.className.split(regex.whitespace)
		for ( var i = 0, l = classes.length; i < l; i++ ) {
			for ( var x = values.length - 1; x >= 0; x-- ) {
				if ( classes[i] == values[x] ) {
					values.splice(x, 1)
				}
			}
		}
		
		return values.length === 0
	},
	isMarkupLoaded: function() {
		// An element is considered loaded when:
		return (
			// - the document is fully loaded
			document.readyState !== "loading"
			// - it's not part of the document structure (ie. created via document.createElement)
			|| (this.nodeType === this.ELEMENT_NODE && this.parentNode === null)
			// - it has a non child element following it in the document structure
			|| this.getNextNonChildElement()
		) && true || false
	},
	removeClass: function(value) {
		if ( !this.className || this.className.trim().length == 0 ) {
			return
		}
		
		var classes_to_remove = {}
		var value_list = value.split(regex.whitespace)
		for ( var i = 0, l = value_list.length; i < l; i++ ) {
			classes_to_remove[value_list[i]] = true
		}
		
		var class_list = this.className.split(regex.whitespace)
		for ( var i = class_list.length-1; i >= 0; i-- ) {
			if ( class_list[i] in classes_to_remove ) {
				class_list.splice(i, 1)
			}
		}
		
		this.className = class_list.join(" ")
	},
	setAttributes: function(value) {
		for ( var key in value ) {
			this.setAttribute(key, value[key])
		}
	},
	setStyle: function() {
		if ( arguments.length >= 2 ) {
			var val = arguments[1]
			if ( typeof(val) === "number" ) val = val+"px"
			this.style[arguments[0]] = val
		} else if ( arguments.length === 1 ) {
			var value = arguments[0]
			if ( typeof(value) === "string" ) {
				this.setAttribute("style", value)
			} else {
				for ( var key in value ) {
					var val = value[key]
					if ( typeof(val) === "number" ) val = val+"px"
					this.style[key] = val
				}
			}
		}
	}
})

// -- Node -------------------------------------------------------------------------------------------------------------

enhancePrototype("Node", {
	appendTo: function(parent) {
		if ( !parent ) return
		parent.appendChild(this)
	},
	insertAbove: function(ref) {
		if ( !ref || !ref.parentNode ) return
		ref.parentNode.insertBefore(this, ref)
	},
	insertBelow: function(ref) {
		if ( !ref || !ref.parentNode ) return
		var nextSibling = ref.nextSibling
		if ( nextSibling ) {
			ref.parentNode.insertBefore(this, nextSibling)
		} else {
			ref.parentNode.appendChild(this)
		}
	},
	prependTo: function(parent) {
		if ( !parent ) return
		var child = parent.firstChild
		if ( child ) {
			parent.insertBefore(this, child)
		} else {
			parent.appendChild(this)
		}
	}
})

// -- NodeList ---------------------------------------------------------------------------------------------------------

enhancePrototype("NodeList", {
	forEach: Array.prototype.forEach,
	reverseForEach: Array.prototype.reverseForEach
})

// -- RegExp -----------------------------------------------------------------------------------------------------------

enhancePrototype("RegExp", {
	match: function(string, index) {
		var matches = this.exec(string)
		if ( matches && matches.length >= index ) {
			return matches[index]
		}
		return null
	},
	matches: function(string, indexes) {
		if ( !indexes || indexes.length === 0 ) return null
		var matches = this.exec(string)
		if ( matches && matches.length > 0 ) {
			var results = []
			for ( var i = 0, l = indexes.length; i < l; i++ ) {
				var num = indexes[i]
				results.push(matches[num] || null)
			}
			return results
		}
		return null
	}
})

// -- String -----------------------------------------------------------------------------------------------------------

enhancePrototype("String", {
	format: function(args) {
		// If an array or table is passed in, use it; otherwise, turn the arguments list into an array
		args = typeof(args) === 'object' ? args : Array.prototype.slice.call(arguments)
		// Replace each instance of {x}, where x is an array index or table key, with the value from args.
		return this.replace(/{([^}]+)}/g, function(match, key) {
			return key in args ? args[key] : "{"+key+"}"
		})
	}
})

})()
