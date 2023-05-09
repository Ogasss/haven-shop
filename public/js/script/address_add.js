import { sendRequest } from '../hooks/sendRequest'
import { getCookie } from '../hooks/getCookie'
import { theAlert } from '../hooks/theAlert'

const init = async ()=>{
    let choseAddress = JSON.parse(sessionStorage.getItem('choseAddress'))
    let status
    let theAddress= ''
    let tag= ''

    const nameInput = document.getElementsByClassName('the-input')[0]
    const phoneInput = document.getElementsByClassName('the-input')[1]
    const theAddressWrapper = document.getElementsByClassName('the-address-msg')[0]
    const moreAddressWrapper = document.getElementsByClassName('the-more-address-input')[0]

    const inputArr = [nameInput,phoneInput,theAddressWrapper,moreAddressWrapper]

    if(choseAddress === null){
        status = 'add'
        const titleWrapper = document.getElementsByClassName('indent-header-title')[0]
        titleWrapper.innerText = '添加新地址'
        const submitButton = document.getElementsByClassName('address-main-submit-button')[0]
        submitButton.innerText = '添加'
    }else{
        status = 'update'
        const titleWrapper = document.getElementsByClassName('indent-header-title')[0]
        titleWrapper.innerText = '修改地址'
        const submitButton = document.getElementsByClassName('address-main-submit-button')[0]
        submitButton.innerText = '修改'
        
        nameInput.value = choseAddress.name
        phoneInput.value = choseAddress.phone
        theAddress = choseAddress.address.split('/')[0]
        theAddressWrapper.innerText = theAddress
        moreAddressWrapper.value = choseAddress.address.split('/')[1]
        if(choseAddress.tag !== ''){
            tag = choseAddress.tag
        }
    }
    

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
    
    const {address, address_tag} = userResponse.data
    let _address = []
    let addressList = []
    if(address !== '' && address !== undefined && address !== null){
         _address = userResponse.data.address.split(',')
        addressList = _address.map((item)=>{
            let newItem = {}
            newItem.tag = item.split(':')[0]
            newItem.address = item.split(':')[1].split('-')[0]
            newItem.name = item.split(':')[1].split('-')[1]
            newItem.phone = item.split(':')[1].split('-')[2]
            return newItem
        })
    }
    let choseAddressIndex 
    if(status === 'update'){
        addressList.forEach((item, index)=>{
        if(item.address === choseAddress.address && item.name === choseAddress.name && item.phone === choseAddress.phone && item.tag === choseAddress.tag){
                choseAddressIndex = index
            }
        })
    }

    const backButton = document.getElementsByClassName('indent-header-back-button')[0]
    backButton.addEventListener('click',()=>{
        sessionStorage.removeItem('choseAddress')
        if(address === null | address === undefined | address === ''){
            location.href = '/app/my'
        }else{
            history.go(-1)
        }
    })
    
    const tagWrapper = document.getElementsByClassName('address-tags-wrapper')[0]
    let tagHTML = `<span class="address-tag add-tag">+</span>`
    const tagTemplate = (item) => `
        <span class="address-tag">${item}</span>
    `
    let tagList 
    if(address_tag !== undefined && address_tag !== null){
        tagList = address_tag.split(',')
        tagList.forEach((item)=>{
            tagHTML += tagTemplate(item)
        })        
    }
    tagWrapper.innerHTML = tagHTML

    if(status === 'update'){
        if(choseAddress.tag !== ''){
            const tagList = Array.from(document.getElementsByClassName('address-tag'))
            tagList.forEach((item)=>{
                if(item.innerText === choseAddress.tag){
                    item.className = 'address-tag-active'
                }
            })
        }
    }

    
    const tagElementList = Array.from(document.getElementsByClassName('address-tag'))
    tagElementList.forEach((item, index)=>{
        item.addEventListener('click', ()=>{
            tagElementList.forEach((_item,_index) => {
                if(index !== 0){
                    if(index === _index){
                        _item.className = 'address-tag-active'
                    }else{
                        _item.className = 'address-tag'
                    }
                }
            })
            if(item.innerText === '+'){
                console.log('添加标签')
            }else{
                tag = item.innerText
            }
        })
    })

    let beDefault = false
    const setDefaultButton = document.getElementsByClassName('chose-default-button')[0]
    setDefaultButton.addEventListener('click',()=>{
        beDefault = !beDefault
        beDefault ? setDefaultButton.className = 'chose-default-button-active' : setDefaultButton.className = 'chose-default-button'
    })

    const choseTheAddressActionPadWrapper = document.getElementsByClassName('the-address-action-pad-wrapper')
    [0]
    const choseTheAddressActionPad = document.getElementsByClassName('the-address-action-pad')[0]
    const choseTheAddressButton = document.getElementsByClassName('address-the-address-input')[0]
    choseTheAddressButton.addEventListener('click', ()=>{
        choseTheAddressActionPadWrapper.style.display = 'flex'
    })
    choseTheAddressActionPadWrapper.addEventListener('click', ()=>{
        choseTheAddressActionPad.style.animation = 'pad-leave 0.3s ease'
        setTimeout(() => {
            choseTheAddressActionPadWrapper.style.display = 'none'
            choseTheAddressActionPad.style.animation = 'pad-enter 0.3s ease'
        }, 250);
    })
    choseTheAddressActionPad.addEventListener('click', (event)=>{
        event.stopPropagation()
    })

    let province = ''
    let city = ''
    let county = ''
    let theAddressStatus = ''
    let provinceCode = null
    let cityCode = null
    let countyCode = null
    const theAddressTextWrapper = document.getElementsByClassName('the-address-msg')[0]
    const theAddressChoseOptionList = Array.from(document.getElementsByClassName('the-address-chose-option'))
    const provinceList = theAddressList.map((item, index)=>{
        return item.name
    })
    let cityList
    let countyList
    const renderTheAddress = (optionList) => {
        let optionHTML = ``
        const theAddressListWrapper = Array.from(document.getElementsByClassName('the-address-options-wrapper'))
        const theOptionsWrapper = theAddressListWrapper[0]
        theOptionsWrapper.innerHTML = `
        <div class="the-address-options" style="height:calc(${optionList.length * 0.6}rem)">
        </div>
        `
        const optionWrapper = document.getElementsByClassName('the-address-options')[0]
        const optionTemplate = (item) => {
            return `
            <div class="the-address-one">
                ${item}
            </div>
            `
        }
        for(let index in optionList){
            optionHTML += optionTemplate(optionList[index])
        }
        optionWrapper.innerHTML = optionHTML

        const optionsElementList = Array.from(document.getElementsByClassName('the-address-one'))
        optionsElementList.forEach((item, index) => {
            item.addEventListener('click',()=>{
                if(theAddressStatus === 'province'){
                    province = item.innerText
                    provinceCode = index
                    cityList = theAddressList[provinceCode].children.map((item)=>{
                        return item.name
                    })
                    if(provinceCode === 21)
                    {
                        console.log(cityList)    
                    }
                    turnChoseCity()
                }else
                if(theAddressStatus === 'city'){
                    city = item.innerText
                    cityCode = index
                    countyList = theAddressList[provinceCode].children[cityCode].children.map((item)=>{
                        return item.name
                    })
                    turnChoseCounty()
                }else
                if(theAddressStatus === 'county'){
                    county = item.innerText
                    countyCode = index+1
                    if(province === city){
                        theAddress = city+county
                    }else{
                        theAddress = province+city+county
                    }
                    theAddressTextWrapper.innerText = theAddress
                    theAddressTextWrapper.style.opacity = '0.7'
                    choseTheAddressActionPadWrapper.click()
                }
                optionsElementList.forEach((_item, _index) => {
                    index === _index ?
                    _item.className = 'the-address-one-active' :
                    _item.className = 'the-address-one'
                })
            })
        })
    }
    theAddressChoseOptionList.forEach((item, index)=>{
        item.addEventListener('click',()=>{
            let flag = false
            if(index === 0){
                flag = true
                theAddressStatus = 'province'
                province = ''
                city = ''
                county = ''
                renderTheAddress(provinceList)
            }
            if(index === 1 && province !== ''){
                flag = true
                theAddressStatus = 'city'
                city = ''
                county = ''
                renderTheAddress(cityList)
            }
            if(index === 2 && city !== ''){
                flag = true
                theAddressStatus = 'county'
                county = ''
                renderTheAddress(countyList)
            }
            if(flag){
                theAddressChoseOptionList.forEach((_item, _index)=>{
                    index === _index ?
                    item.className = 'the-address-chose-option-active':
                    _item.className = 'the-address-chose-option'
                })
            }
        })
    })
    const turnChoseProvince = () => {
        theAddressChoseOptionList[0].click()
    }
    const turnChoseCity = () => {
        theAddressChoseOptionList[1].click()
    }
    const turnChoseCounty = () => {
        theAddressChoseOptionList[2].click()
    }
    turnChoseProvince()
    
    
    
    const verifyForm = () => {
        const nameInput = document.getElementsByClassName('the-input')[0]
        const phoneInput = document.getElementsByClassName('the-input')[1]
        const moreAddressInput = document.getElementsByClassName('the-more-address-input')[0]
        let name = nameInput.value
        let phone = phoneInput.value
        let moreAddress = moreAddressInput.value
        for(;name.indexOf(' ') !== -1;){
           name =  name.splice(' ','')
        }
        for(;moreAddress.indexOf(' ') !== -1;){
            more =  name.splice(' ','')
        }
        if(name.length === 0){
            return {
                msg: '收件人名称还未填写',
                error: ['name']
            }
        }else
        if(!/^1[3456789]\d{9}$/.test(phone)){
            return {
                msg: '手机号不符合规范',
                error: ['phone']
            }
        }else
        if(theAddress === ''){
            return {
                msg: '省市区/县还未选择',
                error: ['theAddress']
            }
        }else
        if(moreAddress === ''){
            return {
                msg: '详细地址还未填写',
                error: ['moreAddress']
            }
        }else{
            return {
                msg: '确认无误即可提交',
                error: []
            }
        }
    }
    inputArr.forEach((item)=>{
        const verify = () => {
            const errResponse = verifyForm()
            document.getElementsByClassName('tip-word')[0].innerText = errResponse.msg
            if(errResponse.error.length === 0){
                document.getElementsByClassName('tip-word')[0].style.color = 'rgba(0,205,205, 0.8)'
            }
        }
        item.addEventListener('click',()=>{
            verify()
        })
        item.addEventListener('input',()=>{
            verify()
        })
        choseTheAddressActionPadWrapper.addEventListener('click', ()=>{
            verify()
        })
    })

    const submitButton = document.getElementsByClassName('address-main-submit-button')[0]
    submitButton.addEventListener('click', ()=>{
        const verifyResponse = verifyForm()
        const {error} = verifyResponse
        if(error.length ===0){
            let newAddress = `${tag}:${theAddress}/${moreAddress}-${name}-${phone}`
            let addressString
            if(status === 'add'){
                if(beDefault){
                    _address.unshift(newAddress)
                }else{
                    _address.push(newAddress)
                }
            }else
            if(status === 'update'){
                if(beDefault){
                    _address.splice(choseAddressIndex,1)
                    _address.unshift(newAddress)
                }else{
                    _address[choseAddressIndex] = newAddress
                }
                
            }
            addressString  = _address.join(',')
            console.log(addressString)
            sendRequest(
                'POST',
                '/user/update',
                {
                    uid: havenUid,
                    target: 'address',
                    value: addressString
                }
            ).then(()=>{
                sessionStorage.removeItem('choseAddress')
                location.href = '/app/address'
            })
        }else{
            alert(verifyResponse.msg)
        }
    })

}
init()