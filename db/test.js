const { dbOpen } = require('./connect')
const { Timer } = require('../node/hooks/timer')

const test = () => {
    let action
    action = dbOpen('haven')
    action.delete({
        sheet: 'indentList',
        condition: `status = 0`
    })
    // action = dbOpen('haven')
    // action.read({
    //     sheet: 'itemList',
    //     condition: `direction LIKE '%T恤%'`
    // }).then((data)=>{
    //     console.log(data)
    // })
}

exports.test = test
