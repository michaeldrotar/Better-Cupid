core.HookEvent("VARIABLES_LOADED", function() {
	
	var visits = core.db.get("visits") || [];
	
	var user = /profile\/(\w+)/.match(core.location.path, 1);
	if ( user ) {
		for ( var i = visits.length-1; i >= 0; i-- ) {
			if ( visits[i].user.toLowerCase() === user.toLowerCase() ) {
				visits.splice(i, 1);
			}
		}
		visits.splice(0, 0, { user: user, url: core.location.url, image: $("#thumb0 img").attr("src") });
		core.db.set("visits", visits);
	}
	
}, true);

(function() {

/*

The following is a list of console methods and properties and their observed usage

assert(cond, msg) - if cond is false, prints msg
count
debug(args*) - displays args as a debug message
dir(object) - displays an expandable listing of the object's properties
dirxml(element) - displays an expandable listing of the element's DOm
error(args*) - displays args as an error message
group(args*) - displays args as the start of a new group
groupCollapsed(msg, args*) - displays args as the start of a new collapsed group
groupEnd() - ends the most recently started group
info(args*) - displays args as an informative message
log(args*) - displays args
markTimeline
memory
profile(name) - starts a new profile with the given name, name must follow variable naming rules, profiles persist until cleared
profileEnd([name]) - ends the profile with the given name or the most recently started profile if not name is given
profiles - an object holding the list of profiles and their properties
time(label) - starts a new timer with the given label, doesn't display anything in the console
timeEnd(label) - ends the timer with the given label, displays the label and the elapsed time
trace() - displays a javascript trace
warn(args*) - displays args as a warning message
*/

/*
console.time("my time");
console.log(console.profiles);
console.debug("the body: ", document.body, "is %s", "awesome");
console.info(document.body);
console.group("give me a group!");
console.group("group!");
console.dir("test %s", "me");
console.dirxml([1,2,3],4,5,6);
console.trace(1, 2, 3);
console.trace();
console.groupEnd();
console.groupCollapsed("hidden", 2, 3, 4);
console.groupEnd();
console.groupEnd();
console.markTimeline(1, 2, 3);
console.timeEnd("my time");

if ( true ) return;

var b = 1, c = 2;
console.assert(b===c, "test");
console.log("%s is %d years old.", "Bob", 42);

core.HookOrRun("VARIABLES_LOADED", function() {
	//a += 1;
	core.HookEvent("TestEvent", function() {
		a += 1;
	});
	core.FireEvent("TestEvent");
});

a += 1;
*/
})();