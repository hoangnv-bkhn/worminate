const {
    get_statistics_info
} = require('./standardized_score_service')

const {
    get_all_posts,
    get_all_users
} = require('./database_service');

const productScoreList = [];
const ageAccountList = [];
const salesHistoryList = [];
const usedTokensList = [];

const reviewsScoreList = [];
const trendingPostList = [];

let currentTime = Date.now()

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter1 = createCsvWriter({
    path: 'user_statistics.csv',
    header: [
        { id: 'attribute', title: 'Attribute' },
        { id: 'mean', title: 'Mean' },
        { id: 'std', title: 'Standard Deviation' }
    ]
});

const csvWriter2 = createCsvWriter({
    path: 'post_statistics.csv',
    header: [
        { id: 'attribute', title: 'Attribute' },
        { id: 'mean', title: 'Mean' },
        { id: 'std', title: 'Standard Deviation' }
    ]
});


let users = get_all_users()
users.then(function (users) {
    const data = [];
    for (let index = 0; index < users.length; index++) {
        productScoreList.push(users[index].productsScore);
        let differenceInTime = currentTime - users[index].createdAt;
        ageAccountList.push(Math.floor(differenceInTime / (1000 * 3600 * 24)));
        salesHistoryList.push(users[index].salesHistory);
        usedTokensList.push(users[index].usedTokens);
    }

    let _productScoreStatistics = get_statistics_info(productScoreList)
    let _ageAccountStatistics = get_statistics_info(ageAccountList)
    let _salesHistoryStatistics = get_statistics_info(salesHistoryList)
    let _usedTokensStatistics = get_statistics_info(usedTokensList)

    const productScoreStatistics = {
        attribute: 'postScore',
        mean: _productScoreStatistics.mean,
        std: _productScoreStatistics.std
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

    data.push(productScoreStatistics, ageAccountStatistics, salesHistoryStatistics, usedTokensStatistics);
    csvWriter1
        .writeRecords(data)
        .then(() => console.log('The user statistics file was written successfully'));

});

let posts = get_all_posts()
posts.then(function (posts) {
    const data = [];
    for (let index = 0; index < posts.length; index++) {
        reviewsScoreList.push(posts[index].reviewsScore)
        trendingPostList.push(posts[index].trendingPost)
    }

    let _reviewsScoreStatistics = get_statistics_info(reviewsScoreList)
    let _trendingPostStatistics = get_statistics_info(trendingPostList)

    const reviewsScoreStatistics = {
        attribute: 'reviewsScore',
        mean: _reviewsScoreStatistics.mean,
        std: _reviewsScoreStatistics.std
    }

    const trendingPostStatistics = {
        attribute: 'trendingPost',
        mean: _trendingPostStatistics.mean,
        std: _trendingPostStatistics.std
    }

    data.push(reviewsScoreStatistics, trendingPostStatistics);
    csvWriter2
        .writeRecords(data)
        .then(() => console.log('The post statistics file was written successfully'));

})