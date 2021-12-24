const {
    get_all_posts,
    get_all_users
} = require('./database_services');

(async () => {
    console.log(await get_all_users())
})()