const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();
var saltRounds = 10;
var adminCount = 0;
var userCount = 0;
var userId, name, imgUrl, msg;


// Mongoose config.
mongoose.connect("mongodb://0.0.0.0:27017/adminDB");
const loginSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: {
        type: String,
        default: "User"
    }
});
const User = mongoose.model("user", loginSchema);

const dataSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: String,
    imgUrl: String,
    msg: {
        type: String,
        default: "Not Accepted by Admin"
    }
});
const UserData = mongoose.model("data", dataSchema);

// EJS and Body-parser config.
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(bodyParser.text({ limit: '200mb' }));

// GET REST APIs.....
app.get("/", (req, res) => {
    res.render("home");
})
app.get("/admin", (req, res) => {
    res.render("login", { heading: "Admin Login!" });
})

app.get("/user", (req, res) => {
    res.render("login", { heading: "User Login!" });
})

app.get("/create", async (req, res) => {
    if (adminCount === 1) {
        try {
            const result = await UserData.find({});
            if (result) {
                res.render("createUser", { result });
            }
        } catch (err) {

        }
    } else {
        res.redirect("/admin")
    }
});

app.get("/credentials", (req, res) => {
    if (userCount === 1) {
        res.render("credentials", { userId });
    } else {
        res.redirect("/user")
    }

})

app.get("/view", async (req, res) => {
    try {
        const result = await UserData.find({});
        // console.log(result);
        res.render("adminView", { result })
    } catch (err) {
        console.log(err);
    }
})

app.get("/userView", (req, res) => {
    res.render("userView", { name, imgUrl, msg });
})

app.get("/userView/:id", async (req, res) => {
    var id = new mongoose.Types.ObjectId(req.params);
    try {
        const [result] = await UserData.find({ userID: id });
        // console.log(result);
        if (result) {
            name = result.userName;
            imgUrl = result.imgUrl;
            msg = result.msg;
            res.redirect("/userView");
        }
    } catch (err) {
        console.log(err)
    }
})


// ADMIN APIs... DELETE AND UPDATE HANDLING......
app.get("/patch/:id", async (req, res) => {

    var id = new mongoose.Types.ObjectId(req.params);
    try {
        const result = await UserData.updateOne({ userID: id }, { msg: "Accepted by Admin" });
        if (result) console.log("Successfully udated.");
        res.redirect("/view");
    } catch (err) {
        console.log(err);
    }
})

app.get("/delete/:id", async (req, res) => {

    var id = new mongoose.Types.ObjectId(req.params);
    try {
        const result = await UserData.deleteOne({ userID: id });
        if (result) console.log("Successfully deleted.");
        res.redirect("/view");
    } catch (err) {
        console.log(err);
    }
})


// POST REST APIs...
app.post("/upload_files", async (req, res) => {
    // console.log(req.body);
    // res.send({ message: "uploaded" });
    const newData = new UserData({
        userID: req.body.userId,
        userName: req.body.name,
        imgUrl: req.body.imgUrl
    });
    const save = await newData.save();
    if (save) {
        res.redirect("/user")
    }
})


app.post("/create", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
            console.log("bcrypt error message:", err);
        } else {
            const user = new User({
                email,
                password: hash
            });
            const save = await user.save();
            if (save) {
                res.redirect("/user")
            }
        }
    });

    // console.log(req.body);
})

app.post("/login", async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    try {
        const result = await User.findOne({ email });
        if (result.role === "Admin") {
            bcrypt.compare(password, result.password, (err, response) => {
                if (err) {
                    console.log("bcrypt compare error: ", err);
                }
                if (response) {
                    res.redirect("/create");
                    adminCount = 1;
                } else {
                    res.redirect("/admin");
                }
            })
        }
        if (result.role === "User") {
            bcrypt.compare(password, result.password, (err, response) => {
                if (err) {
                    console.log("bcrypt compare error: ", err);
                }
                if (response) {
                    res.redirect("/credentials");
                    userId = result._id.valueOf();
                    userCount = 1;
                } else {
                    res.redirect("/user");
                }
            })
        }
        // console.log(result._id.valueOf());
    } catch (err) {
        console.log("User Data Finding Errrors:", err);
    }
})

app.listen(3000, () => {
    console.log("server started on port 3000.");
})