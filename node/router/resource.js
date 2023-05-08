const express = require('express')
const router = express.Router()
const {setGet} = require('../hooks/setGet')


const routerList = [
    ['/css','../../public/css','.css'],
    ['/js','../../public/js/script','.js'],
    ['/hooks','../../public/js/hooks','.js'],
    ['/json','../../public/json','.json'],
    ['/png','../../public/png','.png'],
    ['/recommend','../../public/png/recommend','.png'],
    ['/fashion','../../public/png/fashion','.png'],
    ['/accessories','../../public/png/accessories','.png'],
    ['/shoes','../../public/png/shoes','.png'],
    ['/wrap','../../public/png/wrap','.png'],
    ['/watch','../../public/png/watch','.png'],
]

routerList.forEach((list)=>{
    setGet(router,list[0],list[1],list[2])
})
exports.resourceRouter = router