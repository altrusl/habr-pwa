window.onload = function() {

    fetch("hh.txt").then(data => data.text()).then(data => {
        // document.getElementById("text").innerHTML = data
        animateText(data)
      });
}

function animateText(data) {
    var ele = document.getElementById("text"),
    txt = data.split("");
    var interval = setInterval(function(){
    if(!txt[0]){
        return clearInterval(interval);
    };
    ele.innerHTML += txt.shift();
    }, 200);
}