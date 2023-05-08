import { sendRequest } from "./sendRequest"

export const component = {
    setHTML:(name,_wrapper) => {
        return new Promise((resolve)=>{
            let component
            const wrapper = document.getElementById(_wrapper)
            sendRequest('get',`/component/${name}`).then((response)=>{
                component = response.data
                wrapper.innerHTML = component
                resolve()
            })
        })
    },
    setStyle:(name) => {
        return new Promise((resolve)=>{
            const head = document.getElementsByTagName('head')[0]
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = `/css/${name}`
            head.appendChild(link)
            resolve()
        })
        
    },
    setComponent:async (name,_wrapper) => {
        await component.setStyle(name)
        await component.setHTML(name,_wrapper)
    },
    setScript: (name) => {
        return new Promise((resolve)=>{
            const body = document.getElementsByTagName('body')[0]
            const script = document.createElement('script')
            script.src = `/js/${name}`
            script.type = `module`
            body.appendChild(script)
            resolve()
        })
    }
}