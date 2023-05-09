import { sendRequest } from '../hooks/sendRequest'
import { getCookie } from '../hooks/getCookie'
import { Timer } from '../hooks/timer'

let status = 3

const init = async () => {
    const indentListWrapper = document.getElementsByClassName('indent-main')[0]
    const getIndentList = async () =>{
        const { havenUid } = getCookie()
        if(havenUid === undefined){
            location.href = '../../'
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
        
        const _getIndentList = () => {
            return new Promise((resolve) => {
                if(_indentList.length === 0){
                    indentListWrapper.innerHTML = `
                        <img class="indent-none-img" src="/png/indent_none">
                    `
                    resolve(false)
                }
                _indentList.forEach((item, index, arr)=>{
                    sendRequest(
                        'POST',
                        '/item/get',
                        {
                            condition: `id = ${item.item_id}`
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
                        if(response.data[0].discount){
                            item.price = parseInt(response.data[0].price * response.data[0].discount)
                        }else{
                            item.price = response.data[0].price
                        }
                        item.png = _pngList[pngIndex]
                        item.tag = response.data[0].tag
                        item.old_price = response.data[0].price
                        item.discount = response.data[0].discount
                        item.brand = response.data[0].brand
                        item.total_price = parseInt(item.number) * parseInt(item.price)
                        item.discount_price = (parseInt(response.data[0].price) - parseInt(item.price)) * parseInt(item.number)
                        item.chose = false
                        if(index === arr.length-1){
                            resolve(arr.reverse())
                        }
                    })
                })                
            })
        }

        const indentList = await _getIndentList()
        return indentList
    }
    const indentList = await getIndentList()
    if(indentList === false){
        return
    }

    const indentTemplate = (item) => {
        let _date = new Date(item.buy_time)
        let {year,month,day,hour,minute,second} = Timer.newTimer(_date).date
        let time = `${year}年${month}月${day}日 ${hour}:${minute}:${second}`
        let totalPrice = parseInt(item.total_price)
        let nowAddress = item.now_address.split('/')[1]
        for(;nowAddress.indexOf('-') !== -1;){
            nowAddress = nowAddress.replace('-','')
        }
        let theAddress = item.get_address.split(':')[1].split('-')[0].replace('/','')
        return `
    <div class="indent-main-indent-option">
        <div class="indent-main-indent-wrapper">
                <div class="indent-main-indent-row-1">
                    <div>
                        <a href='/app/item/?item_id=${item.item_id}' class="indent-main-indent-img-wrapper">
                            <img src=${item.png} class="indent-main-indent-img">
                        </a>
                    </div>  
                    <div class="indent-main-indent-msg-wrapper">
                        <div class="indent-main-indent-title-wrapper">
                            <span class="indent-main-indent-title">
                                ${item.name.slice(0,23)}...
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
                            <div class="indent-main-indent-tag">
                                ${
                                    item.status === 3 ? '待发货' :
                                    item.status === 4 ? '待送达' :
                                    item.status === 5 ? '待收货' : ''
                                }
                            </div>
                        </div>  
                    </div>
                    
                    <div class="indent-main-indent-old-price-wrapper">
                        <div></div>
                    </div>
                </div>
        </div>
        <div class="indent-main-indent-price-wrapper">
                <div class="indent-main-indent-price-msg">
                    <div>
                        <span class="indent-main-indent-price-word">
                            付款：
                        </span>
                        <span class="indent-main-indent-price">
                            ¥ ${totalPrice.toFixed(2)}
                        </span>
                    </div>
                    <div class="indent-main-time-tag">
                        ${time}
                    </div>
                </div>
                <div class="indent-main-indent-action-button">
                    <div class="indent-main-indent-cancel-button">
                        退款
                    </div>
                    <div class="indent-main-indent-address-button">
                        物流
                    </div>
                </div>
        </div>
        <div class="indent-main-indent-address-wrapper">
            <div class="indent-main-indent-address-option now-address">
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
        `
    }

    let indentListHTML = ``
    indentList.forEach((item) => {
        if(item.name === undefined){
            indentListHTML = ''
            init()
        }else{
            indentListHTML += indentTemplate(item)
        }
    })
    indentListWrapper.innerHTML = indentListHTML

    const addressShowButton = Array.from(document.getElementsByClassName('indent-main-indent-address-button'))
    const addressWrapper = Array.from(document.getElementsByClassName('indent-main-indent-address-wrapper'))
    const addressPad = Array.from(document.getElementsByClassName('indent-main-indent-address-option'))
    addressShowButton.forEach((item, index)=>{
        item.addEventListener('click', ()=>{
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

    const deleteButton = Array.from(document.getElementsByClassName('indent-main-indent-cancel-button'))
    deleteButton.forEach((item, index)=>{
        item.addEventListener('click',()=>{
            if(confirm('确定要将该订单退款？')){
                sendRequest(
                    'POST',
                    '/indent/update',
                    {
                        indentId: indentList[index].id,
                        assign: `status = 0`
                    }
                ).then(()=>{
                    init()
                })          
            }
        })
    })
}
init()
const backButton = document.getElementsByClassName('indent-header-back-button')[0]
backButton.addEventListener('click',()=>{
    location.href = '/app/my'
})