const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerdUser = await User.register(user, password);
        req.login(registerdUser, err => {
            if (err) return next(err);
            req.flash("success", "yelp campへようこそ");
            res.redirect("/campgrounds");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }

}

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

module.exports.login = (req, res) => {
        req.flash("success", "おかえりなさい!");
        
        // 避難させておいた元のURL（res.locals.returnTo）があればそこへ、なければ一覧ページへ
        const redirectUrl = res.locals.returnTo || "/campgrounds";
        res.redirect(redirectUrl);
    }

module.exports.logout = (req, res, next) => {
    // req.logout の中にエラーハンドリング用の関数を渡す仕様に変更されました
    req.logout((err) => {
        // もしログアウト処理中にエラーが発生したら、エラーハンドラーに処理を逃がす
        if (err) {
            return next(err);
        }

        // ログアウトが「無事に成功した後」に、メッセージを設定してリダイレクトする
        req.flash("success", "ログアウトしました");
        res.redirect("/campgrounds");
    });
}