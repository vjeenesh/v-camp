const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocode = require("@mapbox/mapbox-sdk/services/geocoding");
const { spawn, spawnSync } = require("child_process");
const path = require("path");

const mbxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocode({ accessToken: mbxToken });

const PRODUCTS_PER_PAGE = 10;

module.exports.index = async (req, res) => {
  if (req.query.page === "all") {
    const campgrounds = await Campground.find({});
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );

    return res.status(200).json(campgrounds);
  }
  let current_page = req.query.page
    ? +req.query.page <= 0
      ? 1
      : +req.query.page
    : 1;
  let totalProducts, last_page, last_link, first_link;

  Campground.countDocuments()
    .then((count) => {
      totalProducts = count;
      last_page = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
      current_page = current_page > last_page ? last_page : current_page;
      first_link =
        current_page - 2 <= 1
          ? 1
          : last_page - 4 < current_page - 2
          ? last_page - 4
          : current_page - 2;
      last_link =
        current_page + 2 > last_page
          ? last_page
          : first_link + 4 > last_page
          ? current_page + 2
          : first_link + 4;
      return Campground.find()
        .skip((current_page - 1) * PRODUCTS_PER_PAGE)
        .limit(PRODUCTS_PER_PAGE);
    })
    .then((campgrounds) => {
      res.render("campgrounds/index", {
        campgrounds: campgrounds,
        pagination: {
          first: first_link,
          last: last_link,
          current: current_page,
        },
      });
    })
    .catch((err) => console.log(err));
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

  const recs_title = [];
  const python = spawnSync("python", [
    path.join(__dirname, "v-camp_recommendation/Recommender.py"),
    JSON.stringify(campground),
  ]);

  dataString = python.stdout.toString();
  console.log(dataString);
  err = python.stderr.toString();
  console.log(err);
  dataJson = JSON.parse(dataString);
  const recommendations = await Campground.find({
    title: { $in: dataJson["heading"] },
  });
  console.log(`recs title: ${dataJson["heading"]}`);
  console.log("recs: ", recommendations);

  res.render("campgrounds/show", { campground, recommendations });
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
