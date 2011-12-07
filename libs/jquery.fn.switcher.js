(function($) {

function getData(el) {
	return $(el).data("jQuery.fn.switcher");
}

function setData(el, data) {
	return $(el).data("jQuery.fn.switcher", data);
}

function getContent(el, opts) {
	var el = $(el),
		attr = opts.contentSelectorAttribute,
		selector = el.attr(attr);
	return $(selector);
}

function activateTab(tab) {
	var tab = $(tab),
		data = getData(tab),
		options = data.options;
	getData(data.switcher).children.forEach(function(child) {
		$(child).removeClass(options.activeClass);
		getContent(child, options).hide();
	});
	tab.addClass("active");
	getContent(tab, options).show();
}

function onevent(e) {
	activateTab(this);
}

var defaults = {
	childSelector: "li",
	events: [ "click" ],
	activeClass: "active",
	contentSelectorAttribute: "data-content-selector"
};

function destroyChild(child) {
	var child = $(child),
		cData = getData(child),
		cOpts;
	
	if ( cData ) {
		cOpts = cData.options;
		cOpts.events.forEach(function(event) {
			child.unbind(event, onevent);
		});
		getContent(child, cOpts).show();
		child.removeClass(cOpts.activeClass);
	};
	
	setData(child, null);
}

function destroy(switcher) {
	var switcher = $(switcher),
		data = getData(switcher),
		options;
	
	if ( data ) {
		data.children.forEach(function(child) {
			destroyChild(child);
		});
		setData(switcher, null);
	}
}

var methods = {
	init: function(options) {
		var hasActiveTab = false,
			options = $.extend({}, defaults, options);
		
		return this.each(function() {
			var switcher = $(this),
				data = getData(switcher);
			
			if ( data ) {
				methods.destroy.apply(switcher);
			}
			
			data = {
				options: options,
				children: []
			};
			
			switcher.find(options.childSelector).each(function() {
				var child = $(this),
					cData = getData(child);
				
				if ( cData ) {
					destroyChild(child);
				}
				
				cData = {
					options: options,
					switcher: switcher[0]
				};
				data.children.push(this);
				
				options.events.forEach(function(event) {
					child.bind(event, onevent);
				});
				if ( child.hasClass(options.activeClass) ) {
					hasActiveTab = child;
				}
				
				setData(child, cData);
			});
			
			setData(switcher, data);
			
			if ( hasActiveTab ) {
				activateTab(hasActiveTab);
			} else if ( data.children.length > 0 ) {
				activateTab(data.children[0]);
			}
		});
	},
	
	destroy: function() {
		return this.each(function() {
			destroy(this);
		});
	}
};

$.fn.switcher = function(method) {
	if ( methods[method] ) {
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
	} else if ( typeof method === "object" || !method ) {
		return methods.init.apply(this, arguments);
	} else {
		$.error("Method " + method + " does not exist on jQuery.switcher");
	}
};

})(jQuery);