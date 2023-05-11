import  { sendRequest } from '../hooks/sendRequest'

const backButton = document.getElementsByClassName('search-header-back-button')[0]
backButton.addEventListener('click', ()=>{
    location.href='../../'
})

const actionSearch = (keyword) =>{
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
}

const searchButton = document.getElementsByClassName('home-search-right')[0]
searchButton.addEventListener('click', ()=>{
    const searchInput = document.getElementsByClassName('home-search-input')[0]
    const keyword = searchInput.value
    actionSearch(keyword)
})

const searchInput = document.getElementsByClassName('home-search-input')[0]
const aboutTip = document.getElementsByClassName('search-about-tip')[0]
const tipWrapper = document.getElementsByClassName('search-about-tip-wrapper')[0]
const renderTip = (tipList) => {
    let tipHTML = ''
    
    let tipTemplate = (item) => `
        <div class="tip-option">
            ${item}
        </div>
    `
    tipList.forEach((item)=>{
        tipHTML += tipTemplate(item)
    })
    tipWrapper.innerHTML = tipHTML

    const tipOptions = Array.from(document.getElementsByClassName('tip-option'))
    tipOptions.forEach((item,index)=>{
        item.addEventListener('click',()=>{
            actionSearch(tipList[index])
        })
    })
}

const showTips = async () => {
    const keyword = searchInput.value.trim()
    if(keyword.length !== 0){
        const response = await sendRequest(
            'POST',
            '/item/get',
            {
                condition: `direction LIKE '%${keyword}%'`
            }
        )
        let itemList = response.data
        let tipList = itemList.map((item)=>{
            return item.direction
        })
        renderTip(tipList.reverse())
    }else{
        tipWrapper.innerHTML = ``
    }
}
searchInput.addEventListener('click',()=>{
    aboutTip.style.display = 'block'
    showTips()
})
searchInput.addEventListener('blur',()=>{
    setTimeout(() => {
       aboutTip.style.display = 'none'
        showTips() 
    }, 0);
})
searchInput.addEventListener('input',async ()=>{
    showTips()
})

let historyKeyword = JSON.parse(localStorage.getItem('HavenHistoryKeyword'))
const historyPad = document.getElementsByClassName('history-search-wrapper')[0]
const renderTag = () => {
        const historyKeywordTemplate = (item) => {
            return `
            <div class="history-search-option">
                <span class="history-search-key-word" id="${item}">
                ${
                    item.length > 8 ? 
                    `${item.slice(0,4)}...${item.slice(item.length-4,item.length)}` :
                    `${item}`
                }
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
                    const id = item.getElementsByClassName('history-search-key-word')[0].id
                    actionSearch(id)
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

