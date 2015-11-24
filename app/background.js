console.log("plugin loaded");

// init variables
currentTODO = [];
settings = {};
current_logined = false;

/* fully load settings */
function refreshSetting() {
	chrome.storage.sync.get(null, function (res) {
		settings = res;
	});
}

/* common function: get any string(setting) from storage */
function setString(key, value) {
	chrome.storage.sync.set({key: value});
	settings[key] = value;
}

/* common function: add any TODO work */
function addTODO(todo) {
	currentTODO.push(todo);
}

/* common function: get any TODO work */
function getTODO(todo) {
	if (currentTODO.length <= 0) {
		return null;
	} else {
		return currentTODO.pop();
	}
}


/*
 *
 * main functions
 *
 */

var login_KONAMI = function (page_url, tabid, id, pass) {
	if (current_logined) {
		addTODO({status: 'login_myID', details: {'id': id, 'pass': pass}});
		chrome.tabs.update(tabid, {url: "http://p.eagate.573.jp/gate/p/logout.html"});
		return;
	}
	if (page_url.indexOf("https://p.eagate.573.jp/gate/p/login.html") < 0) {
		addTODO({status: 'login_myID', details: {'id': id, 'pass': pass}});
		chrome.tabs.update(tabid, {url: "https://p.eagate.573.jp/gate/p/login.html"});
		return;
	}
	// set id/pass
	chrome.tabs.executeScript(tabid, {
		code: "enterIDPASS('" + id + "', '" + pass + "');"
	});
}

var remove_myCard = function (page_url, tabid, cardid) {
	if (!current_logined) {
		alert("로그인을 먼저 해 주세요");
		/*
		addTODO({status: 'remove_myCard', details: {}});
		login_KONAMI(page_url, tabid, settings['myid'], settings['mypass']);
		*/
		return;
	}

	if (page_url.indexOf("p.eagate.573.jp/gate/p/eamusement/detach/setting1.html") < 0) {
		addTODO({status: 'remove_myCard', details: {}});
		chrome.tabs.update(tabid, {url: 
			"http://p.eagate.573.jp/gate/p/eamusement/detach/setting1.html?ucdto=" + cardid});
	} else {
		chrome.tabs.executeScript(tabid, {
			code: "removeCard();"
		});
	}
}

var add_myCard = function (page_url, tabid, cardid, cardpass) {
	if (!current_logined) {
		alert("로그인을 먼저 해 주세요");
		/*
		addTODO({status: 'add_myCard', details: {}});
		login_KONAMI(page_url, tabid, settings['myid'], settings['mypass']);
		*/
		return;
	}

	if (page_url.indexOf("p.eagate.573.jp/gate/p/eamusement/attach/index.html") < 0) {
		addTODO({status: 'add_myCard', details: {}});
		chrome.tabs.update(tabid, {url: 
			"https://p.eagate.573.jp/gate/p/eamusement/attach/index.html"});
	} else {
		chrome.tabs.executeScript(tabid, {
			code: "addCard('" + cardid + "', '" + cardpass + "', 0);"
		});
	}
}

var use_card = function (page_url, tabid, cardid) {
	if (!current_logined) {
		alert("로그인을 먼저 해 주세요");
		return;
	}

	if (page_url.indexOf("p.eagate.573.jp/gate/p/eamusement/change/index.html") < 0) {
		addTODO({status: 'use_card', details: {'cardid': cardid}});
		chrome.tabs.update(tabid, {url: 
			"http://p.eagate.573.jp/gate/p/eamusement/change/index.html"});
	} else {
		chrome.tabs.executeScript(tabid, {
			code: "useCard('" + cardid + "');"
		});
	}
}

var update_iidxme = function (page_url, tabid) {
	if (!current_logined) {
		alert("로그인을 먼저 해 주세요");
		return;
	}

	if (page_url.indexOf("p.eagate.573.jp/game/2dx/23") < 0) {
		addTODO({status: 'update_iidxme', details: {}});
		chrome.tabs.update(tabid, {url: 
			"http://p.eagate.573.jp/game/2dx/23/"});
	} else {
		chrome.tabs.executeScript(tabid, {
			code: "iidxme('" + settings['iidxmeid'] + "', '" + settings['iidxmepass'] + "');"
		});
	}
}



/*
 *
 * some menu functions
 *
 */

var login_myID_menu = function(e, tab) {
	login_KONAMI(e.pageUrl, tab.id, settings['myid'], settings['mypass']);
};

var login_masterID_menu = function(e, tab) {
	login_KONAMI(e.pageUrl, tab.id, settings['masterid'], settings['masterpass']);
};

var remove_myCard_menu = function(e, tab) {
	remove_myCard(e.pageUrl, tab.id, settings['mycardid']);
};

var add_myCard_menu = function(e, tab) {
	add_myCard(e.pageUrl, tab.id, settings['mycardid'], settings['mycardpass']);
};

var use_masterCard_menu = function(e, tab) {
	use_card(e.pageUrl, tab.id, settings['mastercardid']);
};

var update_iidxme_menu = function(e, tab) {
	update_iidxme(e.pageUrl, tab.id);
};

var settings_menu = function(e, tab) {
	chrome.tabs.create({url: "options.html"}); 
};

/*
 *
 * onload/init functions
 *
 */

/* when onload, check anything we need to do */
var onload = function(request, url, tabid) {
	todo = getTODO();
	console.log(todo);
	console.log("logined: " + current_logined);

	if (todo == null)
		return;
	details = todo.details

	if (todo.status == 'login_myID') {
		login_KONAMI(url, tabid, details.id, details.pass);
	}
	if (todo.status == 'remove_myCard') {
		remove_myCard(url, tabid, settings['mycardid']);
	}
	if (todo.status == 'add_myCard') {
		add_myCard(url, tabid, settings['mycardid'], settings['mycardpass']);
	}
	if (todo.status == 'use_card') {
		use_card(url, tabid, details.cardid);
	}
	if (todo.status == 'update_iidxme') {
		update_iidxme(url, tabid);
	}
};

function init() {
	console.log("init function called");

	/* finally, add menu */
	var _parentID = chrome.contextMenus.create({
		"title": "iidx.me",
		"contexts": ["all"],
		"documentUrlPatterns": ["*://p.eagate.573.jp/*"]
	});

	chrome.contextMenus.create({
		"title": "내 ID로 로그인",
		"parentId": _parentID,
		"contexts": ["all"],
		"onclick" : login_myID_menu
	});

	chrome.contextMenus.create({
		"title": "주인님 ID로 로그인",
		"parentId": _parentID,
		"contexts": ["all"],
		"onclick" : login_masterID_menu
	});

	chrome.contextMenus.create({
		"title": "내 카드 추가",
		"parentId": _parentID,
		"contexts": ["all"],
		"onclick" : add_myCard_menu
	});

	chrome.contextMenus.create({
		"title": "내 카드 제거",
		"parentId": _parentID,
		"contexts": ["all"],
		"onclick" : remove_myCard_menu
	});

	chrome.contextMenus.create({
		"title": "주인님 카드로 기본 설정",
		"parentId": _parentID,
		"contexts": ["all"],
		"onclick" : use_masterCard_menu
	});

	chrome.contextMenus.create({
		"title": "투덱미 갱신 스크립트",
		"parentId": _parentID,
		"contexts": ["all"],
		"onclick" : update_iidxme_menu
	});

	chrome.contextMenus.create({
		"title": "설정",
		"parentId": _parentID,
		"contexts": ["all"],
		"onclick" : settings_menu
	});
}

/* communicator with injected code */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == "onload") {
		current_logined = request.logined;
		onload(request, sender.tab.url, sender.tab.id);
		sendResponse({status: 'success'});
	} else {
		sendResponse({status: 'none'});
	}
	// load settings every time we refresh page
	// TODO: only when 'setting_changed'
	refreshSetting();
});

refreshSetting();
init();