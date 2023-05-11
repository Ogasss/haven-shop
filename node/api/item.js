const express = require('express')
const router = express.Router()
const { dbOpen } = require('../../db/connect')

const getItemList = async (condition) => {
    const action = dbOpen('haven')
    const itemList = await action.read({
        sheet: 'itemList',
        condition: condition,
    })
    return itemList
}
router.post('/item/get',async (request, response)=>{
    if(request.body.id !== undefined){
        const item_id = await getItemList(`id = ${request.body.id}`)
        response.send(item_id)
    }else
    if(request.body.condition === undefined){
        const itemList_tag = await getItemList('tag is not null')
        const itemList_fashion = await getItemList(`type_0 ='fashion'`)
        const itemList_accessories = await getItemList(`type_0 ='accessories'`)
        const itemList_shoes = await getItemList(`type_0 ='shoes'`)
        const itemList_wrap = await getItemList(`type_0 ='wrap'`)
        const itemList_watch = await getItemList(`type_0 ='watch'`)
        const itemList = []
        itemList.push(itemList_tag,itemList_fashion,itemList_accessories,itemList_shoes,itemList_wrap,itemList_watch)
        response.send(itemList)
    }else{
        const itemList = await getItemList(request.body.condition)
        response.send(itemList)
    }
})
router.post('/item/update',async (request, response)=>{
    const action = dbOpen('haven')
    const { condition,assign } = request.body
    action.update({
        sheet: 'itemList',
        assign,
        condition
    }).then(()=>{
        response.send()
    })
})
exports.itemRouter = router