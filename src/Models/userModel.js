const { pool } = require('../database')
const User = {}

User.findOne = async ({ column: value }) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT 1 FROM users WHERE $1 = $2', [column, value], (error, results) => {
            if (error) {
                reject(error)
            } else {
                resolve(results.rows[0])
            }
        })
    })
}




module.exports = User