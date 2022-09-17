

secondsFormat(78);

function secondsFormat( s ) { 
    var day = Math.floor (s / (24 * 3600)); // Math.floor () redondea hacia abajo 
    var hour = Math.floor( (s - day*24*3600) / 3600); 
    var minute = Math.floor( (s - day*24*3600 - hour*3600) /60 ); 
    var second = s - day*24*3600 - hour*3600 - minute*60; 
        
    console.log(day + "d " + hour + "h " + minute + "m " + second + "s");
}

 //console.log (secondsFormat (5555555)) // 64 días, 7 horas, 12 minutos y 35 segundos
 //console.log (secondsFormat (1234)) // 0 días, 0 horas, 20 minutos y 34 segundos