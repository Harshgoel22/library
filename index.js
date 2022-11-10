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
let st_id = 0;
let user_id = 0;
//for signup
let pass = false;
let nully = false;
let success = false;
let userPass = false;
let fullname = ""; 
let user_fullname = "";
let admin_fullname = "";
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
    con.query('select * from student',function(error,output,fields){
        unique_id = result.length + output.length +1;
    });
});

app.get('/', function (req,res){
    res.render("homepage");
});
//getting users list
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

//getting students list
app.get('/studentList',function(req,res){
    con.query('select * from student',function(err,result,fields){
        if(err){
            console.log(err);
        }
        else{
            res.render("studentList",{list: result});
        }
    })
});

app.get('/err',function(req,res){
    res.render("error",{check_nully : nully, check_pass : pass, succ : success, userpass : userPass, full_name: fullname, validLogin : valid_login, validUser : valid_user});
});

//after posting the signup credential, this will execute.
app.post('/list',function(req,res){
    var id = unique_id;
    var role = req.body.Role;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var dob = req.body.dob;
    var username = req.body.username;
    var gender = req.body.gender;
    var password = req.body.password;
    var confirmPassword = req.body.cpassword;
    //for adding to student list
    if(role==="student"){
        var studentId = req.body.stdID;
        if(id && studentId && fname && lname && email && password && dob && username && gender && confirmPassword){
            if(password === confirmPassword){
                
                con.query('select * from student where Susername = ?',[username],function(error,data){
                 if(error) throw error;
                 else
                    console.log(data);
                    if(data.length === 0){
                        con.query('insert into student values(?,?,?,?,?,?,?,?,?)',[id,studentId,fname,lname,email,dob,gender,username,password],function(err,result){
                            if(err){
                                console.log(err);
                            }
                            else{
                                console.log("Connected!");
                                userPass=pass=nully=false;
                                success = true;
                                fullname = fname + " " + lname;
                                st_id = unique_id;
                                res.redirect("/student");
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
    }

    //for adding to user list
    else{
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
                                user_fullname = data[0].firstName + " " + data[0].lastName;
                                user_id = unique_id;
                                res.redirect("/user");
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
    }
});

//after posting the login credential, this will execute.
app.post('/post',function(req,res){
    var member = req.body.Member;
    var username = req.body.username;
    var password = req.body.password;

    if(member && username && password){
        //for admin login
        if(member==="admin"){
            const query = 'select * from adminList where username = ?';
        con.query(query,[username],function(error,data){
            if(data.length > 0){
                if(data[0].password === password){
                    admin_fullname = data[0].firstname + " " + data[0].lastname;
                    valid_login = true;
                    nully=pass=valid_user=false;
                    //here we have to redirect it to the homepage 
                    res.redirect("/admin");
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
        }
        //for user login
        else if(member==="user"){
            const query = 'select * from list where userName = ?';
        con.query(query,[username],function(error,data){
            if(data.length > 0){
                if(data[0].pasword === password){
                    user_fullname = data[0].firstName + " " + data[0].lastName;
                    valid_login = true;
                    nully=pass=valid_user=false;
                    //assigning value to unique id for demanding book
                    user_id = data[0].id;
                    //here we have to redirect it to the homepage 
                    res.redirect("/user");
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
        }
        //for student login
        else{
            const query = 'select * from student where Susername = ?';
        con.query(query,[username],function(error,data){
            if(data.length > 0){
                if(data[0].Spassword === password){
                    fullname = data[0].Sfname + " " + data[0].Slname;
                    valid_login = true;
                    nully=pass=valid_user=false;
                    //assigning value to unique id for demanding book
                    st_id = data[0].khId;
                    //here we have to redirect it to the homepage 
                    res.redirect("/student");
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
        }
    }else{
        nully = true;
        valid_login=pass=valiid_user=false;
        res.redirect("/err");
    }

});

//getting user homepage
app.get('/user',function(req, res){
    con.query('select * from book',function(err,data){
        if(err){
            throw err;
        }
        else{
            console.log("book has been updated.");
            res.render("user",{full_name: user_fullname, list: data, id_value: user_id});
        }
    })
});

//getting student homepage
app.get('/student',function(req, res){ 
    con.query('select * from book',function(err,data){
        if(err){
            throw err;
        }
        else{
            console.log("book has been updated.");
            res.render("student",{full_name: fullname, list: data, id_value: st_id});
        }
    })
});

//posting the book to the user or student homepage
app.post('/postbook',function(req,res){
    const img_url = req.body.imgurl;
    const book_title = req.body.booktitle;
    const book_text = req.body.booktext;
    const book_url = req.body.bookurl;
    const id = req.body.id;

    con.query('insert into book values (?,?,?,?)',[img_url,book_title,book_text,book_url],function(err,result){
        if(err){
            throw err;
        }
        else{
            console.log("Book added!");
        }
    });

    con.query('delete from demandbook where id = ?',[id],function(err,result){
        if(err){
            throw err;
        }
        else{
            console.log("Demand is successfully approved.");
        }
    });
    res.redirect('/admin');

});

//getting admin homepage
app.get('/admin',function(req,res){
    con.query('select * from demandbook',function(err,result){
        if(err){
            console.log(err);
        }
        else{
            res.render("admin",{full_name: admin_fullname,list: result});
        }
    })
});

//posting demanded books on admin homepage
app.post('/admin',function(req,res){
    const book_name = req.body.bname;
    const author_name = req.body.baname;
    const names = req.body.data.split(' ');
    const fname = names[0];
    const lname = names[1];
    const id = names[2];

    if(book_name && author_name && fname && lname && id){
        con.query('insert into demandbook values (?,?,?,?,?)',[id,fname,lname,book_name,author_name],function(err,result,fields){
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                console.log("Demanded!");
                con.query('select * from list where id = ?',[id],function(err,data){
                    if(err){
                        throw err;
                    }
                    else{
                        if(data.length===0){
                            res.redirect('/student');
                        }
                        else{
                            res.redirect('/user')
                        }
                    }
                });
            }
        });
    }
    else{
        nully = true;
        pass=userPass=success=false;
        res.redirect("/err");
    }

});

//after posting data for changing password
app.post('/forget',function(req,res){
    const member = req.body.member;
    const username = req.body.username;
    const email = req.body.email;
    const repassword = req.body.repassword;
    const con_repassword = req.body.con_repassword;

    if(member && username && email && repassword && con_repassword){
        if(repassword===con_repassword){
            if(member==="student"){
                con.query('update student set Spassword = ? where Susername = ?',[repassword,username],function(error,output){
                    if(error){
                        throw error;
                    }
                    else{
                        if(output.changedRows === 0){
                            valid_user = true;
                            pass=valid_login=nully=false;
                            res.redirect("/err");
                        }
                        else{
                            console.log("Password gets changed successfully");
                            res.redirect('/');
                        }
                    };
                });
            }
            else{
                con.query('update list set pasword = ? where userName = ?',[repassword,username],function(error,output){
                    if(error){
                        throw error;
                    }
                    else{
                        if(output.changedRows === 0){
                            valid_user = true;
                            pass=valid_login=nully=false;
                            res.redirect("/err");
                        }
                        else{
                            console.log("Password gets changed successfully");
                            res.redirect('/');
                        }
                    };
                });
            }
        }
        else{
            pass = true;
            valid_login=nully=valid_user=false;
            res.redirect("/err");
        }
    }
    else{
        nully = true;
        pass=userPass=success=false;
        res.redirect("/err");
    }

});

//getting the videos section
app.get('/video',function(req,res){
    res.sendFile(__dirname+"/Templates/index.html");
});
app.get('/maths',function(req,res){
    res.sendFile(__dirname+"/Templates/Math.html")
});
app.get('/toc',function(req,res){
    res.sendFile(__dirname+"/Templates/TOC.html")
});
app.get('/Se',function(req,res){
    res.sendFile(__dirname+"/Templates/SE.html")
});

//getting the notes section
app.get('/notes',function(req,res){
    res.sendFile(__dirname+"/Templates/notes.html");
});
app.get('/dsd',function(req,res){
    res.sendFile(__dirname+"/Templates/dsd_1.html");
});
app.get('/math',function(req,res){
    res.sendFile(__dirname+"/Templates/maths_1.html");
});
app.get('/set',function(req,res){
    res.sendFile(__dirname+"/Templates/Se_1.html");
});

app.listen(3000,function(){
    console.log("Server has started on port 3000");
});

//https://drive.google.com/uc?export=view&id=