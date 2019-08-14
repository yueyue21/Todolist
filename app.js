//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
// console.log(date.getDate());
// const request = require("request");
const app = express();
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static("Public"));

// mongoose.connect(
//   "mongodb://localhost:27017/todolistDB", {
//     useNewUrlParser: true
//   }
// );

mongoose.connect("<mongode: connect>", {
  useNewUrlParser: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
// initialize the database
const item1 = new Item({
  name: "Welcome to to-do list"
});
const item2 = new Item({
  name: "Hit the button to create a new item"
});
const item3 = new Item({
  name: "Hit the checkbox to delete an item"
});
let defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

let today = date.getDate();
app.get("/", (req, res) => {
  Item.find({}, (err, resList) => {
    if (err) {
      console.log(err);
    } else {
      if (resList.length === 0) {
        Item.insertMany(defaultItems, (err, res) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully initialized the todolistDB");
          }
        });
        res.redirect("/");
        // console.log("redirected!~~~~~~~~~");
      } else {
        //console.log(resList);
        res.render("list", {
          listTitle: today,
          newListItems: resList
        });
      }
    }
  });
});

app.post("/", (req, res) => {
  //create a new document from Item model and insert it to the items collection
  const itemName = req.body.newItem;
  const listName = req.body.list;

  let item = new Item({
    name: itemName
  });
  if (listName === today) {
    item.save();
    res.redirect("/");
  } else {
    // as long as the list can be visited, it indicates it is exist
    // just need match the foundList.name is same as the listTitle(listName)
    // one to many relationship
    List.findOne(
      {
        name: listName
      },
      (err, foundList) => {
        foundList.items.push(item);
        //"save" the original obj rather than its child obj
        foundList.save();
        res.redirect("/" + listName);
      }
    );
  }
});

//with each checkBox checked
app.post("/delete", (req, res) => {
  //the value returned from the font checkbox
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;
  if (listName === today) {
    Item.deleteOne(
      {
        _id: checkedItemId
      },
      (err, response) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully deleted item: " + checkedItemId);
        }
      }
    );
    res.redirect("/");
  } else {
    //match the list name at the condition
    //pull(delete) the  matched id query result
    //
    List.findOneAndUpdate(
      {
        name: listName
      },
      {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        } else {
          console.log(err);
        }
      }
    );
  }
});

app.get("/:name", (req, res) => {
  const customListName = _.capitalize(req.params.name);
  List.findOne(
    {
      name: customListName
    },
    (err, foundList) => {
      if (!err) {
        if (!foundList) {
          //create a new list
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          // display the existing list
          // console.log(foundList);
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items
          });
        }
      } else {
        console.log(err);
      }
    }
  );
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
