import { sendRequest } from '../hooks/sendRequest'
import { getCookie } from '../hooks/getCookie'
import { Timer } from '../hooks/timer'

const init =  async () => {
    let indentList

    const getIndentList = async () => {
        const {havenUid} = getCookie()

        if(havenUid === undefined){
            
        }
    }

}
init()