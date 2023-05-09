const backButton = document.getElementsByClassName('search-header-back-button')[0]
backButton.addEventListener('click', ()=>{
    location.href='../../'
})

const searchButton = document.getElementsByClassName('home-search-right')[0]
searchButton.addEventListener('click', ()=>{
    const searchInput = document.getElementsByClassName('home-search-input')[0]
    const keyword = searchInput.value
    if(keyword!==''){
        let historyKeyword = localStorage.getItem('HavenHistoryKeyword')
        if(historyKeyword === null){
            historyKeyword = []
        }else{
            historyKeyword = JSON.parse(historyKeyword)
        }
        if(historyKeyword.indexOf(keyword) === -1){
            historyKeyword.unshift(keyword)
        }else{
            const deleteIndex = historyKeyword.indexOf(keyword)
            historyKeyword.splice(deleteIndex,1)
            historyKeyword.unshift(keyword)
        }

        localStorage.setItem('HavenHistoryKeyword',JSON.stringify(historyKeyword))
        
        location.href = `/app/more?keyword=${keyword}`
    }    
    
})

let historyKeyword = JSON.parse(localStorage.getItem('HavenHistoryKeyword'))
const historyPad = document.getElementsByClassName('history-search-wrapper')[0]
const renderTag = () => {
        const historyKeywordTemplate = (item) => {
            return `
            <div class="history-search-option">
                <span class="history-search-key-word">
                    ${item}
                </span>
                <span class="history-search-option-delete">
                    x
                </span>
            </div>
            `
        }
        let historyKeywordHTML = ``
        historyKeyword.forEach((item)=>{
            historyKeywordHTML += historyKeywordTemplate(item)
        })
        const historyKeywordWrapper = document.getElementsByClassName('history-search-main')[0]
        historyKeywordWrapper.innerHTML = historyKeywordHTML

        let actionStatus = 'search'

        const deleteButton = Array.from(document.getElementsByClassName('history-search-option-delete'))
        const optionButton = Array.from(document.getElementsByClassName('history-search-option'))
        const statusButton = document.getElementsByClassName('history-search-delete-button')[0]
        statusButton.addEventListener('click',()=>{
            if(actionStatus === 'search'){
                actionStatus = 'delete'
                deleteButton.forEach((item)=>{
                    item.style.visibility = 'visible'
                })
            }else{
                actionStatus = 'search'
                deleteButton.forEach((item)=>{
                    item.style.visibility = 'hidden'
                })
            }
        })
        let timer 
        statusButton.addEventListener('touchstart',()=>{
            timer = setTimeout(() => {
                localStorage.setItem('HavenHistoryKeyword',JSON.stringify([]))
                historyKeyword = []
                renderTag()
            }, 1500);
        })
        statusButton.addEventListener('touchend',()=>{
            clearTimeout(timer)
        })
        optionButton.forEach((item, index)=>{
            item.addEventListener('click',()=>{
                if(actionStatus === 'delete'){
                    historyKeyword.splice(index,1)
                    
                    localStorage.setItem('HavenHistoryKeyword',JSON.stringify(historyKeyword))

                    renderTag(historyKeyword)  
                }else{
                    location.href = `/app/more?keyword=${item.innerText}`
                }
            })
        })
}

if(historyKeyword === null || historyKeyword.length === 0){
    historyPad.style.display = 'none'
}else{
    historyPad.style.display = 'block'
    renderTag()
}

