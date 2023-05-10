const { dbOpen } = require('./connect')
const { Timer } = require('../node/hooks/timer')

const test = () => {
    let action
    action = dbOpen('haven')
    action.delete({
        sheet: 'indentList',
        condition: `status = 0`
    })
}

exports.test = test
