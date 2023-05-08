export const getCookie = (name) => {
    let _cookieList = []
    let cookieList = {}
    document.cookie.split(';').map((item,index)=>{
        _cookieList.push(item.split('='))
    })
    _cookieList.forEach((item,index)=>{
        cookieList[item[0].trim()] = item[1]
    })
    if(name){
        return cookieList[name]
    }else{
        return cookieList
    }
}