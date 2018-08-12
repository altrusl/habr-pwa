// Загружает содержимое url в HTML элемент el
function loadData(el, url){
	url.indexOf("?") >= 0 ? url += "&" : url += "?";
	url = url + 'mode=nocache&tmpl=' + el;
	fetch(url)
	.then(
	function(response) {
		if (response.status == 200) {
			response.text().then(function(data) {
				document.getElementById(el).innerHTML = data;
			});
		}
	})
	.catch();	
	return false;
}

// Вешает на все <a> кастомный обработчик кликов
function handleLinks() {
	var links = document.querySelectorAll('a');
	for (var i = 0; i < links.length; ++i) {
		links[i].removeEventListener("click", handleLink);
		links[i].addEventListener("click", handleLink); 
	}
}

// Обработчик кликов
function handleLink(e) {
	e.preventDefault();
	loadData("main-content", this.href);
	loadData("module-2", this.href);
	handleLinks();
	return false;
}

// Первоначальная загрузка страницы в браузере
function DOMLoaded() {
	loadData("main-content", location.pathname);
	loadData("module-2", location.pathname);
	loadData("module-7", location.pathname);
	handleLinks();
}
document.addEventListener('DOMContentLoaded', DOMLoaded, true);