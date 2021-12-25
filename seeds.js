// const faker = require('faker');
// const Post = require('./models/Post');
// const Review = require('./models/Review');
const User = require('./models/User');
// const cities = require('./cities');
async function seedPosts() {
    // await Post.deleteMany({});
    // for (const i of new Array(300)) {
    //     const random1000 = Math.floor(Math.random() * 1000);
    //     const random5 = Math.floor(Math.random() * 6);
    //     const title = faker.lorem.word(10);
    //     const description = faker.lorem.text();
    //     const review = await Review.create({
    //         body: faker.lorem.word(30),
    //         rating: random5,
    //         author: '61c735b7dd5246a05898604c'
    //     });
    //     const postData = {
    //         title,
    //         description,
    //         location: `${cities[random1000].city}, ${cities[random1000].state}`,
    //         geometry: {
    //             type: 'Point',
    //             coordinates: [cities[random1000].longitude, cities[random1000].latitude],
    //         },
    //         price: random1000,
    //         author: '61c735e9dd5246a058986054',
    //         category: '61c72f8353ea1a64eda2e34e',
    //         bonusLevel: Math.floor(Math.random() * 4),
    //         trendingPost: Math.floor(Math.random() * 1000),
    //         postScore: Math.floor(Math.random() * 1000),
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
    //     await post.save();
    //     await post.reviewsScoreCaculate();
    // }
    // console.log('600 new posts created');
    const mongoose = require('mongoose');
    const mongoDB = "mongodb+srv://dungUser:dungNt2000@cluster0.vkheq.mongodb.net/dbWorminate?retryWrites=true&w=majority";
    mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', function () { console.log('MongoDB connection open'); });
    var user = await User.findById('61c734c6296b51facc0c7e7d');
    user.createdAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 1536);
    console.log(user.createdAt)
    await user.save();
    console.log('User saved')
}
seedPosts()

// module.exports = seedPosts;