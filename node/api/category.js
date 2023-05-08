const express = require('express')
const router = express.Router()
const { dbOpen } = require('../../db/connect')

router.post('/category/get',async (request ,response)=>{
    const {condition, header} = request.body
    const action = dbOpen('haven')
    const categoryList = await action.read({
        sheet: 'categoryList',
        header: header? header: undefined,
        condition: condition ? condition : undefined,
    })
    response.send(categoryList)
})

exports.categoryRouter = router
