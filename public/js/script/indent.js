let status = location.href.split('/')[4].split('?')[1].split('=')[1]
import { component } from "../hooks/setComponent"
let wrapper = document.createElement('div')
wrapper.id = `indent_${status}`
document.body.appendChild(wrapper)
const titleWrapper = document.getElementsByClassName('indent-header-title')[0]

// status == 1 ? titleWrapper.innerText = '购物车' :
// status == 2 ? titleWrapper.innerText = '代付款' :
// status == 3 ? titleWrapper.innerText = '待收货' : 
// status == 4 ? titleWrapper.innerText = '售后' : ''

component.setComponent(`indent_${status}`,`indent_${status}`).then(()=>{
    component.setScript(`indent_${status}`)
})