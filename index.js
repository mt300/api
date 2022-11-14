const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

var DB = {
    games: [
        {
            id: 1,
            name: "League of Legends",
            year: 2010,
            price: 0
        },
        {
            id:2,
            name: "Fall Guys",
            year: 2021,
            price: 10.99
        },
        {
            id:3,
            name: "GTA V",
            year: 1845,
            price: 1450.0
        }
    ]
}

app.get("/games",(req,res) => {
    res.statusCode = 200;
    res.json(DB.games);
})

app.get("/game/:id", (req,res) => {
    var id = req.params.id;
    if(isNaN(id)){
        res.statusCode = 400;
        res.send("That's not a number")
    }else{
        res.statusCode = 200;
        res.json(DB.games.find(el => (el.id == parseInt(id))));
    }
});

app.post("/game", (req,res) => {
    var {name,year,price,id} = req.body;

    DB.games.push({
        id: id,
        name: name,
        year: year,
        price: price
    });
    res.statusCode = 200;
    res.send("New game added");
})

app.delete("/game/:id", (req,res) => {
    var id = parseInt(req.params.id);
    if(isNaN(id)){
        res.sendStatus(400);
    }else{
        var index = DB.games.findIndex(g => g.id == id);
        if(index == -1){
            res.sendStatus(404)
        }else{
            DB.games.splice(index,1);
            res.sendStatus(200);
        }
    }
});

app.put("/game/:id", (req,res) => {
    var id = req.params.id;
    var { name, price, year} = req.body;
    var game = DB.games.find(el => (el.id == id));
    console.log(game);
    if(isNaN(id)){
        res.statusCode = 400;
        res.send("That's not a number")
    }else{
        
        if(year != undefined){
            game.year = year
        }

        if(name != undefined){
            game.name = name
        }

        if(price != undefined){
            game.price = price
        }
        res.sendStatus(200);
        // res.json(DB.games.find(el => (el.id == parseInt(id))));
    }
});

app.listen(8080,() => {
    console.log("API Running");
});
