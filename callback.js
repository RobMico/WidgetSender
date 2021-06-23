const timeoutSignal = require("timeout-signal");
const fetch = require("cross-fetch");

const fs = require('fs');

let args = process.argv;

let file='./базы/AllResult.json';
let Result='FinalAllResult1.json';


if(args[2] == '--file'){
    file = args[3];
}

let rawdata = fs.readFileSync(file, 'utf8');

let array = JSON.parse(rawdata.toString());

console.log(array);

let active_count = 0;
let index = 200000;

fs.writeFileSync(Result, '['); 


async function DO(){
for(;index<251000;index++)
{
       
        
        try {
                console.log(array[index].url);
                var response =(await fetch(array[index].url, { signal: timeoutSignal(5000) }));
                console.log("1");
                var text= await response.text();
                //console.log(text);
                try{
                        let obj = {
                            url: array[index].url
                        };

                        
                        if(text.indexOf('jivosite.com')>=0){
                            
                            if(text.indexOf('<input class="phoneInput')>=0){
                                obj.callback = "jivositeCall.com";                                
                            }
                            else{
                                obj.callback = "jivosite.com";
                            }         
                            fs.appendFileSync(Result,'\n{"url":"'+array[index].url+'","city":"'+array[index].city+'","callback":"'+obj.callback+'"},');
                        } else if(text.indexOf('envybox.io')>=0){
                            obj.callback = "envybox.io";      
                            fs.appendFileSync(Result,'\n{"url":"'+array[index].url+'","city":"'+array[index].city+'","callback":"'+obj.callback+'"},');                      
                        } else if(text.indexOf('callbackhunter.com')>=0){
                            obj.callback = "callbackhunter.com";     
                            fs.appendFileSync(Result,'\n{"url":"'+array[index].url+'","city":"'+array[index].city+'","callback":"'+obj.callback+'"},');                       
                        } else if(text.indexOf('calltouch')>=0){
                            obj.callback = "calltouch.ru";
                            fs.appendFileSync(Result,'\n{"url":"'+array[index].url+'","city":"'+array[index].city+'","callback":"'+obj.callback+'"},');                            
                        } else if(text.indexOf('callibri')>=0){
                            obj.callback = "callibri.ru"; 
                            fs.appendFileSync(Result,'\n{"url":"'+array[index].url+'","city":"'+array[index].city+'","callback":"'+obj.callback+'"},');                         
                        }
                        console.log(array[index].city);
                        console.log(index+'/'+array.length);

                            //start();
                    } catch (e)
                    {
                        console.log("1:"+e);
                        //start();
                    }
                                                                            
            } catch (e) {
                console.log("Error:" + e.message);
                //start();
            }            
    
}
console.log('\n');
    console.log('\n');
    console.log('\n');

    fs.writeFile('result-'+file+'.txt', JSON.stringify(result), function (err) {
        if (err) return console.log(err);
    });
}
DO();
    