$.copy = function(obj) {
	if ( obj && typeof obj === "object" ) {
		return $.extend(true, {}, obj);
	} else {
		return obj;
	}
};

$.count = function(obj) {
	return Object.keys(obj).length;
};
