const puppeteer = require('puppeteer');
const fs = require('fs');
const fetch = require('node-fetch');

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

let tels = [
    '+38 096 282 97 49',
    '+38 068 556 24 10',
    '+38 068 853 88 46',
    '+38 096 207 33 85',
    '+38 068 117 15 45',
    '+38 095 362 07 89',
    '+38 068 934 23 18',
    '+38 097 224 21 58',
    '+38 097 295 20 55',
    '+38 068 958 28 07',
    '+38 068 219 56 40'
];

// shuffle(tels);

//Путь до файла со списком ссылок
let rawdata = fs.readFileSync('c:\\Users\\dev\\Documents\\Project1\\binotel.json');
let links = JSON.parse(rawdata);

shuffle(links);

//Файл со списком прокси
//JSON: array with objects with ip and port
//let proxy_data = fs.readFileSync('C:\\Users\\User\\Documents\\links-data\\proxy.json');
//let proxy = JSON.parse(proxy_data);
let proxy;

let index = 0;
let index2 = 0;

let proxy_index = 0;

fetch('https://panel.farmproxy.ru/api/v1/proxies.json?anonymity=2&anonymity=1&countries=UA&api_key=nv3lsu51372e8o8bbgpv2v7q8gb9d2mfg6u3vugf', { method: "Get" })
    .then(res => res.json())
    .then((json) => {
        proxy = json;
        f2();
    });

async function f(tel) {
    let proxyUrl = proxy[proxy_index].protocol + '://' + proxy[proxy_index].ip + ':' + proxy[proxy_index].port;

    const browser = await puppeteer.launch({
        args: [`--proxy-server=${proxyUrl}`],
        headless: true,
        devtools: false
    });

    const page = await browser.newPage();

    try {
        await page.setDefaultNavigationTimeout(30000);

        console.log(proxy[proxy_index].ip);
        console.log(links[index].url);

        // await page.goto('https://thehost.ua/myip');
        await page.goto(links[index].url);

        await page.waitFor(1000);

        const resultsSelector = '.bingc-phone-button';
        await page.waitForSelector(resultsSelector, {
            timeout: 2000
        });
        await page.click(resultsSelector);

        await page.waitFor(1000);

        const messageField = '#bingc-passive-get-phone-form-input';
        await page.waitForSelector(resultsSelector, {
            timeout: 2000
        });

        tel = tels[Math.floor(Math.random() * tels.length)];
        console.log(tel);


        const result = await page.evaluate(async (tel) => {
            document.querySelector('#bingc-passive-get-phone-form-input').value = tel;

            let button = await document.querySelector('.bingc-passive-phone-form-button');
            let event = new Event('input');

            document.querySelector('#bingc-passive-get-phone-form-input').dispatchEvent(event);

            button.click();
        }, tel);

        //Увеличиваем этот интервал, если не меняем ip, на 30+ с - 30000
        await page.waitFor(2000);

        await page.close();

        await browser.close();

        console.log("Сайт " + (++index) + " из " + links.length);

        if (index < links.length) {
            await f(tel);

            if (proxy_index + 1 === proxy.length) {
                proxy_index = 0;
            } else {
                proxy_index++;
            }
        }
    } catch (e) {
        console.log(e);

        if (e.message.indexOf("net::ERR_SOCKS_CONNECTION_FAILED") >= 0 || e.message.indexOf("net::ERR_EMPTY_RESPONSE") >= 0 || e.message.indexOf("net::ERR_CONNECTION_CLOSED") >= 0 || e.message.indexOf("net::ERR_CONNECTION_RESET") >= 0 || e.message.indexOf("net::ERR_PROXY_CONNECTION_FAILED") >= 0) {
            if (proxy_index + 1 === proxy.length) {
                proxy_index = 0;
            } else {
                proxy_index++;
            }

            await browser.close();
            await f(tel);
        } else {
            await browser.close();

            if (proxy_index + 1 === proxy.length) {
                proxy_index = 0;
            } else {
                proxy_index++;
            }

            console.log("Сайт " + (++index) + " из " + links.length);

            if (index < links.length) {
                await f(tel);
            }
        }

    }
};

async function f2() {
    index = 0;

    await f(tels[index2]);

    console.log("телефон " + (++index2) + " из " + tels.index2);

    if (index2 < tels.length) {
        await f2();
    }
};