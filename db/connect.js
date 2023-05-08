const mysql = require('mysql')

const connect = (database, sheet) => {
    const _database = {
        sheet: sheet
    }
    


    _database.connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '123456',
        database: database
    })//createConnection()会每次连接需要断开重连
    
    _database.connect = _database.connection.connect((err) => {
        if(err) return console.log(err)
    })

    _database.sql = (sql,data) => {
        return new Promise((resolve)=>{
            _database.connection.query(sql,data,(err, data)=>{
                if (err) return console.log(err)
                _database.connection.end()
                resolve(data)
            })
        })
    }

    _database.read = (options) => {
        let {sheet,header,condition} = options
        if(_database.sheet !== undefined) sheet = _database.sheet
        let _header = ''
        if(header !== undefined){
            _header = header.join(',')
        }
         
        let _sql
        if(header === undefined && condition === undefined){
            _sql = `select * from ${sheet}`
        }else
        if(header === undefined && condition !== undefined){
            _sql = `select * from ${sheet} where ${condition}`
        }else
        if(header !==undefined && condition === undefined){
            _sql = `select ${_header} from ${sheet}`
        }else
        {
            _sql = `select ${_header} from ${sheet} where ${condition}`
        }
        return _database.sql(_sql)
    }

    _database.create = (options) => {
        let {sheet,header,value} = options
        if(_database.sheet !== undefined) sheet = _database.sheet
        let _header = header.join(',')
        let _value = value.map(element => {
            return `'` + element + `'`
        }).join(',')
        return _database.sql(`insert into ${sheet} (${_header}) values (${_value});`)
    }
    // action.create({
    //     sheet: 'userList',
    //     header: ['username','password','created_time','other_name','has','profile'],
    //     value: [username,bcrypt.hashSync(password,salt),nowTime,username,1,'/png/profile']
    // })

    _database.update = (options) => {
       let {sheet,assign,condition} = options
       if(_database.sheet !== undefined) sheet = _database.sheet
       return _database.sql(`update ${sheet} set ${assign} where ${condition}`)
    }
    // action.update({
    //     sheet: 'userList',
    //     assign: `login_time = '${nowTime}'`,
    //     condition: `username = ${username}`
    // })

    _database.delete = (options) => {
        let { sheet,condition } = options
        if(_database.sheet !== undefined) sheet = _database.sheet
        const promise = _database.sql(`delete from ${sheet} where ${condition}`)
        _database.getRows(sheet).then((rows)=>{
            _database.setAutoIncrement(sheet,rows)
        })
        return promise
    }

    _database.setAutoIncrement = (sheet,number) => {
        if(_database.sheet !== undefined) sheet = _database.sheet
        return _database.sql(`alter table ${sheet} AUTO_INCREMENT = ${number}`)
    }

    _database.getRows = (sheet) => {
        if(_database.sheet !== undefined) sheet = _database.sheet
        return new Promise ((resolve)=>{
            const sql = `select count(*) from ${sheet}`
            _database.connection.query(sql,(err,data)=>{
                if(err) return console.log(err)
                resolve(parseInt(JSON.stringify(data[0]).replace(/[^\d]/g,"")))
            })
        })
    }
 
    return _database
}

exports.dbOpen = connect