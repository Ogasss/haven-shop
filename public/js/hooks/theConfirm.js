export const theConfirm = (string,fun) => {
    const wrapper = document.getElementsByClassName('the-confirm-wrapper')[0]
    wrapper.style.display='flex'
    const pad = wrapper.getElementsByClassName('the-confirm-tip')[0]
    pad.innerText = string
    const cancelButton = wrapper.getElementsByClassName('the-confirm-cancel-button')[0]
    cancelButton.addEventListener('click',()=>{
        wrapper.style.display = 'none'
    })
    const confirmButton = wrapper.getElementsByClassName('the-confirm-confirm-button')[0]
    confirmButton.addEventListener('click',()=>{
        wrapper.style.display = 'none'
        if(fun !== undefined){
            fun()
        }
    })
}