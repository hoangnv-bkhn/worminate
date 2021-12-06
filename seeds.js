const faker = require('faker');
const Post = require('./models/post');
const cities = require('./cities');

async function seedPosts() {
    await Post.deleteMany({});
    for (const i of new Array(600)) {
        const random1000 = Math.floor(Math.random() * 1000);
        const random5 = Math.floor(Math.random() * 6);
        const title = faker.lorem.word();
        const description = faker.lorem.text();
        const postData = {
            title,
            description,
            category: '619513b5b04caf25341b5e30',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude],
            },
            price: random1000,
            avgRating: random5,
            author: '61951314b04caf25341b5df3'
        }
        let post = new Post(postData);
        post.properties.description = `<strong><a href="/posts/${post._id}">${title}</a></strong><p>${post.location}</p><p>${description.substring(0, 20)}...</p>`;
        await post.save();
    }
    console.log('600 new posts created');
}

module.exports = seedPosts;