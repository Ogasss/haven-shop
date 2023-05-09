import { sendRequest } from '../hooks/sendRequest'
import { getCookie } from '../hooks/getCookie'

const init = async () =>{
    const backButton = document.getElementsByClassName('item-back-button')[0]
    backButton.addEventListener('click',()=>{
        if(document.referrer.split('/')[4] === 'indent_1'){
            location.href = document.referrer
        }else{
           history.go(-1) 
        }
    })

    window.addEventListener('scroll',()=>{
        if(window.scrollY >= 40){
            const hiddenTops = document.getElementsByClassName('item-header-hidden-tops')[0]
            hiddenTops.style.display = 'flex'
        }else{
            const hiddenTops = document.getElementsByClassName('item-header-hidden-tops')[0]
            hiddenTops.style.display = 'none'
        }
    })






    const itemId = parseInt(window.location.href.split('?')[1].split('=')[1])
    const {data} = await sendRequest('POST','/item/get',{
        id: itemId
    })
    let image = data[0]
    const price = document.getElementsByClassName('item-main-the-price')[0]
    const oldPrice = document.getElementsByClassName('item-main-old-price')[0]
    if(image.discount === null){
        image.price.toFixed(2)
        price.innerText = image.price.toFixed(2)
        oldPrice.remove()
    }else{
        price.innerText = (image.price * image.discount).toFixed(2)
        oldPrice.innerText = image.price.toFixed(2)
    }
    





    
    oldPrice.innerText = image.price.toFixed(2)
    const buyer = document.getElementsByClassName('item-main-buyer-number')[0]
    buyer.innerText = `${image.volume}付款`
    const wanter = document.getElementsByClassName('item-main-want-number')[0]
    wanter.innerText = `${image.wanter}收藏`
    const tag = document.getElementsByClassName('item-main-tag')[0]
    image.tag === null ? tag.style.border = 'none' : tag.innerText = image.tag
    const direction = document.getElementsByClassName('item-main-text-row')[0]
    direction.innerText = image.direction
    const brand = document.getElementsByClassName('item-main-volume-word')[0]
    brand.innerText = `${image.brand}品牌优质商品`







    const imgList = JSON.parse(image.png)
    const imgWrapper = document.getElementsByClassName('item-main-img-row-wrapper')[0]
    imgWrapper.innerHTML = `
    <div class="item-main-img-row-images" style="width: ${100*imgList.length}vw">
                
    </div>
    `
    const listWrapper = document.getElementsByClassName('item-main-img-row-list-wrapper')[0]
    listWrapper.innerHTML = `
        <div class="item-main-img-row-list" style="width: ${0.13 + (1.5 + 0.26)*imgList.length}rem">

        </div>
    `

    let imgListTemplate = (item,index) => `
        <span class="img-row-list-option" >
            <img id="item-img-${index}" src='${item}'>
        </span>
    `
    let imgOptionTemplate = (item,index) => `
    <span class="item-main-img-option">
        <img id="item-img-${index}" src='${item}'>
    </span>
    `
    let imgListHTML = ``
    let imgOptionHTML = ``
    imgList.forEach((item, index)=>{
        imgListHTML += imgListTemplate(item,index)
        imgOptionHTML += imgOptionTemplate(item,index)
    });
    const imgListWrapper = document.getElementsByClassName('item-main-img-row-list')[0]
    const imgOptionWrapper = document.getElementsByClassName('item-main-img-row-images')[0]
    






    let imgIndex = 0
    let oldImgIndex = 0
    imgListWrapper.innerHTML = imgListHTML
    imgOptionWrapper.innerHTML = imgOptionHTML
    const itemListArr = Array.from(document.getElementsByClassName('img-row-list-option'))
    const imgOptionClick = (index) => {
        image = itemListArr[index]
        const width = document.getElementsByClassName('item-main-img-option')[0].clientWidth
        imgWrapper.scrollTo({
            left:width * index,
            behavior: 'smooth',
        })
        image.style.border = `1px solid rgb(160, 160, 160)`
        imgIndex = index
        itemListArr.forEach((item, index)=>{
            if(index !== imgIndex){
                item.style.border = `1px solid rgb(220, 220, 220)`
            }
        })
    }
    imgOptionClick(imgIndex)
    itemListArr.forEach((item, index)=>{
        item.addEventListener('click',()=>{
            oldImgIndex = imgIndex
            imgOptionClick(index)
        })
    })
    








    const showImgWrapper = document.getElementsByClassName('show-image-wrapper')[0]
    const showImg = document.getElementsByClassName('show-image')[0]
    const itemImgsArr = Array.from(document.getElementsByClassName('item-main-img-option'))
    let touchStartPosition
    let touchEndPosition
    itemImgsArr.forEach((item, index)=>{
        item.addEventListener('click',()=>{
            const src = item.childNodes[1].getAttribute('src')
            showImg.setAttribute('src',src)
            showImgWrapper.style.display = 'block'
        })
        item.addEventListener('touchstart',(event)=>{
            touchStartPosition = event.changedTouches[0].clientX
        })
        item.addEventListener('touchend',(event)=>{
            touchEndPosition = event.changedTouches[0].clientX
            if(Math.abs(touchEndPosition - touchStartPosition) >= 60){
                if(touchEndPosition > touchStartPosition){
                    if(imgIndex > 0){
                        oldImgIndex = imgIndex
                        imgOptionClick(imgIndex - 1)
                    }
                }else{
                    if(imgIndex < itemListArr.length-1){
                        oldImgIndex = imgIndex 
                        imgOptionClick(imgIndex + 1)
                    }
                }
            }
        })
    })





    showImgWrapper.addEventListener('click',()=>{
        showImgWrapper.style.animation = 'hidden 0.3s ease'
        setTimeout(() => {
            showImgWrapper.style.display = 'none'
            showImgWrapper.style.animation = ''
        }, 250);
    })




    const setActionButton = async () => {
        const carButton = document.getElementsByClassName('item-footer-car-button')[0]
        const buyButton = document.getElementsByClassName('item-footer-buy-button')[0]

        const carPadWrapper = document.getElementsByClassName('item-into-car')[0]
        const carPad = document.getElementsByClassName('item-into-car-pad')[0]
        const closeButton = document.getElementsByClassName('close-button')[0]
        closeButton.addEventListener('click',()=>{
            carPad.style.animation = 'leave 0.3s ease'
            setTimeout(() => {
                carPadWrapper.style.display = 'none'
                carPad.style.animation = 'enter 0.3s ease'
            }, 250);
        })
        carPadWrapper.addEventListener('click',()=>{
            carPad.style.animation = 'leave 0.3s ease'
            setTimeout(() => {
                carPadWrapper.style.display = 'none'
                carPad.style.animation = 'enter 0.3s ease'
            }, 250);
        })
        
        const submitButton = document.getElementsByClassName('submit-button')[0]
        carButton.addEventListener('click',()=>{
            submitButton.innerText = '加入购物车'
            carPadWrapper.style.display = 'block'
        })
        buyButton.addEventListener('click',()=>{
            submitButton.innerText = '下单购买'
            carPadWrapper.style.display = 'block'
        })
        carPad.addEventListener('click',(e)=>{
            e.stopPropagation()
        })

        const colorList = JSON.parse(data[0].more_type_0)
        const paramsList = JSON.parse(data[0].more_type_1)

        const optionListWrapper = document.getElementsByClassName('main-option-list-wrapper')
        optionListWrapper[0].innerHTML = `
        <div class="main-option-list" style="width: ${colorList.length * 2}rem"></div>
        `
        optionListWrapper[1].innerHTML = `
        <div class="main-option-list" style="width: ${paramsList.length * 2}rem"></div>
        `
        const optionList = document.getElementsByClassName('main-option-list')
        
        let colorHTML = ``
        const colorTemplate = (src) => `
        <div class="main-option colorOption">
            <img class="main-option-img" src=${src}>
        </div>
        ` 

        let paramsHTML = ``
        const paramsTemplate = (text) => `
        <div class="main-option paramsOption">
            <div class="params">${text}</div>
        </div>
        `
        for(let i=0; i<colorList.length; i++){
            colorHTML += colorTemplate(imgList[i])
        }
        optionList[0].innerHTML = colorHTML

        for(let i=0; i<paramsList.length; i++){
            paramsHTML += paramsTemplate(paramsList[i])
        }
        optionList[1].innerHTML = paramsHTML

        let color = colorList[0]
        let params = paramsList[0]
        let number = 1
        let price
        const getPrice = () => {
            if(data[0].discount !== null){
                price = (data[0].price*data[0].discount*number).toFixed(2)
            }else{
                price = (data[0].price*number).toFixed(2)
            }
        }
        getPrice()

        const msgRender = (index) => {
            getPrice()
            const numberWrapper = document.getElementsByClassName('action-number')[0]
            numberWrapper.innerHTML = number
            const wrapper = document.getElementsByClassName('header-msg')[0]
            wrapper.innerText = `已选 ${color} ${params} ¥${price}`
            if(index !== undefined){
                const chosedImg = document.getElementsByClassName('header-img')[0]
            chosedImg.setAttribute('src',imgList[index])
            }
        }
        msgRender(0)
    
        const colorOptions = Array.from(document.getElementsByClassName('colorOption'))
        const paramsOptions = Array.from(document.getElementsByClassName('paramsOption'))

        const clickStyle = (item,index,arr) => {
            item.style.border = '3px solid rgb(50,50,50)'
            arr.forEach((_item, _index)=>{
                if(_index !== index){
                    _item.style.border = '3px solid white'
                }
            })
        }        

        colorOptions.forEach((item, index, arr)=>{
            clickStyle(colorOptions[0],0,arr)
            item.addEventListener('click',()=>{
                color = colorList[index]
                msgRender(index)
                clickStyle(item,index,arr)
            })
        })

        paramsOptions.forEach((item, index, arr)=>{
            clickStyle(paramsOptions[0],0,arr)
            item.addEventListener('click',()=>{
                params = paramsList[index]
                msgRender()
                clickStyle(item,index,arr)
            })
        })

        const reduceButton = document.getElementsByClassName('action-reduce')[0]
        reduceButton.addEventListener('click',()=>{
            if(number!==1){
                number-=1
            }
            msgRender()
        })
        const addButton = document.getElementsByClassName('action-add')[0]
        addButton.addEventListener('click', ()=>{
            number += 1
            msgRender()
        })
        
        const cookies = getCookie()
        if(cookies.havenUid === undefined){
            Location.href = '../../'
        }
        let from_user = cookies.havenUid
        if(cookies.havenUid === undefined && cookies.havenToken === undefined){
            buyButton.innerText = `请先登录`
            buyButton.style.opacity = '0.4'
            carButton.style.opacity = '0.4'
            buyButton.style.pointerEvents = 'none'
            carButton.style.pointerEvents = 'none'
        }

        submitButton.addEventListener('click',()=>{
            let item = data[0]
            let indent = {
                item_id: data[0].id,
                number: number,
                more_type_0: color,
                more_type_1: params,
                from_user: from_user,
                status: 1,
            }
            let newIndent
            if(submitButton.innerText === '加入购物车'){
                indent.status = 1
                sendRequest(
                    'POST',
                    '/indent/create',
                    indent
                ).then(()=>{
                    closeButton.click()
                })
            }else{
                indent.status = 2
                sendRequest(
                    'POST',
                    '/indent/create',
                    indent
                ).then(()=>{
                    sendRequest(
                        'POST',
                        '/indent/getNew',
                    ).then((response)=>{
                        newIndent = response.data[0]
                        newIndent.name = item.direction
                        newIndent.price = item.price * item.discount
                        let _pngList = item.png.split(',')
                        _pngList = _pngList.map((item, index)=>{
                            return item.split('"')[1]
                        })
                        let _paramList = item.more_type_0.split(',').map((item)=>{
                            item = item.replace('"','')
                            item = item.replace('"','')
                            item = item.replace('[','')
                            item = item.replace(']','')
                            return item
                        })
                        let pngIndex 
                        _paramList.forEach((_item, _index)=>{
                            if(_item === newIndent.more_type_0){
                                pngIndex = _index
                            }
                        })
                        newIndent.png = _pngList[pngIndex]
                        sessionStorage.setItem('choseIndentList',JSON.stringify([newIndent]))
                        if(newIndent.name === undefined){
                            console.log(newIndent)
                            sessionStorage.removeItem('choseIndentList')
                            submitButton.click()
                        }
                        else{
                            location.href = '/app/indent_submit'
                        }
                    })
                })
            }
        })
    }
    setActionButton()
}
init()