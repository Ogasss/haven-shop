import { sendRequest } from '../hooks/sendRequest'
import { getCookie } from '../hooks/getCookie'
import { theConfirm } from '../hooks/theConfirm'

let status = 1

const init = () => {
    let indentList
    let total
    const init = async () =>{
        const {havenUid} = getCookie()
        if(havenUid === undefined){
            Location.href = '../../'
        }
        const response = await sendRequest(
            'POST',
            '/indent/get',
            {
                user_id: havenUid,
                status
            }
        )
        const _indentList = response.data
    
        const getIndentList = () => {
            return new Promise((resolve)=>{
                if(_indentList.length === 0){
                    resolve(undefined)
                }
                _indentList.forEach((item, index, arr)=>{
                    sendRequest(
                        'POST',
                        '/item/get',
                        {
                            condition:`id = ${item.item_id}`
                        }
                    ).then((response)=>{
                        item.name = response.data[0].direction
                        let _pngList = response.data[0].png.split(',')
                        _pngList = _pngList.map((item, index)=>{
                            return item.split('"')[1]
                        })
                        let _paramList = response.data[0].more_type_0.split(',').map((item)=>{
                            item = item.replace('"','')
                            item = item.replace('"','')
                            item = item.replace('[','')
                            item = item.replace(']','')
                            return item
                        })
                        let pngIndex 
                        _paramList.forEach((_item, _index)=>{
                            if(_item === item.more_type_0){
                                pngIndex = _index
                            }
                        })
                        item.png = _pngList[pngIndex]
                        item.chose = false
                        if(response.data[0].discount){
                            item.price = parseInt(response.data[0].price * response.data[0].discount)
                        }else{
                            item.price = response.data[0].price
                        }
                        if(index === arr.length-1){
                            resolve(arr.reverse())
                        }
                    })
                })
            })
        }
        const renderIndentList = (indentList) => {
            let indentHTML = ``
    
            const actionTotalPrice = () => {
                const totalPrice = document.getElementsByClassName('indent-footer-price')[0]
                total = 0
                indentList.forEach((item)=>{
                    if(item.chose){
                        total += item.price * item.number
                    }
                })
                totalPrice.innerText = total.toFixed(2)
            }
            actionTotalPrice()
        
            let allChose = false
            const renderAllChose = () => {
                let flag = true
                const allChoseImg = document.getElementsByClassName('indent-main-top-img')[0]
                indentList.forEach((item,index,arr)=>{
                    if(!item.chose){
                        flag = false
                    }
                    if(index === arr.length-1){
                        if(flag){
                            allChoseImg.src = '/png/chosed'
                        }else{
                            allChoseImg.src = '/png/chose'
                        }
                        allChose = flag
                    }
                })
            }
        
            const renderChose = () => {
                const choseImg = Array.from(document.getElementsByClassName('indent-main-option-chose-img'))
                choseImg.forEach((item, index)=>{
                    if(indentList[index].chose){
                        item.src = '/png/chosed'
                    }else{
                        item.src = '/png/chose'
                    }
                })
            }
        
            const actionAllChose = () => {
                if(!allChose){
                    indentList.map((item, index)=>{
                        item.chose = true
                        return item
                    })
                }else{
                    indentList.map((item, index)=>{
                        item.chose = false
                        return item
                    })
                }
                renderChose()
                allChose = !allChose
                renderAllChose()
                actionTotalPrice()
            }
        
        
        
            const actionChose = (item, index) => {
                const choseButton = item.getElementsByClassName('indent-main-option-chose')[0]
                const choseImg = choseButton.getElementsByClassName('indent-main-option-chose-img')[0]
                choseButton.addEventListener('click', ()=>{
                    indentList[index].chose = !indentList[index].chose
                    if(indentList[index].chose){
                        choseImg.src = '/png/chosed'
                    }else{
                        choseImg.src = '/png/chose'
                    }
                    renderAllChose()
                    actionTotalPrice()
                })
            }
            
            const actionNumber = (item, index) => {
                const addButton = item.getElementsByClassName('indent-main-option-number-action')[0]
                const reduceButton = item.getElementsByClassName('indent-main-option-number-action')[1]
                const number = item.getElementsByClassName('indent-main-option-number')[0]
                const price = item.getElementsByClassName('indent-main-option-price')[0]
                addButton.addEventListener('click',()=>{
                    indentList[index].number += 1
                    number.innerText = indentList[index].number
                    price.innerText =  '¥' + (indentList[index].number*indentList[index].price).toFixed(2)
                    actionTotalPrice()
                })
                reduceButton.addEventListener('click',()=>{
                    if(indentList[index].number === 1){
                        return
                    }
                    indentList[index].number -= 1
                    number.innerText = indentList[index].number
                    price.innerText =  '¥' + (indentList[index].number*indentList[index].price).toFixed(2)
                    actionTotalPrice()
                })
            }
    
            const indentTemplate =(item,index)=> `
            <div class="indent-main-option">
                <div class="indent-main-option-chose">
                    <img class="indent-main-option-chose-img" src=${item.chose ? '/png/chosed': '/png/chose'}>
                </div>
                <div class="indent-main-option-img-wrapper">
                    <img src=${item.png} class="indent-main-option-img">
                </div>
                <div class="indent-main-option-msg">
                    <span class="indent-main-option-title">
                        ${item.name.slice(0,23)}...
                    </span>
                    <div class="indent-main-option-param-wrapper">
                        <div class="indent-main-option-params-wrapper">
                        <div class="indent-main-option-params" id="params-1">${item.more_type_0}</div>
                        <div class="indent-main-option-params" id="params-2">${item.more_type_1}</div>
                        </div>
                    </div>
                    <div class="indent-main-option-price" id="price">¥${(item.price*item.number).toFixed(2)}</div>
                </div>
                <div class="indent-main-option-number-wrapper">
                    <div class="indent-main-option-number-action" id="number-add">
                        +
                    </div>
                    <div class="indent-main-option-number">
                        ${item.number}
                    </div>
                    <div class="indent-main-option-number-action" id="number-reduce">
                        -
                    </div>
                </div>
            </div>
            `

            let errFlag

            for(let i=0; i<indentList.length; i++){
                let item = indentList[i]
                if(item.png === undefined){
                    init()
                }else{
                    indentHTML += indentTemplate(item,i)
                }
            }
            
            const indentWrapper = document.getElementsByClassName('indent-main-wrapper')[0]
            indentWrapper.innerHTML = indentHTML

            const allChoseButton = document.getElementsByClassName('indent-main-top-chose')[0]
            allChoseButton.addEventListener('click', ()=>{
                actionAllChose()
            })

            const indentElementList = Array.from(document.getElementsByClassName('indent-main-option'))
            indentElementList.forEach((item,index)=>{
                actionChose(item, index)
                actionNumber(item, index)
            })

            const indentImgElementList = Array.from(document.getElementsByClassName('indent-main-option-img-wrapper'))
            indentImgElementList.forEach((item, index)=>{
                item.addEventListener('click',()=>{
                    sessionStorage.setItem('HavenBackToCar', 1)
                    location.href = `/app/item/?item_id=${indentList[index].item_id}`
                })
            })




            const getTargetItem = (itemId) => {
                return new Promise((resolve)=>{
                    sendRequest(
                        'POST',
                        '/item/get',
                        {
                            id: itemId
                        }
                    ).then((response)=>{
                        resolve(response.data)
                    })
                })
            }
            let targetItem
            let updateIndentType0
            let updateIndentType1
            let type0List
            let type1List
            let imgList
            let updateImg

            const indentParamsElementList = Array.from(document.getElementsByClassName('indent-main-option-param-wrapper'))
            const carPadWrapper = document.getElementsByClassName('item-into-car')[0]
            const carPad = document.getElementsByClassName('item-into-car-pad')[0]
            const closeButton = document.getElementsByClassName('close-button')[0]
            carPad.addEventListener('click',(e)=>{
                e.stopPropagation()
            })
            indentParamsElementList.forEach((item, index)=>{
                item.addEventListener('click',()=>{
                    updateIndentType0 = indentList[index].more_type_0
                    updateIndentType1 = indentList[index].more_type_1
                    getTargetItem(indentList[index].item_id).then((data)=>{
                        targetItem = data[0]
                        type0List = targetItem.more_type_0.split(",").map((item)=>{
                            item = item.replace('"','')
                            item = item.replace('"','')
                            item = item.replace('[','')
                            item = item.replace(']','')
                            return item
                        })
                        type1List = targetItem.more_type_1.split(",").map((item)=>{
                            item = item.replace('"','')
                            item = item.replace('"','')
                            item = item.replace('[','')
                            item = item.replace(']','')
                            return item
                        })
                        imgList = targetItem.png.split(',').map((item)=>{
                            item = item.replace('"','')
                            item = item.replace('"','')
                            item = item.replace('[','')
                            item = item.replace(']','')
                            return item
                        })
                        const optionListWrapper = document.getElementsByClassName('main-option-list-wrapper')
                        optionListWrapper[0].innerHTML = `
                        <div class="main-option-list" style="width: ${type0List.length * 2}rem"></div>
                        `
                        optionListWrapper[1].innerHTML = `
                        <div class="main-option-list" style="width: ${type1List.length * 2}rem"></div>
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
                        for(let i=0; i<type0List.length; i++){
                            colorHTML += colorTemplate(imgList[i])
                        }
                        optionList[0].innerHTML = colorHTML

                        for(let i=0; i<type1List.length; i++){
                            paramsHTML += paramsTemplate(type1List[i])
                        }
                        optionList[1].innerHTML = paramsHTML

                        const msgRender = (index) => {
                            const wrapper = document.getElementsByClassName('header-msg')[0]
                            wrapper.innerText = `已选 ${updateIndentType0} ${updateIndentType1}`
                            if(index !== undefined){
                                const chosedImg = document.getElementsByClassName('header-img')[0]
                                chosedImg.setAttribute('src',imgList[index])
                                updateImg = imgList[index]
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
                        clickStyle(colorOptions[type0List.indexOf(updateIndentType0)], type0List.indexOf(updateIndentType0), colorOptions)
                        clickStyle(paramsOptions[type1List.indexOf(updateIndentType1)], type1List.indexOf(updateIndentType1), paramsOptions)

                        colorOptions.forEach((item, index, arr)=>{
                            item.addEventListener('click',()=>{
                                updateIndentType0 = type0List[index]
                                msgRender(index)
                                clickStyle(item,index,arr)
                            })
                        })
                
                        paramsOptions.forEach((item, index, arr)=>{
                            item.addEventListener('click',()=>{
                                updateIndentType1 = type1List[index]
                                msgRender()
                                clickStyle(item,index,arr)
                            })
                        })

                        const submitButton = document.getElementsByClassName('submit-button')[0]
                        submitButton.addEventListener('click', ()=>{
                            indentList[index].more_type_0 = updateIndentType0
                            indentList[index].more_type_1 = updateIndentType1
                            const paramsWrapper = document.getElementsByClassName('indent-main-option-params-wrapper')[index]
                            const params_1 = paramsWrapper.getElementsByClassName('indent-main-option-params')[0]
                            const params_2 = paramsWrapper.getElementsByClassName('indent-main-option-params')[1]
                            params_1.innerText = updateIndentType0
                            params_2.innerText = updateIndentType1
                            const img = document.getElementsByClassName('indent-main-option-img')[index]
                            img.src = updateImg
                            closeButton.click()
                        })
                    })
                    carPadWrapper.style.display = 'block'
                })
            })
            
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
        }
    
        getIndentList().then((data)=>{
            indentList = data
            if(indentList === undefined){
                const indentWrapper = document.getElementsByClassName('indent-main-wrapper')[0]
                indentWrapper.innerHTML = `
                    <img class="indent-none-img" src="/png/indent_none">
                `
                const allChoseWrapper = document.getElementsByClassName('indent-main-tops')[0]
                allChoseWrapper.style.display = 'none'
            }else{
                renderIndentList(indentList)
            }
        })

        const searchInput = document.getElementsByClassName('home-search-input')[0]
        searchInput.addEventListener('input', ()=>{
            let keyword = searchInput.value
            let searchIndentList = indentList.filter((item)=>{
                return item.name.indexOf(keyword) !== -1
            })
            renderIndentList(searchIndentList)
        })
    }
    init()

    const indent_1Back = (fun) => {
        if(indentList === undefined){
            fun()
        }else{
            let body = JSON.stringify(indentList)
            sendRequest(
                'POST',
                '/indent/update',
                {
                    indentList:body
                }
            ).then((response)=>{
                setTimeout(() => {
                    fun()
                }, 0);
            })
        }
    }

    const backButton = document.getElementsByClassName('search-header-back-button')[0]
    backButton.addEventListener('click',()=>{
        indent_1Back(()=>{
            location.href = '../../'
        })
    })
    
    const tops = document.getElementsByClassName('indent-tops')[0]
    tops.addEventListener('click', ()=>{
        indent_1Back(()=>{})
    })

    const actionSubmit = (status, string) => {
        let flag = false
        let choseIndentList = []
        indentList.map((item,index)=>{
            if(item.chose){
                flag = true
                choseIndentList.push(item)
                if(status === 0){
                    item.status = status
                }
                if(status === 2){
                    item.status = status
                    flag = '进入结算'
                }
            }
        })
        if(flag === true) {
            theConfirm(string, 
                ()=>{
                    let body = JSON.stringify(choseIndentList)
                    sendRequest(
                        'POST',
                        '/indent/update',
                        {
                            indentList:body
                        }
                    ).then((response)=>{
                        setTimeout(() => {
                            history.go(0)
                        }, 0);
                    })
                }   
            )
            
        }else if(flag === '进入结算'){
            let value = JSON.stringify(choseIndentList)
            sessionStorage.setItem('choseIndentList', value)
            let body = JSON.stringify(choseIndentList)
                sendRequest(
                    'POST',
                    '/indent/update',
                    {
                        indentList:body
                    }
                ).then((response)=>{
                    setTimeout(() => {
                        sessionStorage.setItem('HavenBackToCar', 1)
                        location.href = '/app/indent_submit'
                    }, 0);
                })
        }
    }
    
    const deleteButton = document.getElementsByClassName('indent-delete-button')[0]
    deleteButton.addEventListener('click',()=>{
        actionSubmit(0, `确定将选中商品从购物车删除？`)
    })
    const submitButton = document.getElementsByClassName('indent-submit-button')[0]
    submitButton.addEventListener('click',()=>{
        actionSubmit(2, `确定支付？`)
    })
}
init()