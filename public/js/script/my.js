import { component } from '../hooks/setComponent'
import { sendRequest } from '../hooks/sendRequest'
import { getCookie } from '../hooks/getCookie'
import { setExpiredTime } from '../hooks/setExpiredTime'

component.setComponent('home-nav','home-nav').then(()=>{
    component.setScript('home-nav')
})

const havenUid = getCookie('havenUid')

const getUserMsg = (uid) => {
    return sendRequest(
        'POST',
        '/user/get',   
        {
            uid
        }    
    )
}

getUserMsg(havenUid).then((response)=>{
    const {
        username,
        other_name,
        profile
    } = response.data
    const usernameWrapper = document.getElementById('username')
    const otherNameWrapper = document.getElementById('other_name')
    const profileWrapper = document.getElementById('profile')
    usernameWrapper.innerText = username
    otherNameWrapper.innerText = other_name
    profileWrapper.src = profile
})

const exitButton = document.getElementsByClassName('my-header-leave-wrapper')[0]
exitButton.addEventListener('click',()=>{
    document.cookie = `havenToken=0;${setExpiredTime(0)}`
    document.cookie = `havenUid=0;${setExpiredTime(0)}`
    window.location.href = '../../app/signin'
})