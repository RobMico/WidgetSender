if(typeof require !== 'undefined') {var XLSX = require('xlsx-style');}
var workbook = XLSX.readFile('test.xlsx');
var fs = require('fs');
fs.appendFileSync("urls.json", "[");

var str="";
function GetElement(address_of_cell)
{
    try{
   // console.log(address_of_cell);
    var first_sheet_name = workbook.SheetNames[0];
    //console.log(first_sheet_name);
 
/* Get worksheet */
    var worksheet = workbook.Sheets[first_sheet_name];
    
/* Find desired cell */
    var desired_cell = worksheet[address_of_cell];
  //  console.log(desired_cell);
/* Get the value */
    var desired_value = desired_cell.v;
    return desired_value;}
    catch{return "";}
}
let V="";
for(let i=2;;i++){
    console.log("1");
    if(str!="")
    {
        str=",";
    }    
    V=GetElement("A"+i);
    if(V==""){break;}
    str+='{ "url":"'+V+'",\n';
    str+='"callback":"'+GetElement("B"+i)+'"}\n';
    fs.appendFileSync("urls.json", str);
    console.log("2");
} 
fs.appendFileSync("urls.json", "]");