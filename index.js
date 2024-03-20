const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true,}));

mongoose.connect(
  "mongodb+srv://kartikginwal07:uF8TBPDR6xvzCjls@cluster0.bk1on2o.mongodb.net/khatabook"
);
var db = mongoose.connection;

db.on("error", () => console.log("Error in Connecting to Database"));
db.once("open", () => console.log("Connected to Database"));
app.post("/sign_up", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var phno = req.body.phno;
  var password = req.body.password;
  var data = {
    name: name,
    email: email,
    phno: phno,
    password: password,
  };
  db.collection("users").insertOne(data, (err, collection) => {
    if (err) throw err;
    console.log("Record Inserted Successfully");
  });
  return res.redirect("index.html");
});

app.post("/login", (req, res) => {
  const userCollection = db.collection("users");
  userCollection.findOne(
    { email: req.body.email, password: req.body.password },
    (err, user) => {
      if (user) {
        console.log("Login successful");
        res.redirect("home.html");
      } else {
        res.status(500).send("Login failed");
      }
    }
  );
});

app.post("/createCustomer", (req, res) => {
  var name = req.body.name;
  var phno = req.body.phno;
  var data = {
    name: name,
    phno: phno
  };
  db.collection("customers").insertOne(data, (err, collection) => {
    if (err) throw err;
    console.log("Customer Inserted Successfully");
  });
  res.cookie('khatabookname', name);
  return res.redirect("details.html");
})

app.post("/searchCustomer", async (req, res) => {
  const customerCollection = db.collection("customers");
  try {
    customerCollection.findOne(
      { name: req.body.userName },
      (err, user) => {
        if (user) {
          console.log("User found");
          res.cookie('khatabookname', req.body.userName);
          res.redirect("details.html")
        } else {
          res.status(404)
          console.log("User Not Found")
          res.redirect("home.html");
        }
      }
    )

  } catch (e) {
    document.getElementById('errorBox').style.display = "block";
    console.log(e);
  }
})

app.post('/api/add', async (req, res) => {
  try {
    const data = req.body;
    const collection = db.collection('transactions');
    await collection.insertOne(data);
    res.status(201).send({ message: 'Data added successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error adding data to MongoDB', error: error.message });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const collection = db.collection('transactions');
    const data = await collection.find({}).toArray();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching data from MongoDB', error: error.message });
  }
});

app.delete('/api/delete/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const collection = db.collection('transactions');
    const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    if (result.deletedCount === 1) {
      res.status(200).send({ message: 'Transaction deleted successfully' });
    } else {
      res.status(404).send({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error deleting transaction from MongoDB', error: error.message });
  }
});

app
  .get("/", (req, res) => {
    res.set({
      "Allow-access-Allow-Origin": "*",
    });
    return res.redirect("index.html");
  })
  .listen(3000);

console.log("Listening on Port 3000");
