import { sendRequest } from '../hooks/sendRequest'
import { getCookie } from '../hooks/getCookie'
import { theConfirm } from '../hooks/theConfirm'


const init = async () => {
    const {havenUid} = getCookie()
    if(havenUid === undefined){
        location.href = '../../'
    }
    const userResponse = await sendRequest(
        'POST',
        '/user/get',
        {
            uid: havenUid
        }
    )
    if(userResponse.data.address === null | userResponse.data.address === ''){
        location.href = '/app/address_add'
    }
    const _address = userResponse.data.address.split(',')
    let addressList = _address.map((item)=>{
        let newItem = {}
        newItem.tag = item.split(':')[0]
        newItem.address = item.split(':')[1].split('-')[0]
        newItem.name = item.split(':')[1].split('-')[1]
        newItem.phone = item.split(':')[1].split('-')[2]
        return newItem
    })
    const setAddressList = () => {
        return new Promise((resolve)=>{
            let addressString = addressList.map((item)=>{
                return  `${item.tag}:${item.address}-${item.name}-${item.phone}`
            }).join(',')
            sendRequest(
                'POST',
                '/user/update',
                {
                    uid: havenUid,
                    target: 'address',
                    value: addressString
                }
            ).then(()=>{
                resolve()
            })
        })
    }

    const addressListRender = (addressList) => {
        const addressTemplate = (item, index) => `
            <div class="the-address-option">
                <div class="indent-chose-address-option-active" id="address-option">
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
                                index === 0 ?
                                `<span class="option-address-tag">
                                    默认
                                </span>`
                                :''
                            }
                            ${
                                item.tag === '' ? '' :
                                `<span class="option-address-tag">
                                    ${item.tag}
                                </span>`
                            }
                            
                            <span class="option-address-address">
                                ${item.address.replace('/','')}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="option-address-action-pad" style="display: none">
                    <div class="option-address-action-button address-default">
                        设为默认
                    </div>
                    <div class="option-address-action-button address-update">
                        更改地址
                    </div>
                    <div class="option-address-action-button address-delete">
                        删除地址
                    </div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        `
        let addressHTML = ''
        addressList.forEach((item, index)=>{
            addressHTML += addressTemplate(item, index)
        })
        const addressOptionWrapper = document.getElementsByClassName('indent-main')[0]
        addressOptionWrapper.innerHTML = addressHTML
        
        const phoneTextWrapper = Array.from(document.getElementsByClassName('option-user-msg-phone'))
        const phoneEyeButton = Array.from(document.getElementsByClassName('option-hidden-img'))
        phoneEyeButton.forEach((item, index)=>{
            item.addEventListener('click', (event)=>{
                event.stopPropagation()
                item.src = '/png/eye-show'
                phoneTextWrapper[index].innerText = addressList[index].phone
                setTimeout(() => {
                    item.src = '/png/eye-hidden'
                    phoneTextWrapper[index].innerText = `${addressList[index].phone.slice(0,3)}****${addressList[index].phone.slice(7,11)}`
                }, 2000);
            })
        })

        const addressOption = Array.from(document.getElementsByClassName('the-address-option'))
        const addressActionPad = Array.from(document.getElementsByClassName('option-address-action-pad'))
        
        addressOption.forEach((item, index)=>{
            item.addEventListener('click', ()=>{
                addressActionPad.forEach((_item, _index)=>{
                    if(index === _index){
                        _item.style.display = 'flex'
                    }else{
                        _item.style.animation = 'action-leave 0.3s ease'
                        setTimeout(() => {
                            _item.style.animation = 'action-enter 0.3s ease'
                            _item.style.display = 'none'
                        }, 250);
                    }
                })
            })
        })

        addressActionPad.forEach((item, index)=>{
            item.addEventListener('click',()=>{
                item.style.animation = 'action-leave 0.3s ease'
                setTimeout(() => {
                    item.style.animation = 'action-enter 0.3s ease'
                    item.style.display = 'none'
                }, 250);
            })
            
        })

        const actionSetDefault = Array.from(document.getElementsByClassName('address-default'))
        const actionUpdateAddress = Array.from(document.getElementsByClassName('address-update'))
        const actionDeleteAddress = Array.from(document.getElementsByClassName('address-delete'))

        actionSetDefault.forEach((item, index)=>{
            item.addEventListener('click', (event)=>{
                if(index !== 0){
                    addressList.unshift(addressList.splice(index,1)[0])
                    addressListRender(addressList)
                }
            })
        })

        actionUpdateAddress.forEach((item, index)=>{
            item.addEventListener('click', ()=>{
                sessionStorage.setItem('choseAddress',JSON.stringify(addressList[index]))
                location.href = '/app/address_add?status=update'
            })
        })
        
        actionDeleteAddress.forEach((item, index)=>{
            item.addEventListener('click', ()=>{
                
               theConfirm('确定要删除该地址？',()=>{
                    addressList.splice(index, 1)[0]
                    addressListRender(addressList)
               })
            })
        })
    }
    addressListRender(addressList)

    const backButton = document.getElementsByClassName('indent-header-back-button')[0]
    backButton.addEventListener('click',()=>{
        setAddressList().then(()=>{
            location.href = '/app/my'
        })
    })

    const turnToAddButton = document.getElementsByClassName('indent-address-add')[0]
    turnToAddButton.addEventListener('click',()=>{
        setAddressList().then(()=>{
            location.href = '/app/address_add'
        })
    })
}
init()