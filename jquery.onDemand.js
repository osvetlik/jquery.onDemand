if (jQuery) {

jQuery.onDemand = {
		
	loadedStyles: new Array(),
	loadedScripts: new Array(),
	neededScripts: new Array(),
	setupFunctions: new Array(),
	setupCalled: false,
	insideSetup: false,
	insideLoad: false,
	linksToImages: false,
	
	loadStyle: function(url, media) {
		if ($.inArray(url, jQuery.onDemand.loadedStyles) < 0) {
			link = document.createElement("link");
			link.type = "text/css";
			link.rel = "stylesheet";
			link.href = url;
			if (media) {
				link.media = media;
			}
			$('head').append(link);
			jQuery.onDemand.loadedStyles.push(url);
		}
	},
	
	loadScript: function(url, callback) {
		if ($.inArray(url, jQuery.onDemand.loadedScripts) < 0) {
			jQuery.onDemand.loadedScripts.push(url);
			$.ajax(
					{
						'url': url,
						'dataType': 'script',
						'cache': true,
						'success': callback || $.noop
					}
			);
		}
		else {
			if (jQuery.onDemand.isFunction(callback)) {
				callback();
			}
		}
	},
	
	loadScriptsCallback: function(script, status) {
		if (jQuery.onDemand.neededScripts.length > 0) {
			jQuery.onDemand.loadScriptsInternal();
		}
		else {
			jQuery.onDemand.insideLoad = false;
			jQuery.onDemand.callSetupFunctions();
		}
	},
	
	loadScriptsInternal: function() {
		url = jQuery.onDemand.neededScripts.shift();
		jQuery.onDemand.loadScript(url, jQuery.onDemand.loadScriptsCallback);
	},
	
	loadScripts: function() {
		if (!jQuery.onDemand.insideLoad) {
			if (jQuery.onDemand.isArray(jQuery.onDemand.neededScripts) && (jQuery.onDemand.neededScripts.length > 0)) {
				jQuery.onDemand.insideLoad = true;
				jQuery.onDemand.loadScriptsInternal();
			}
			else {
				jQuery.onDemand.callSetupFunctions();
			}
		}
	},
	
	callSetupFunctions: function() {
		if (!jQuery.onDemand.insideLoad && !jQuery.onDemand.insideSetup) {
			jQuery.onDemand.insideSetup = true;
			if (jQuery.onDemand.isArray(jQuery.onDemand.setupFunctions)) {
				while ((jQuery.onDemand.setupFunctions.length > 0) && (!jQuery.onDemand.insideLoad)) {
					setupFunction = jQuery.onDemand.setupFunctions.shift();
					if (jQuery.onDemand.isFunction(setupFunction)) {
						setupFunction();
					}
				}
			}
			jQuery.onDemand.insideSetup = false;
		}
	},
	
	addNeededScript: function(url) {
		if (jQuery.onDemand.isArray(url)) {
			for (i = 0; i < url.length; i++) {
				jQuery.onDemand.addNeededScript(url[i]);
			}
		}
		else if ($.inArray(url, jQuery.onDemand.neededScripts) < 0) {
			jQuery.onDemand.neededScripts.push(url);
		}
		
		if (jQuery.onDemand.setupCalled) {
			jQuery.onDemand.loadScripts();
		}
	},
	
	addSetupFunction: function(fn) {
		if (jQuery.onDemand.isFunction(fn)) {
			if ($.inArray(fn, jQuery.onDemand.setupFunctions) < 0) {
				jQuery.onDemand.setupFunctions.push(fn);
				
				if (jQuery.onDemand.setupCalled && (jQuery.onDemand.neededScripts.length == 0)) {
					jQuery.onDemand.callSetupFunctions();
				}
			}
		}
		else {
			if (console) {
				console.error("Not a function " + fn);
			}
		}
	},
	
	setup: function() {
		if (!jQuery.onDemand.setupCalled) {
			jQuery.onDemand.setupCalled = true;
			jQuery.onDemand.loadScripts();
		}
		else {
			if (console) {
				console.error("Setup function jQuery.onDemand.setup already called!");
			}
		}
	},
	
	isFunction: function(fn) {
		return (typeof(fn) == typeof(Function));
	},
	
	isArray: function(a) {
		return (a instanceof Array);
	}

};

$(document).ready(jQuery.onDemand.setup);
