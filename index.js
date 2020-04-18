/*
 * Bulk URL Opener
 * Copyright (C) 2013-2015, Melanto Ltd.
 * www.melanto.com
 *
 */

function loadSettings() {
  // default app settings if no settings stored yet:
  if (!window.localStorage.appSettings) {
    window.localStorage.appSettings = JSON.stringify({
      newTab: true,
      dedicatedWindow: false,
      newWindow: false,
      xPerWindow: false,
      xNum: '10',
      maxTotal: false,
      xNumTotal: '25',
      saveList: false,
      cleanOpened: false,
      autoClose: true,
      greenIcon: false,
      grayIcon: false,
      redIcon: false,
      orangeIcon: false,
      defaultIcon: true
    });
  }

  var settings = JSON.parse(window.localStorage.appSettings);
  return settings;
}

function resetDefaultPrefs() {
  //resets defaults
  window.localStorage.appSettings = JSON.stringify({
    newTab: true,
    dedicatedWindow: false,
    newWindow: false,
    xPerWindow: false,
    xNum: '10',
    maxTotal: false,
    xNumTotal: '25',
    saveList: false,
    cleanOpened: false,
    autoClose: true,
    greenIcon: false,
    grayIcon: false,
    redIcon: false,
    orangeIcon: false,
    defaultIcon: true
  });
  var settings = JSON.parse(window.localStorage.appSettings);

  document.getElementById('newTab').checked = settings.newTab;

  if (settings.newTab == false) {
    document.getElementById('dedicatedWindowCheckbox').style.display = 'none';
  } else {
    document.getElementById('dedicatedWindowCheckbox').style.display = 'inline';
  }

  document.getElementById('newWindow').checked = settings.newWindow;
  document.getElementById('dedicatedWindow').checked = settings.dedicatedWindow;
  document.getElementById('xPerWindow').checked = settings.xPerWindow;
  document.getElementById('xNum').value = settings.xNum;
  document.getElementById('maxTotal').checked = settings.maxTotal;
  document.getElementById('xNumTotal').value = settings.xNumTotal;

  document.getElementById('saveList').checked = settings.saveList;
  document.getElementById('autoClose').checked = settings.autoClose;
  if (settings.saveList == false && settings.autoClose == true) {
    document.getElementById('subOptionSave').style.display = 'none';
  } else {
    document.getElementById('subOptionSave').style.display = 'inline';
  }
  document.getElementById('cleanOpened').checked = settings.cleanOpened;

  settings.greenIcon = false;
  document.getElementById('greenIcon').checked = false;
  settings.grayIcon = false;
  document.getElementById('grayIcon').checked = false;
  settings.redIcon = false;
  document.getElementById('redIcon').checked;
  settings.orangeIcon = false;
  document.getElementById('orangeIcon').checked = false;
  settings.defaultIcon = true;
  document.getElementById('defaultIcon').checked = true;

  saveSettings();
}

function saveSettings() {
  var settings = JSON.parse(window.localStorage.appSettings);

  settings.newTab = document.getElementById('newTab').checked;

  if (settings.newTab == false) {
    document.getElementById('dedicatedWindowCheckbox').style.display = 'none';
  } else {
    document.getElementById('dedicatedWindowCheckbox').style.display = 'inline';
  }

  settings.newWindow = document.getElementById('newWindow').checked;
  settings.dedicatedWindow = document.getElementById('dedicatedWindow').checked;
  settings.xPerWindow = document.getElementById('xPerWindow').checked;
  settings.xNum = document.getElementById('xNum').value;
  settings.maxTotal = document.getElementById('maxTotal').checked;
  settings.xNumTotal = document.getElementById('xNumTotal').value;
  settings.saveList = document.getElementById('saveList').checked;
  settings.autoClose = document.getElementById('autoClose').checked;
  if (settings.saveList == false && settings.autoClose == true) {
    document.getElementById('subOptionSave').style.display = 'none';
  } else {
    document.getElementById('subOptionSave').style.display = 'inline';
  }
  settings.cleanOpened = document.getElementById('cleanOpened').checked;

  if (document.getElementById('greenIcon'))
    settings.greenIcon = document.getElementById('greenIcon').checked;
  if (document.getElementById('grayIcon'))
    settings.grayIcon = document.getElementById('grayIcon').checked;
  if (document.getElementById('redIcon'))
    settings.redIcon = document.getElementById('redIcon').checked;
  if (document.getElementById('orangeIcon'))
    settings.orangeIcon = document.getElementById('orangeIcon').checked;
  if (document.getElementById('defaultIcon'))
    settings.defaultIcon = document.getElementById('defaultIcon').checked;

  //update icon
  if (settings.greenIcon) chrome.browserAction.setIcon({ path: 'green.png' });
  else if (settings.grayIcon)
    chrome.browserAction.setIcon({ path: 'gray.png' });
  else if (settings.redIcon) chrome.browserAction.setIcon({ path: 'red.png' });
  else if (settings.orangeIcon)
    chrome.browserAction.setIcon({ path: 'orange.png' });
  else chrome.browserAction.setIcon({ path: 'icon.png' });

  window.localStorage.cleanerSettings = JSON.stringify(settings);
  //wake background page:
  chrome.runtime.sendMessage({ greeting: 'hello' }, function(response) {
    //console.log(response);
    //execute init command on background page:
    chrome.extension.getBackgroundPage().setIcon();
    chrome.extension.getBackgroundPage().setIcon();
  });

  window.localStorage.appSettings = JSON.stringify(settings);
  saveList();
}

function showError(string) {
  document.getElementById('box2').style.display = 'none';
  document.getElementById('box1').style.display = 'block';
  document.getElementById('error').innerHTML = string;
  document.getElementById('error').style.display = 'inline';
  setTimeout(function() {
    document.getElementById('error').style.display = 'none';
  }, 5000);
}

var currTab = null,
  currWin = null;
var dedicatedWindow = null;

var lines = []; //used by all sub methods !
var totalOpened = 0;

//save app's tab and window
chrome.tabs.getCurrent(function(tab) {
  //  console.log(tab.id);
  currTab = tab;
});
chrome.windows.getCurrent(function(win) {
  //  console.log(win.id);
  currWin = win;
});

function openURLs() {
  /* ************************ */
  /* Open URLs Button Clicked */
  /* ************************ */

  document.getElementById('box2').style.display = 'block';
  document.getElementById('box1').style.display = 'none';
  document.getElementById('counter').innerHTML = 'Opening Pages...';

  var settings = loadSettings(); //load current settings

  var uri = new URI('');
  var current = '';

  //get textarea content
  var textarea = document.getElementById('urls').value;
  //if(textarea==''){showError("You must enter at least one URL in the box below ...");return;}
  var didWeOpenAnything = false;
  totalOpened = 0;
  lines = textarea.split('\n');
  for (var i = 0; i < 40; i++) {
    // MAIN URL LIST LOOP

    //   lines[i]  will give you each line
    //console.log(lines[i]);
    if (settings.maxTotal) if (totalOpened >= settings.xNumTotal) break;

    uri = URI(lines[0]);
    // normalize protocol and so on
    uri.normalize(); // returns the URI instance for chaining
    if (uri.href() != '') {
      //if not an empty space...
      didWeOpenAnything = true; //we opened at least one URL
      totalOpened++;
      if (uri.scheme() == '') {
        current = 'http://' + uri.href();
      } else {
        current = uri.href();
      }

      // check if we plan to close app on end to set "active" tab...
      var isActive = false; //was true, fixed in 1.0.0.2 (major bug with auto-closing popup window)
      //if( settings.autoClose==true ){isActive = true;}

      // open it:

      if (settings.newTab == true) {
        //in new tabs...
        /*if(settings.dedicatedWindow==true){ //in dedicated window?     --- not needed, boy, remainings from the app ;-(
					if(dedicatedWindow==null){ //create dedicated window now
						chrome.windows.create({"url": current}, function(win){	
								dedicatedWindow=win;  	
								theRestInDedicatedWin();
							} );
							
						 return; // we break and return because the rest will be processed in separate function!						
						
					} else{
						// dedicated window exists, procesed in separate function
					}
				} else */
        {
          chrome.tabs.create({ url: current, active: isActive });
        }
      } else if (settings.newWindow == true) {
        //in new window each!
        chrome.windows.create({ url: current, focused: false }); //was without "focused" flag, fixed in 1.0.0.2 (major bug with auto-closing popup window)
      }
    } //end if empty line...

    // var indexToRemove = 0;
    // var numberToRemove = 1;
    // arr.splice(indexToRemove, numberToRemove);
    if (settings.cleanOpened == true) {
      //remove processed line
      lines.shift();
      //console.log(lines);
      i--;
      //document.getElementById('urls').value = lines.join("\n");
    }
  } // END of MAIN URL LIST LOOP

  if (settings.cleanOpened == true) {
    //remove processed lines
    document.getElementById('urls').value = lines.join('\n');
  }

  //if we don't plan to autoclose -- bring app window/tab to front
  /*if( settings.autoClose==false && settings.newTab==true){
				chrome.tabs.update(currTab.id, {"active":true});
				chrome.windows.update(currWin.id, {"focused":true});
			}*/
  //don't close if we have an error
  if (didWeOpenAnything == '') {
    showError('You must enter at least one URL in the box below ...');
    document.getElementById('urls').value = '';
    return;
  }
  // close the app
  if (settings.autoClose == true) {
    //-- not available in extension version -- chrome.tabs.remove(currTab.id);
    document.getElementById('box2').style.display = 'none';
    document.getElementById('box1').style.display = 'block';
    // if(dedicatedWindow==null) window.close();
    // return;
  }
  document.getElementById('box2').style.display = 'none';
  document.getElementById('box1').style.display = 'block';
  window.close(); //now in ver.1.0.0.2 we need this
}

function theRestInDedicatedWin() {
  var settings = loadSettings(); //load current settings

  var uri = new URI('');
  var current = '';

  // shift 1st url (already processed)
  lines.shift();

  //	var background = chrome.extension.getBackgroundPage();
  //   background.console.log('background console...');

  // now -- go open the rest of the items in the new window

  totalOpened = 1; //we already opened the 1st one

  for (var i = 0; i < lines.length; i++) {
    // MAIN URL LIST LOOP

    //   lines[i]  will give you each line
    //console.log(lines[i]);
    if (settings.maxTotal) if (totalOpened >= settings.xNumTotal) break;

    uri = URI(lines[i]);
    // normalize protocol and so on
    uri.normalize(); // returns the URI instance for chaining
    if (uri.href() != '') {
      //if not an empty space...

      totalOpened++;

      if (uri.scheme() == '') {
        current = 'http://' + uri.href();
      } else {
        current = uri.href();
      }

      // check if we plan to close app on end to set "active" tab...
      var isActive = false;
      if (settings.autoClose == true) {
        isActive = true;
      }

      // open it:

      chrome.tabs.create({ url: current, windowId: dedicatedWindow.id });
    } //end if not empty line...

    if (settings.cleanOpened == true && settings.autoClose == false) {
      //remove processed line
      lines.shift();
      i--;
    }
  } // END of MAIN URL LIST LOOP

  if (settings.cleanOpened == true) {
    //remove processed lines
    document.getElementById('urls').value = lines.join('\n');
  }

  /*	//if we don't plan to autoclose -- bring app window/tab to front
			if( settings.autoClose==false ){
				chrome.tabs.update(currTab.id, {"active":true});
				chrome.windows.update(currWin.id, {"focused":true});
			}*/
  // close the app
  if (settings.autoClose == true) {
    //-- not available in extension version -- chrome.tabs.remove(currTab.id);
    dedicatedWindow = null;
    document.getElementById('box2').style.display = 'none';
    document.getElementById('box1').style.display = 'block';
    // window.close();
    // return;
  }
  // cleanup dedicated window pointer
  dedicatedWindow = null;

  document.getElementById('box2').style.display = 'none';
  document.getElementById('box1').style.display = 'block';
}

function saveList() {
  //	var background = chrome.extension.getBackgroundPage();
  //    background.console.log(event.type);

  var settings = loadSettings();
  if (settings.saveList != true) {
    window.localStorage.URLs = JSON.stringify({
      URLs: ''
    });
  } else {
    //save urls
    if (!window.localStorage.URLs) {
      window.localStorage.URLs = JSON.stringify({
        URLs: ''
      });
    }

    settings = JSON.parse(window.localStorage.URLs);

    settings.URLs = document.getElementById('urls').value;

    window.localStorage.URLs = JSON.stringify(settings);
  }
}

addEventListener(
  'unload',
  function(event) {
    saveList();
  },
  true
);

//http://davidwalsh.name/caret-end
//to fix missing pages in "dedicated window":
function moveCursorToEnd(el) {
  if (typeof el.selectionStart == 'number') {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != 'undefined') {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

window.onload = function() {
  // load app settings
  var settings = loadSettings();

  document.getElementById('newTab').checked = settings.newTab;

  if (settings.newTab == false) {
    document.getElementById('dedicatedWindowCheckbox').style.display = 'none';
  } else {
    document.getElementById('dedicatedWindowCheckbox').style.display = 'inline';
  }

  document.getElementById('newWindow').checked = settings.newWindow;
  document.getElementById('dedicatedWindow').checked = settings.dedicatedWindow;
  document.getElementById('xPerWindow').checked = settings.xPerWindow;
  document.getElementById('xNum').value = settings.xNum;
  document.getElementById('maxTotal').checked = settings.maxTotal;
  document.getElementById('xNumTotal').value = settings.xNumTotal;
  document.getElementById('saveList').checked = settings.saveList;
  document.getElementById('autoClose').checked = settings.autoClose;
  if (settings.saveList == false && settings.autoClose == true) {
    document.getElementById('subOptionSave').style.display = 'none';
  } else {
    document.getElementById('subOptionSave').style.display = 'inline';
  }
  document.getElementById('cleanOpened').checked = settings.cleanOpened;

  document.getElementById('newTab').onchange = function() {
    saveSettings();
  };
  document.getElementById('dedicatedWindow').onchange = function() {
    saveSettings();
  };
  document.getElementById('newWindow').onchange = function() {
    saveSettings();
  };
  document.getElementById('xPerWindow').onchange = function() {
    saveSettings();
  };
  document.getElementById('xNum').onchange = function() {
    saveSettings();
  };
  document.getElementById('maxTotal').onchange = function() {
    saveSettings();
  };
  document.getElementById('xNumTotal').onchange = function() {
    saveSettings();
  };
  document.getElementById('saveList').onchange = function() {
    saveSettings();
  };
  document.getElementById('cleanOpened').onchange = function() {
    saveSettings();
  };
  document.getElementById('autoClose').onchange = function() {
    saveSettings();
  };

  document.getElementById('restoreDefaults').onclick = function() {
    resetDefaultPrefs();
  };

  document.getElementById('openBtn').onclick = function() {
    openURLs();
  };

  document.getElementById('pasteBtn').onclick = function() {
    document.getElementById('urls').value = '';
    document.getElementById('urls').focus();
    document.execCommand('paste');
  };
  document.getElementById('copyBtn').onclick = function() {
    document.getElementById('urls').focus();
    document.getElementById('urls').select();
    document.execCommand('copy');
  };
  document.getElementById('clearBtn').onclick = function() {
    document.getElementById('urls').value = '';
  };

  if (settings.saveList == true) {
    var urllst = JSON.parse(window.localStorage.URLs);
    document.getElementById('urls').value = urllst.URLs;
    //moveCursorToEnd(document.forms["post"].elements["urls"]);
  }

  //document.addEventListener("DOMContentLoaded", function () {
  /* var blurTimerId = window.setInterval(function() {
		if (document.activeElement != document.body) {
		  //document.activeElement.blur();
		  moveCursorToEnd(document.forms["post"].elements["urls"]);
		}
	  }, 200);
	  window.setTimeout(function() {
		window.clearInterval(blurTimerId);
	  }, 1000);*/
  //});

  if (document.getElementById('greenIcon'))
    document.getElementById('greenIcon').checked = settings.greenIcon;
  if (document.getElementById('grayIcon'))
    document.getElementById('grayIcon').checked = settings.grayIcon;
  if (document.getElementById('redIcon'))
    document.getElementById('redIcon').checked = settings.redIcon;
  if (document.getElementById('orangeIcon'))
    document.getElementById('orangeIcon').checked = settings.orangeIcon;
  if (document.getElementById('defaultIcon'))
    document.getElementById('defaultIcon').checked = settings.defaultIcon;
  //default icon by default ;-)
  if (
    !settings.greenIcon &&
    !settings.grayIcon &&
    !settings.redIcon &&
    !settings.orangeIcon &&
    !settings.defaultIcon
  )
    if (document.getElementById('defaultIcon'))
      document.getElementById('defaultIcon').checked = true;

  if (document.getElementById('greenIcon'))
    document.getElementById('greenIcon').onclick = function() {
      saveSettings();
    };
  if (document.getElementById('grayIcon'))
    document.getElementById('grayIcon').onclick = function() {
      saveSettings();
    };
  if (document.getElementById('redIcon'))
    document.getElementById('redIcon').onclick = function() {
      saveSettings();
    };
  if (document.getElementById('orangeIcon'))
    document.getElementById('orangeIcon').onclick = function() {
      saveSettings();
    };
  if (document.getElementById('defaultIcon'))
    document.getElementById('defaultIcon').onclick = function() {
      saveSettings();
    };
};
