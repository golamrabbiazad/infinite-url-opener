/*
 * Bulk URL Opener
 * Copyright (C) 2013-2015, Melanto Ltd.
 * www.melanto.com 
 *
 */

	// default cleaner Settings
	if (!window.localStorage.appSettings) {
		window.localStorage.appSettings = JSON.stringify({ 
		"newTab": true, 
			"dedicatedWindow": false, 
		"newWindow": false, 
		"xPerWindow": false,
		"xNum": "10",
		"maxTotal": false,
		"xNumTotal": "25" ,
		"saveList": false,
		"cleanOpened": false,
		"autoClose": true    
		});
	}
	// app version
	var currVersion = getVersion();
	var prevVersion = window.localStorage.appVersion;
	if (currVersion != prevVersion) {
		if (typeof prevVersion == 'undefined') {
			onInstall();
		} else {
			onUpdate();
		}
		window.localStorage.appVersion = currVersion;
	}

// Check if this is new version
function onInstall() {
	
	if (navigator.onLine) {
		chrome.tabs.create({url: 'https://melanto.com/apps/bulk-url-opener/postinstall-chrome-extension.html'});
	}
}
function onUpdate() {
	
	if (navigator.onLine) {
		chrome.tabs.create({url: 'https://melanto.com/apps/bulk-url-opener/whatsnew-1-3-chrome.html'});
	}
}
function getVersion() {
	var details = chrome.app.getDetails();
	return details.version;
}


function setIcon(){
    var settings = JSON.parse(window.localStorage.cleanerSettings);
    var icon = 'icon';   
    // icon is now inside prefs->colored Icon ...etc.
         if (settings.redIcon) icon = 'red'
    else if (settings.greenIcon) icon = 'green'
    else if (settings.orangeIcon) icon = 'orange'
    else if (settings.grayIcon) icon = 'gray'
    else icon = 'icon';
    //update icon
    chrome.browserAction.setIcon({path:icon + ".png"});    
    //console.log(icon);
}

setIcon();
chrome.runtime.onStartup.addListener(function(){setIcon();});