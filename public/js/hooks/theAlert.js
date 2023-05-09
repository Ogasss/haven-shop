export const theAlert = (string, fun) => {
    const wrapper = document.getElementsByClassName('the-alert-wrapper')[0]
    wrapper.style.display = 'flex'
    const pad = wrapper.getElementsByClassName('the-alert-pad')[0]
    pad.innerText = string
    wrapper.addEventListener('click',()=>{
        wrapper.style.animation = 'tip-leave 0.3s ease'
        setTimeout(()=>{
            wrapper.style.display = 'none'
            wrapper.style.animation = 'tip-enter 0.3s ease'
            if(fun !== undefined){
                fun()
            }
        },250)
    })  
}