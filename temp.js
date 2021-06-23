const fs = require('fs');
const { Json } = require('sequelize');
//var LogFile="script_logs.txt";
var jsonFile="resultSuccessRF.json";
var jsonResultFile="resultSuccessRF1.json";


//let rawdata = fs.readFileSync(LogFile, 'utf8');
let resultData=fs.readFileSync(jsonFile, 'utf8');

var arr = JSON.parse(resultData);
var result=[];
for(var i=0;i<arr.length;i++)
{
    //console.log("a");
    if(JSON.stringify(result).indexOf(arr[i].url)<0)
    {
        
        result.push(arr[i]);
    }
    else{
        console.log("-1");
    }
}
console.log(JSON.stringify(result));
fs.writeFileSync(jsonResultFile, JSON.stringify(result));
//var result=resultData.toString();
//console.log(rawdata);
//console.log(rawdata.split(":").length)
//var Array=rawdata.split("Start:");
//for(var i=1;i<Array.length;i++)
// {
//     var city = (Array[i].split("Filter:"))[1].split("\n")[0];
//     city=city.slice(1, city.length)
//     city='"'+city+'"';
//     city=city.replace(" ", "_");
//     //console.log(city);
//     var number =  Array[i].split("\n")[0];
//     //console.log(city+"  "+number);
//     var string='"city": '+number;
//     //console.log(string);
//     var z=(resultData.indexOf(string));
//     if(z>=0)
//     {
//         var re = new RegExp(string, 'g');
//         console.log(string);
//         result = result.replace(re, '"city": '+city);
//         //console.log(result.replace(re, '"city": '+city));
//         //console.log(resultData);
//     }
//     //console.log(number);
    
// }
//
//console.log(result);
                    //url_list = JSON.parse(rawdata);