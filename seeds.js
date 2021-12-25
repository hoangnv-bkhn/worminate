const faker = require('faker');
const Post = require('./models/Post');
const Review = require('./models/Review');
const cities = require('./cities');

async function seedPosts() {
    await Post.deleteMany({});
    for (const i of new Array(600)) {
        const random1000 = Math.floor(Math.random() * 1000);
        const random5 = Math.floor(Math.random() * 6);
        const title = faker.lorem.word(10);
        const description = faker.lorem.text();
        const review = await Review.create({
            body: faker.lorem.word(30),
            rating: random5,
            author: '61b2da2ea74b4f0de843a7d1'
        });
        const postData = {
            title,
            description,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude],
            },
            price: random1000,
            author: '61b2d9caa74b4f0de843a7ca',
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
    console.log('600 new posts created');
}

module.exports = seedPosts;