const path = require('path');

const {
    get_standardized_score
} = require('./standardized_score_service')

const {
    get_all_posts,
    get_all_users
} = require('./database_service');

const Post = require('../models/Post');
const User = require('../models/User');

const csv = require('csvtojson')

const postScoreStatistics = {};
const ageAccountStatistics = {};
const salesHistoryStatistics = {};
const usedTokensStatistics = {};

const reviewsScoreStatistics = {};
const trendingPostStatistics = {};

function calculate_user_score(user, ageOfAccount) {
    const x1 = get_standardized_score(user.postsScore, postScoreStatistics.mean, postScoreStatistics.std);

    const x2 = get_standardized_score(ageOfAccount, ageAccountStatistics.mean, ageAccountStatistics.std);

    const x3 = get_standardized_score(user.salesHistory, salesHistoryStatistics.mean, salesHistoryStatistics.std);

    const x4 = 1000 - 50 * user.creditLevel;

    const x5 = get_standardized_score(user.usedTokens, usedTokensStatistics.mean, usedTokensStatistics.std);

    return 0.2 * x1 + 0.2 * x2 + 0.2 * x3 + 0.2 * x4 + 0.2 * x5;
}

function calculate_post_score(post) {

    let x1 = 0;
    if (post.author.userRank == 'S') {
        x1 = 1000;
    } else if (post.author.userRank == 'A') {
        x1 = 800;
    } else if (post.author.userRank == 'B') {
        x1 = 600;
    } else if (post.author.userRank == 'C') {
        x1 = 400;
    } else if (post.author.userRank == 'D') {
        x1 = 200;
    }

    const x2 = get_standardized_score(post.reviewsScore, reviewsScoreStatistics.mean, reviewsScoreStatistics.std);

    let x3 = 0;
    if (post.bonusLevel == 1) {
        x3 = 300;
    } else if (post.bonusLevel == 2) {
        x3 = 600;
    } else if (post.bonusLevel == 3) {
        x3 = 1000;
    }

    const x4 = get_standardized_score(post.trendingPost, trendingPostStatistics.mean, trendingPostStatistics.std);

    return 0.3 * x1 + 0.1 * x2 + 0.4 * x3 + 0.2 * x4;
}

module.exports = {

    update_user_score: async () => {
        const userStatistics = await csv().fromFile(path.join(__dirname, 'user_statistics.csv'));

        for (const element of userStatistics) {
            if (element.Attribute == 'postScore') {
                postScoreStatistics.mean = element.Mean;
                postScoreStatistics.std = element.Std;
            } else if (element.Attribute == 'ageAccount') {
                ageAccountStatistics.mean = element.Mean
                ageAccountStatistics.std = element.Std
            } else if (element.Attribute == 'salesHistory') {
                salesHistoryStatistics.mean = element.Mean;
                salesHistoryStatistics.std = element.Std;
            } else if (element.Attribute == 'usedTokens') {
                usedTokensStatistics.mean = element.Mean;
                usedTokensStatistics.std = element.Std;
            }
        }

        get_all_users().then((users) => {
            var bulkOp = User.collection.initializeOrderedBulkOp();
            var counter = 0;

            for (const user of users) {

                let currentTime = Date.now();
                let differenceInTime = currentTime - user.createdAt;
                let ageOfAccount = Math.floor(differenceInTime / (1000 * 3600 * 24));

                const userScore = calculate_user_score(user, ageOfAccount)
                console.log(userScore);
                var userRank = 'D';
                if (userScore > 900) {
                    userRank = 'S';
                } else if (900 >= userScore && userScore > 700) {
                    userRank = 'A';
                } else if (700 >= userScore && userScore > 500) {
                    userRank = 'B';
                } else if (500 >= userScore && userScore > 300) {
                    userRank = 'C';
                }
                bulkOp.find({ '_id': user._id }).updateOne({
                    '$set': {
                        'userScore': userScore,
                        'userRank': userRank,
                        'ageAccount': ageOfAccount
                    }
                });
                counter++;
                if (counter % 100 === 0) {
                    // Execute per 100 operations and re-init
                    bulkOp.execute(function (err, r) {
                        bulkOp = User.collection.initializeOrderedBulkOp();
                        counter = 0;
                    });
                }

            }

            if (counter > 0) {
                bulkOp.execute();
            }
        })

    },

    update_post_score: async () => {

        const postStatistics = await csv().fromFile(path.join(__dirname, 'post_statistics.csv'));

        for (const element of postStatistics) {
            if (element.Attribute == 'reviewsScore') {
                reviewsScoreStatistics.mean = element.Mean;
                reviewsScoreStatistics.std = element.Std;
            } else if (element.Attribute == 'trendingPost') {
                trendingPostStatistics.mean = element.Mean;
                trendingPostStatistics.std = element.Std;
            }
        }

        get_all_posts().then((posts) => {
            var bulkOp = Post.collection.initializeOrderedBulkOp();
            var counter = 0;

            for (const post of posts) {
                const postScore = calculate_post_score(post);
                bulkOp.find({ '_id': post._id }).updateOne({
                    '$set': {
                        'postScore': postScore
                    }
                });
                counter++;
                if (counter % 100 === 0) {
                    // Execute per 100 operations and re-init
                    bulkOp.execute(function (err, r) {
                        bulkOp = Post.collection.initializeOrderedBulkOp();
                        counter = 0;
                    });
                }
            }
            if (counter > 0) {
                bulkOp.execute();
            }

        })

    }
}

// module.exports.update_user_score()
// module.exports.update_post_score()