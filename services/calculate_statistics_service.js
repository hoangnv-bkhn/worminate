const path = require('path');

const {
    get_statistics_info
} = require('./standardized_score_service')

const {
    get_all_posts,
    get_all_users,
    calculate_hit_counter
} = require('./database_service');

const postScoreList = [];
const ageAccountList = [];
const salesHistoryList = [];
const creditLevelList = [];
const usedTokensList = [];

const reviewsScoreList = [];
const hitCounterList = [];

let currentTime = Date.now()

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter1 = createCsvWriter({
    path: path.join(__dirname, 'user_statistics.csv'),
    header: [
        { id: 'attribute', title: 'Attribute' },
        { id: 'mean', title: 'Mean' },
        { id: 'std', title: 'Std' }
    ]
});

const csvWriter2 = createCsvWriter({
    path: path.join(__dirname, 'post_statistics.csv'),
    header: [
        { id: 'attribute', title: 'Attribute' },
        { id: 'mean', title: 'Mean' },
        { id: 'std', title: 'Std' }
    ]
});

module.exports = {

    calculate_user_statistics: async () => {
        const users = await get_all_users();

        const data = [];
        for (let index = 0; index < users.length; index++) {

            postScoreList.push(users[index].postsScore);

            let differenceInTime = currentTime - users[index].createdAt;
            ageAccountList.push(Math.floor(differenceInTime / (1000 * 3600 * 24)));

            salesHistoryList.push(users[index].salesHistory);

            let followBy = users[index].manageFollowers.followBy.length;
            let reported = users[index].reported;
            creditLevelList.push(followBy - reported);

            usedTokensList.push(users[index].usedTokens);
        }

        let _postScoreStatistics = get_statistics_info(postScoreList)
        let _ageAccountStatistics = get_statistics_info(ageAccountList)
        let _salesHistoryStatistics = get_statistics_info(salesHistoryList)
        let _creditLevelStatistics = get_statistics_info(creditLevelList)
        let _usedTokensStatistics = get_statistics_info(usedTokensList)

        const postScoreStatistics = {
            attribute: 'postsScore',
            mean: _postScoreStatistics.mean,
            std: _postScoreStatistics.std
        }
        const ageAccountStatistics = {
            attribute: 'ageAccount',
            mean: _ageAccountStatistics.mean,
            std: _ageAccountStatistics.std
        }
        const salesHistoryStatistics = {
            attribute: 'salesHistory',
            mean: _salesHistoryStatistics.mean,
            std: _salesHistoryStatistics.std
        }
        const creditLevelStatistics = {
            attribute: 'creditLevel',
            mean: _creditLevelStatistics.mean,
            std: _creditLevelStatistics.std
        }
        const usedTokensStatistics = {
            attribute: 'usedTokens',
            mean: _usedTokensStatistics.mean,
            std: _usedTokensStatistics.std
        }

        data.push(postScoreStatistics, ageAccountStatistics, salesHistoryStatistics,
            creditLevelStatistics, usedTokensStatistics);
        csvWriter1
            .writeRecords(data)

    },

    calculate_post_statistics: async () => {
        const posts = await get_all_posts();
        const data = [];
        for (let index = 0; index < posts.length; index++) {
            reviewsScoreList.push(posts[index].reviewsScore);
            let hits = calculate_hit_counter(posts[index].hitCounter)
            hitCounterList.push(hits);
        }

        let _reviewsScoreStatistics = get_statistics_info(reviewsScoreList)
        let _hitCounterStatistics = get_statistics_info(hitCounterList)

        const reviewsScoreStatistics = {
            attribute: 'reviewsScore',
            mean: _reviewsScoreStatistics.mean,
            std: _reviewsScoreStatistics.std
        }

        const hitCounterStatistics = {
            attribute: 'hitCounter',
            mean: _hitCounterStatistics.mean,
            std: _hitCounterStatistics.std
        }

        data.push(reviewsScoreStatistics, hitCounterStatistics);
        csvWriter2
            .writeRecords(data)
        // .then(() => console.log('The post statistics file was written successfully'));

    },

    caculate_data: async () => {
        const posts = await get_all_posts();
        for (let post of posts) {
            let date = currentTime - Date.parse(post.expirationDate);
            date = date / 24 / 3600 / 1000;
            if (date < 0 && date > -30) {
                continue;
            } else {
                post.promotionalPlan = 0;
                post.expirationDate = undefined;
                await post.save();
            }
        }
        const users = await get_all_users();
        for (let user of users) {
            let j = 0;
            for (i of user.postList) {
                if (i.status == false) j++;
            }
            user.salesHistory = j;
            await user.save();
        }
    }
}

// module.exports.calculate_user_statistics()
// module.exports.calculate_post_statistics()
