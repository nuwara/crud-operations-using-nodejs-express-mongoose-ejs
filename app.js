const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const methodOverride = require("method-override");
const multer = require("multer");
const session = require("express-session");
const flash = require("connect-flash");

const app = express();

// mongodb connection
mongoose.connect("mongodb://127.0.0.1:27017/productDB");

// mongoose schema and model
const productSchema = new mongoose.Schema({
  image: String,
  name: String,
  description: String,
  price: Number,
  qty: Number,
});
const Product = mongoose.model("Product", productSchema);

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

// ejs view engine setup
app.set("view engine", "ejs");

// express session and flash set up
app.use(
  session({
    secret: "blogCruds",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());

// muter set
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },

  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}.${file.originalname}`);
  },
});
const upload = multer({ storage: multerStorage });

// routes
app.get("/products", (req, res) => {
  Product.find().then((results) => {
    res.render("index", { results, successMsg: req.flash("message") });
  });
});

app.get("/products/add", (req, res) => {
  res.render("add");
});
app.post("/products", upload.single("image"), (req, res) => {
  const productObjects = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    qty: req.body.qty,
  };
  if (req.file) {
    productObjects.image = req.file.filename;
  }
  // console.log(productObjects);
  const newProduct = new Product(productObjects);
  newProduct
    .save()
    .then(() => {
      req.flash("message", "product added successfully");
      res.redirect("/products");
    })
    .catch((err) => console.log(err));
});

app.get("/products/:id", (req, res) => {
  Product.findById(req.params.id)
    .then((result) => res.render("edit", { result }))
    .catch((err) => console.log(err));
});

app.put("/products/:id", upload.single("image"), (req, res) => {
  const productUpdates = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    qty: req.body.qty,
  };
  if (req.file) {
    productUpdates.image = req.file.filename;
  }
  Product.findByIdAndUpdate(req.params.id, productUpdates)
    .then(() => {
      req.flash("message", "Data updated successfully");
      res.redirect("/products");
    })
    .catch((err) => console.log(err));
});

app.delete("/products/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then(() => {
      req.flash("message", "Data deleted successfully");
      res.redirect("/products");
    })
    .catch((err) => console.log(err));
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
