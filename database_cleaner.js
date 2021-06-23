//время для чистки назад(дни)
var TimeAgoDefault=3;
//удалять записи бд?
var DBClear=true;
//удалять скрины?
var FileClear=true;
//Пользователь БД
let database_user = 'root';
//Пароль БД 
let database_password = '';




let args = process.argv;

var Query='SELECT MAX(id) as value FROM urlphonetasks WHERE urlphonetasks.GlobalNameId=(SELECT MAX(id) FROM globalname WHERE updatedAt<=(CURDATE() - INTERVAL (:interval) DAY))';

const { Sequelize,QueryTypes } = require('sequelize');
const fs=require('fs');
console.log("11");
for (let i = 0; i < args.length; i++) {
    if (args[i] == '--date') {
        try{
            TimeAgoDefault=parseInt(args[i+1]);
        }
        catch(ex){
            console.log(ex.message);
            return;
        }        
    }
    if (args[i] == '--nodbclear') {
        DBClear=false;
    } else if (args[i] == '--nofileclear') {
        FileClear=false;
    }
    
}
console.log("2");
console.log("Time ago:"+TimeAgoDefault);


const sequelize = new Sequelize('caller_jobs', database_user, database_password, {
    dialect: 'mysql',
    host: '127.0.0.1',//'(LocalDB)\MSSQLLocalDB',
    logging: false
});
sequelize.sync().then(async () => {
    var MaxId=await sequelize.query(
        Query,{
            replacements: {
                interval: TimeAgoDefault
            },
            type: QueryTypes.SELECT
        }
    );   
    console.log("Last id:"+MaxId[0].value);
    let filenames = fs.readdirSync('ScreenFail'); 
    
    if(FileClear)
    {
        console.log('Clearing FILES');
    //console.log("\nFilenames in directory:"); 
        filenames.forEach((file) => {
        try{
            var num =parseInt(file.replace(/\D/g,''));
            //console.log(num);
            if(num<=MaxId[0].value)
            {
                
                console.log('Deleting fail'+file);                
                fs.unlink('ScreenFail/'+file, ()=>{});
            }
        }
        catch(ex){
            fs.appendFileSync('cleanerlog.txt', '{File remove fail\nFail path:'+file+'\nReason:'+ex.message+'\n}\n')
        }
        //console.log("File:", ''.join(filter(str.isdigit, file))); 
        }); 

        filenames.forEach((file) => {
        try{
            var num =parseInt(file.replace(/\D/g,''));
            //console.log(num);
            if(num<=MaxId[0].value)
            {
                
                console.log('Deleting '+file);                
                fs.unlink('ScreenSuccess/'+file, ()=>{});
            }
        }
        catch(ex){
            fs.appendFileSync('cleanerlog.txt', '{File remove fail\Success path:'+file+'\nReason:'+ex.message+'\n}\n')
        }
        //console.log("File:", ''.join(filter(str.isdigit, file))); 
        }); 
    }
    if(DBClear)
    {
        console.log('Clearing DB');
        try{
        var result=await sequelize.query('Delete from globalname WHERE updatedAt<=(CURDATE() - INTERVAL (:interval) DAY)',
    {
        replacements: {
            interval: TimeAgoDefault
        },
        type: QueryTypes.DELETE
        }); 
        }   
        catch(ex){
        fs.appendFileSync('cleanerlog.txt', '{Database clear fail\nReason:'+ex.message+'\n}\n')

        }
    }
    console.log('Done');

});