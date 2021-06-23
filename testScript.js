const puppeteer = require('puppeteer');
const useProxy = require('puppeteer-page-proxy');
//const { ne } = require('sequelize/types/lib/operators');
//1984
//4392
const calltouchButtonSelector="#CalltouchWidgetFrame";
let jv_hoverl='jdiv[id="jvlabelWrap"]';//'jdiv[class*="hoverl"]';
let jv_input = 'inputField';
let jv_send = 'sendButton';
var NameInp="Имя";
var EmailInp="exampleEmail@gmail.com"
//Ids
let callibriPhoneInput="callibri_callback_phone";
let callibriSendBtn="callibri_callback_button_timer";

let envboxButtonClass="callbackkiller";
let envboxInputId="cbkPhoneInput";
let envboxInputId2="cbkPhoneDeferredInput";
let envboxSendId="cbkPhoneBtn";
let envboxSendId2="cbkPhoneDeferredBtn";
    //7802
    //

async function runBinotelScript(phone, proxy, url, proxyId, binotelPhoneId, threadId, type, tries) {    
    let browser;
    let page;   
    let sendType=0;
    let localTries=0;
    try {
        
        browser = await puppeteer.launch({            
            ignoreHTTPSErrors: true,
            headless: false,
            //devtools: false
        });
        
//94.180.253.213
        page =await browser.newPage(); 
        // const pages = await browser.pages(); // get all open pages by the browser
        // const popup = pages[pages.length - 1];     
        // console.log(popup);
        //  await page.setExtraHTTPHeaders({
        //      'Proxy-Authorization': 'Basic ' + Buffer.from('iXEE9WCtj:fFLYc7EjK').toString('base64'),
        //  });
        //await page.authenticate({ username: 'iXEE9WCtj' , password:'fFLYc7EjK' });
        // 'HTTP://149.154.64.132:443')
        
        
        await page.goto(url);        
        await page.waitFor(400);
        //await page.authenticate({ username: 'iXEE9WCtj' , password:'fFLYc7EjK' });        
        //await page.waitFor(200);
        //await page.authenticate({ username: 'iXEE9WCtj' , password:'fFLYc7EjK' });
        try {
            await page.setDefaultNavigationTimeout(0);             
            console.log("i m loaded");   
            await page.waitFor(5000);         
 
            if(type=="jivosite.com")
            {
                var hover=await page.$(jv_hoverl);
                while(localTries<25&&hover==null)
                {
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
                await page.click('jdiv[class*="callMe"] jdiv[class*="callIcon"]');
                await page.type('input[class*="phoneInput"]', phone);
                await page.waitFor(1000);
                await page.click('jdiv[class*="inputButton"] jdiv[class*="buttonIcon"]');
                await page.click('jdiv[class*="inputButton"] jdiv[class*="buttonIcon"]');

                //console.log (form);
            }
            if(type=="callibri.ru")
            {   
                var btn = await page.$("#callibri_wrap_pict_operator");                
                while(localTries<25&&btn==null)
                {
                    await page.waitFor(300);
                    btn = await page.$("#callibri_wrap_pict_operator");                
                    localTries++;    
                    
                }
                if(btn==null)
                { 
                    throw ('Open button not found');

                }
                btn.click();
                await page.waitFor(500);

                try{
                    await page.click("#callibri_input_chat_div_checkbox input[type='checkbox']");
                    await page.waitFor(500);

                }
                catch{}

                var Input=await page.$("#callibri_chat_input");
                if(Input!=null)
                {
                    await Input.type(("Здравствуйте! есть вопросы, позвоните мне " + phone))
                    page.waitFor(500);
                    await page.click("#callibri_send");
                }

                await page.evaluate((phone, callibriPhoneInput, callibriSendBtn)=>{
                    
                    let input = document.getElementById(callibriPhoneInput);
                    input.value=phone;
                    document.getElementById(callibriSendBtn).click();                    
                }, phone, callibriPhoneInput, callibriSendBtn);
                


            }
            if(type=="envybox.io")
            {
                var OpenButton = await page.$("a[class*='callbackkiller']");
                localTries=0;
                while(localTries<25&&OpenButton==null)
                {
                    await page.waitFor(300);
                    OpenButton = await page.$("a[class*='callbackkiller']");
                    localTries++;    
                    
                }
                var inp= await page.$('#'+envboxInputId);
                console.log(inp);
                if(OpenButton==null&&inp==null)
                {
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
                    //if(inp==null)
                    //{
                        console.log("click");
                    await page.evaluate((OpenButton)=>{
                        OpenButton.click();
                    //document.getElementsByClassName("callbackkiller")[0].click();
                   }, OpenButton);
                    //}   
                //console.log(await page.$('#'+envboxSendId));
                await page.waitFor(500);  
                              
                inp= await page.$('#'+envboxInputId);
                try{
                    
                    await inp.click({clickCount: 3});
                    
                    await inp.press('Backspace');
                    
                    await page.waitFor(300);
                    
                    await inp.type(PhoneCode+ phone);
                    
                    var EmailIput= await page.$('#cbkEmailInput');
                    if(EmailIput!=null)
                    {
                        await EmailIput.type(EmailInp);
                    }
                    var NameInput= await page.$('#cbkNameInput');
                    if(NameInput!=null)
                    {
                        await NameInput.type(NameInp);
                    }
                    
                    await page.click('#'+envboxSendId);

                    var Warning=await page.evaluate(()=>{
                        return document.documentElement.outerHTML.indexOf("Вы слишком часто пытаетесь звонить");
                    });
                    if(Warning)
                    {
                        throw 'WARNING';
                    }
                }
                catch(e){
                    console.log(e.message);
                    try{
                    inp= await page.$('#'+envboxInputId2);
                    
                    await inp.click({clickCount: 3});
                    await inp.press('Backspace');
                    await page.waitFor(300);
                    await inp.type(PhoneCode+ phone);
                    await page.waitFor(300);
                    var EmailIput= await page.$('#cbkEmailDeferredInput');
                    if(EmailIput!=null)
                    {
                        await EmailIput.type(EmailInp);
                    }
                    var NameInput= await page.$('#cbkNameDeferredInput');
                    if(NameInput!=null)
                    {
                        await NameInput.type(NameInp);
                    }
                    await page.click('#'+envboxSendId2);
                    
                }
                    catch{console.log("URL FAILED");}
                }
                }
                
            }
            if(type=="binotel")
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
            if(type=="callbackhunter.com")
            {
                var tempFrame=await page.waitForSelector("iframe[id='cbh_button_container']");
                while(localTries<25&&tempFrame==null)
                {
                    await page.waitFor(1000);
                    tempFrame=await page.waitForSelector("iframe[id='cbh_button_container']");
                    localTries++;    
                    
                }
                if(tempFrame==null)
                { 
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
                    await ChatsFrame.type('.form input[type="tel"]', phone, {delay: 500});
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
                    await ChatsFrame.type('.chat-text-field>input[type="text"]', "У меня есть вопросы, передзвоните мне: "+phone);
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
            if(type=="calltouch")
            {
            //    console.log("point1");                                
                // handle frame
                const frameHandle = await page.$("iframe[id='CalltouchWidgetFrame']");
                //console.log(frameHandle);
                const frame = await frameHandle.contentFrame();
                // filling form in iframe
                //await frame.waitFor(1000);
         //       console.log("1");
                
                await frame.hover('button');
                await frame.click('button');
                await frame.waitFor(1000);
                await frame.type('input[type="text"]', phone);
                await frame.click('input[type="tel"]');
                await page.waitFor(300);
                //await frame.click('div[class*="commonStyles__FieldContainer"] div[class*="tyles__OptionButton-sc"] div[class*="tyles__OptionButton-sc"]');
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
           
          
            
            await page.waitFor(1000);
           // await page.screenshot({path: 'binotel.png'});            

            
            
             
        } catch (e) {
            console.log(e);
            
        }
    } catch (exception) {
        console.log(exception);
    }
    
}
runBinotelScript("+79817143266", "no", "http://автосеть.рф/cars/", "no", "no", "no", "calltouch");