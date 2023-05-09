import { getCookie } from '../hooks/getCookie'
import { sendRequest } from '../hooks/sendRequest'

const init = async () => {
const searchButton = document.getElementsByClassName('home-search-right')[0]
searchButton.addEventListener('click',()=>{
    const searchInput = document.getElementsByClassName('home-search-input')[0]
    const keyword = searchInput.value
    if(keyword!==''){
        location.href = `/app/more?keyword=${keyword}`
    }
})

let itemList
await sendRequest(
    'POST',
    '/item/get'
).then((response)=>{
    itemList = response.data
})
let topsList = Array.from(homeJson.topsList)

const { havenToken, havenUid } = getCookie()
if(havenToken === undefined || havenUid === undefined){
    const title = document.getElementsByClassName('home-title-title')[0]
    title.innerText = '点击登录，寻找好物'
    const titleWrapper = document.getElementsByClassName('home-title-title-wrapper')[0]
    titleWrapper.addEventListener('click',()=>{
        window.location.href = '../../app/signin'
    })
}


let wrapper = document.getElementsByClassName('home-tops-wrapper')[0]
let rows = document.getElementsByClassName('home-tops-rows')[0]
const mainWrapper = document.getElementsByClassName('home-main-wrapper')[0]
const more = document.getElementsByClassName('home-tops-more-word')[0]

more.addEventListener('click',()=>{
    window.location.href = '../../app/more/?category=none'
})

let html = ``
const template = (content,index) => {
  return `
    <div class="home-tops-option" id="tops-option-${index}">
        <div class="home-tops-title">
        ${content}
        </div>
    </div>`  
}

topsList.push('')
topsList.forEach((item,index)=>{
    html += template(item,index)
})
rows.innerHTML = html
rows.style.width = `${topsList.length * 64}px`

let componentHTML = ``
const componentTemplate = (item,index) =>  {
    let theHeight
    if(index === 0){
        theHeight = itemList[index].length % 2 ===0 ?
        (parseInt(itemList[index].length/2)+0.7)*5.7:
        (parseInt(itemList[index].length/2)+1.7)*5.7
    }else{
        theHeight = itemList[index].length % 2 ===0 ?
        (parseInt(itemList[index].length/2)+0.7)*5.45:
        (parseInt(itemList[index].length/2)+1.7)*5.45
    }
    return `
    <div class="home-main-content-wrapper" style="height: calc(${theHeight}rem + 10vh)">
        <div class="home-main-content" id="home-main-${index}">
            ${item}
        </div>
    </div>
    `
}
const itemTemplate = (item,index) => {
return`
<a href='/app/item/?itemId=${item.id}' class="home-main-item">
    <img class="home-main-item-img" src=${JSON.parse(item.png)[0]}>
    ${item.tag ? `<div class="home-main-item-tag" style="width: ${item.tag.length*0.28}rem">${item.tag}</div>` : ''}
    <div class="home-main-item-direction">${item.direction.slice(0,20)}</div>
    <div class="home-main-item-footer">
        <span class="home-main-item-price">
        ${
            item.discount ?
            `¥${(item.price*item.discount).toFixed(2)}
            <span class="home-main-item-discount">
                ¥${item.price}
            </span> `:
            `¥${item.price}`
        }
        </span>
        <span class="home-main-item-popular">
            ${item.volume}付款
        </span> 
    </div>
</a>`
}

itemList.forEach((item,index)=>{
    componentHTML += componentTemplate(item,index)
})
mainWrapper.innerHTML = componentHTML

itemList.forEach((item,index)=>{
    const contentWrapper = document.getElementById(`home-main-${index}`)
    let itemHTML = ``
    item.forEach((item,index)=>{
        itemHTML += itemTemplate(item)
    })
    contentWrapper.innerHTML = 
    `   ${
            index === 0 ?
            `
            <div class="home-main-category">
            </div>
            <div class="home-main-activity">
                <div class="home-activity-option">
                </div>
                <div class="home-activity-option">
                </div>
            </div>
            
            ` :
            `
            <div class="home-main-category-1">
            </div>
            <div class="home-main-category-2">
            </div>
            <div class="home-main-category-3">
            </div>
            `
        }
    `
    +
    itemHTML 
    +
    `
    <a class="home-main-none">
    </a>
    <a class="home-main-none">
    </a>`
})

const categoryInit = async () => {
    const getCategoryImg = async (type_1) => {
        const response = await sendRequest(
            'POST',
            '/item/get',
            {
                condition: `type_1 = '${type_1}'`
            }
        )
        if(response.data[0] !== undefined){
            return JSON.parse(response.data[0].png)[0]
        }else{
            return '/png/none'
        }
    }
    const getCategoryList = async (category) => {
        return new Promise(async (resolve)=>{
            const response = await sendRequest(
                'POST',
                '/category/get',
                {
                    condition: `theFrom = '${category}'`
                }
            )
            const _categoryList = response.data
            const setImg = () => new Promise((resolve)=>{
                _categoryList.forEach((item, index)=>{
                    getCategoryImg(item.href).then((data)=>{
                        item.img = data
                        if(index === _categoryList.length-1){
                            resolve()
                        }
                    })
                })
            })
            setImg().then(()=>{
                let categoryList = []
                categoryList.push(_categoryList.slice(0,5),_categoryList.slice(5,9))
                resolve(categoryList)
            })
        })
    }
    
    const topsList = ['fashion', 'accessories', 'shoes', 'wrap', 'watch']
    const categoryTemplate = (item) => {
        return `
        <a class="home-category-option" href=${`/app/more?category=${item.href}`}>
            <img class="home-category-img" src=${item.img}/>
            <div class="home-category-title">
                ${item.title}
            </div>
        </a>
        `
    }
    const renderCategory = (categoryList) => {
        categoryList.forEach((item,index)=>{
            if(index === 0){
                let categoryHTML = ``
                item.forEach((item)=>{
                    categoryHTML += categoryTemplate(item)
                })
                const categoryWrapper = document.getElementsByClassName('home-main-category')[index]
                categoryWrapper.innerHTML = categoryHTML
            }else{
                let categoryHTML = [``,``,``]
                item.forEach((item,index)=>{
                    item.forEach((item)=>{
                        categoryHTML[index] += categoryTemplate(item)
                    })
                })
                const categoryWrapper1 = document.getElementsByClassName('home-main-category-1')[index-1]
                const categoryWrapper2 = document.getElementsByClassName('home-main-category-2')[index-1]
                const categoryWrapper3 = document.getElementsByClassName('home-main-category-3')[index-1]
                categoryWrapper1.innerHTML = categoryHTML[0]
                categoryWrapper2.innerHTML = categoryHTML[1]
                categoryWrapper3.innerHTML = categoryHTML[2]
            }
        })
    }
    const setCategoryList = new Promise(
        (resolve)=>{
            let categoryList = [
                [
                    {
                        title: '平价好物',
                        href: 'cheap',
                        img: '/shoes/03_1'
                    },
                    {
                        title: '新款潮流',
                        href: 'new',
                        img: '/fashion/04_1'
                    },
                    {
                        title: '学院校园',
                        href: 'school',
                        img: '/wrap/04_1'
                    },
                    {
                        title: '女性品牌',
                        href: 'female',
                        img: '/wrap/02_1'
                    },
                    {
                        title: '高端品牌',
                        href: 'expensive',
                        img: '/watch/01_1'
                    }
                ],
            ]
            topsList.forEach(async (item, index)=>{
                const list = await getCategoryList(item)
                list[1].push({
                    title: '更多分类',
                    href: 'none',
                    img: '/png/more_category'
                })
                categoryList[index+1] = list
                if(index === topsList.length-1){
                    resolve(categoryList)
                }
           })
        }
    )
    setCategoryList.then((categoryList)=>{
        renderCategory(categoryList)
    })
}
categoryInit()

const activityInit = () => {
    const activityList = [
        [
            {
                top_title: '品牌专区',
                word: '入驻品牌',
                bottom_title: '优质好物',
                img: '/fashion/04_1',
                href:'/app/brand'
            },
            {
                top_title: '更多分类',
                word: '好物分类',
                bottom_title: '寻你所想',
                img: '/png/more_category',
                href:'/app/more?category=none'
            },
        ],
        [
            {
                top_title: '热销专区',
                word: '大伙都在买',
                bottom_title: '热门商品',
                img: '/accessories/04_1',
                href:'/app/more?category=hot'
            },
            {
                top_title: '每日签到',
                word: '签到累金币',
                bottom_title: '金币兑奖',
                img: '/png/activity_signin',
                href:''
            },
        ]
    ]
    const activityTemplate = (item) => {
        return `
            <a class="activity-option-wrapper" href=${item.href}>
                <div class="home-activity-top-title">
                    ${item.top_title}
                </div>
                <img class="home-activity-img" src=${item.img}></img>
                <div class="home-activity-text">
                    ${item.word}
                </div>
                <div class="home-activity-bottom-title">
                    ${item.bottom_title}
                </div>
            </a>
        `
    }
    const activityWrapper = Array.from(document.getElementsByClassName('home-activity-option'))
    activityWrapper.forEach((item, index)=>{
        let activityHTML = ``
        activityList[index].forEach((item, index)=>{
            activityHTML += activityTemplate(item)
        })
        activityWrapper[index].innerHTML = activityHTML
    })
}
activityInit()

const optionList =  Array.from(document.getElementsByClassName('home-tops-option'))
let timer
let timerFlag = false
optionList.forEach((item,index)=>{
    item.addEventListener('click',()=>{
        const itemWidth = item.getBoundingClientRect().width + parseFloat(getComputedStyle(item).marginLeft)
        if(timerFlag){
            clearInterval(timer)
        }
        item.className = 'home-tops-option-active'
        wrapper.scrollTo({
            left:itemWidth*(index-2),
            behavior: 'smooth',
        })
        getActiveOptions(item.innerText,index)
        optionList.forEach((_item,_index)=>{
            index !== _index ? _item.className = 'home-tops-option' : ''
        })
    })
})

let index = 0 
let oldIndex = 0
let scrollList = topsList.map(item=>{
    return 0
})
const getActiveOptions = (_option,_index) => {
    oldIndex = index
    const contentWrapper = document.getElementsByClassName('home-main-wrapper')[0]
    const contentWidth = document.getElementsByClassName('home-main-content-wrapper')[0].clientWidth
    const totalWidth = contentWidth * _index
    contentWrapper.scrollTo({
        left: totalWidth,
        behavior: 'smooth'
    })
    window.scrollTo({
        top: scrollList[_index],
        behavior: 'instant'
    })
    index = _index
}

const optionClick = (_index) => {
    const optionList =  Array.from(document.getElementsByClassName('home-tops-option'))
    if(_index < 0 || _index>=optionList.length) return
    const option =  document.getElementById(`tops-option-${_index}`)
    option.click()
    index = _index
}

setTimeout(() => {
    optionClick(index)
}, 0);

let touchTimer
let touchCount = 0
let touchStartY = 0
let touchEndY = 0
let touchStartPosition = 0
let touchEndPosition = 0
var debounceTimer = null
let touching
function debounce(fn, wait) {
    debounceTimer = null
    return function() {
        if(debounceTimer !== null) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fn, wait);
    }
}

mainWrapper.addEventListener('touchstart',(event)=>{
    touchTimer = setInterval(() => {
        touchCount++
    }, 1);
    touchStartPosition = event.changedTouches[0].clientX
    touchStartY = event.changedTouches[0].clientY
    const mainWrapper = document.getElementsByClassName('home-main-wrapper')[0]
    newScroll = mainWrapper.scrollLeft
    touching = true
})

let newScroll = 0
let oldScroll = 0

mainWrapper.addEventListener('scroll',(event)=>{
    if(debounceTimer !== null) clearTimeout(debounceTimer);
    const mainWrapper = document.getElementsByClassName('home-main-wrapper')[0]
    const contentWidth = document.getElementsByClassName('home-main-content-wrapper')[0].clientWidth
    debounce(()=>{
        if(mainWrapper.scrollLeft !== contentWidth*index){
            optionClick(index)
        }
    },500)()
    if(mainWrapper.scrollLeft > contentWidth*(index+0.25) && touching){
        mainWrapper.scrollLeft = contentWidth*(index+0.25)
        // optionClick(index + 1)
    }else
    if(mainWrapper.scrollLeft < contentWidth*(index-0.25) && touching){
        mainWrapper.scrollLeft = contentWidth*(index-0.25)
        // optionClick(index - 1)
    }
})

mainWrapper.addEventListener('touchend',(event)=>{
    if(debounceTimer !== null) clearTimeout(debounceTimer);
    clearInterval(touchTimer)
    touching = false
    touchEndPosition = event.changedTouches[0].clientX
    touchEndY = event.changedTouches[0].clientY
    const contentWidth = document.getElementsByClassName('home-main-content-wrapper')[0].clientWidth
    if(Math.abs(touchEndY - touchStartY) < 50){
        if(touchCount >= 10 &&touchCount <= 65 && Math.abs(touchEndPosition - touchStartPosition)>10){
            if(touchEndPosition>touchStartPosition){
                oldIndex = index
                optionClick(index - 1)
            }else if(touchEndPosition<touchStartPosition){
                oldIndex = index
                optionClick(index + 1)
            }
        }else
        if(touchCount > 65 && Math.abs(touchEndPosition - touchStartPosition)>contentWidth/6){
            if(touchEndPosition > touchStartPosition){
                oldIndex = index
                optionClick(index - 1)
            }else{
                oldIndex = index
                optionClick(index + 1)
            }
        }else{
            optionClick(index)
        }
    }
    touchCount = 0
    debounce(()=>{
        if(mainWrapper.scrollLeft % contentWidth !== 0){
            optionClick(index)
        }
    },200)()
})


window.addEventListener('scroll',()=>{
    const contentWrapper = document.getElementsByClassName('home-main-content-wrapper')[index]
    const title = document.getElementById('home-title')
    const tops = document.getElementById('home-tops')
    const search = document.getElementById('home-search')
    const scrollTop = window.scrollY
    const max = contentWrapper.clientHeight + title.clientHeight + tops.clientHeight + search.clientHeight - window.innerHeight
    if(scrollTop > max){
        window.scrollTo({
            top: max,
            behavior: 'instant'
        })
    }
    scrollList[index] = scrollTop
})
}
init()