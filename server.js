const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const path = require('path')
const { connectToDb,getDb } = require('./db')
const { ObjectId } = require('mongodb')

const app = express()
app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
  

let db

//db-connection --refer db.js
connectToDb((err)=>{
    if(!err){
        app.listen(3000,()=>console.log("SERVER RUNNING ON PORT 3000"));
        db = getDb()
    }
    else{
        console.log("ERROR *404*")
    }
})

//routes

//test route
app.get('/test',(req,res)=>{
    res.send("Working")
})

//register a user
app.post('/register',(req,res)=>{
    db.collection('users')
    .findOne({userName:req.body.userName})
    .then((data)=>{
        if(data!==null)res.send("Username already exists")
        else{
            db.collection('users')
            .insertOne({
                name:req.body.name,
                userName:req.body.userName,
                password:req.body.password,
                department:req.body.department,
            })
            .then(()=> res.send("User Successfully registered"))
            .catch(err => res.send("User couldn't be registered,Try again"))
        }
    })
    .catch(err => res.send("User couldn't be registered,Try again"))
})

//fetch all users
app.get('/users',(req,res)=>{
    let users = []
    db.collection('users')
    .find()
    .forEach(user => users.push(user))
    .then(()=> res.send(users))
    .catch(err => res.send("Error in retrieving users"))
})

//fetch user
app.get('/users/:id',(req,res)=>{
    db.collection('users')
    .findOne({userName:req.params.id})
    .then(user => res.send(user))
    .catch(err => res.send("User Not Found"))
})

//login
app.post('/login',(req,res)=>{
    db.collection('users')
    .findOne({userName:req.body.userName})
    .then(data => {
        if(data===null)res.send("Username Doesn't exist")
        else{
            if(req.body.password===data.password){
                res.send("Login Successful")
            }
            else{
                res.send("Incorrect Password")
            }
        } 
    })
    .catch(err => res.send("Error")) //username not found
})

//note-upload
app.post('/upload',(req,res)=>{
    const tags = JSON.parse(req.body.tags).tags
    let filePath
    if(req.files){
        let file = req.files.pdf
        let filename = file.name 
        file.mv('./uploads/'+filename)
        filePath = './uploads/'+filename
        db.collection('notes')
        .insertOne({
            path:filePath,
            course:req.body.course,
            tags:tags,
            upvotes:0,
            comments:[]
        })
        .then(()=>{
            res.send("Upload Succesful")
        })
        .catch(err => res.send("Upload Failed"))
    }else{
        res.send("No Files uploaded")
    }
})

//send-notes
app.get('/download/:id',(req,res)=>{
    const options = {
        root: path.join('./','uploads'),
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      }
    let file = req.params.id

    res.sendFile(file,options,(err)=>{
        if(err){
            res.send('No Such file')
        }
        else{
            // console.log(req)
        }
    })
})

app.get('/comments/:id',(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    db.collection('notes')
    .findOne({path:'./uploads/'+req.params.id})
    .then(data=> res.send(data.comments))
    .catch(err => res.send('Error'))
})


//add-comment
app.put('/comment/',(req,res)=>{
    db.collection('notes')
    .updateOne({path:req.body.path},{$push:{comments:req.body.comment}})
    .then(() => res.send({msg:"Comments added"}))
    .catch(err => res.send({msg:"Error"}))
})

//fetch-notes
app.get('/notes',(req,res)=>{
    let notes = []
    db.collection('notes')
    .find()
    .forEach(note => notes.push(note))
    .then(()=> res.send(notes))
    .catch(err => res.send("Error in retrieving notes"))
})

//upvote
app.put('/upvote/:id',(req,res)=>{
    db.collection('notes')
    .updateOne({_id:new ObjectId(req.params.id)},{$inc:{upvotes:1}})
    .then(()=>res.send('upvoted'))
    .catch(err => res.send('couldnt upvote'))
})