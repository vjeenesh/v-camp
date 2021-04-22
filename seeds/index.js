const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useUnifiedTopology: true,
  useCreateIndex: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", () => {
  console.log("DB Connection Open!");
});

const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const seedDB = async () => {
  console.log(cities.length);
  await Campground.deleteMany({});
  for (let i = 0; i <= 100; i++) {
    const randNum = Math.floor(Math.random() * 200);
    const price = Math.floor(Math.random() * 1000) + 500;
    const camp = new Campground({
      location: `${cities[randNum].name}, ${cities[randNum].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      price,
      geometry: {
        coordinates: [
          parseInt(cities[randNum].lon),
          parseInt(cities[randNum].lat),
        ],
        type: "Point",
      },
      author: "60784cf371fba42030dc6453",
      images: [
        {
          url:
            "https://res.cloudinary.com/dj1psudpz/image/upload/v1618677272/YelpCamp/kpxylkkn6oztttosnfla.jpg",
          filename: "YelpCamp/kpxylkkn6oztttosnfla",
        },
        {
          url:
            "https://res.cloudinary.com/dj1psudpz/image/upload/v1618677344/YelpCamp/kn0xmwflambqh69hxtdz.jpg",
          filename: "YelpCamp/kn0xmwflambqh69hxtdz",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum perspiciatis, quasi sunt distinctio dolorem consectetur magnam quod, laboriosam ipsum fugiat excepturi laudantium aliquam nesciunt doloribus mollitia quaerat minus exercitationem expedita.",
    });
    await camp.save();
  }
};
seedDB().then(() => {
  console.log("DB Updated");
  mongoose.connection.close();
});
