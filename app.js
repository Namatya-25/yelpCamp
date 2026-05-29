if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

// 書き直した
const MongoStore = require('connect-mongo').default || require('connect-mongo');

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl)
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

const app = express();

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
// なんかむり
// app.use(mongoSanitize());

const secret = process.env.SECRET || "mysecret";

const store = MongoStore.create({
    mongoUrl: dbUrl, // 先ほど設定した dbUrl を指定します
    crypto: {
        secret // 本番環境ではもっと複雑な文字列にすることをおすすめします！
    },
    touchAfter: 24 * 3600 // セッションの更新頻度（秒）
});

store.on('error', e => {
    console.log('セッションストアエラー', e);
});

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(helmet());

// MapTiler 用のドメインを設定
const scriptSrcUrls = [
    'https://cdn.maptiler.com', // MapTiler SDK / OpenLayers / Leaflet 等のライブラリ用
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://cdn.maptiler.com', // MapTiler の CSS 用
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.maptiler.com', // 地図タイル、ジオコーディング、ルート検索などの API 用
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com',
    'https://api.maptiler.com'   // 静的マップ画像などを取得する場合に必要
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/", (req, res) => {
    res.render("home");
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);


app.all(/.*/, (req, res, next) => {
    next(new ExpressError("ページが見つかりませんでした"), 404)
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "問題が起きました"
    }
    res.status(statusCode).render("error", { err });
});

const port = process.env.POST || 3000
app.listen(port, () => {
    console.log(`ポート${port}でリクエスト待ち受け中`);
});