const timeoutSignal = require("timeout-signal");
const fetch = require("cross-fetch");

const fs = require('fs');

let args = process.argv;

let file='nurls.json';

if(args[2] == '--file'){
    file = args[3];
}

//let rawdata = fs.readFileSync(file, 'utf8');

//let array = JSON.parse(rawdata.toString());

//console.log(array);

let active_count = 0;
let index = -1;

let result = [];

async function start() {
        index++;

        if(index >= 1){
            console.log('\n');
            console.log('\n');
            console.log('\n');

            fs.writeFile('result-'+file+'.txt', JSON.stringify(result), function (err) {
                if (err) return console.log(err);
            });
        } else {
            try {
                //console.log(array[index].url);
                var response = await fetch('https://smol-avtozvuk.ru/', { signal: timeoutSignal(5000) })
                var text= await response.text();
                console.log(text);
                try{
                        let obj = {
                            url: 'https://smol-avtozvuk.ru/'
                        };

                        
                        if(text.indexOf('jivosite.com')>=0){
                            console.log("1");
                            if(text.indexOf('<input class="phoneInput')>=0){
                                console.log("2");
                                obj.callback = "jivositeCall.com";                                
                            }
                            else{
                                obj.callback = "jivosite.com";
                            }
                            result.push(obj);
                        } else if(text.indexOf('envybox.io')>=0){
                            obj.callback = "envybox.io";
                            result.push(obj);
                        } else if(text.indexOf('callbackhunter.com')>=0){
                            obj.callback = "callbackhunter.com";
                            result.push(obj);
                        } else if(text.indexOf('calltouch')>=0){
                            obj.callback = "calltouch.ru";
                            result.push(obj);
                        } else if(text.indexOf('callibri')>=0){
                            obj.callback = "callibri.ru";
                            result.push(obj);
                        }

                        console.log(result.length+'-'+index);

                        //start();
                    } catch (e)
                    {
                        console.log("1:"+e);
                        //start();
                    }
                                                                            
            } catch (e) {
                console.log(e);
                //start();
            }
        }
}

start();

