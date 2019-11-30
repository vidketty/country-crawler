const request = require('request');
const cheerio = require('cheerio');
const throttledQueue = require('throttled-queue');
const mysql = require('mysql');

const categories = [6000, 6001, 6002, 6003, 6004, 6005, 6006, 6007, 6008, 6009, 6010, 6011, 6012, 6013, 6014, 6015, 6016, 6017, 6018, 6020, 6021, 6023,
    6024, 6025, 7001, 7002, 7003, 7004, 7005, 7006, 7007, 7008, 7009, 7011, 7012, 7013, 7014, 7015, 7016, 7017, 7018, 7019];

//const categories = [6016];
/*const countries = ["ae","ag","ai","al","am","ao","ar","at","au","az",
                                                      "bb","be","bf","bg","bh","bj","bm","bn","bo","br","bs","bt","bw","by","bz",
                                                      "ca","cg","ch","cl","cn","co","cr","cv","cy","cz",
                                                      "de","dk","dm","do","dz","ec","eg","ee","es","fi","fj","fm","fr",
                                                      "gb","gd","gh","gm","gr","gt","gw","gy","hk","hn","hr","hu",
                                                      "id","ie","il","in","is","it","jm","jo","jp",
                                                      "ke","kg","kh","kn","kr","kw","ky","kz","la","lb","lc","lk","lr","lu","lv",
                                                      "md","mg","mk","ml","mn","mo","mr","ms","mt","mu","mw","mx","my","mz",
                                                      "na","ne","ng","ni","nl","no","np","nz","om",
                                                      "pa","pe","pg","ph","pk","pl","pt","pw","py","qa","ro","ru",
                                                      "sa","sb","sc","sg","si","sk","sl","sn","sr","st","sv","sz",
                                                      "tc","td","th","tj","tm","tn","tr","tt","tw","tz","ua","ug","us","uy","uz",
                                                      "vc","ve","vg","vn","ye","za","zw"];
*/
const countries = ['mo'];
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '*'];
//var letters = ['Z'];//,'G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','*'];

const throttle = throttledQueue(10, 3000);

const base = "https://apps.apple.com/";
const mid = "/genre/id";
const suff = "?letter=";
const end = "&page=";
const endEnd = "#page";



const con = mysql.createPool({
    connectionLimit: 2,
    host: 'db-appstats.cx4723vp6ouw.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: 'Orit1017',
    database: 'MobileAppStats',
    charset: 'utf8mb4'
});


//throttle(function () {
letters.forEach(letter => {
    categories.forEach(cat => {
        countries.forEach(country => {
            for (let i = 5; i < 6; i++) {
                const url = base + country + mid + cat + suff + letter + end + i + endEnd;
                console.log(url);
                throttle(function () {
                    request(url, function (err, resp, body) {
                        $ = cheerio.load(body);
                        links = $('a'); //jquery get all hyperlinks
                        $(links).each(function (g, link) {
                            if ($(link).attr('href').startsWith('https://apps.apple.com')) {
                                const idd = $(link).attr('href');
                                const id = idd.substring(idd.lastIndexOf('/') + 3);
                                if ((!isNaN(id)) && id.length > 5) {
                                    const queryy = `Insert into IOSApp (storeId) values('${id}') on duplicate key update storeId='${id}'`;
                                    con.query(queryy, (err, rows) => {
                                        if (err) { console.log(err); }
                                        else {
                                            if (rows.insertId != 0) {
                                                console.log(rows.insertId);
                                            }
                                        }
                                    });
                                    //              console.log($(link).attr('href'));
                                    //      DBConnector.getInstance().checkIfIosExist(id);
                                }
                                //      console.log($(link).attr('href'));
                            }
                            //console.log($(link).text() + ':\n  ' + $(link).attr('href'));
                        });
                    });
                    // global.gc();
                });
            }
        });
    });
});                      
