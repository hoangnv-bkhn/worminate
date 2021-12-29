const faker = require('faker');
const Post = require('./models/Post');
const Review = require('./models/Review');
const User = require('./models/User');
const cities = require('./cities');

function random_item(items) {

    return items[Math.floor(Math.random() * items.length)];

}

var userId = ['61cb3f9296a33b1c93cec735', '61cb3faf96a33b1c93cec739', '61cb3fc996a33b1c93cec73d', '61cb3fdb96a33b1c93cec741', '61cb3fee96a33b1c93cec745'];

var category = ['61c72f6953ea1a64eda2e34a', '61c72f8353ea1a64eda2e34e', '61c72fa153ea1a64eda2e352', '61c9d6f0520edfa1e5dd9c88'];

var bool = [true, false];

async function seedPosts() {
    await Post.deleteMany({});
    for (const i of new Array(500)) {
        const random1000 = Math.floor(Math.random() * 1000);
        const random5 = Math.floor(Math.random() * 6);
        const title = faker.lorem.word(10);
        const description = faker.lorem.text();
        const review = await Review.create({
            body: faker.lorem.word(30),
            rating: random5,
            author: random_item(userId)
        });
        const postData = {
            title,
            description,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude],
            },
            status: random_item(bool),
            price: random1000,
            author: random_item(userId),
            category: random_item(category),
            promotePlan: Math.floor(Math.random() * 4),
            trendingPost: Math.floor(Math.random() * 1000),
            postScore: Math.floor(Math.random() * 1000),
            images: [
                {
                    path: 'https://picsum.photos/1000/1500',
                    filename: faker.lorem.word(15)
                },
                {
                    path: 'https://picsum.photos/1000/1500',
                    filename: faker.lorem.word(15)
                },
                {
                    path: 'https://picsum.photos/1000/1500',
                    filename: faker.lorem.word(15)
                }
            ]
        }
        let post = new Post(postData);
        post.reviews.push(review);
        post.properties.description = `<strong><a href="/posts/${post._id}">${title}</a></strong><p>${post.location}</p><p>${description.substring(0, 20)}...</p>`;
        await post.save();
        await post.reviewsScoreCaculate();
    }
    console.log('500 new posts created');
}

module.exports = seedPosts;