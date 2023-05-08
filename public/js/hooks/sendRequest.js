export const sendRequest = (method,url,data) => {
    const options = {}
    options.method = method
    // options.url = "http://192.168.1.105:4400" + url
    options.url = "http://127.0.0.1:4400" + url
    if(method.toUpperCase() === 'GET'){
        options.params = data
    }
    if(method.toUpperCase() === 'POST'){
        options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        options.data = data
    }
    let theAxios = axios(options)
    axios.interceptors.request.use((config)=>{
        // const body = document.getElementsByTagName('body')[0]
        // const loadingWrapper = document.getElementsByClassName('loading-wrapper')[0]
        // if(loadingWrapper === undefined){
        //     body.innerHTML += `
        //         <div class="loading-wrapper">
        //             <img src="/png/loading" class="loading">
        //         </div>
        //     `
        // }
        return config
    })
    axios.interceptors.response.use((response)=>{
        // const loadingWrapper = document.getElementsByClassName('loading-wrapper')[0]
        // loadingWrapper.style.visibility = 'hidden'
        // loadingWrapper.style.zIndex = -1
        return response
    })
    return theAxios
}
/*
    sendRequest(
        'POST',
        '/api/get',
        {
            msg: '2233'
        }
    )
*/