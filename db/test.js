const { dbOpen } = require('./connect')
const { Timer } = require('../node/hooks/timer')
const  pinyinlite = require('pinyinlite');

const test = () => {
    const getPinyin = (string) => {
        let singleWordArr = pinyinlite(string)
        singleWordArr =  singleWordArr.map((item)=>{
            return item[0]
        })
        return singleWordArr.join('')
    }
    const setPinyin = async () => {
        let action 
        action = dbOpen('haven')
        let itemList = await action.read({
            sheet: 'itemList',
        })
        let pinyinList = itemList.map((item)=>{
            return getPinyin(item.direction)
        })
        pinyinList.forEach(async (item, index)=>{
            action = dbOpen('haven')
            await action.update({
                sheet: 'itemList',
                assign: `pinyin = '${item}'`,
                condition: `id = ${index}`
            })
        })
    }
    setPinyin()
}

exports.test = test
