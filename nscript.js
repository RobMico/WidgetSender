function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// setTimeout((function () {
//     return process.kill(process.pid);
// }), 1000 * 60 * 59);
//НАСТРОЙКИ
//таймеры для времени
var Start=new Date();
var Middle;



//ПАРАМЕТРЫ

//Пользователь БД
let database_user = 'root';
//Пароль БД 
let database_password = '';

//Время работы скрипта
//Начало
let start_hour = 9;
//Конец
let end_hour = 22;

//Путь до файла ссылок
let urls_json_path = 'resultSuccessRF1.json';

//Путь до файла с телефонами
let phones_path;// = './phones.json';
var PhoneCode="+7";

//Путь на файл прокси

let proxy_path="parsedproxy.json";

//Количество потоков(максимальное)
let count_threads = 10;

var logFile="script_logs.txt";
//Название задачи
let name = "task";

//продожить исполнение не законченных задач предыдущих запусков
let continue_previous_task=false;
//Headless
let headless = true;

//Отключить прокси
let ProxyDisable=false;

let SaveScreen=false;
//Дополнительные настройки
//Дополнительные параметры для заявок
var NameInp="Анастасия";
var EmailInp="anastasya12@mail.ru"


var cityFilter=null;

//Calltouch настройки
const calltouchButtonSelector="#CalltouchWidgetFrame";



//jivosite настройки
let jv_hoverl='jdiv[id="jvlabelWrap"]';//'jdiv[class*="hoverl"]';
let jv_input = 'inputField';
let jv_send = 'sendButton';


//calibri настройки
let callibriPhoneInput="callibri_callback_phone";
let callibriSendBtn="callibri_callback_button_timer";


//envybox настойки
let envboxButtonClass="callbackkiller";
let envboxInputId="cbkPhoneInput";
let envboxInputId2="cbkPhoneDeferredInput";
let envboxSendId="cbkPhoneBtn";
let envboxSendId2="cbkPhoneDeferredBtn";



//Начало скрипта
const puppeteer = require('puppeteer');

const {
    Sequelize,
    Model,
    DataTypes,
    QueryTypes
} = require('sequelize');

const fs = require('fs');

const fetch = require('node-fetch');

const { Json } = require('sequelize');
const { url } = require('inspector');

let args = process.argv;

let tels = [];

let jivosite_urls = [];

let url_list = [];

let proxy = [];

let global_task_id;

process.setMaxListeners(0);

async function showStat(task_id) {
    var End=new Date();
    console.log("Start to now: "+(Start-End));
    console.log("Start to load ended: "+(Start-Middle));
    var data=await sequelize.query('SELECT URLType, status,Count(*) as count,AVG(OperationTime) as OperationTime FROM `urlphonetasks`'+
    ' Where GlobalNameId=(:GlobalNameId) GROUP BY URLType, status', {
        replacements: {
            GlobalNameId: [global_task_id]
        }        
    });//'SELECT status,Count(*) as count FROM `urlphonetasks` GROUP BY status');
    //console.log(data);
    var type="";
    var GeneralP=0;
    var GeneralW=0;
    var GeneralS=0;
    var GeneralF=0;    
    console.log("---------------------------");
    for(let i=0;i<data[0].length;i++)
    {        
        if(type!=data[0][i].URLType)
        {
            console.log("---------------------------");
            type=data[0][i].URLType;
        }
        if(data[0][i].status==1)
        {
            GeneralP+=data[0][i].count;
            console.log("Задач для выполнения по "+data[0][i].URLType+" :"+data[0][i].count);
        }   
        if(data[0][i].status==2)
        {
            GeneralW+=data[0][i].count;
            console.log("Задач выполняется по "+data[0][i].URLType+" :"+data[0][i].count);
        }   
        if(data[0][i].status==3)
        {
            GeneralS+=data[0][i].count;
            console.log("Успешных задач по "+data[0][i].URLType+" :"+data[0][i].count);
        }   
        if(data[0][i].status==4)
        {
            GeneralF+=data[0][i].count;
            console.log("Проваленых задач по "+data[0][i].URLType+" :"+data[0][i].count);
        }

    }   
    console.log("---------------------------");
    console.log("Задач для выполнения: "+GeneralP); 
    console.log("Задач выполняется: "+GeneralW); 
    console.log("Успешных задач: "+GeneralS); 
    console.log("Проваленых задач: "+GeneralF);
    console.log("Расчет времени выполнения");
    var res= (await sequelize.query('SELECT SUM(time) as result FROM (SELECT URLType as type, AVG(OperationTime)*(SELECT COUNT(*) FROM urlphonetasks WHERE urlphonetasks.URLType=type and GlobalNameId=(:GlobalNameId)) as time FROM `urlphonetasks` GROUP BY URLType) as table1', {
        replacements: {
            GlobalNameId: [global_task_id]
        }        
    }));
    console.log("Расчитанный срок выполнения:"+res[0][0].result/1000+'с');
    //SELECT SUM(time) as result FROM (SELECT URLType as type, AVG(OperationTime)*(SELECT COUNT(*) FROM urlphonetasks WHERE urlphonetasks.URLType=type and GlobalNameId=12) as time FROM `urlphonetasks` GROUP BY URLType) as table1
 
}

async function getWorkedProxy(count) {
    let proxy;        
    if(continue_previous_task)
    {
         proxy = await Proxy.findAll({
            limit: count,
            where: {            
                status: 1,
                proxy: sequelize.literal('NOT EXISTS (SELECT * FROM proxyhistory WHERE proxyhistory.proxy = proxy.proxy AND status = 2)')
            },
            order: sequelize.literal('rand()')
        });        
    }
    else {
         proxy = await Proxy.findAll({
            limit: count,
            where: {
                GlobalNameId:global_task_id,     
                status: 1,
                proxy: sequelize.literal('NOT EXISTS (SELECT * FROM proxyhistory WHERE proxyhistory.proxy = proxy.proxy AND status = 2)')
            },
            order: sequelize.literal('rand()')
        });        
    }       
    return await proxy;
}
async function runScript(phone, proxy, url, proxyId, binotelPhoneId, threadId, type, tries, ScriptStartedTime) {  
    let browser;
    //phone="4732006111";
    var a=async function ()
    {
    try{
    if(!ScriptStartedTime)
    {
        ScriptStartedTime=new Date();
    }
    
    //console.log(tries);    
    if(tries==undefined)
    {        
        tries = 1;
    }
    console.log(phone);
    console.log(type);
    var ScreenPath=type+binotelPhoneId+'.png';
    
    let page;
    console.log("ID:"+binotelPhoneId);
    //console.log("Started");
    try {
        browser = await puppeteer.launch({
            args: [ProxyDisable?'':`--proxy-server=${proxy}`],
            ignoreHTTPSErrors: true,
            headless: headless,
            //devtools: false
        });
        //console.log("Browser created ScreenPath:"+ScreenPath+"MyProxy:"+proxy);
        page =await browser.newPage();
        await page.setDefaultNavigationTimeout(600000);
        await page.authenticate({ username: 'iXEE9WCtj' , password:'fFLYc7EjK' });
        //console.log("1");
        await page.waitFor(1000);
        //console.log("2");
        //console.log(page);        
        try {
            await page.goto(url);
            await page.authenticate({ username: 'iXEE9WCtj' , password:'fFLYc7EjK' });              
            
            // type = await page.evaluate(()=>{
            //     var text = document.documentElement.outerHTML;
            //     var res;
            //     if(text.indexOf('jivosite.com')>=0){                                                
            //         res = "jivosite.com";                
            //     } else if(text.indexOf('envybox.io')>=0){
            //         res = "envybox.io";                          
            //     } else if(text.indexOf('callbackhunter.com')>=0){
            //         res = "callbackhunter.com";                         
            //     } else if(text.indexOf('calltouch')>=0){
            //         res = "calltouch.ru";
                
            //     } else if(text.indexOf('callibri')>=0){
            //         res = "callibri.ru";                     
            //     }
            //     return res;
            // })
            
            console.log("Url: "+url+" Phone: "+phone+"  type:"+type+"  trie:"+tries+"  STARTED");
            await page.waitFor(2000); 
            var localTries=0;           
            if(type=="jivosite.com")
            {
                var hover=await page.$(jv_hoverl);
                localTries=0;
                while(localTries<25&&hover==null)
                {
                    //console.log("waiting: "+url);
                    await page.waitFor(300);
                    hover=await page.$(jv_hoverl);                   
                    localTries++;    
                    
                }
                if(hover==null&&!await page.$("#jcont"))
                { 
                    throw ('Hover not found');

                }     
                if(!await page.$("#jcont"))
                {
                    await hover.click();
                }                           
                await page.waitFor(500);

                //Jivo обработка по виджету обратного вызова
                try{
                    await page.click('jdiv[class*="callMe"] jdiv[class*="callIcon"]');
                    await page.type('input[class*="phoneInput"]', phone);
                    await page.waitFor(1000);
                    await page.click('jdiv[class*="inputButton"] jdiv[class*="buttonIcon"]');
                    await page.click('jdiv[class*="inputButton"] jdiv[class*="buttonIcon"]');                    
                    await page.waitFor(5000);
                    await UrlPhoneTasks.update({                        
                        URLType:"jivositeCall.com"                        
                    }, {
                        where: {
                            id: binotelPhoneId
                        }
                    });
                    console.log("SUCCESS!!!!!!!!!!");
                }//если не прошло то обработка по чату
                catch{
                    throw 'No jivosite call widget';
                //     {
                // try{
                //     var NameInpEl= await page.$('jdiv>input[class*="'+jv_input+'"][type="text"]');
                //     if(NameInpEl!=null)
                //     {
                //         await NameInpEl.type(NameInp);
                //     }
                //     NameInpEl= await page.$('jdiv>input[class*="'+jv_input+'"][type="tel"]');
                //     if(NameInpEl!=null)
                //     {
                //         await NameInpEl.type(PhoneCode+ phone);
                //     }
                //     NameInpEl= await page.$('jdiv>input[class*="'+jv_input+'"][type="email"]');
                //     if(NameInpEl!=null)
                //     {
                //         await NameInpEl.type(EmailInp);
                //     }
                // }catch(ex){
                //     //console.log(ex.message)
                // }
                // await page.type('jdiv>textarea[class*="'+jv_input+'"]', ("Здравствуйте!"));                
                // await page.click('jdiv[class*="'+jv_send+'"]');    
                // var form = await page.$('jdiv[class*="box"] input');
                // localTries=0;
                // while(localTries<25&&form==null)
                // {
                //     await page.waitFor(400);
                //     form=await page.$('jdiv[class*="box"] input');
                //     //console.log(localTries);
                //     localTries++;    
                    
                // }
                // if(form!=null)
                // { 
                //     //console.log("Form input");
                //     var Name=await page.$('jdiv[class*="box"] input[type="name"]');
                //     if(Name!=null)
                //     {
                //         await Name.type(NameInp);
                //     }
                //     await page.waitFor(300);
                //     var Phone=await page.$('jdiv[class*="box"] input[type="tel"]');
                //     console.log("Phone:" + phone);
                //     if(Phone!=null)
                //     {

                //         await Phone.type(PhoneCode + phone);
                //     }
                //     await page.waitFor(300);
                //     var Email=await page.$('jdiv[class*="box"] input[type="email"]');
                //     if(Email!=null)
                //     {
                //         await Email.type(EmailInp);
                //     }
                //     await page.waitFor(300);


                //     var Send=await page.$('jdiv[class*="box"] jdiv[class*="button"]');
                //     await Send.click();
                //     await page.waitFor(500);
                //     var CheckBox=await page.$('jdiv[class*="checkbox"]');
                //     if(CheckBox!=null)
                //     {
                //         await CheckBox.click();
                //     }

                //     await page.waitFor(5000);
                //     if(CheckBox)
                //     {
                //         await CheckBox.click();
                //         await page.waitFor(5000);
                //     }
                //     // var SubmitSuccess=await page.$('jdiv[class*="box"] jdiv[class*="submitSuccess"]')
                //     // localTries=0;
                //     // while(localTries<25&&SubmitSuccess==null)
                //     // {
                //     //     await page.waitFor(400);
                //     //     SubmitSuccess=await page.$('jdiv[class*="box"] jdiv[class*="submitSuccess"]');
                //     //     //console.log(localTries);
                //     //     localTries++;    
                        
                //     // }
                //     // if(SubmitSuccess==null)
                //     // {
                //     //     throw ('SubmitSuccess not found');
                //     // }

                // }
                // await page.type('jdiv>textarea[class*="'+jv_input+'"]', ("Я плохо печатаю, позвоните мне " +PhoneCode+ phone));    
                // await page.click('jdiv[class*="'+jv_send+'"]');                
                // }
                }
                
                //console.log (form);
            }
            else if(type=="callibri.ru")
            {   
                var btn = await page.$("#callibri_wrap_pict_operator");
                localTries=0;                
                while(localTries<25&&btn==null)
                {
                    await page.waitFor(500);
                    btn = await page.$("#callibri_wrap_pict_operator");                
                    localTries++;    
                    
                }
                try{
                await page.evaluate(( phone, callibriPhoneInput, callibriSendBtn)=>{                    
                        let input = document.getElementById(callibriPhoneInput);
                        input.value=phone;
                        document.getElementById(callibriSendBtn).click();                    
                    }, phone, callibriPhoneInput, callibriSendBtn);
                    throw '';
                }
                catch{
                if(btn==null&&await page.$('#callibri_containerWidget')==null)
                { 
                    throw ('Open button not found');

                }
                if(btn!=null)
                {
                    btn.click();
                }
                await page.waitFor(500);
                try{
                    var cheskbox = await page.$("#callibri_input_chat_div_checkbox input[type='checkbox']");
                    if(cheskbox!=null)
                    {
                        await cheskbox.click();
                    }
                    await page.waitFor(500);

                }
                catch{}
                var Input=await page.$("#callibri_chat_input");
                if(Input!=null)
                {
                    await Input.type(("Здравствуйте! есть вопросы, позвоните мне " +PhoneCode+ phone))
                    page.waitFor(500);
                    await page.click("#callibri_send");
                }
                try{
                
                }catch{}
                }

            }
            else if(type=="envybox.io")
            {
                var OpenButton = await page.$("a[class*='callbackkiller']");
                localTries=0;
                while(localTries<25&&OpenButton==null)
                {
                    await page.waitFor(500);
                    OpenButton = await page.$("a[class*='callbackkiller']");
                    localTries++;    
                    
                }
                var inp= await page.$('#'+envboxInputId);
                if(OpenButton==null&&inp==null)
                {
                    if(await page.evaluate(()=>{
                        return document.documentElement.innerText.indexOf('Access Denied')>0||
                        document.documentElement.innerText.indexOf('403 Forbiden')>0;
                    
                    }))
                    {
                        throw 'Access denied';
                    }
                    throw 'NO CALL WIDGET';
                }
                if(false)//OpenButton==null)
                {   
                    OpenButton= await page.$("div[class*='ws-chat']");
                    if(OpenButton==null)
                    {
                        throw ('Open button not found');
                    }
                    await page.click("div[class*='ws-chat-btn-el-container']");
                    var ofline=false;
                    try{
                        var inp=await page.$("input[type='text'][class*='ws-offline-input']");
                        
                        if(inp!=null)
                        {
                            console.log("123");
                            await inp.click();
                            await page.waitFor(500);
                            await inp.type(NameInp);
                        }
                        var PhoneInput = await page.$("input[type='tel'][class*='ws-offline-input']");
                        if(PhoneInput!=null)
                        {
                            console.log("113");
                            await PhoneInput.click({clickCount: 3});
                            await PhoneInput.press('Backspace');
                            await PhoneInput.type(PhoneCode+ phone);
                        }
                        var EmailInput = await page.$("input[type='email'][class*='ws-offline-input']");
                        if(EmailInput!=null)
                        {
                            console.log("111");
                            await EmailInput.type(EmailInp);
                        }
                        var MessageInput = await page.$("div[class*='ws-offline-textarea']");
                        if(MessageInput!=null)
                        {
                            console.log("111");
                            await MessageInput.type(("Здравствуйте! есть вопросы, позвоните мне " +PhoneCode+ phone));
                        }
                        await page.click('a[class*="ws-offline-btn"]');
                        ofline=true;
                    }
                    catch{

                    }
                    if(!ofline)
                    {
                        await page.waitFor(300);
                        await page.type("div[class*='ws-textarea-placeholder']", ("Здравствуйте! есть вопросы, позвоните мне " +PhoneCode+ phone));
                        await page.click("div[class*='ws-textarea-send-btn']");
                        await page.waitFor(500);
                        try{
                            var inp=await page.$("input[type='text'][class*='ws-preform-input']");
                            if(inp!=null)
                            {
                                console.log("123");
                                await inp.click();
                                await page.waitFor(500);
                                await inp.type(NameInp);
                            }
                            var PhoneInput = await page.$("input[type='tel'][class*='ws-preform-input']");
                            if(PhoneInput!=null)
                            {
                                console.log("113");
                                await PhoneInput.click({clickCount: 3});
                                await PhoneInput.press('Backspace');
                                await PhoneInput.type(PhoneCode+ phone);
                            }
                            var EmailInput = await page.$("input[type='email'][class*='ws-preform-input']");
                            if(EmailInput!=null)
                            {
                                console.log("111");
                                await EmailInput.type(EmailInp);
                            }
                            var MessageInput = await page.$("div[class*='ws-offline-textarea']");
                            if(MessageInput!=null)
                            {
                                console.log("111");
                                await MessageInput.type(("Здравствуйте! есть вопросы, позвоните мне " +PhoneCode+ phone));
                            }
                            await page.click('a[class*="ws-preform-btn-save"]');                                                    
                        }
                        catch{

                        }
                    }
                }   
                else
                {         
                    
                    
                        await page.evaluate((OpenButton)=>{
                        OpenButton.click();
                    //document.getElementsByClassName("callbackkiller")[0].click();
                   }, OpenButton);
                       
                //console.log(await page.$('#'+envboxSendId));
                await page.waitFor(500);                
                inp= await page.$('#'+envboxInputId);
                try{
                    
                    var IsError=false, ErrorCounter=0;

                    do{
                        await inp.click({clickCount: 3});
                    
                        await inp.press('Backspace');
                    
                        await page.waitFor(300);
                    
                        await inp.type(PhoneCode+ phone);
                    
                        var EmailIput= await page.$('#cbkEmailInput');
                        //console.log("EMAIL!!!!!!!!!!!!!")
                        if(await page.evaluate(()=>{
                            return window.getComputedStyle(document.getElementById('cbkEmailInput')).display!="none";
                        }))
                        {
                            //console.log(EmailIput);
                            await EmailIput.click({clickCount: 3});
                            
                            //console.log("1");
                            await EmailIput.press('Backspace');
                    
                            await page.waitFor(300);

                            await EmailIput.type(EmailInp);
                            //console.log("2");
                        }
                        var NameInput= await page.$('#cbkNameInput');
                        //console.log("NAME!!!!!!!!!!!!!")
                        if(await page.evaluate(()=>{
                            return window.getComputedStyle(document.getElementById('cbkNameInput')).display!="none";
                        }))
                        {
                            await NameInput.click({clickCount: 3});
                            
                            //console.log("1");
                            await NameInput.press('Backspace');
                    
                            await page.waitFor(300);

                            await NameInput.type(NameInp);
                            //console.log("2");
                        }
                    
                        await page.click('#'+envboxSendId);

                        //console.log("MY CLICK!!!!!!!!!!!!!")

                        await page.waitFor(3000); 
                        IsError = await page.evaluate(()=>{
                            return document.getElementsByClassName("cbk-error").length>0;
                        });
                        if(IsError)
                        {
                            console.log("ENVYBOX ");
                            ErrorCounter++;
                            await page.waitFor(1000);
                        }
                    } while(IsError&&ErrorCounter<20)
                    if(ErrorCounter>=20)
                    {
                        throw 'Envybox send error';
                    }
                }
                catch(ex){
                    console.log(ex);            
                    inp= await page.$('#'+envboxInputId2);
                    
                    await inp.click({clickCount: 3});
                    await inp.press('Backspace');
                    await page.waitFor(300);
                    await inp.type(PhoneCode+ phone);
                    await page.waitFor(300);
                    var EmailIput= await page.$('#cbkEmailDeferredInput');
                    if(await page.evaluate(()=>{
                        return window.getComputedStyle(document.getElementById('cbkEmailDeferredInput')).display!="none";
                    }))
                    {
                        await EmailIput.type(EmailInp);
                    }
                    var NameInput= await page.$('#cbkNameDeferredInput');
                    if(await page.evaluate(()=>{
                        return window.getComputedStyle(document.getElementById('cbkNameDeferredInput')).display!="none";
                    }))
                    {
                        await NameInput.type(NameInp);
                    }
                    await page.click('#'+envboxSendId2);
                    
                
                }
                }
                
            }
            else if(type=="binotel")
            {
                const resultsSelector = '#bingc-phone-button';
                await page.waitForSelector(resultsSelector, {
                timeout: 15000
                });
                await page.click(resultsSelector);

                await page.waitFor(1000);
                //console.log("1");
                const messageField = '#bingc-passive-get-phone-form-input';
                await page.waitForSelector(resultsSelector, {
                timeout: 2000
                });
                //console.log("2");
                const result = await page.evaluate(async (phone) => {
                    document.getElementById('bingc-passive-get-phone-form-input').value = phone;
                  //  console.log("3");
                    let button = await document.getElementsByClassName('bingc-passive-phone-form-button')[0];
                    let event = new Event('input');
                    document.getElementById('bingc-passive-get-phone-form-input').dispatchEvent(event);

                    button.click();
                }, phone);
            }
            else if(type=="callbackhunter.com")
            {
                var tempFrame=await page.$("iframe[id='cbh_button_container']");
                localTries=0;
                while(localTries<25&&tempFrame==null)
                {
                    await page.waitFor(800);
                    tempFrame=await page.$("iframe[id='cbh_button_container']");
                    localTries++;    
                    
                }
                if(tempFrame==null)
                { 
                    if(await page.evaluate(()=>{
                        return document.documentElement.innerText.indexOf('Access Denied')>0||
                        document.documentElement.innerText.indexOf('403 Forbiden')>0;
                    
                    }))
                    {
                        throw 'Access denied';
                    }
                    throw ('Callback button not found');

                }
                
                const BtnsFrame = await (await page.waitForSelector("iframe[id='cbh_button_container']")).contentFrame();
                const ChatsFrame = await (await page.waitForSelector("iframe[id='cbh_slider_container']")).contentFrame();
                await BtnsFrame.click('.buttons>.main-button');
                await page.waitFor(1000);
                var PhoneForm= await ChatsFrame.evaluate(()=>{
                    var el= document.getElementsByClassName("slider")[0];
                    var style = window.getComputedStyle(el);
                    return (style.display != 'none');
                });
                if(PhoneForm)
                {
                    var z= await ChatsFrame.$('.form input[type="tel"]');                                

                    await z.click({clickCount: 3});
                    await z.press('Backspace');
                    await ChatsFrame.type('.form input[type="tel"]',PhoneCode+ phone, {delay: 500});
                    //console.log("Inp stage 2");
                    await ChatsFrame.click('.form button[data-bind*="click: call,"]');
                    await page.waitFor(300);
                    var next=await ChatsFrame.$('.form button[data-bind*="click: next(),"]');
                    if(next!=null)
                    {
                        await next.click();
                    }
                    await page.waitFor(300);
                    var next=await ChatsFrame.$('.form button[data-bind*="click: next(),"]');
                    
                    if(next!=null)
                    {
                        await next.click();
                    } 
                    next=await ChatsFrame.$('.form button[data-bind*="click: next(),"]');
                    
                    if(next!=null)
                    {
                        await next.click();
                    }         
                                                                                                 
                }
                else
                {   
                    await ChatsFrame.type('.chat-text-field>input[type="text"]', "У меня есть вопросы, передзвоните мне: "+PhoneCode+ phone);
                    await ChatsFrame.click('.chat-text-field>div>.send');                    
                }
                //await ChatsFrame.type('input[type="tel"]', phone);//>.body>.content>.form>div>input');
                
                //slideVisible('builtin')
                //await frameHandle.type('.chat-text-field>input[type="text"]', phone);
               // console.log("Heeeyyy");
                //window.ko.dataFor(btn).send();  
                // var btn= window.frames[1].document.getElementsByClassName("main-button")[0]            ;
                // window.ko.dataFor(btn).slideVisible('builtin');          
            }
            else if(type=="calltouch.ru")
            {
            //    console.log("point1");                                
                // handle frame
                const frameHandle = await page.$("iframe[id='CalltouchWidgetFrame']");                
                //console.log(frameHandle);
                const frame = await frameHandle.contentFrame();
                // filling form in iframe
                await frame.waitFor(1000);
         //       console.log("1");
                
                await frame.hover('button');
                await frame.click('button');
                await frame.waitFor(500);
                await frame.type('input[type="text"]',PhoneCode+ phone);
                await frame.evaluate((phone)=>{
                    var spans = document.getElementsByTagName("span");
                    for(let i=0;i<spans.length;i++)
                    {
                        if(spans[i].parentElement.className.includes("Button"))
                        {
                            x=spans[i].parentElement;
                      //      console.log(spans[i].parentElement);
                        }
                    }
                    x.click();


                }, phone);
           //     console.log("end");
                // await page.evaluate(()=>{
                // document.getElementById("CalltouchWidgetFrame").contentWindow
                // .document.getElementById("Calltouch-widget-container").getElementsByTagName("Button")[0].click();
                // });
                // await page.waitFor(1000);
                // console.log("point2");
                // await page.evaluate((phone)=>{
                // document.getElementById("CalltouchWidgetFrame").contentWindow.document.getElementsByTagName("Input")[0].value="123";
                // let x;
                // var spans = document.getElementById("CalltouchWidgetFrame").contentWindow.document.getElementsByTagName("span");
                
                // for(let i=0;i<spans.length;i++)
                // {
                //     if(spans[i].parentElement.className.includes("Button"))
                //     {
                //         x=spans[i].parentElement;
                //         console.log(spans[i].parentElement);
                //     }
                // }
                // x.click();
                // }, phone);
              //  console.log("point 3");
            }
            else{throw 'Widget not found';}
            //console.log("ScriptEnded");
            await page.waitFor(1000);
            if(SaveScreen)
            {
            await page.screenshot({path:("ScreenSuccess\\"+ ScreenPath)}); 
            }
            //await browser.close(); 
            //console.log("Url: "+url+" Phone: "+phone+"  SUCCESS");            
            await browser.close();
            
            
            
            await UrlPhoneTasks.update({
                status: 3,
                comment:SaveScreen?ScreenPath:"No screen",
                ProxyId: proxyId,
                OperationTime:(ScriptStartedTime-(new Date()))
            }, {
                where: {
                    id: binotelPhoneId
                }
            });

            await Thread.update({
                status: 1
            }, {
                where: {
                    GlobalNameId: global_task_id,
                    number: threadId
                }
            });

            // await ProxyHistory.create({
            //     proxy: proxy,
            //     status: 1
            // });

            // await BinotelUrlHistory.create({
            //     url: url,
            //     status: 1
            // });
            //console.log("point 1!!!!!!");
            console.log([
                type,
                'Success!',
                phone, proxy, url, ScreenPath
            ]);
        } catch (e) {
            //console.log("point 2");
            
            console.log("%cUrl: "+url+" Phone: "+phone+"  FAIL1", 'color: red');
            console.log(e);
            //console.log("Error: "+ e);
            if(!e.message)
            {
                //console.log(e);                
                   
                tries++;
                if(tries<3)
                {     
                    await browser.close();                                                     
                    await runScript(phone, proxy, url, proxyId, binotelPhoneId, threadId, type,  (tries), ScriptStartedTime);
                    return;
                } 
                if(SaveScreen)
                {
                    await page.screenshot({path:"ScreenFail\\"+ ScreenPath});   
                }
                await browser.close();                    
                await UrlPhoneTasks.update({
                    status: 4,
                    comment: SaveScreen?ScreenPath:"No screen",
                    ProxyId: proxyId,
                    reason:e,
                    OperationTime:(ScriptStartedTime-(new Date()))
                }, {
                    where: {
                        id: binotelPhoneId
                    }
                });
                
                // await BinotelUrlHistory.create({
                //     url: url,
                //     status: 2
                // });

                await Thread.update({
                    status: 1
                }, {
                    where: {
                        GlobalNameId: global_task_id,
                        number: threadId
                    }
                });
                return;
            }
            // console.log([
            //     'Binotel',
            //     'Fail!',
            //     e.message,
            //     phone, proxy, url
            // ]);
             
            //if (e.message.indexOf("net::ERR_SOCKS_CONNECTION_FAILED") >= 0 || e.message.indexOf("net::ERR_EMPTY_RESPONSE") >= 0 || e.message.indexOf("net::ERR_CONNECTION_CLOSED") >= 0 || e.message.indexOf("net::ERR_CONNECTION_RESET") >= 0 || e.message.indexOf("net::ERR_PROXY_CONNECTION_FAILED") >= 0) {net::ERR_NO_SUPPORTED_PROXIES
            if (e.message.indexOf("net::ERR_SOCKS_CONNECTION_FAILED") >= 0 || e.message.indexOf("net::ERR_EMPTY_RESPONSE") >= 0
             || e.message.indexOf("net::ERR_CONNECTION_RESET") >= 0 || e.message.indexOf("net::ERR_PROXY_CONNECTION_FAILED") >= 0||
              e.message.indexOf("net::ERR_TUNNEL_CONNECTION_FAILED") >= 0|| e.message.indexOf("ERR_CONNECTION_CLOSED") >= 0
              || e.message.indexOf("ERR_NO_SUPPORTED_PROXIES") >= 0) {
                // !!!                
                // !!!
                await browser.close();

                await Proxy.update({
                    status: 2,
                    comment: e.message
                }, {
                    where: {
                        id: proxyId
                    }
                });

                // await ProxyHistory.create({
                //     proxy: proxy,
                //     status: 2
                // });
                tries++;
                if(tries<3)
                {
                    proxy = await getWorkedProxy();
                    proxyId = proxy[0].id;
                    proxy = proxy[0].proxy;            
                    await runScript(phone, proxy, url, proxyId, binotelPhoneId, threadId,type,  tries, ScriptStartedTime);
                    return;
                }else{
                    await UrlPhoneTasks.update({
                        status: 4,
                        comment: 'No screen',
                        ProxyId: proxyId,
                        reason:e.message,
                        OperationTime:(ScriptStartedTime-(new Date()))
                    }, {
                        where: {
                            id: binotelPhoneId
                        }
                    });        
                    await Thread.update({
                        status: 1
                    }, {
                        where: {
                            GlobalNameId: global_task_id,
                            number: threadId
                        }
                    });
                }
            } else {
                // !!!                
                // !!!

                tries++;
                if(tries<3)
                {    
                    await browser.close();                                                                        
                    await runScript(phone, proxy, url, proxyId, binotelPhoneId, threadId, type,  (tries), ScriptStartedTime);
                    return;
                }
                
                console.log("TRIES ENDED")
                await page.screenshot({path:"ScreenFail\\"+ ScreenPath});          
                await browser.close();
                await UrlPhoneTasks.update({
                    status: 4,
                    comment: ScreenPath,
                    ProxyId: proxyId,
                    reason:e.message,
                    OperationTime:(ScriptStartedTime-(new Date()))
                }, {
                    where: {
                        id: binotelPhoneId
                    }
                });

                // await BinotelUrlHistory.create({
                //     url: url,
                //     status: 2
                // });

                await Thread.update({
                    status: 1
                }, {
                    where: {
                        GlobalNameId: global_task_id,
                        number: threadId
                    }
                });                            
            }
        }
    } catch (exception) {
        //console.log("point 3");
        console.log("%cUrl: "+url+" Phone: "+phone+'    Screen:'+ScreenPath+"  FAIL2", 'color: red');
        console.log(exception.message);
        
        try {            
            if(SaveScreen)
            {
            await page.screenshot({path:"ScreenFail\\"+ ScreenPath}); 
            }
            await page.close();
            await browser.close();
        } catch (exc) {

        }
        //console.log(exception.message);
        tries++;
        console.log("Trie:"+tries);
        if (tries > 3) {
            
            
            await UrlPhoneTasks.update({
                status: 4,
                comment:SaveScreen? ScreenPath:"No screen",
                reason:exception.message,
                OperationTime:(ScriptStartedTime-(new Date()))
            }, {
                where: {
                    id: binotelPhoneId
                }
            });
            await Thread.update({
                status: 1
            }, {
                where: {
                    GlobalNameId: global_task_id,
                    number: threadId
                }
            });
            // await BinotelUrlHistory.create({
            //     url: url,
            //     status: 2
            // });
        } else {
            try{
                   await runScript(phone, proxy, url, proxyId, binotelPhoneId, threadId, type, tries, ScriptStartedTime);
            }
            catch(exc){
                await UrlPhoneTasks.update({
                    status: 4,
                    comment:SaveScreen?ScreenPath:"No screen",
                    reason:exception.message,
                    OperationTime:(ScriptStartedTime-(new Date()))
                }, {
                    where: {
                        id: binotelPhoneId
                    }
                });
                await Thread.update({
                    status: 1
                }, {
                    where: {
                        GlobalNameId: global_task_id,
                        number: threadId
                    }
                });
                console.log("URL failed:"+exc.message);
            }
            
        }
    }
    }    
    catch(e){
        await UrlPhoneTasks.update({
            status: 4,            
            reason:('!!!!!FAIL!!!!!!'+ e.message),
        }, {
            where: {
                id: binotelPhoneId
            }
        });
        await Thread.update({
            status: 1
        }, {
            where: {
                GlobalNameId: global_task_id,
                number: threadId
            }
        });
        try{
            await browser.close();
        }
        catch{}
    }   
    };
    try{
    await a();
    }
    catch{ 
        await UrlPhoneTasks.update({
            status: 4,            
            reason:('!!!!!FAIL!!!!!!'+ e.message),
        }, {
            where: {
                id: binotelPhoneId
            }
        });
        await Thread.update({
            status: 1
        }, {
            where: {
                GlobalNameId: global_task_id,
                number: threadId
            }
        });   
    }
    try{
        await browser.close();
    }catch{

    }
}

const sequelize = new Sequelize('caller_jobs', database_user, database_password, {
    dialect: 'mysql',
    host: '127.0.0.1',//'(LocalDB)\MSSQLLocalDB',
    logging: false
});

class GlobalName extends Model {}

GlobalName.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
        // allowNull defaults to true
    },
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:true
    },
    updatedAt:{
        type:DataTypes.DATE,
        allowNull:true
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'GlobalName', // We need to choose the model name,
    tableName: 'globalname'
});

class Thread extends Model {}

Thread.init({
    GlobalNameId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
        // allowNull defaults to true
    },
    number: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
        // allowNull defaults to true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
        // allowNull defaults to true
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:true
    },
    updatedAt:{
        type:DataTypes.DATE,
        allowNull:true
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Thread', // We need to choose the model name,
    tableName: 'Thread',
    timestamps: true
});


class Proxy extends Model {}

Proxy.init({
    proxy: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
        // allowNull defaults to true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
        // allowNull defaults to true
    },
    GlobalNameId: {
        type: DataTypes.INTEGER,
        allowNull: false
        // allowNull defaults to true
    },
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:true
    },
    updatedAt:{
        type:DataTypes.DATE,
        allowNull:true
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Proxy', // We need to choose the model name,
    tableName: 'Proxy',
    timestamps: true
});


class ProxyHistory extends Model {}

ProxyHistory.init({
    proxy: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
        // allowNull defaults to true
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:true
    },
    updatedAt:{
        type:DataTypes.DATE,
        allowNull:true
    },
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'ProxyHistory', // We need to choose the model name,
    tableName: 'ProxyHistory',
    timestamps: true
});

//class UrlPhoneTasks extends Model {}

// UrlPhoneTasks.init({
//     url: {
//         type: DataTypes.STRING,
//         allowNull: false
//         // allowNull defaults to true
//     },
//     status: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//         // allowNull defaults to true
//     }
// }, {
//     // Other model options go here
//     sequelize, // We need to pass the connection instance
//     modelName: 'BinotelUrlHistory', // We need to choose the model name,
//     tableName: 'BinotelUrlHistory',
//     timestamps: true
// });

class UrlPhoneTasks extends Model {}

UrlPhoneTasks.init({
    Phone: {
        type: DataTypes.TEXT,
        allowNull: false
        // allowNull defaults to true
    },
    ProxyId: {
        type: DataTypes.INTEGER,
        allowNull: true
        // allowNull defaults to true
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false
        // allowNull defaults to true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
        // allowNull defaults to true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
        // allowNull defaults to true
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
        // allowNull defaults to true
    },
    URLType: {
        type: DataTypes.TEXT,
        allowNull: true
        // allowNull defaults to true
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:true
    },
    updatedAt:{
        type:DataTypes.DATE,
        allowNull:true
    },
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true

    },
    OperationTime:{
        type:DataTypes.INTEGER,        
        allowNull:true

    }, 
    GlobalNameId: {
        type: DataTypes.INTEGER,
        allowNull: false
        // allowNull defaults to true
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'UrlPhoneTasks', // We need to choose the model name,
    tableName: 'urlphonetasks',
    timestamps: true
});

(async () => {    
    if (phones_path) {
        try {
            let rawdata = fs.readFileSync(phones_path);
            tels = JSON.parse(rawdata);
        } catch (exception) {
            console.log("exception.message");
            console.log('Не удалось прочитать файл с телефонами!');
            return;
        }
    }

    if (urls_json_path) {
        try {
            let rawdata = fs.readFileSync(urls_json_path);
            url_list = JSON.parse(rawdata);
            //console.log(url_list);
        } catch (exception) {
            console.log(exception);
            console.log('Не удалось прочитать файл со списком url!');
            return;
        }
    }


    if (proxy_path) {
        try {
            let rawdata = fs.readFileSync(proxy_path);
            proxy = JSON.parse(rawdata);

            // let response = await fetch(proxy_path);
            // proxy = await response.json();
        } catch (exception) {
            console.log('Не удалось прочитать файл с прокси!');
            return;
        }
    }

    //Проверка агрументов
    for (let i = 0; i < args.length; i++) {
        if (args[i] == '--stat') {
            showStat(args[3]);
            return;
        }
        if (args[i] == '--phones') {
            if ((i + 1) != args.length) {
                try {
                    let rawdata = fs.readFileSync(args[i + 1]);
                    tels = JSON.parse(rawdata);
                } catch (exception) {
                    console.log('Не удалось прочитать файл с телефонами!');
                    return;
                }
            } else {
                console.log('Введите путь для ключа --phones');
                return;
            }
        } else if (args[i] == '--name') {
            if ((i + 1) != args.length) {
                name = args[i + 1];
            } else {
                console.log('Введите путь для ключа --name');
                return;
            }
        } else if (args[i] == '--thread') {
            if ((i + 1) != args.length) {
                count_threads = args[i + 1];
            } else {
                console.log('Введите путь для ключа --thread');
                return;
            }
        } else if (args[i] == '--url-path') {
            if ((i + 1) != args.length) {
                try {
                    console.log("a");
                    let rawdata = fs.readFileSync(args[i + 1]);
                    url_list = JSON.parse(rawdata);
                } catch (exception) {
                    console.log('Не удалось прочитать файл со списком url!');
                    return;
                }
            } else {
                console.log('Введите путь для ключа --url_path');
                return;
            }
        } else if (args[i] == '--proxy') {
            if ((i + 1) != args.length) {
                try {
                    let response = await fetch(args[i + 1], {
                        method: "Get"
                    });
                    proxy = await response.json();
                    //console.log(proxy);
                } catch (exception) {
                    console.log('Не удалось прочитать файл с прокси!');
                    return;
                }
            } else {
                console.log('Введите путь для прокси --proxy');
                return;
            }
        } else if (args[i] == '--proxy_file') {
            if ((i + 1) != args.length) {
                try {
                    let rawdata = fs.readFileSync(args[i + 1]);
                    jivosite_urls = JSON.parse(rawdata);
                } catch (exception) {
                    console.log('Не удалось прочитать файл с прокси!');
                    return;
                }
            } else {
                console.log('Введите путь для прокси --proxy');
                return;
            }
        } else if (args[i] == '--db-user') {
            if ((i + 1) != args.length) {
                database_user = args[i + 1];
            } else {
                console.log('Укажите значение --db-user');
                return;
            }
        } else if (args[i] == '--db-password') {
            if ((i + 1) != args.length) {
                database_password = args[i + 1];
            } else {
                console.log('Укажите значение --db-password');
                return;
            }
        } else if (args[i] == '--start-hour') {
            if ((i + 1) != args.length) {
                start_hour = args[i + 1];
            } else {
                console.log('Укажите значение --start-hour');
                return;
            }
        } else if (args[i] == '--end-hour') {
            if ((i + 1) != args.length) {
                end_hour = args[i + 1];
            } else {
                console.log('Укажите значение --end-hour');
                return;
            }
        } else if (args[i] == '--th') {
            if ((i + 1) != args.length) {
                count_threads = args[i + 1];
            } else {
                console.log('Укажите значение кол-ва потоков --th');
                return;
            }
        
        } else if (args[i] == '--city') {
        if ((i + 1) != args.length) {
            cityFilter = args[i + 1];
            cityFilter = cityFilter.replace('_', " ");
        } else {
            //console.log('Укажите значение кол-ва потоков --th');
            return;
        }
        
        }
    }
    

    async function checkDataBaseConnection() {
        try {
            await sequelize.authenticate();
        } catch (error) {
            console.error('Не удалось подключиться к базе', error);
        }
    }

    checkDataBaseConnection();
    sequelize.sync().then(async () => {        
        const global = await GlobalName.create({
            name: name,
            status: 1
        });
        console.log("ID созданного потока:", global.id);
        global_task_id=global.id;        
        shuffle(tels);      
        //Создание потоков
        for (let i = 1; i <= count_threads; i++) {
            console.log("Thread:"+i)
            await Thread.create({
                number: i,
                status: 1,
                GlobalNameId: global_task_id
            });
        }
        shuffle(jivosite_urls);        
        

        shuffle(url_list);

        console.log('Экспортирую в бд прокси '+proxy.length+" штук");
        for (let i = 0; i < proxy.length; i++) {
            //let protocol = proxy[i].protocol ;

            await Proxy.create({
                // proxy: (proxy[i].protocol + '://' + proxy[i].ip + ':' + proxy[i].port),
                proxy: (proxy[i].protocol + '://' + proxy[i].ip + ':' + proxy[i].port),
                status: 1,
                GlobalNameId: global_task_id
            });
        }
        console.log('Прокси экспортированы.');


        if (url_list.length > 0) {
            console.log('Экспортирую в бд список ссылок  '+url_list.length+' штук');
        }
        //Импорт урлов для binotel
        let TempIsFirstTime=true, counter=0;
        for (let i = 0; i < url_list.length; i++) {
            for (let j = 0; j < tels.length; j++) {
                //console.log(url_list[i].callback);
                //console.log(tels[j]);  
                // await sequelize.query(
                //     'INSERT INTO UrlPhoneTasks(url,URLType,status,GlobalNameId, Phone) VALUES ((:url),(:URLType),1, (:GlobalNameId),(:Phone));',{
                //         replacements: {
                //             url:[url_list[i].url],
                //             URLType:[url_list[i].callback],
                //             Phone:[tels[j]],
                //             GlobalNameId: [global_task_id]
                //         }
                //     }
                // );
                //console.log("b");
                //console.log(cityFilter);
                if(cityFilter)
                {
                if(cityFilter.replace(' ', '_')==url_list[i].city.replace(' ', '_')||cityFilter==null)
                {
                        if(TempIsFirstTime)
                        {
                            TempIsFirstTime=false;
                            fs.appendFileSync(logFile, "Start:"+global_task_id+"\nFilter: "+cityFilter+"\n");                        
                            fs.appendFileSync(logFile, "Started at:"+new Date().toLocaleString()+"\n");                      
                        }
                        if(url_list[i].callback!='jivosite.com')
                        {
                    
                        try{                
                            await UrlPhoneTasks.create({
                                url: url_list[i].url,  
                                URLType:url_list[i].callback,                  
                                status: 1,
                                GlobalNameId: global_task_id,
                                Phone: tels[j]
                    
                                });
                                counter++;
                            }
                            catch(e){
                                console.log(e);
                            }
                        }
                }
                }
                else{
                    if(url_list[i].callback!='jivosite.com')
                    {
                    
                    try{                
                        await UrlPhoneTasks.create({
                            url: url_list[i].url,  
                            URLType:url_list[i].callback,                  
                            status: 1,
                            GlobalNameId: global_task_id,
                            Phone: tels[j]
                    
                        });
                        counter++;
                    }
                    catch(e){
                        console.log(e);
                    }
                    }
                }
                //console.log("b");
            }
        }        
        fs.appendFileSync(logFile, "Task count: "+counter+"\n");
        if (url_list.length > 0) {
            console.log('Экспорт url закончен');
        }
        //Экспортирую в бд прокси
        showStat();

        Middle=new Date();
        console.log('Работа выполняется...');    
        //Статусы потоков
        //Не в работе
        const THREAD_NOT_IN_WORK = 1;
        //В работе
        const THREAD_IN_WORK = 2;
        //Завершен
        const THREAD_COMPLETED = 3;

        //Тип скрипта
        //Не в работе
        const JIVOSITE_CONST = 1;
        //В работе
        const BINOTEL_CONST = 2;

        let jivosite_completed = false;

        let work_completed = false;
    
        //if (url_list.length > 0) {
        current_script_type = BINOTEL_CONST;
        //}
        while(true)
        {
            var date = new Date();
            var current_hour = date.getHours();

            if (true)//((!start_hour && !end_hour) || start_hour && end_hour && current_hour >= start_hour && current_hour < end_hour) 
            {
                let less_used_url = [];
                
                    //Получение наименее использованных url
                let query='SELECT \n' +
                '    url , SUM(urlphonetasks.status) as sum\n' +
                'FROM\n' +
                '    caller_jobs.urlphonetasks\n' +                    
                'WHERE\n' +
                ' urlphonetasks.status = 1  \n'+
                (!continue_previous_task?'AND GlobalNameId = (:GlobalNameId)\n':'')+//+' AND NOT EXISTS (SELECT * FROM binotelurlhistory WHERE binotelurlhistory.url = binotelphone.url AND status = 2)\n'+
                'GROUP BY url\n' +
                'ORDER BY sum DESC\n' +
                'LIMIT 1;';                                      
                less_used_url = await sequelize.query(
                    query,{
                        replacements: {
                            GlobalNameId: [global_task_id]
                        },
                        type: QueryTypes.SELECT
                    }
                );   

                if (less_used_url.length == 0) {
                    console.log('Задача выполнена.Процес остановится через 2 мин');
                    console.log('Результаты работы:');     
                    fs.appendFileSync(logFile, "Ended at:"+new Date().toLocaleString()+"\n");                                                                            
                    setTimeout((async function () {
                        console.log("!!!!!end!!!!");
                            return process.kill(process.pid);
                        }), 1000*60*2);
                    showStat(global_task_id);
                    return;
                }
                            
                //Получение свободного потока
                let free_thread = await Thread.findAll({
                    limit: 1,
                    where: {
                        GlobalNameId: global_task_id,
                        status: 1
                    }
                });
                
                if (free_thread.length != 0) {                    
                    //Установка потока в работу
                    await Thread.update({
                        status: 2
                    }, {
                        where: {
                            GlobalNameId: free_thread[0].GlobalNameId,
                            number: free_thread[0].number
                        }
                    });

                    proxy=await getWorkedProxy(1);                        
                    
                    if(proxy.length==0)
                    {
                        console.log('Закончились рабочие прокси!');
                        return;              
                    }  
                  
                    //Запуск скрипта
                    //Получение телефона не в работе
                    
                        let data = await sequelize.query(
                            'SELECT urlphonetasks.id, url, URLType, phone FROM caller_jobs.urlphonetasks\n' +                            
                            'WHERE urlphonetasks.status = 1 AND '+(!continue_previous_task?' GlobalNameId = (:GlobalNameId) AND ':'')+
                            'url=(:url)'+                            
                            'LIMIT 1;', {
                                replacements: {
                                    GlobalNameId: [global_task_id],
                                    url: less_used_url[0].url
                                },
                                type: QueryTypes.SELECT
                            }
                        );
                     
                        //console.log("data:");
                        //console.log(data);
                        //Устанавливаем телефон в работу
                        await UrlPhoneTasks.update({
                            status: 2
                        }, {
                            where: {
                                id: data[0].id,
                                status: 1
                            }
                        });                 
                        console.log("TYPE:"+data[0].URLType);       
                        // //Запускаем скрипт    
                    runScript(data[0].phone, proxy[0].proxy, data[0].url, proxy[0].id, data[0].id, free_thread[0].number, data[0].URLType);
                    
                                  
                }
                else{
                    //console.log("Не осталось свободных потоков");                    
                }
            

            }           


        }
    });
})
();