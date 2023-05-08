export const theAlert = (string) => {
    return new Promise((resolve)=>{
        const body = document.getElementsByTagName('body')[0]
        body.innerHTML += 
        `
        <div class="the-alert-wrapper">
            <div class="the-alert-pad">
                ${string}
            </div>
        </div>
        `
        const alertWrapper = body.getElementsByClassName('the-alert-wrapper')[0]
        alertWrapper.addEventListener('click',()=>{
            alertWrapper.style.animation = 'tip-leave 0.3s ease'
            setTimeout(()=>{
                alertWrapper.style.display = 'none'
                alertWrapper.style.animation = 'tip-enter 0.3s ease'
                body.removeChild(alertWrapper)
                resolve()
            },250)
        })  
    })
    
}