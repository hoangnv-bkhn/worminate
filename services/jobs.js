const {
    get_all_posts,
    get_all_users
} = require('./database_services');

let posts = get_all_users()
posts.then(function (users) {
    console.log(users)
})