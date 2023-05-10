let status = location.href.split('/')[4].split('?')[1].split('=')[1]
import { component } from "../hooks/setComponent"
let wrapper = document.createElement('div')
wrapper.id = `indent_${status}`
document.body.appendChild(wrapper)

if(parseInt(status) === 1){
    document.getElementsByClassName('indent-tops')[0].style.display = 'none'
}else{
    document.getElementById(`status_${status}`).className = `indent-top-wrapper-active`
    const backButton = document.getElementsByClassName('search-header-back-button')[0]
    backButton.addEventListener('click',()=>{
        location.href = '/app/my'
    })
}

let statusArr = ['all',2,3,4]

statusArr.forEach((status)=>{
    document.getElementById(`status_${status}`).addEventListener('click',()=>{
        location.href = `/app/indent?status=${status}`
    })
})

component.setComponent(`indent_${status}`,`indent_${status}`).then(()=>{
    component.setScript(`indent_${status}`)
})