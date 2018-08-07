window.onload = function() {
    var ele = document.getElementById("text"),
	    txt = "Hello Hubr".split("");
	var interval = setInterval(function(){
		if(!txt[0]){
			return clearInterval(interval);
		};
		ele.innerHTML += txt.shift();
	}, 200);
}