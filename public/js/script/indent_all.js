import { sendRequest } from '../hooks/sendRequest'
import { getCookie } from '../hooks/getCookie'
import { Timer } from '../hooks/timer'

const theConfirm = (string,fun) => {
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
        fun()
    })
}

const init =  async () => {
    let indentList

    const getIndentList = async () => {
        const {havenUid} = getCookie()

        if(havenUid === undefined){
            location.href ='/app/signin'
        }
        const response_status_2 = await sendRequest(
            'POST',
            '/indent/get',
            {
                user_id: havenUid,
                status: 2
            }
        )
        const response_status_3 = await sendRequest(
            'POST',
            '/indent/get',
            {
                user_id: havenUid,
                status: 3
            }
        )
        const response_status_4 = await sendRequest(
            'POST',
            '/indent/get',
            {
                user_id: havenUid,
                status: 4
            }
        )
        
        const indentList_2 = response_status_2.data
        const indentList_3 = response_status_3.data
        const indentList_4 = response_status_4.data
        const indentListOrigin = indentList_2.concat(indentList_3, indentList_4)
        
        let promises = []
        indentListOrigin.forEach((item, index) => {    
            promises.push(sendRequest(
                'POST',
                '/item/get',
                {
                    condition: `id = ${item.item_id}`
                }
            ))
        })
        let promisesResponseArr = await Promise.all(promises)
        let itemList = promisesResponseArr.map((item, index) => {
            return item.data[0]
        })
        indentListOrigin.forEach((item, index)=>{
            item.name = itemList[index].direction
            let _pngList = itemList[index].png.split(',')
            _pngList = _pngList.map((item, index)=>{
                return item.split('"')[1]
            })
            let _paramList = itemList[index].more_type_0.split(',').map((item)=>{
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
            if(itemList[index].discount){
                item.price = parseInt(itemList[index].price * itemList[index].discount)
            }else{
                item.price = itemList[index].price
            }
            item.png = _pngList[pngIndex]
            item.tag = itemList[index].tag
            item.old_price = itemList[index].price
            item.discount = itemList[index].discount
            item.brand = itemList[index].brand
            item.total_price = parseInt(item.number) * parseInt(item.price)
            item.discount_price = (parseInt(itemList[index].price) - parseInt(item.price)) * parseInt(item.number)
            item.chose = false
            return item
        })
        indentListOrigin.sort((front, after) =>{
            let front_time
            let after_time

            if(front.buy_time.length !== ''){
                front_time = new Date(front.buy_time)
            }else{
                front_time = new Date(front.want_time)
            }
            
            if(after.buy_time.length !== ''){
                after_time = new Date(after.buy_time)
            }else{
               after_time = new Date(after.want_time) 
            }
            
            return after_time - front_time
        })
        return indentListOrigin
    }

    indentList = await getIndentList()

    const bandAction = async () => {
        const cancelBuyButtonList = Array.from(document.getElementsByClassName('indent-status-2-cancel-button'))
        const buyButtonList = Array.from(document.getElementsByClassName('indent-status-2-buy-button'))
        const cancelGetButtonList = Array.from(document.getElementsByClassName('indent-status-3-cancel-button'))
        const addressButtonList = Array.from(document.getElementsByClassName('indent-status-3-address-button'))

        const actionSubmit = (status, index) => {
            if(status === 0){
                theConfirm('确定取消付款？',
                    () => {
                        sendRequest(
                            'POST',
                            '/indent/merge',
                            {
                                indentList: JSON.stringify(indentList[index])
                            }
                        ).then((response)=>{
                            if(response.data === false){
                                sendRequest(
                                    'POST',
                                    '/indent/update',
                                    {
                                        indentId: indentList[index].id,
                                        assign: `status = ${status}`
                                    }
                                ).then(()=>{
                                    init()
                                })
                            }else{
                                init()
                            }
                        })
                    }
                )
            }else
            if(status === 3){
                let arr = []
                arr.push(indentList[index])
                let _indentList = JSON.stringify(arr)
                sessionStorage.setItem('choseIndentList', _indentList)
                location.href = '/app/indent_submit'
            }
        }

        cancelBuyButtonList.forEach((item) => {
            item.addEventListener('click', ()=>{
                const indentIndex = item.id
                actionSubmit(0, indentIndex)
            })
        })

        buyButtonList.forEach((item)=>{
            item.addEventListener('click', ()=>{
                const indentIndex = item.id
                actionSubmit(3, indentIndex)
            })
        })

        cancelGetButtonList.forEach((item)=>{
            item.addEventListener('click', ()=>{
                const indentIndex = item.id
                theConfirm('确定退款取消订单？',
                    async ()=>{
                        await sendRequest(
                            'POST',
                            '/indent/update',
                            {
                                indentId: indentList[indentIndex].id,
                                assign: `status = 0`
                            }
                        )
                        await sendRequest(
                            'POST',
                            '/item/update',
                            {
                                assign: `number = ${parseInt(indentList[indentIndex].item_total_number) + parseInt(indentList[indentIndex].number)}`,
                                condition: `id = ${indentList[indentIndex].item_id}`
                            }
                        )
                        init()          
                    }
                )
            })
        })

        addressButtonList.forEach((item, index)=>{
            item.addEventListener('click', ()=>{
                const indentIndex = item.id
                const addressShowButton = Array.from(document.getElementsByClassName('indent-status-3-address-button'))
                const addressWrapper = Array.from(document.getElementsByClassName('indent-status-3-address-wrapper'))
                const addressPad = Array.from(document.getElementsByClassName('indent-status-3-address-option'))
                if(addressWrapper[index].style.display === '' || addressWrapper[index].style.display === 'none'){
                    addressWrapper[index].style.display = 'block'
                }else{
                    addressPad[index].style.animation = 'address-pad-leave 0.3s ease'
                    setTimeout(()=>{
                        addressWrapper[index].style.display = 'none'
                        addressPad[index].style.animation = 'address-pad-enter 0.3s ease'
                    },250)
                }
            })
        })
    }
    const renderIndentList = async (indentList) => {
        const wrapper = document.getElementsByClassName('indent-main')[0]
        if(indentList.length === 0){
            wrapper.innerHTML = `
            <img class="indent-none-img" src="/png/indent_none">
            `
            return 
        }
        let HTML = ``
        const template = (item, index) => {
            let html
            let _date = new Date(item.buy_time)
            let {year,month,day,hour,minute,second} = Timer.newTimer(_date).date
            minute < 10 ? minute = `0${minute}` : ''
            let time = `${year}年${month}月${day}日 ${hour}:${minute}`
            let totalPrice = parseInt(item.total_price)
            let nowAddress = ''
            let theAddress = ''
            if(item.status >= 3){
                nowAddress = item.now_address.split('/')[1]
                for(;nowAddress.indexOf('-') !== -1;){
                    nowAddress = nowAddress.replace('-','')
                }
                theAddress = item.get_address.split(':')[1].split('-')[0].replace('/','')
                
            }
            item.status === 2 ?
            html = `
        <div class="indent-status-2-option">
            <div class="indent-status-2-wrapper">
                <div class="indent-status-2-row-1">
                    <a href='/app/item/?item_id=${item.item_id}' class="indent-status-2-img-wrapper">
                        <img src=${item.png} class="indent-status-2-img">
                    </a>
                    <div class="indent-status-2-msg-wrapper">
                        <div class="indent-status-2-title-wrapper">
                            <span class="indent-status-2-title">
                                ${item.name.slice(0,25)}...
                            </span>
                        </div>
                        
                        <div class="indent-status-2-params-wrapper">
                            <div class="indent-status-2-type">
                            ${item.more_type_0}
                            </div>
                            <div class="indent-status-2-type">
                            ${item.more_type_1}
                            </div>
                            <div class="indent-status-2-number">
                                数量: ${item.number}
                            </div>
                        </div>
                        <div class="indent-status-2-tags-wrapper">
                            <div class="indent-status-2-tag">
                                待付款
                            </div>
                        </div>  
                    </div>
                    
                    <div class="indent-status-2-old-price-wrapper">
                        <div></div>
                        <div class="indent-status-2-old-price">¥ ${item.old_price.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            <div class="indent-status-2-discount-price-wrapper">
                <span class="indent-status-2-discount-price-word">
                    优惠：
                </span>
                <span class="indent-status-2-discount-price">
                    - ¥ ${item.discount_price.toFixed(2)}
                </span>
            </div>
            <div class="indent-status-2-price-wrapper">
                
                <div>
                    <span class="indent-status-2-price-word">
                        小计：
                    </span>
                    <span class="indent-status-2-price">
                        ¥ ${item.total_price.toFixed(2)}
                    </span>
                </div>
                <div class="indent-status-2-action-button">
                    <div class="indent-status-2-cancel-button" id="${index}">
                        取消
                    </div>
                    <div class="indent-status-2-buy-button" id="${index}">
                        付款
                    </div>
                </div>
            </div>
        </div>
            ` :
            item.status === 3 ?
            html =`
        <div class="indent-status-3-option">
            <div class="indent-status-3-wrapper">
                    <div class="indent-status-3-row-1">
                        <div>
                            <a href='/app/item/?item_id=${item.item_id}' 
                            class="indent-status-3-img-wrapper">
                                <img src=${item.png} class="indent-status-3-img">
                            </a>
                        </div>  
                        <div class="indent-status-3-msg-wrapper">
                            <div class="indent-status-3-title-wrapper">
                                <span class="indent-status-3-title">
                                ${item.name.slice(0,23)}...
                                </span>
                            </div>
                            
                            <div class="indent-status-3-params-wrapper">
                                <div class="indent-status-3-type">
                                ${item.more_type_0}
                                </div>
                                <div class="indent-status-3-type">
                                ${item.more_type_1}
                                </div>
                                <div class="indent-status-3-number">
                                    数量:${item.number}
                                </div>
                            </div>
                            <div class="indent-status-3-tags-wrapper">
                                <div class="indent-status-3-tag">
                                ${
                                    item.status === 3 ? '待发货' :
                                    item.status === 4 ? '待送达' :
                                    item.status === 5 ? '待收货' : ''
                                }
                                </div>
                            </div>  
                        </div>
                        
                        <div class="indent-status-3-old-price-wrapper">
                            <div></div>
                        </div>
                    </div>
            </div>
            <div class="indent-status-3-price-wrapper">
                    <div class="indent-status-3-price-msg">
                        <span class="indent-status-3-price-word">
                            付款：
                        </span>
                        <span class="indent-status-3-price">
                            ¥ ${totalPrice.toFixed(2)}
                        </span>
                        <div class="indent-main-time-tag">
                        ${time}
                        </div>
                    </div>
                    <div class="indent-status-3-action-button">
                        <div class="indent-status-3-cancel-button" id=${index}>
                            退款
                        </div>
                        <div class="indent-status-3-address-button" id=${index}>
                            位置
                        </div>
                    </div>
            </div>
            <div class="indent-status-3-address-wrapper">
                <div class="indent-status-3-address-option now-address">
                    <div class="the-img-wrapper">
                        <div class="img-wrapper">
                            <img src="/png/sending">
                        </div>
                        <div class="line-wrapper">
                            <div class="line"></div>
                        </div>
                        <div class="img-wrapper">
                            <img src="/png/needget">
                        </div>
                    </div>
                    
                    <div class="the-msg-wrapper">
                        <div class="msg-wrapper">
                            <div class="title">当前位置</div>
                            <div class="msg">
                                <span class="now_place">
                                ${nowAddress}
                                </span>
                            </div>
                        </div>
                        <div class="msg-wrapper">
                            <div class="title">收货地址</div>
                            <div class="msg">
                                <span class="now_place">
                                ${theAddress}
                                </span>
                            </div>
                        </div>
                        <div class="msg-wrapper">
                            <div class="title">货运状态</div>
                            <div class="msg">
                                <span class="now_place">
                                ${
                                    item.status === 3 ? '等待商家发货' :
                                    item.status === 4 ? `预计${item.transport_time}天后到达收货地址` :
                                    item.status === 5 ? `已经到了哦，快去取货吧` : ''
                                }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            `:
            item.status == 6 ?
            html =`

            `: ''
            return html
        }
        indentList.forEach((item, index)=>{
            HTML += template(item, index)
        })
        wrapper.innerHTML = HTML
        bandAction()
    }
    renderIndentList(indentList)
}
init()