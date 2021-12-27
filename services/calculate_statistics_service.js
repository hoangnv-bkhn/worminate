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
        get_all_users().then(function (users) {
            const data = [];
            for (let index = 0; index < users.length; index++) {
                postScoreList.push(users[index].postsScore);
                let differenceInTime = currentTime - users[index].createdAt;
                ageAccountList.push(Math.floor(differenceInTime / (1000 * 3600 * 24)));
                salesHistoryList.push(users[index].salesHistory);
                usedTokensList.push(users[index].usedTokens);
            }

            let _postScoreStatistics = get_statistics_info(postScoreList)
            let _ageAccountStatistics = get_statistics_info(ageAccountList)
            let _salesHistoryStatistics = get_statistics_info(salesHistoryList)
            let _usedTokensStatistics = get_statistics_info(usedTokensList)

            const postScoreStatistics = {
                attribute: 'postScore',
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
            const usedTokensStatistics = {
                attribute: 'usedTokens',
                mean: _usedTokensStatistics.mean,
                std: _usedTokensStatistics.std
            }

            data.push(postScoreStatistics, ageAccountStatistics, salesHistoryStatistics, usedTokensStatistics);
            csvWriter1
                .writeRecords(data)

        });
    },

    calculate_post_statistics: async () => {
        let posts = get_all_posts()
        posts.then(function (posts) {
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
        })
    }
}

// module.exports.calculate_user_statistics()
// module.exports.calculate_post_statistics()
