import { sendRequest } from '../hooks/sendRequest'

const theKey = window.location.href.split('?')[1].split('=')[0]
const theType = decodeURIComponent(window.location.href.split('?')[1].split('=')[1])

const backButton = document.getElementsByClassName('more-back-button')[0]
backButton.addEventListener('click',()=>{
    location.href = '/app/search'
})

const itemListInit = async () => {
    const needHiddenWrapper = document.getElementsByClassName('more-category-wrapper')[0]
    needHiddenWrapper.style.display = 'none'
    
    let itemList = []

    if(theKey === 'category'){
        const type_1Response = await sendRequest(
            'POST',
            '/category/get',
            {
                condition: `href = '${theType}'`
            }
        )
        document.getElementsByClassName('more-header-title')[0].innerText = type_1Response.data[0].title

        const type_2Response = await sendRequest(
            'POST',
            '/category/get',
            {
                condition: `theFrom is null`,
            }
        )
        const type_2List = type_2Response.data.map((item)=>{
            return item.href
        })
        let theItemResponse
        type_2List.indexOf(theType) === -1 ? 
        theItemResponse = await sendRequest(
            'POST',
            '/item/get',
            {
                condition: `type_1 = '${theType}'`
            }
        ):
        theItemResponse = await sendRequest(
            'POST',
            '/item/get',
            {
                condition: `${theType} = 1`
            }
        )
        itemList = theItemResponse.data
    }else{
        let title
        theType.length > 12 ? 
        title = `${theType.slice(0,6)}...${theType.slice(theType.length-6,theType.length)}` :
        title = `${theType}`
        document.getElementsByClassName('more-header-title')[0].innerText = title
        
        if(theType.length <= 1 || theType.length >= 10){
            let response = await sendRequest(
                'POST',
                '/item/get',
                {
                    condition: `direction LIKE '%${theType}%'`
                }
            )
            itemList = response.data
        }else{
            let splitArr = []

            for(let i=0; i<theType.length; i++){
                for(let j=i+1; j<=theType.length; j++){
                    const sliceStr = theType.slice(i,j);
                    splitArr.push(sliceStr);
                }
            }

            if(theType.length >2){
                splitArr = splitArr.filter((item)=>{
                    return item.length > 1
                })
            }

           if(splitArr.indexOf('色') !== -1){
                const index = splitArr.indexOf('色')
                splitArr.splice(index,1)
            }

            splitArr.sort((a, b)=>{
                return a.length - b.length
            })

            const getItemList = async () =>{
                let promises = []
                splitArr.forEach((item)=>{
                    promises.push(
                        sendRequest(
                            'POST',
                            '/item/get',
                            {
                                condition: `direction LIKE '%${item}%'`
                            }
                        )
                    )
                })
                const itemListParts = await Promise.all(promises)
                return itemListParts
            }
            const itemListParts = await getItemList()
            let items = []
            itemListParts.forEach((item)=>{
                items = items.concat(Array.from(item.data))
            })
            let itemsIdList =  Array.from(new Set(items.map((item)=>{
                return item.id
            })))
            const newItems = itemsIdList.map((id)=>{
                return items.find((item) => item.id === id)
            })
            itemList = newItems
        }
    }

    const renderItemList = (itemList) => {
        let itemHTML = ``
        const itemTemplate = (item) => `
        <div class="more-main-item">
            <a href='/app/item/?itemId=${item.id}'>
                <div class="more-main-item-img-wrapper">
                    <img src=${JSON.parse(item.png)[0]} class="more-main-item-img">
                </div>
                ${
                    item.tag ? 
                    `
                    <span class="home-main-item-tag" style="width: ${item.tag.length*0.28}rem">${item.tag}</span>
                    `:
                    `<div style="height: 0.25rem"></div>`
                }
                
                <div class="home-main-item-direction">
                    ${
                        item.direction.length > 23  ?
                        `${item.direction.slice(0,23)}...` :
                        `${item.direction}`
                    }
                </div>
                <div class="home-main-item-footer">
                    <div class="item-price-wrapper">
                    ${
                        item.discount ? 
                        `<span class="home-main-item-price">
                            ¥${(item.price*item.discount).toFixed(2)}
                        </span>
                        <span class="home-main-item-discount">
                            ¥${item.price}
                        </span>
                        `:
                        `
                        <span class="home-main-item-price">
                            ¥${item.price}
                        </span>
                        `
                    }
                    </div>
                    
                    <div class="home-main-item-popular">
                        ${item.volume}付款
                    </div> 
                </div>
            </a>
        </div>
        `
        
        itemList.forEach((item) => {
            itemHTML += itemTemplate(item)
        })
        const itemListWrapper = document.getElementsByClassName('more-main-content-option')[0]
        if(itemList.length === 0){
            const wrapper = document.getElementsByClassName('more-main-content')[0]
            wrapper.style.marginLeft = '-30vh'
            wrapper.innerHTML = `
            <img class="indent-none-img" src="/png/indent_none">
            `
        }else{
            itemListWrapper.innerHTML = itemHTML
        }
    }
    renderItemList(itemList)

    let topsList = Array.from(document.getElementsByClassName('more-main-tops-option'))
    let volumeList
    let wanterList
    let newList
    let expensiveList
    let cheapList
    const updateList = () => {
        volumeList = [...itemList].sort((a, b)=>{
            return b.volume - a.volume
        })
        wanterList = [...itemList].sort((a, b)=>{
            return b.wanter - a.wanter
        })
        newList = [...itemList].sort((a, b)=>{
            return b.id - a.id
        })
        cheapList = [...itemList].sort((a, b)=>{
            let price_a = a.discount!==null ? (a.discount * a.price).toFixed(2) : a.price.toFixed(2)
            let price_b = b.discount!==null ? (b.discount * b.price).toFixed(2) : b.price.toFixed(2)
            return price_a - price_b
        })
        expensiveList = [...cheapList].reverse()
    }
    updateList()

    let theStatus = 'initial'
    let ListArr = [
        ['volume',volumeList],
        ['wanter',wanterList],
        ['new',newList]
    ]
    topsList.forEach((item, index, arr)=>{
        const top = document.getElementsByClassName('more-main-top-img')[0]
        if(index < arr.length-1){
            item.addEventListener('click',()=>{
                if(theStatus === 'expensive' || theStatus === 'cheap'){
                    top.style.visibility = 'hidden',
                    theStatus = 'initial'
                }
                if(theStatus === ListArr[index][0]){
                    renderItemList(itemList)
                    topsList.forEach(_item=>{
                        _item.style.color = 'black'
                    })
                    theStatus = 'initial'
                }else{
                    renderItemList(ListArr[index][1])
                    topsList.forEach((_item,_index)=>{
                        index !== _index 
                        ? _item.style.color = 'black'
                        : _item.style.color = 'rgb(20, 165, 160)'
                    })
                    theStatus = ListArr[index][0]
                }
            })
        }else{
            item.addEventListener('click',()=>{
                if(theStatus !== 'expensive' && theStatus !=='cheap'){
                    renderItemList(expensiveList)
                    topsList.forEach((_item,_index)=>{
                        index !== _index 
                        ? _item.style.color = 'black'
                        : _item.style.color = 'rgb(20, 165, 160)'
                    })
                    top.style.visibility = 'visible'
                    top.style.transform = 'none'
                    theStatus = 'expensive'
                }else 
                if(theStatus === 'expensive'){
                    renderItemList(cheapList)
                    topsList.forEach((_item,_index)=>{
                        index !== _index 
                        ? _item.style.color = 'black'
                        : _item.style.color = 'rgb(20, 165, 160)'
                    })
                    top.style.transform = 'rotate(180deg)'
                    theStatus = 'cheap'
                }else
                if(theStatus === 'cheap'){
                    renderItemList(itemList)
                    topsList.forEach((item)=>{
                        item.style.color = 'black'
                    })
                    top.style.visibility = 'hidden',
                    theStatus = 'initial'
                }
            })
        }
    })   
} 

const categoryListInit = async () => {
    const needHiddenWrapper = document.getElementsByClassName('more-main-wrapper')[0]
    needHiddenWrapper.style.display = 'none'
    document.getElementsByClassName('more-header-title')[0].innerText = '所有分类'
    
    const getCategoryList = (theFrom) => {
        return new Promise((resolve)=>{
            sendRequest(
                'POST',
                '/category/get',
                {
                    condition:`theFrom = '${theFrom}'`
                }
            ).then((response)=>{
                resolve(response.data)
            })
        })
    }
    const optionList = [
        ['fashion', '潮服'],
        ['accessories', '配饰'],
        ['shoes', '鞋类'],
        ['wrap', '包袋'],
        ['watch','钟表']
    ]
    // const fashionCategory = await getCategoryList('fashion')
    // const accessoriesCategory = await getCategoryList('accessories')
    // const shoesCategory = await getCategoryList('shoes')
    // const wrapCategory = await getCategoryList('wrap')
    // const watchCategory = await getCategoryList('watch')

    const optionListRender = () => {
        const listTopWrapper = document.getElementsByClassName('more-category-list-wrapper')[0]
        listTopWrapper.innerHTML=`
            <div class="more-category-list" style="height: ${optionList.length-0.52}rem">
            </div>
        `
        const listWrapper = document.getElementsByClassName('more-category-list')[0]
        let optionHTML = ``
        const optionTemplate =(item)=> `
        <div class="more-category-option-wrapper" id="${item[0]}">
            <div class="more-category-option">
                ${item[1]}
                <div class="more-category-option-line"></div>
            </div>
        </div>
        `
        optionList.forEach(item=>{
            optionHTML += optionTemplate(item)
        })
        listWrapper.innerHTML = optionHTML

        let option = ''
        const optionElementList = Array.from(document.getElementsByClassName('more-category-option-wrapper'))
        optionElementList.forEach((item)=>{
            item.addEventListener('click',()=>{
                choseOption(item.id)
            })
        })
        
        const contentRender = async (theFrom) => {
            let title
            optionList.forEach((item)=>{
                if(item[0] === theFrom){
                    title = item[1]
                }
            })
            const contentTopWrapper = document.getElementsByClassName('more-category-items-wrapper')[0]
            const contentList = await getCategoryList(theFrom)
            contentTopWrapper.innerHTML = `
                <div class="more-category-content-wrapper" style="
                    height: ${ parseInt(contentList.length/3)*2 + 0.35 + 0.52 }rem">
                    <div class="more-category-content">
                        <div class="more-category-title">
                            ${title}
                        </div>
                        <div class="more-category-items">
                        </div>
                    </div>
                </div>
            `
            let contentHTML = ``
            const contentTemplate = (item) => {
                return `
                <a class="more-category-item-wrapper" href='/app/more/?category=${item.href}'>
                    <div class="more-category-item-image-wrapper">
                        <img src=${item.img} class="more-category-item-image">
                    </div>
                    <div class="more-category-item-word">
                        ${item.type}
                    </div>
                </a>
                `
            }
            const contentWrapper = document.getElementsByClassName('more-category-items')[0]
            contentList.forEach((item,index,arr)=>{
                sendRequest(
                    'POST',
                    '/item/get',
                    {
                        condition: `type_1 = '${item.href}'`
                    }
                ).then((response)=>{
                    if(response.data[0] !== undefined){
                        item.img = response.data[0].png.split(',')[0].split('"')[1]
                        contentHTML += contentTemplate(item)
                    }
                    if(index === arr.length-1){
                        contentWrapper.innerHTML = contentHTML
                    }
                })
            })
        }
        const choseOption = (theFrom) => {
            option = theFrom
            optionElementList.forEach((item)=>{
                if(item.id !== theFrom){
                    item.className = 'more-category-option-wrapper'
                }else{
                    item.className = 'more-category-option-wrapper-active'
                }                
            })
            contentRender(theFrom)
        }

        choseOption(optionList[0][0])
    }
    optionListRender()
    
    
} 

if(theKey === 'category'){
    if(theType === 'none'){
        categoryListInit()
    }else{
        itemListInit()
    }
}
else if(theKey === 'keyword'){
    itemListInit()
}