const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocode = require("@mapbox/mapbox-sdk/services/geocoding");

const mbxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocode({ accessToken: mbxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.newCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  // if (!req.body.campground)
  //   throw new ExpressError("Invalid Campground Data", 400);
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.author = req.user._id;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  await campground.save();
  console.log(campground);
  req.flash("success", "Campground Added Successfully");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "review",
      populate: {
        path: "author",
      },
    })
    .populate("author", "username");
  // console.log(campground);
  // console.log(req.user);
  if (!campground) {
    req.flash("error", "Campground Not Found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Campground Not Found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.editCampground = async (req, res) => {
  const newCampground = req.body.campground;
  const campground = await Campground.findByIdAndUpdate(req.params.id, {
    ...newCampground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  campground.save();
  if (req.body.deleteImages) {
    for (let image of req.body.deleteImages) {
      await cloudinary.uploader.destroy(image);
    }
    await campground.updateOne({
      $pull: {
        images: {
          filename: { $in: req.body.deleteImages },
        },
      },
    });
  }
  req.flash("success", "Campground Updated Successfully");
  res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const campground = await Campground.findByIdAndDelete(req.params.id);
  if (campground.images) {
    for (let image of campground.images) {
      await cloudinary.uploader.destroy(image.filename);
    }
  }
  req.flash("success", "Campground Deleted Successfully");
  res.redirect("/campgrounds");
};
