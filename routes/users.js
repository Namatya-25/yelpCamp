const express = require("express");
const router = express.Router();
const passport = require("passport");
const users = require("../controllers/users");
//下のやついらんかも
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middleware");

router.route("/register")
    .get(users.renderRegister)
    .post(users.register);


router.route("/login")
    .get(users.renderLogin)
    .post( 
    // 1. セッションがクリアされる前に returnTo を res.locals に避難
    storeReturnTo, 
    // 2. ログイン認証（ここでセッションがクリアされる）
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), 
    // 3. ログイン成功後の処理
    users.login
);

// router.get("/logout", (req, res) => {
//     req.logout();
//     req.flash("success", "ログアウトしました");
//     res.redirect("/campgrounds");
// });

// 引数に「next」を追加する
router.get("/logout", users.logout);

module.exports = router;