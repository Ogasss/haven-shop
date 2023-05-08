import { getCookie } from "../hooks/getCookie"

// export const scriptHomeNav = () => {
    const {havenToken, havenUid} = getCookie()
    const navList = [
        {
            name: 'home',
            word: '好物',
            png: '/png/buy',
            href: '../../app/home'
        },
        {
            name: 'brand',
            word: '品牌',
            png: '/png/brand',
            href: '../../'
        },
        {
            name: 'car',
            word: '小车',
            png: '/png/car',
            href: `${ havenToken!==undefined&&havenUid !==undefined ? '../../app/indent?status=1' : '../../app/signin' }`
        },
        {
            name: 'my',
            word: '我的',
            png: '/png/my',
            href: `${ havenToken!==undefined&&havenUid !==undefined ? '../../app/my' : '../../app/signin' }`
        },
    ]
    const template = (item) => `
    <button class=${window.location.href.split('/')[4] === item.name ? 'home-nav-part-active' : 'home-nav-part'}>
        <img class="home-nav-icon" id="home-nav-${item.name}" src=${item.png}>
        <div class="home-nav-title">
            ${item.word}
        </div>
    </button>
    `
    let navTemplate = ''
    navList.forEach((item)=>{
        navTemplate += template(item)
    })
    const homeNavWrapper = document.getElementsByClassName('home-nav-wrapper')[0]
    homeNavWrapper.innerHTML = navTemplate




    const navPartArr = Array.from(homeNavWrapper.children)
    const hrefList = navList.map((item)=>{
        return item.href
    })
    navPartArr.forEach((item,index) => {
        item.addEventListener('click', ()=>{
            item.className = 'home-nav-part-active'
            window.location.href = hrefList[index]
            navPartArr.forEach((_item,_index)=>{
                if(_index !== index){
                    _item.className = 'home-nav-part'
                }
            })
        })
    });
// }