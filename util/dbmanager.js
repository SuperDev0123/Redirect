const mysql = require('mysql');
const {config} = require('./dbconfig')
// var con = mysql.createPool({
//   connectionLimit: 10,
//   host: "localhost",
//   user: "root",
//   password: "root",
//   database: "fencingone",
//   multipleStatements: true,
// });

// var con = mysql.createPool({
//   connectionLimit: 10,
//   host: "92.204.219.243",
//   user: "fencingone",
//   password: "fencingone@123",
//   database: "xview",
//   multipleStatements: true,
// });

var con = mysql.createPool(config);


module.exports.isConnected = () => {
  return new Promise((resolve, reject) => {
    con.getConnection(function (err, connection) {
      if (!err)
        console.log('db connected')
      console.log(err);
      resolve(!err);
    });
  })
}

const runQuery = async (sql, data) => {
  return new Promise((resolve, reject) => {
    mysqlQuery(sql, data, async function (err, result, fields) {
      if (err) {
        resolve([]);
        return;
        // throw err;
      }
      resolve(result)
    })
  })
}

const mysqlQuery = (sql, data, callback, retry = 0) => {
  try {
    if (typeof data === 'function') {
      callback = data;
      data = []
    }
    if (typeof callback === 'undefined') {
      callback = () => { }
    }
    con.query(sql, data, (err, result, fields) => {
      if (err) {
        console.log(err);
        console.log(err.code)
        if (retry < 10)
          mysqlQuery(sql, data, callback, ++retry)
        else
          callback(err, result, fields)
      }
      else {
        callback(err, result, fields)
      }
    })
  } catch (e) {
    if (retry < 10)
      mysqlQuery(sql, data, callback, ++retry)
    else
      callback(e, null, null)
  }
}

module.exports.runQuery = runQuery;