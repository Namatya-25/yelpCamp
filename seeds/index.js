const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 2000 + 1000);
        const camp = new Campground({
            author: "6a07cbde41c816bbd7a7df4a",
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            title: `${sample(descriptors)}・${sample(places)}`,
            description: "みんな魚のようにこっちを見ている影も、もう汽車のひびきと、すすきの風との間にならび、思わず何べんもおまえといっしょに苹果をたべたり汽車に乗ってるんだよジョバンニは言いました。けれどもだんだん気をつけていました。それから橋の上に立って左手に時計を持って行ってしまいました。誰がいったいここらではこんな苹果ができるのですか車掌がたずねました。ところがそれはいちめん黒い唐草のような声がしました。",
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dmejlku18/image/upload/v1779418626/YelpCamp/bhhhmwjmnfjk8cvbkikc.jpg',
                    filename: 'YelpCamp/nstyjrm1nkjprklckknx',
                },
                {
                    url: 'https://res.cloudinary.com/dmejlku18/image/upload/v1779420201/YelpCamp/w26minxc94qdndhuos2v.jpg',
                    filename: 'YelpCamp/w26minxc94qdndhuos2v',
                }
            ],
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
