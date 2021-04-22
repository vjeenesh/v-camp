const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: {
    type: String,
  },
  filename: {
    type: String,
  },
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    images: {
      type: [imageSchema],
    },
    description: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    review: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

CampgroundSchema.virtual("properties.popupMarkup").get(function () {
  return `<a href="/campgrounds/${this._id}">${this.title}</a>
  <p>${this.description.substring(0, 20)}...</p>
  `;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  await Review.deleteMany({ _id: { $in: doc.review } });
});

module.exports = mongoose.model("Campground", CampgroundSchema);
