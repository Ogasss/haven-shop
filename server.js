const express = require('express')
const app = express()
const {pageRouter} = require('./node/router/page')
const {resourceRouter} = require('./node/router/resource')
const {userRouter} = require('./node/api/user')
const {itemRouter} = require('./node/api/item')
const {categoryRouter} = require('./node/api/category')
const { test } = require('./db/test')
const { indentRouter } = require('./node/api/indent')
const { expressjwt } = require('express-jwt')
const { tokenSecret } = require('./config')

app.use(express.static('public'))
app.use(express.urlencoded({
    extended: false
}))
app.use(expressjwt({
    secret: tokenSecret,
    algorithms: ['HS256']
}).unless({
    path:[
        '/',
        /^\/app\//,
        
        /^\/component\//,
        /^\/js\//,
        /^\/css\//,
        /^\/hooks\//,
        /^\/json\//,

        /^\/png\//,
        /^\/recommend\//,
        /^\/fashion\//,
        /^\/accessories\//,
        /^\/shoes\//,
        /^\/wrap\//,
        /^\/watch\//,
        
        /^\/user\//,
        /^\/item\//,
        /^\/category\//,
        /^\/indent\//,
    ]
}))
app.use(pageRouter)
app.use(resourceRouter)
app.use(userRouter)
app.use(itemRouter)
app.use(categoryRouter)
app.use(indentRouter)
app.get('/',(request, response)=>{
    response.redirect('/app/home')
})

app.use((err,req,res,next)=>{
    if(err.name==='UnauthorizedError'){
        return res.send({
            status: 401,
            message: '无效的token'
        })
    }
})




test()

app.listen(4400)