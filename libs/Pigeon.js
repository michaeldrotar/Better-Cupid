var Pigeon = (function() {
	
	var _shared = {},
		self;
	
	_shared.tabRequestFilter = {
		auto: {
			url: /https?:\/\/(?:[^\.]+\.)?okcupid\.com/i
		},
		all: null
	};
	
	_shared.getTabs = function(filter, callback) {
		var tabs = [];
		chrome.windows.getAll({ populate: true }, function(windowArray) {
			$.each(windowArray, function(_, window) {
				$.each(window.tabs, function(_, tab) {
					var passes = true;
					if ( filter && typeof filter === "object" ) {
						$.each(filter, function(property, value) {
							var tabValue = tab[property];
							switch ( typeof value ) {
								
								case "function":
									passes = value(tabValue, property);
									break;
								
								case "object":
									if ( typeof value.test === "function" ) {
										passes = value.test(tabValue);
									} else {
										passes = ( tabValue === value );
									}
									break;
									
								default:
									passes = ( tabValue === value );
									break;
								
							}
							if ( !passes ) {
								return false;
							}
						});
					}
					if ( passes ) {
						tabs.push(tab);
					}
				});
			});
			callback(tabs);
		});
	};
	
	self = function(init) {
		var _private = {
				requestListeners: []
			},
			pigeon = this;
		
		pigeon.addRequestListener = function(listener) {
			_private.requestListeners.unshift(listener);
			return pigeon;
		};
		
		pigeon.removeRequestListener = function(listener) {
			var i = _private.requestListeners.length - 1;
			for ( ; i >= 0; i-- ) {
				if ( _private.requestListeners[i] === listener ) {
					_private.requestListeners.splice(i, 1);
				}
			}
			return pigeon;
		};
		
		pigeon.sendRequest = function(request, response, filter) {
			pigeon.sendExtensionRequest(request, response);
			pigeon.sendTabRequest(filter, request, response);
			return pigeon;
		};
		
		pigeon.sendExtensionRequest = function(request, response) {
			chrome.extension.sendRequest(response, response);
			return pigeon;
		};
		
		pigeon.sendTabRequest = function(filter, request, response) {
			if ( !filter || typeof filter !== "object" || filter.preset === "auto" ) {
				filter = _shared.tabRequestFilter.auto;
			} else if ( filter.preset ) {
				filter = _shared.tabRequestFilter[filter.preset];
			}
			
			if ( filter && filter.id && typeof filter.id === "number" ) {
				chrome.tabs.sendRequest(filter.id, request, response);
			} else {
				_shared.getTabs(filter, function(tabs) {
					$.each(tabs, function(_, tab) {
						chrome.tabs.sendRequest(tab.id, request, response);
					});
				});
			}
			
			return pigeon;
		};
		
		chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
			var response,
				i = 0,
				l = _private.requestListeners.length;
			for ( ; i < l; i++ ) {
				response = _private.requestListeners[i](request, sender);
				if ( response ) {
					sendResponse(response);
					return;
				}
			}
			
			sendResponse({});
		});
	};
	
	return self;
	
})();