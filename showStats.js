let database_user = 'root';
//Пароль БД 
let database_password = '';
const fs = require('fs');

const {Sequelize} = require('sequelize');
const sequelize = new Sequelize('caller_jobs', database_user, database_password, {
    dialect: 'mysql',
    host: '127.0.0.1',//'(LocalDB)\MSSQLLocalDB',
    logging: false
});


async function checkDataBaseConnection() {
    try {
        await sequelize.authenticate();
    } catch (error) {
        console.error('Не удалось подключиться к базе', error);
    }
}
checkDataBaseConnection();
sequelize.sync().then(async () => {
    //SELECT (Count(*))*(AVG(OperationTime)) FROM `urlphonetasks` GROUP BY URLType
    //var data=await sequelize.query('SELECT URLType, status,Count(*) as count,AVG(OperationTime) as OperationTime FROM `urlphonetasks` Where GlobalNameId=139 GROUP BY URLType, status');//'SELECT status,Count(*) as count FROM `urlphonetasks` GROUP BY status');
    var data=await sequelize.query('SELECT URLType, status,Count(*) as count,AVG(OperationTime) as OperationTime FROM `urlphonetasks` Where GlobalNameId=(SELECT MAX(GlobalNameId) FROM urlphonetasks ) GROUP BY URLType, status');//'SELECT status,Count(*) as count FROM `urlphonetasks` GROUP BY status');
    var data1=await sequelize.query('SELECT CONCAT("[", GROUP_CONCAT( CONCAT("{url:\'",url,"\'"), CONCAT("number:\'",urlphonetasks.GlobalNameId,"\'"), CONCAT(",callback:\'",URLType,"\'}") ) ,"]") AS json FROM urlphonetasks WHERE status=3');
    console.log(data1[0][0].json);
    fs.writeFileSync('gg.json',data1[0][0].json); 
    //console.log(data);
    return;
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
            console.log("Задач для выполнения по "+data[0][i].URLType+": "+data[0][i].count);
        }   
        if(data[0][i].status==2)
        {
            GeneralW+=data[0][i].count;
            console.log("Задач выполняется по "+data[0][i].URLType+": "+data[0][i].count);
        }   
        if(data[0][i].status==3)
        {
            GeneralS+=data[0][i].count;
            console.log("Успешных задач по "+data[0][i].URLType+": "+data[0][i].count+" среднее время выполнения:"+data[0][i].OperationTime/1000);
        }   
        if(data[0][i].status==4)
        {
            GeneralF+=data[0][i].count;
            console.log("Проваленых задач по "+data[0][i].URLType+": "+data[0][i].count+" среднее время выполнения:"+data[0][i].OperationTime/1000);
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
            GlobalNameId: 83
        }        
    }));
    console.log("Расчитанный срок выполнения:"+res[0][0].result/1000+'с');
});

   
