const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const regUser = await User.register(user, password);
    req.login(regUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to YelpCamp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  const returnTo = req.session.returnTo;
  const redirectUrl = returnTo || "/campgrounds";
  delete req.session.returnTo;
  req.flash("success", "Welcome back!");
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Logged Out Successfully");
  res.redirect("/login");
};
