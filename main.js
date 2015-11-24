options = [
	'myid',
	'mypass',
	'masterid',
	'masterpass',
	'iidxmeid',
	'iidxmepass',
	'mycardid',
	'mycardpass',
	'mastercardid'
];

function loadOptions() {
	chrome.storage.sync.get(null, function (r) {
		for (var i in options) {
			$('#'+options[i]).val(r[options[i]]);
		}
		console.log(r);
	});
}

function saveOptions() {
	settings = {};
	for (var i in options) {
		settings[options[i]] = $('#'+options[i]).val();
	}
	chrome.storage.sync.set(settings);
	console.log(settings);
}

$(function () {
	loadOptions();
	$('#saveoption').click(saveOptions);
});