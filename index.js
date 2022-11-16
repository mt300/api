const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");


const JWTSecret = "random";

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

function auth(req,res,next){
    const authToken = req.headers['authorization'];

    if(authToken != undefined){
        
        const bearer = authToken.split(" ");
        const token = bearer[1];

        jwt.verify(token,JWTSecret, (err,data) => {
            if(err){
                res.status(401);
                res.json({err:"Invalid Token"});
            }else{

                req.token = token;
                req.loggedUser = {id: data.id, email: data.email}
                // console.log(data);
                next();
            }
        });

    }else{
        res.status(401);
        res.json({err:"Invalid Token"});
    }

    next();
}

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
    ],
    users: [
        {
            id: 1,
            name: "Matheus",
            email: "matheus.tomazi5@gmail.com",
            password: "123"
        },
        {
            id: 2,
            name: "Clara",
            email: "claragami@gmail.com",
            password: "123"
        }
    ]
}

app.get("/games",auth,(req,res) => {

    var HATEOAS = [
        {
            href: "http://localhost:8080/game/1",
            method: "DELETE",
            rel: "delete_game"
        },
        {
            href: "http://localhost:8080/game/1",
            method: "PUT",
            rel: "edit_game"
        }
    ]

    res.statusCode = 200;
    res.json({games:DB.games,_links:HATEOAS});
})

app.get("/game/:id", (req,res) => {
    var id = parseInt(req.params.id);
    if(isNaN(id)){

        res.statusCode = 400;
        res.send("That's not a number")
    }else{
        var HATEOAS = [
            {
                href: "http://localhost:8080/game/" + id,
                method: "DELETE",
                rel: "delete_game"
            },
            {
                href: "http://localhost:8080/game/" + id,
                method: "PUT",
                rel: "edit_game"
            }
        ]
        var games = DB.games.find(el => (el.id == parseInt(id)));
        res.statusCode = 200;
        res.json({games:games,_link:HATEOAS});
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

app.post("/auth", (req,res) => {
    var {email, password} = req.body;
    if(email != undefined){
        var user = DB.users.find(u => u.email == email);

        if(user != undefined){
            if(user.password == password){
                
                jwt.sign({id: user.id, email: user.email}, JWTSecret, {expiresIn:'48h'},(err,token) =>{
                    if(err){
                        res.status(400);
                        res.json({err:"Internal Failure"});
                    }else{
                        res.status(200);
                        res.json({token:token});
                    }
                });

            }else{
                res.status(401);
                res.json({err: "BAD Authentication"});
            }
            
        }else {
            res.status(404);
            res.json({err: "email doesn't exist"});
        }
    }else{
        console.log("wtf")
        res.status(400);
        res.json({err: "email invalido"});
    }
});

app.listen(8080,() => {
    console.log("API Running");
});
