const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
 
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
 

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);
 
// *** Create a Mongoose Documents: ***
const item1 = new Item({
  name: "Welcome to your todolist!"
});
 
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
const defaultItems = [item1, item2, item3];

Item.insertMany(defaultItems)       .then(function () {         console.log("Successfully saved defult items to DB");       })       .catch(function (err) {         console.log(err);       });
 
// *** Create a list Schema: ***
const listSchema = {
  name: String,
  items: [itemsSchema]
};
 
// *** Create a list Model: ***
const List = mongoose.model("list", listSchema);
 
app.get("/", function(req, res) {
  // *** Mongoose find() ***
  Item.find().then(function (foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
        console.log("Successfully saved defult items to DB");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
});
 
app.post("/", function(req, res){
  // *** Adding a New Item: ***
  const itemName = req.body.newItem;
  const listName = req.body.list.trim();
 
  const item = new Item({
    name: itemName
  });
 
  if (listName === "Today"){
    // *** Save item to mongoose: ***
    item.save();
    // *** render item to home page: ***
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
 
app.post("/delete", function(req, res){
 
  const checkedItemId = req.body.checkbox.trim();
 
  Item.findByIdAndRemove(checkedItemId).then(function(foundItem){Item.deleteOne({_id: checkedItemId})})
 
  res.redirect("/");
 
});

app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(4000, function() {
  console.log("Server started on port 3000");
});