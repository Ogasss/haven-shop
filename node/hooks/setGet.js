const path = require('path')

const setGet = (router,faURL,dir,fileType) => {
    router.get(faURL+'/:id',(request ,response)=>{
        const { id } = request.params
        response.sendFile(path.join(__dirname,dir+'\/'+id+fileType))
    })
}

exports.setGet = setGet