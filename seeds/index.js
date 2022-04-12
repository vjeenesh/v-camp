const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const Campground = require("../models/campground");
const seed_data = require("./seed_data.json");

const mbxGeocode = require("@mapbox/mapbox-sdk/services/geocoding");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocode({ accessToken: mbxToken });

dburl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dburl, {
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
  for (let i = 0; i <= 1160; i++) {
    const price = Math.floor(Math.random() * 1000) + 500;
    const geoData = await geocoder
      .forwardGeocode({
        query: seed_data["location"][i],
        limit: 1,
      })
      .send();
    const camp = new Campground({
      location: seed_data["location"][i],
      title: seed_data["heading"][i],
      price,
      geometry: geoData.body.features[0].geometry,
      author: "6080737fe30d0d3ad8ef79c3",
      images: [
        {
          url: seed_data["img_url"][i],
          filename: `YelpCamp/${seed_data["heading"][i]}`,
        },
      ],
      description: seed_data["text"][i],
    });
    await camp.save();
  }
};
seedDB().then(() => {
  console.log("DB Updated");
  mongoose.connection.close();
});
console.log("End of Script");
