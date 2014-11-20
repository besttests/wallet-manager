var ri = setInterval(function(){console.log('hello')},1000);

console.log(ri);

setTimeout(function(){clearInterval(ri)},5000)
