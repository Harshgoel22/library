const express = require('express');
const mysql = require("mysql");
const app = express();
const bodyParser = require("body-parser");

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

//declare variables
let unique_id = 1;
//for signup
let pass = false;
let nully = false;
let success = false;
let userPass = false;
let fullname = ""; 
//for login
let valid_login = false;
let valid_user = false;

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#Harsh@27',
    database: 'signin'
});

// create unique id 
con.query('select * from list',function(err,result,fields){
    if(err){
        console.log(err);
    }
    else{
        if(result.length > 0){
            unique_id = result.length+1;
        }
    }
});

app.get('/', function (req,res){
    res.render("homepage");
});

app.get('/list',function(req,res){
    con.query('select * from list',function(err,result,fields){
        if(err){
            console.log(err);
        }
        else{
            res.render("list",{list: result});
        }
    })
});

app.get('/err',function(req,res){
    res.render("error",{check_nully : nully, check_pass : pass, succ : success, userpass : userPass, full_name: fullname, validLogin : valid_login, validUser : valid_user});
});

app.post('/list',function(req,res){
    var id = unique_id;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var dob = req.body.dob;
    var username = req.body.username;
    var gender = req.body.gender;
    var password = req.body.password;
    var confirmPassword = req.body.cpassword;

    if(id && fname && lname && email && password && dob && username && gender && confirmPassword){
        if(password === confirmPassword){

            const query = 'select * from list where userName = ?';
            con.query(query,[username],function(error,data){
                console.log(data);
                if(data.length === 0){
                    con.query('insert into list values(?,?,?,?,?,?,?,?)',[id,fname,lname,email,dob,gender,username,password],function(err,result){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log("Connected!");
                            userPass=pass=nully=false;
                            success = true;
                            res.redirect("/err");
                        }
                    });
                }
                else{
                    pass=nully=success=false;
                    userPass = true;
                    res.redirect("/err");
                }
            });

        }
        else{
            pass = true;
            nully=userPass=success=false;
            res.redirect("/err");
        }
    }
    else{
        nully = true;
        pass=userPass=success=false;
        res.redirect("/err");
    }
    
});

app.post('/post',function(req,res){
    var member = req.body.Member;
    var username = req.body.username;
    var password = req.body.password;

    if(member && username && password){
        const query = 'select * from list where userName = ?';
        con.query(query,[username],function(error,data){
            if(data.length > 0){
                if(data[0].pasword === password){
                    fullname = data[0].firstName + " " + data[0].lastName;
                    valid_login = true;
                    nully=pass=valid_user=false;
                    //here we have to redirect it to the homepage 
                    res.redirect("/err");
                }
                else{
                    pass = true;
                    valid_login=nully=valid_user=false;
                    res.redirect("/err");
                }
            }
            else{
                valid_user = true;
                pass=valid_login=nully=false;
                res.redirect("/err");
            }
        });
    }else{
        nully = true;
        valid_login=pass=valiid_user=false;
        res.redirect("/err");
    }

});

app.listen(3000,function(){
    console.log("Server has started on port 3000");
});