const express = require('express')
const router = express.Router()
const {setGet} = require('../hooks/setGet')

const routerList = [
    ['/app','../../public/html/app','.html'],
    ['/component','../../public/component','.html'],
]

routerList.forEach((list)=>{
    setGet(router,list[0],list[1],list[2])
})

router

exports.pageRouter = router