import {sendRequest} from '../hooks/sendRequest'

let signinStatus = 'login'

const backButton = document.getElementsByClassName('signin-back-button')[0]
backButton.addEventListener('click',()=>{
    window.location.href = '../../app/home'
})



const changeButton = document.getElementsByClassName('signin-turn-change')[0]
const ElementChange = (className,text) => {
    return new Promise((solve)=>{
        let item = document.getElementsByClassName(className)[0]
        item.innerText = text
        item.className = `${className} signin-change`
        solve({
            item,
            className
        })
    })
}

const statusChange = () => {
    if(signinStatus === 'login'){
        let eleList = [
            {
                className: 'signin-title',
                text: '账号注册'
            },
            {
                className: 'signin-submit-text',
                text: `注  册`
            },
            {
                className: 'signin-turn-change',
                text: '已有账号？点击这里登录'
            }
        ]
        eleList.forEach((item)=>{
            ElementChange(item.className,item.text).then((obj)=>{
                setTimeout(() => {
                    obj.item.className = obj.className
                }, 600);
            })
        })
        signinStatus = 'register'
        return
    }else
    if(signinStatus === 'register'){
        let eleList = [
            {
                className: 'signin-title',
                text: '账号登录'
            },
            {
                className: 'signin-submit-text',
                text: `登  录`
            },
            {
                className: 'signin-turn-change',
                text: '没有账号？点击这里注册'
            }
        ]
        eleList.forEach((item)=>{
            ElementChange(item.className,item.text).then((obj)=>{
                setTimeout(() => {
                    obj.item.className = obj.className
                }, 600);
            })
        })
        signinStatus = 'login'
        return
    }
}

changeButton.addEventListener('click',statusChange)
const eyeButton = document.getElementsByClassName('signin-password-eye')[0]
eyeButton.addEventListener('click',()=>{
    let passwordInput = document.getElementsByClassName('signin-password-input')[0]
    let eyeStatus = eyeButton.src.split('/')[4]
    if(eyeStatus === 'eye-show'){
        eyeButton.src = '/png/eye-hidden'
        passwordInput.type = 'password'
    }else
    if(eyeStatus === 'eye-hidden'){
        eyeButton.src = '/png/eye-show'
        passwordInput.type = 'text'
    }
})

const verify = (username,password) => {
    if(username === '' && password === ''){
        return {
            msg: '请输入手机号和密码',
            error: ['name','pass']
        }
    }else
    if(password === ''){
        return {
            msg: '请输入密码',
            error: ['pass']
        }
    }else
    if(username === ''){
        return {
            msg: '请输入手机号',
            error: ['name']
        }
    }else
    if(username.length !== 11){
        return {
            msg: '手机号位数不符合11位',
            error: ['name']
        }
    }else
    if(!/^1[3456789]\d{9}$/.test(username)){
        return {
            msg: '手机号不符合规范',
            error: ['name']
        }
    }else
    if(password.length<8){
        return {
            msg: '密码长度过短',
            error: ['pass']
        }
    }else
    if(password.length>=16){
        return {
            msg: '密码长度过长',
            error: ['pass']
        }
    }else
    if(!/(?!^(\d+|[a-zA-Z]+|[~!@#$%^&*()_.]+)$)^[\w~!@#$%^&*()_.]{8,16}$/.test(password)){
        return {
            msg: '密码应为数字，字母，合法符合两种及以上的组合',
            error: []
        }   
    }
    else{
        return {
            msg: `请登录`,
            error: []
        }
    }
}

const verifyView = (verifyData) => {
    const usernameBox = document.getElementsByClassName('signin-username')[0]
    const passwordBox = document.getElementsByClassName('signin-password')[0]
    const warn = document.getElementsByClassName('signin-warn-msg')[0]
    const err = verifyData.error
    if(err.indexOf('name') !==-1 && err.indexOf('pass') !==-1){
        usernameBox.style.borderBottom = '1px solid red'
        passwordBox.style.borderBottom = '1px solid red'
    }
    if(err.indexOf('name') !==-1 && err.indexOf('pass') === -1){
        usernameBox.style.borderBottom = '1px solid red'
        passwordBox.style.borderBottom = '1px solid rgb(65, 160, 165)'
    }
    if(err.indexOf('name') ===-1 && err.indexOf('pass') !== -1){
        usernameBox.style.borderBottom = '1px solid rgb(65, 160, 165)'
        passwordBox.style.borderBottom = '1px solid red'
    }
    if(err.indexOf('name') === -1 && err.indexOf('pass') === -1){
        usernameBox.style.borderBottom = '1px solid rgb(65, 160, 165)'
        passwordBox.style.borderBottom = '1px solid rgb(65, 160, 165)'
    }
    warn.innerText = verifyData.msg
}

const submit = (username, password, status) => {
    if(status === 'login'){
        sendRequest('POST','/user/login',{
            username,
            password
        }).then((response)=>{
            const data = response.data
            if(data.error.length !== 0){
                verifyView(data)
            }else{
                verifyView(data)
                const { cookies } = data
                cookies.forEach((item)=>{
                    document.cookie = item
                })
                window.location.href = '../../app/home'
            }
        })
    }else
    if(status === 'register'){
        console.log('注册')
        sendRequest('POST','/user/register',{
            username,
            password
        }).then((response)=>{
            const verifyData = response.data
            if(verifyData.error.length !== 0){
                verifyView(verifyData)
            }else{
                verifyView(verifyData)
                statusChange()
            }
        })
    }
}

const usernameInput = document.getElementsByClassName('signin-username-input')[0]
usernameInput.addEventListener('input',()=>{
    const usernameInput = document.getElementsByClassName('signin-username-input')[0]
    const passwordInput = document.getElementsByClassName('signin-password-input')[0]
    const username = usernameInput.value
    const password = passwordInput.value
    const verifyData = verify(username,password)
    if(verifyData.error){
        verifyView(verifyData)
    }
})
const passwordInput = document.getElementsByClassName('signin-password-input')[0]
passwordInput.addEventListener('input', ()=>{
    const usernameInput = document.getElementsByClassName('signin-username-input')[0]
    const passwordInput = document.getElementsByClassName('signin-password-input')[0]
    const username = usernameInput.value
    const password = passwordInput.value
    const verifyData = verify(username,password)
    if(verifyData.error){
        verifyView(verifyData)
    }
})

const submitButton = document.getElementsByClassName('signin-submit-button')[0]
submitButton.addEventListener('click',()=>{
    const usernameInput = document.getElementsByClassName('signin-username-input')[0]
    const passwordInput = document.getElementsByClassName('signin-password-input')[0]
    const username = usernameInput.value
    const password = passwordInput.value
    const verifyData = verify(username,password)
    if(verifyData.error){
        verifyView(verifyData)
    }
    if(verifyData.error.length === 0){
        if(signinStatus === 'login'){
            submit(username,password,signinStatus)
        }else
        if(signinStatus === 'register'){
            submit(username,password,signinStatus)
        }
    }
})

