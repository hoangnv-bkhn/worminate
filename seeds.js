const faker = require('faker');
const Post = require('./models/Post');
const Review = require('./models/Review');
const User = require('./models/User');
const cities = require('./cities');

function random_item(items) {

    return items[Math.floor(Math.random() * items.length)];

}

var userId = ['61cd353732361a43ee6175db', '61cd353732361a43ee6175dd', '61cd353732361a43ee6175df', '61cd353732361a43ee6175e1', '61cd353732361a43ee6175e3', '61cd353732361a43ee6175e5', '61cd353732361a43ee6175e7', '61cd353732361a43ee6175e9', '61cd353732361a43ee6175eb', '61cd353832361a43ee6175ed'];

var category = ['61c72f6953ea1a64eda2e34a', '61c72f8353ea1a64eda2e34e', '61c72fa153ea1a64eda2e352', '61c9d6f0520edfa1e5dd9c88'];

var bool = [true, false];

async function seedPosts() {
    // for (let i = 0; i < 50; i++) {
    //     let randomUser = random_item(userId);
    //     let userCreated = random_item(userId);
    //     let user = await User.findById(userCreated);
    //     let check = 0;
    //     user.manageFollowers.follow.map(item => {
    //         if (randomUser == item._id.toString()) {
    //             check++;
    //         }
    //     });
    //     if (check > 0) {
    //         continue;
    //     } else {
    //         user.manageFollowers.follow.push(randomUser);
    //         await user.save();
    //         delete user;
    //         user = await User.findById(randomUser);
    //         user.manageFollowers.followBy.push(userCreated);
    //         await user.save();
    //     }
    // }
    // await User.deleteMany({});
    // for (let i = 0; i < 10; i++) {
    //     const random1000 = Math.floor(Math.random() * 1000);
    //     const random5 = Math.floor(Math.random() * 6);
    //     const fullName = faker.lorem.word(10);
    //     const email = faker.lorem.word(5) + '@' + faker.lorem.word(5) + '.com';
    //     const userData = {
    //         fullName,
    //         email,
    //         password: 123456,
    //         admin: random_item(bool),
    //         active: true,
    //         image: {
    //             path: 'https://picsum.photos/1000/1500',
    //             filename: faker.lorem.word(15)
    //         },
    //         postsScore: random5,
    //         salesHistory: random1000,
    //         usedTokens: random5 * 10,
    //         reported: random5,
    //         createdAt: new Date(Date.now() - random1000 * 24 * 60 * 60 * 1000),
    //     }
    //     let user = new User(userData);
    //     await user.save();
    // }
    // await Post.deleteMany({});
    // for (const i of new Array(350)) {
    //     const random1000 = Math.floor(Math.random() * 1000);
    //     const random5 = Math.floor(Math.random() * 6);
    //     const title = faker.lorem.word(10);
    //     const description = faker.lorem.text();
    //     const review = await Review.create({
    //         body: faker.lorem.word(30),
    //         rating: random5,
    //         author: random_item(userId)
    //     });
    //     const postData = {
    //         title,
    //         description,
    //         location: `${cities[random1000].city}, ${cities[random1000].state}`,
    //         geometry: {
    //             type: 'Point',
    //             coordinates: [cities[random1000].longitude, cities[random1000].latitude],
    //         },
    //         status: random_item(bool),
    //         price: random1000,
    //         author: random_item(userId),
    //         category: random_item(category),
    //         promotionalPlan: Math.floor(Math.random() * 4),
    //         postScore: Math.floor(Math.random() * 1000),
    //         expirationDate: new Date(Date.now() + random1000 * 24 * 60 * 60 * 100),
    //         images: [
    //             {
    //                 path: 'https://picsum.photos/1000/1500',
    //                 filename: faker.lorem.word(15)
    //             },
    //             {
    //                 path: 'https://picsum.photos/1000/1500',
    //                 filename: faker.lorem.word(15)
    //             },
    //             {
    //                 path: 'https://picsum.photos/1000/1500',
    //                 filename: faker.lorem.word(15)
    //             }
    //         ]
    //     }
    //     let post = new Post(postData);
    //     post.reviews.push(review);
    //     post.properties.description = `<strong><a href="/posts/${post._id}">${title}</a></strong><p>${post.location}</p><p>${description.substring(0, 20)}...</p>`;
    //     const date = time_now();
    //     date.setDate(date.getDate() - 29);
    //     for (let i = 0; i < 30; i++) {
    //         post.hitCounter.set(date.toUTCString(), Math.floor(Math.random() * 1000).toString());
    //         date.setDate(date.getDate() + 1);
    //     }
    //     await post.save();
    //     await post.reviewsScoreCaculate();
    //     const user = await User.findById(post.author);
    //     user.postList.push(post._id);
    //     await user.save();
    // }
    // console.log('500 new posts created');
}

module.exports = seedPosts;