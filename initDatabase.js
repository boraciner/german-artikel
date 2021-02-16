require("dotenv").config();
const csv=require('csvtojson')

const csvFilePath='./word-source/nouns.csv'

const ignore = new Set([
    "ER_DB_CREATE_EXISTS", "ER_TABLE_EXISTS_ERROR"
]);

const mysql = require("mysql");
const db = mysql.createConnection({
    user: process.env.DB_MYSQL_USER,
    password: process.env.DB_MYSQL_PASSWORD,
});

db.query("CREATE DATABASE words DEFAULT CHARACTER SET utf32;");
db.query("USE words;");

db.query(`
CREATE TABLE words.words (
    id INT NOT NULL AUTO_INCREMENT,
    keyword VARCHAR(90) CHARACTER SET 'utf32' NOT NULL,
    artikel VARCHAR(45) CHARACTER SET 'utf32' NOT NULL,
    PRIMARY KEY (id));
`);

db.on("error", (err) => {
    if (ignore.has(err.code)) return;
    throw err;
});



csv()
.fromFile(csvFilePath)
.then((jsonObj)=>{
    for(stuct of jsonObj){
        if(stuct.genus && 
            stuct.genus.length > 0 && 
            stuct.lemma && 
            stuct.lemma.length > 0 
            )
        {
            let w = " "
            switch(stuct.genus){
                case "m":
                    w = "der"
                    break;
                case "f":
                    w = "die"
                    break;
                case "n":
                    w = "das"
                    break;
            }
            console.log(stuct.lemma,"\t",w)
            
            db.query(`INSERT INTO words.words (keyword, artikel) VALUES (?,?);`,[stuct.lemma,w]);
        }
    }
    db.end();
})

//SELECT * FROM words.words WHERE keyword LIKE 'apf%' LIMIT 20;