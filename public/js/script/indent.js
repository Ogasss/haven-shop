let status = location.href.split('/')[4].split('?')[1].split('=')[1]
import { component } from "../hooks/setComponent"
let wrapper = document.createElement('div')
wrapper.id = `indent_${status}`
document.body.appendChild(wrapper)
document.getElementById(`status_${status}`).className = `indent-top-wrapper-active`

let statusArr = [1,2,3,4]

statusArr.forEach((status)=>{
    document.getElementById(`status_${status}`).addEventListener('click',()=>{
        location.href = `/app/indent?status=${status}`
    })
})

component.setComponent(`indent_${status}`,`indent_${status}`).then(()=>{
    component.setScript(`indent_${status}`)
})