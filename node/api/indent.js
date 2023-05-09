const express = require('express')
const router = express.Router()
const { Timer } = require('../hooks/timer')
const { dbOpen } = require('../../db/connect')

const getNowTime = () => {
    const {year,month,day,hour,minute,second} = Timer.newTimer().format().date
    const nowTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`
    return nowTime
} 

const getIndent = async (id, status) => {
    const action = dbOpen('haven')
    const indentList = action.read({
        sheet:'indentList',
        condition: `from_user = ${id} and status = ${status}`
    })
    return indentList
}

const setIndent = (indentList) => {
    return new Promise((resolve)=>{
        indentList.forEach(async (item,index)=>{
            let action
            action = dbOpen('haven')
            action.update({
                sheet: 'indentList',
                assign:`number = ${item.number}`,
                condition: `id = ${item.id}`
            })
            action = dbOpen('haven')
            action.update({
                sheet: 'indentList',
                assign: `status = ${item.status}`,
                condition: `id = ${item.id}`
            })
            action = dbOpen('haven')
            action.update({
                sheet: 'indentList',
                assign: `more_type_0 = '${item.more_type_0}'`,
                condition: `id = ${item.id}`
            })
            action = dbOpen('haven')
            action.update({
                sheet: 'indentList',
                assign: `more_type_1 = '${item.more_type_1}'`,
                condition: `id = ${item.id}`
            })
            .then(()=>{
                resolve()
            })
            if(item.status === 3){
                action = dbOpen('haven')
                nowTime = getNowTime()
                action.update({
                    sheet: 'indentList',
                    assign: `buy_time = '${nowTime}'`,
                    condition: `id = ${item.id}`
                })
            }
        })
    })
}

const createIndent = async (indent) => {
    const {item_id,number,more_type_0,more_type_1,from_user,status} = indent
    const action2 = dbOpen('haven')
    const targetIndent = await action2.read({
        sheet: 'indentList',
        condition: `item_id = ${item_id} and more_type_0 = '${more_type_0}' and more_type_1 = '${more_type_1}' and from_user = '${from_user}' and status = 1`
    })
    let want_time = getNowTime()

    let action 
    if(targetIndent.length === 0 || parseInt(status) !== 1){
        action = dbOpen('haven')
        await action.create({
            sheet: 'indentList',
            header: ['item_id','number','more_type_0','more_type_1','from_user','status','want_time'],
            value: [parseInt(item_id), parseInt(number), more_type_0, more_type_1, from_user, parseInt(status), want_time]
        })
    }else
    if(targetIndent.length !== 0){
        const targetIndentId = targetIndent[0].id
        const targetIndentNumber = targetIndent[0].number
        action = dbOpen('haven')
        await action.update({
            sheet: 'indentList',
            assign: `number = ${parseInt(targetIndentNumber) + parseInt(number)}`,
            condition: `id = ${targetIndentId}`
        })
        action = dbOpen('haven')
        nowTime = getNowTime()
        await action.update({
            sheet: 'indentList',
            assign: `buy_time = '${nowTime}'`,
            condition: `id = ${targetIndentId}`
        })
    }
}

const getNewIndent = () => {
    return new Promise((resolve)=>{
        action = dbOpen('haven')
        action.sql(`select * from indentList order by id desc limit 1`).then((data)=>{
            resolve(data)
        })
    })
}

const mergeIndent = (indentList) => {
    return new Promise(async (resolve)=>{
        const {item_id, more_type_0, more_type_1, from_user, number, id } = indentList
        let action = dbOpen('haven')
        let condition = `item_id = ${item_id} and more_type_0 = '${more_type_0}' and more_type_1 = '${more_type_1}' and from_user = '${from_user}' and status = 1`
        const targetIndent = await action.read({
            sheet: 'indentList',
            condition,
        })
        if(targetIndent.length !== 0){
            action = dbOpen('haven')
            action.update({
                sheet: 'indentList',
                assign: `number = ${targetIndent[0].number + number}`,
                condition: `id = ${targetIndent[0].id}`,
            })
            action = dbOpen('haven')
            action.update({
                sheet: 'indentList',
                assign: `status = 0`,
                condition: `id = ${id}`
            })
            resolve(true)
        }else{
            resolve(false)
        }
    })
}

router.post('/indent/getNew', async(request, response)=>{
    const indentList = await getNewIndent()
    response.send(indentList)
})

router.post('/indent/merge', async(request, response)=>{
    const indentList = JSON.parse(request.body.indentList)
    const result = await mergeIndent(indentList)
    response.send(result)
})

router.post('/indent/get',async (request, response)=>{
    const user_id = request.body.user_id
    const status = request.body.status
    const indentList = await getIndent(user_id,status)
    response.send(indentList)
})

router.post('/indent/update',(request, response)=>{
    const indentList = request.body.indentList
    const indentId = request.body.indentId
    if(indentList !== undefined){
        let _indentList = JSON.parse(indentList)
        setIndent(_indentList).then((data)=>{
            response.send()
        })
    }else
    if(indentId !== undefined){
        const assign = request.body.assign
        let action = dbOpen('haven')
        action.update({
            sheet: 'indentList',
            assign,
            condition: `id = ${indentId}`
        }).then(()=>{
            response.send()
        })
    }
})



router.post('/indent/create',async (request, response)=>{
    const indent = request.body
    await createIndent(indent)
    response.send()
})

exports.indentRouter = router