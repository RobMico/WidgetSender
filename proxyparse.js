const puppeteer = require('puppeteer');
const fs = require('fs');
async function GetProxy()
{
    browser = await puppeteer.launch({
        // args: [`--proxy-server=${proxy}`],
        headless: false,
         //devtools: false
    });

    page =await browser.newPage();
    await page.goto('http://300.proxydb.ru/profile.aspx');  
    await page.type("input[name*='Logintbox']", "iXEE9WCtj");
    await page.type("input[name*='Passwordtbox']", "fFLYc7EjK");
        
    
        await page.click('#MainContent_Button1');
        await page.waitFor(500);
    var result='[';
    var a = await page.evaluate(()=>{
        return document.getElementById('MainContent_txtList').innerText;
    });
    a = a.split('\n');
    console.log("a:"+a.length);
    for(var i=0;i<a.length;i++)
    {
        
        if(i==a.length-1)
        {
            //result+='{"ip":"'+a[i]+'","protocol":"SOCKS5","port":"68"}';   
            result+='{"ip":"'+a[i]+'","protocol":"HTTP","port":"443"}';   
            //result+="{'ip':'"+a[i]+"','protocol':'HTTP','port':'443'}";   
        }
        else
        {
            //result+='{"ip":"'+a[i]+'","protocol":"SOCKS5","port":"68"},\n';      
            result+='{"ip":"'+a[i]+'","protocol":"HTTP","port":"443"},\n';      
            //result+="{'ip':'"+a[i]+"','protocol':'HTTP','port':'443'},\n";   
        }
    }
    result+=']';
   
    { 
//     var result='[' + await page.evaluate(()=>{        
//         var Result='';
//         var Table = document.getElementsByTagName("table")[0].children[1];
//         for(var i=0;i<Table.childElementCount;i++)
//         {            
//             Result+=((i!=0)?',':'')+'\n{"ip":"'+Table.children[i].children[0].innerText+'","port":"'+Table.children[i].children[1].innerText+'","protocol":"'+Table.children[i].children[4].innerText+'"}';            
//         }      
//         return Result;          
//     });
//     await page.goto('https://hidemy.name/ru/proxy-list/?country=RU&start=64#list');
//     try{
//     result +=await page.evaluate(()=>{        
//         var Result='';
//         var Table = document.getElementsByTagName("table")[0].children[1];
//         for(var i=0;i<Table.childElementCount;i++)
//         {
            
//             Result+='\n,{"ip":"'+Table.children[i].children[0].innerText+'","port":"'+Table.children[i].children[1].innerText+'","protocol":"'+Table.children[i].children[4].innerText+'"}';
            
//         }    
//         return Result;            
//     });
//     await page.goto('https://hidemy.name/ru/proxy-list/?country=RU&start=128#list');
//     result +=await page.evaluate(()=>{        
//         var Result='';
//         var Table = document.getElementsByTagName("table")[0].children[1];
//         for(var i=0;i<Table.childElementCount;i++)
//         {
//             if(Table.children[i].children[4].innerText!=""){
//             Result+='\n,{"ip":"'+Table.children[i].children[0].innerText+'","port":"'+Table.children[i].children[1].innerText+'","protocol":"'+Table.children[i].children[4].innerText+'"}';
//             }
//         }         
//         return Result;    
//     });
//     }catch{}
    
//     for(var i=1;;i++)
//     {
//         try{
//         await page.goto('http://free-proxy.cz/ru/proxylist/country/RU/https/ping/all/'+i);
//         result+= await page.evaluate(()=>
//         {
//                 var Result='';
//                 var Table=document.getElementById('proxy_list').children[1];
//                 for(var i=0;i<Table.childElementCount;i++)
//                 {
//                     if(Table.children[i].childElementCount>2)
//                     {
//                         if(Table.children[i].children[4].innerText!=""){
//                         Result+='\n,{"ip":"'+Table.children[i].children[0].innerText+'","port":"'+Table.children[i].children[1].innerText+'","protocol":"'+Table.children[i].children[2].innerText+'"}';
//                         }
//                     }

//                 }
//             //console.log(Result);
//                 return Result;
//             }
//         );
//         }
//         catch{break;}
//     }
//     for(var i=1;;i++)
//     {
//         try{
//         await page.goto('http://free-proxy.cz/ru/proxylist/country/RU/http/ping/all/'+i);
//         result+= await page.evaluate(()=>
//         {
//                 var Result='';
//                 var Table=document.getElementById('proxy_list').children[1];
//                 for(var i=0;i<Table.childElementCount;i++)
//                 {
//                     if(Table.children[i].childElementCount>2)
//                     {
//                         if(Table.children[i].children[4].innerText!=""){
//                         Result+='\n,{"ip":"'+Table.children[i].children[0].innerText+'","port":"'+Table.children[i].children[1].innerText+'","protocol":"'+Table.children[i].children[2].innerText+'"}';
//                     }}

//                 }
//             //console.log(Result);
//                 return Result;
//             }
//         );
//         }
//         catch{break;}
//     }
//     for(var i=1;;i++)
// {
//     try{
//     await page.goto('http://free-proxy.cz/ru/proxylist/country/RU/socks4/ping/all/'+i);
//     result+= await page.evaluate(()=>
//     {
//             var Result='';
//             var Table=document.getElementById('proxy_list').children[1];
//             for(var i=0;i<Table.childElementCount;i++)
//             {
//                 if(Table.children[i].childElementCount>2)
//                 {if(Table.children[i].children[4].innerText!=""){
//                     Result+='\n,{"ip":"'+Table.children[i].children[0].innerText+'","port":"'+Table.children[i].children[1].innerText+'","protocol":"'+Table.children[i].children[2].innerText+'"}';
//                 }}

//             }
//         //console.log(Result);
//             return Result;
//         }
//     );
//     }
//     catch{break;}
//     }
//     for(var i=1;;i++)
// {
//     try{
//     await page.goto('http://free-proxy.cz/ru/proxylist/country/RU/SOCKS5/ping/all/'+i);
//     result+= await page.evaluate(()=>
//     {
//             var Result='';
//             var Table=document.getElementById('proxy_list').children[1];
//             for(var i=0;i<Table.childElementCount;i++)
//             {
//                 if(Table.children[i].childElementCount>2)
//                 {if(Table.children[i].children[4].innerText!=""){
//                     Result+='\n,{"ip":"'+Table.children[i].children[0].innerText+'","port":"'+Table.children[i].children[1].innerText+'","protocol":"'+Table.children[i].children[2].innerText+'"}';
//                 }}

//             }
//         //console.log(Result);
//             return Result;
//         }
//     );
//     }
//     catch{break;}
//     }

//     await page.goto('http://online-proxy.ru/');

//     try{
//         result +=await page.evaluate(()=>{        
//             var Result='';
//             var Table = document.getElementsByTagName("table")[15].children[1];
//             for(var i=1;i<Table.childElementCount;i++)
//             {
                
//                 Result+='\n,{"ip":"'+Table.children[i].children[1].innerText+'","port":"'+Table.children[i].children[2].innerText+'","protocol":"'+Table.children[i].children[3].innerText+'"}';
                
//             }    
//             console.log(Result);
//             return Result;            
//         });        
//         }catch{}

//     await browser.close();
//     result+=']';
   }
    fs.writeFile('parsedproxy.json', result,()=>{}); 
    console.log("Done")    ;
    await browser.close();
}


GetProxy();