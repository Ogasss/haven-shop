const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10)
const { dbOpen } = require('../../db/connect')
const  { Timer } = require('../hooks/timer')
const jwt = require('jsonwebtoken')
const { tokenSecret } = require('../../config')
const { setExpiredTime } = require('../hooks/setExpiredTime')

const getNowTime = () => {
    const {year,month,day,hour,minute,second} = Timer.newTimer().format().date
    const nowTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`
    return nowTime
} 

const loginUser = (username, password, userList, action) => {
    let cookies
    const _id = userList.id
    const _password = userList.password
    if(bcrypt.compareSync(password,_password)){
        const token = jwt.sign(
            {
                userId: _id,
            },
            tokenSecret,
            {
                expiresIn: '48h'
            }
        )
        const nowTime = getNowTime()
        action.update({
            sheet: 'userList',
            assign: `login_time = '${nowTime}'`,
            condition: `username = ${username}`
        })
        let expiredTime = setExpiredTime(2)
        cookies = [`havenUid=${_id};${expiredTime}`,`havenToken=${token};${expiredTime}`]
    }
    return cookies
}
router.post('/user/login',async (request, response) => {
    const { username, password } = request.body
    const action = dbOpen('haven')
    let userList = await action.read({
        sheet: 'userList',
        condition: `username = '${username}'`
    })
    if(userList.length === 0){
        response.send({
            msg: '该手机号还未注册账号',
            error: ['name']
        })
    }else{
        const cookies = loginUser(username,password,userList[0],dbOpen('haven'))
        if(cookies){
            response.send({
                msg: '回到好物，寻你所想。',
                cookies: cookies,
                error: [],
            })
        }else{
            response.send({
                msg: '该手机号对应的密码错误',
                error: ['pass']
            })
        }
    }
})


const createUser = (username, password) => {
    const action = dbOpen('haven')
    const nowTime = getNowTime()
    action.create({
        sheet: 'userList',
        header: ['username','password','created_time','other_name','has','profile'],
        value: [username,bcrypt.hashSync(password,salt),nowTime,username,1,'/png/profile']
    })
}
router.post('/user/register',async (request, response) => {
    const { username, password } = request.body
    const action = dbOpen('haven')
    let userList = await action.read({
        sheet: 'userList',
        condition: `username = '${username}'`
    })
    if(userList.length !== 0){
        response.send({
            msg: '手机号已注册',
            error: ['name']
        })
    }else{
        createUser(username, password)
        response.send({
            msg: `欢迎新人,开启你的好物之旅！`,
            error: []
        })
    }
})



router.post('/user/get', async (request, response) => {
    const { uid } = request.body
    const action = dbOpen('haven')
    let userList = await action.read({
        sheet: 'userList',
        condition: `id = ${uid}`
    })
    response.send(userList[0])
})
exports.userRouter = router

router.post('/user/update', async (request, response) => {
    const { uid, target, value } = request.body
    const action = dbOpen('haven')
    await action.update({
        sheet: 'userList',
        condition: `id = ${uid}`,
        assign: ` ${target} = '${value}'`
    })
    response.send()
})