const {
    get_standardized_score
} = require('./standardized_score_service')

const {
    get_all_posts,
    get_all_users
} = require('./database_service');

const csv = require('csv-parser');
const fs = require('fs');

fs.createReadStream('user_statistics.csv')
    .pipe(csv())
    .on('data', (row) => {
        console.log(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });

fs.createReadStream('post_statistics.csv')
    .pipe(csv())
    .on('data', (row) => {
        console.log(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });

// let users = get_all_users()
// users.then(function (users) {
//     for (const user of users) {

//     }
// })