import { sendRequest } from '../hooks/sendRequest'
import { theAlert } from '../hooks/theAlert'

const init = async () => {
const backButton = document.getElementsByClassName('indent-header-back-button')[0]
backButton.addEventListener('click',()=>{
    if(document.referrer.split('/')[4] === 'indent_1'){
        location.href = document.referrer
    }else{
        sessionStorage.removeItem('choseIndentList')
        history.go(-1)
    }
})

const indentList = JSON.parse(sessionStorage.getItem('choseIndentList'))
if(indentList === null){
    location.href = '../../'
}
const user_id = JSON.parse(indentList[0].from_user)
const response = await sendRequest(
    'POST',
    '/user/get',
    {
        uid: user_id
    }
)
const {address} = response.data
let choseAddress
const getIndentList = () => {
    return new Promise((resolve)=>{
        indentList.forEach((item, index, arr)=>{
            const {item_id} = item
            sendRequest(
                'POST',
                '/item/get',
                {
                    condition: `id = '${item_id}'`
                }
            ).then((response)=>{
                const itemList = response.data[0]
                item.old_price = itemList.price
                item.discount = itemList.discount
                item.tag = itemList.tag
                item.brand = itemList.brand
                item.total_price = item.number * item.price
                item.discount_price = (itemList.price - item.price) * item.number
                if(index === arr.length-1){
                    resolve(indentList)
                }
            })
        })
    })
}
let indentHTML = ``
const indentTemplate = (item) =>{
    return `
    <div class="indent-main-indent-option">
            <div class="indent-main-indent-wrapper">
                <div class="indent-main-indent-row-1">
                    <div class="indent-main-indent-img-wrapper">
                        <img src=${item.png} class="indent-main-indent-img">
                    </div>
                    <div class="indent-main-indent-msg-wrapper">
                        <div class="indent-main-indent-title-wrapper">
                            <span class="indent-main-indent-title">
                                ${item.name.slice(0,25)}...
                            </span>
                        </div>
                        
                        <div class="indent-main-indent-params-wrapper">
                            <div class="indent-main-indent-type">
                                ${item.more_type_0}
                            </div>
                            <div class="indent-main-indent-type">
                                ${item.more_type_1}
                            </div>
                            <div class="indent-main-indent-number">
                                数量:${item.number}
                            </div>
                        </div>
                        <div class="indent-main-indent-tags-wrapper">
                        ${
                            item.tag
                            ?
                                `
                                <div class="indent-main-indent-tag">
                                    ${item.tag}
                                </div>
                                `
                            :
                            `
                                <div class="indent-main-indent-tag" style="border: none">
                                </div>
                            `
                        }
                        </div>  
                    </div>
                    
                    <div class="indent-main-indent-old-price-wrapper">
                        <div></div>
                        <div class="indent-main-indent-old-price">¥ ${item.old_price.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            <div class="indent-main-indent-discount-price-wrapper">
                <span class="indent-main-indent-discount-price-word">
                    优惠
                </span>
                <span class="indent-main-indent-discount-price">
                    - ¥ ${item.discount_price.toFixed(2)}
                </span>
            </div>
            <div class="indent-main-indent-price-wrapper">
                <div></div>
                <div>
                    <span class="indent-main-indent-price-word">
                        小计：
                    </span>
                    <span class="indent-main-indent-price">
                        ¥ ${item.total_price.toFixed(2)}
                    </span>
                </div>
            </div>
    </div>
    `
}
let totalPrice = 0
let discountPrice = 0
getIndentList().then((indentList)=>{
    indentList.forEach((item,index)=>{
        // console.log(item)
        totalPrice += item.total_price
        indentHTML += indentTemplate(item)
    })
    
    const indentListWrapper = document.getElementsByClassName('indent-main')[0]
    indentListWrapper.innerHTML += indentHTML
    
    const totalPriceWrapper = document.getElementsByClassName('indent-footer-total-msg-line-1-2')[0]
    totalPriceWrapper.innerText = `¥${totalPrice.toFixed(2)}`

    const discountPriceWrapper = document.getElementsByClassName('indent-footer-total-msg-line-2')[0]
    discountPriceWrapper.innerText = `优惠：¥${discountPrice.toFixed(2)}`

    const indentNumberWrapper = document.getElementsByClassName('indent-footer-total-msg-line-1-3')[0]
    indentNumberWrapper.innerText = `共${indentList.length}单`

    const indentImgElementList = Array.from(document.getElementsByClassName('indent-main-indent-img-wrapper'))
    indentImgElementList.forEach((item, index)=>{
        item.addEventListener('click',()=>{
            location.href = `/app/item/?item_id=${indentList[index].item_id}`
        })
    })
    
    let addressList
    let noAddress = true
    const addressTextWrapper = document.getElementsByClassName('indent-main-address-word-wrapper')[0]
    const addressImg = document.getElementsByClassName('indent-main-address-img')[0]
    if(address === undefined | address === null | address === ''){
        addressTextWrapper.innerText = '您还没有填写收货地址'
        noAddress = false
    }else{
        console.log('触发')
        addressList = address.split(',')
        addressList = addressList.map((item)=>{
            let arr = item.split(':')
            let newItem = {}
            newItem.tag = arr[0]
            arr = arr[1].split('-')
            newItem.address = arr[0]
            newItem.name = arr[1]
            newItem.phone = arr[2]
            return newItem
        })
        choseAddress = addressList[0]
        let addressText = `${choseAddress.tag}-${choseAddress.address.replace('/','')}`
        addressTextWrapper.innerText = addressText.length > 17 ? addressText.slice(0,17)+'...' : addressText
        addressImg.src = 
        choseAddress.tag === '家'   ? '/png/home' :
        choseAddress.tag === '学校' ? '/png/school' :
        choseAddress.tag === '公司' ? '/png/company' :
        choseAddress.tag === '对象' ? '/png/lover' :
        choseAddress.tag === '父母' ?' /png/parents' :
        '/png/address'
    }
    const addressPadWrapper = document.getElementsByClassName('indent-chose-address')[0]
    const addressOpenButton = document.getElementsByClassName('indent-main-address-msg')[0]
    addressOpenButton.addEventListener('click', ()=>{
        if(address === undefined || address === '' || address === null){
            location.href = '/app/address_add'
        }else{
            addressPadWrapper.style.display = 'block'
        }
    })

    if(noAddress){
        const addressPad = document.getElementsByClassName('indent-chose-address-pad')[0]
        const addressCloseButton = document.getElementsByClassName('address-pad-header-close-button')[1]
        const addressSubmitButton = document.getElementsByClassName('indent-chose-address-pad-button')[0]
        const addressHTMLWrapper = document.getElementsByClassName('indent-chose-address-pad-main')[0]
        
        addressPad.addEventListener('click', (event)=>{
            event.stopPropagation()
        })
        const closeAddressChosePad = () => {
            addressPad.style.animation = 'leave 0.3s ease'
            setTimeout(() => {
                addressPadWrapper.style.display = 'none'
                addressPad.style.animation = 'enter 0.3s ease'
            }, 250);
        }

        let addressHTML = ``
        const addressTemplate = (item) => {
            return `
            <div class="indent-chose-address-option">
                <div class="indent-chose-address-option-img-wrapper">
                    <div class="option-address-img-wrapper">
                        <img src=${
                            item.tag === '家'   ? '/png/home' :
                            item.tag === '学校' ? '/png/school' :
                            item.tag === '公司' ? '/png/company' :
                            item.tag === '对象' ? '/png/lover' :
                            item.tag === '父母' ?' /png/parents' :
                            '/png/address'
                        } class="indent-chose-address-option-img">
                    </div>
                </div>
                <div class="indent-chose-address-option-msg">
                    <div class="indent-chose-address-option-user-msg">
                        <span class="option-user-msg">
                            <span class="option-user-msg-name">
                                ${item.name}  
                            </span>
                            <span class="option-user-msg-phone">
                                ${item.phone.slice(0,3)}****${item.phone.slice(7,11)}
                            </span>
                        </span>
                        <span class="option-hidden-img-wrapper">
                            <img src="/png/eye-hidden" class="option-hidden-img">
                        </span>
                    </div>
                    <div class="indent-chose-address-option-address-msg">
                        ${
                            item.tag === '' ? '' : 
                            `
                            <span class="option-address-tag">
                                ${item.tag}
                            </span>
                            `
                        }

                        <span class="option-address-address">
                            ${item.address.replace('/','')}
                        </span>
                    </div>
                </div>
            </div>
            `
        }
    
        addressList.forEach((item)=>{
            addressHTML += addressTemplate(item)
        })
        addressHTMLWrapper.innerHTML = addressHTML

        addressPadWrapper.addEventListener('click', ()=>{
            closeAddressChosePad()
        })
        addressCloseButton.addEventListener('click', ()=>{
            closeAddressChosePad()
        })

        const addressEyeImg = Array.from(document.getElementsByClassName('option-hidden-img'))
        const addressPhoneButton = Array.from(document.getElementsByClassName('option-hidden-img-wrapper'))
        const addressPhoneWrapper = Array.from(document.getElementsByClassName('option-user-msg-phone'))
        addressPhoneButton.forEach((item, index)=>{
            item.addEventListener('click', (event)=>{
                event.stopPropagation()
                const eyeImg = addressEyeImg[index]
                const phoneWrapper = addressPhoneWrapper[index]
                eyeImg.src = '/png/eye-show'
                const phone = addressList[index].phone
                phoneWrapper.innerText = phone
                setTimeout(() => {
                    eyeImg.src = '/png/eye-hidden'
                    phoneWrapper.innerText = `${phone.slice(0,3)}****${phone.slice(7,11)}`
                }, 1500);
            })
        })

        const addressElementList = Array.from(document.getElementsByClassName('indent-chose-address-option'))
        let choseIndex
        const actionChoseAddress = (index) => {
            addressElementList.forEach((item,_index)=>{
                if(_index === index){
                    item.className = 'indent-chose-address-option-active'
                }else{
                    item.className = 'indent-chose-address-option'
                }
            })
            choseIndex = index
        }
        actionChoseAddress(0)
        addressElementList.forEach((item,index)=>{
            item.addEventListener('click',()=>{
                actionChoseAddress(index)
            })
        })

        const addressRender = () => {
            choseAddress = addressList[choseIndex]
            addressTextWrapper.innerText = choseAddress.address
            let png = choseAddress.tag === '家'   ? '/png/home' :
            choseAddress.tag === '学校' ? '/png/school' :
            choseAddress.tag === '公司' ? '/png/company' :
            choseAddress.tag === '对象' ? '/png/lover' :
            choseAddress.tag === '父母' ?' /png/parents' :
            '/png/address'
            addressImg.src = png
            addressCloseButton.click()
        }
        addressSubmitButton.addEventListener('click', ()=>{
            addressRender()
        })
    }

    const submitButton = document.getElementsByClassName('indent-footer-action-button')[0]
    submitButton.addEventListener('click',async ()=>{
        let chart = sessionStorage.getItem('choseIndentList')
        if(chart === null){
            location.href = '../../'
        }
        if(address === undefined || address === null || address === ''){
            theAlert('您还没有填写收货地址')
        }else{
            indentList.forEach((item, index, arr)=>{
                sendRequest(
                    'POST',
                    '/indent/update',
                    {
                        indentId: item.id,
                        assign: `status = 3`
                    }
                ).then(()=>{
                    const get_address = `${choseAddress.tag}:${choseAddress.address}-${choseAddress.name}-${choseAddress.phone}`
                    sendRequest(
                        'POST',
                        '/indent/update',
                        {
                            indentId: item.id,
                            assign: `get_address = '${get_address}'`
                        }
                    ).then(()=>{
                        if(index === arr.length-1){
                            sessionStorage.removeItem('choseIndentList')
                            if(confirm('确定支付')){
                                theAlert('支付成功').then(()=>{
                                    location.href = '/app/indent?status=3'
                                })
                            }
                        }
                    })
                })
            })
        }
    })
})
}
init()