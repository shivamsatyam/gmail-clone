const express = require('express')
const routes = express.Router()
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const multer = require('multer')
const userModel = require('./model/userModel')
const bcrypt = require('bcryptjs')
const Html5Entities = require('html-entities').Html5Entities
const validator = require('validator')
const path = require('path')
const MongoStore = require('connect-mongo')(session)
const textPostModel = require('./model/text_post')

 routes.use(session({
 	secret:"shivamGmail",
 	resave:false,
 	saveUninitialized:true,
 	store:new MongoStore({
 		url:'mongodb+srv://shivamsatyam:shivamsatyam123@cluster0.hrigk.mongodb.net/gmail?retryWrites=true&m=majority',
 		mongooseConnection:mongoose.connection,
 		ttl:14*24*60*60
 	})
 }))
 


mongoose.connect('mongodb+srv://shivamsatyam:shivamsatyam123@cluster0.hrigk.mongodb.net/gmail?retryWrites=true&m=majority',{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
	console.log('the connection is suceesfully established')
}).catch((err)=>{
	console.log('error')
})
routes.use(express.urlencoded({extended:false}))



routes.get('/',(req,res)=>{
	console.log(req.session)
	if(req.session==undefined){
		res.redirect('/signin')
	}else{
		res.redirect('/user')
	}
})

routes.get('/signin',(req,res)=>{
	console.log(req.session)
	res.render('signin',{error:''})
})

//for file uploadation


const Storage = multer.diskStorage({
	destination:'./public/upload',
	filename:(req,file,cb)=>{
		cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
	}
})

const upload = multer({
	storage:Storage
}).single('file')

const saving = async(req,res)=>{
	console.log(req.session)
	userModel.findOne({'email':req.body.email},(err,data)=>{
		if (err) {throw err}
		if(data){
			res.render('login',{error:'the user already exist'})
		}else{
			if(req.body.password==req.body.cpassword){
				const validate = validator.isEmail(String(req.body.email))
				if (validate) {
						const hash = bcrypt.hashSync(req.body.password,10)
						userModel({
							name:Html5Entities.encode(req.body.name),
							email:Html5Entities.encode(req.body.email),
							password:hash,
							image:req.file.filename
						}).save((err)=>{
							if (err) {
								throw err;
							}else{
								res.redirect('/login')
							}
						})

				}else{
					res.render('signin',{error:'Please enter a valid email address'})

				}

			}else{
				res.render('signin',{error:'the password and confirm password not match'})
			}
		}	
	})
}

routes.post('/signin',upload,(req,res,next)=>{
	console.log(req.session)
	saving(req,res)
})



routes.get('/login',(req,res)=>{
	console.log(req.session)
	console.log(Html5Entities.encode('<br>the boss ;#$%,>'))
	console.log('the session is ',req.session)
	res.render('login',{error:''})
})

routes.post('/login',async(req,res)=>{
	console.log(req.session)
	try {
		const email = Html5Entities.decode(req.body.email);
		const password  = req.body.password;
		const userEmail =  await userModel.findOne({email:email})
		console.log(userEmail)
		if (userEmail) {
			console.log('the compare is done1')
			if(bcrypt.compareSync(password,userEmail.password)){
			console.log('the compare is done2')
			
			req.session.name = userEmail.name
			req.session.email = req.body.email
			req.session.image = userEmail.image
			req.session.id = userEmail.__id

			req.session.save((err)=>{
				if (err) {
					throw err;
				}else{
			res.redirect('/user')

				}
			})


		}else{
			res.render('login',{error:'Invalid login details'})
		}	
		}else{
			res.render('login',{error:'Invalid login details'})
		}
		
		

	} catch(e) {
		console.log(e);
		res.status(400).send("Invalid entry input")
	}
})


routes.get('/user',(req,res)=>{
	console.log(req.session)
	if(req.session.email==undefined){

		res.redirect('/signin')
	}else if(req.session==undefined){

		res.redirect('/signin')
	}else{
		console.log(req.session.email)
			
		textPostModel.find({$or:[{from_email:req.session.email},{to_email:req.session.email}]}).sort({age:-1}).then((data)=>{
			// console.log(data)
			data.forEach((item) => {
			  item.subject =Html5Entities.decode(item.subject) 
			  item.message =Html5Entities.decode(item.message) 
			})
		res.render('user',{data:req.session,users:data})
		})

	}
	
})


routes.get('/logout',(req,res)=>{
	console.log(req.session)
	console.log('logout')
	req.session.destroy()
	res.redirect('/login')
})

routes.get('/content',(req,res)=>{
	console.log(req.session)
	if(req.session==undefined){
		res.redirect('/login')
	}
	else if(req.session.email==undefined){
		res.redirect('/login')

	}	
	else{

		res.render('content',{error:'',text:'',subjext:''})
	}
})


//adding messages

routes.post('/text_post',async(req,res)=>{
	console.log(req.session)
	try {
		if (req.session==undefined) {
		res.redirect('/login')
	}else if(req.session.email==undefined){
		res.redirect('/login')

	}else{

	const userData = await userModel.findOne({email:req.body.email})

	if (userData) {
		console.log('the userData is ',userData)
	const textModel = await new  textPostModel({

		from_email:req.session.email,
		to_email:userData.email,
		from_id:'not defined',
		to_id:userData._id,
		isOur:true,
		from_image:req.session.image,
		to_image:userData.image,
		subject:Html5Entities.encode(req.body.subject),
		message:Html5Entities.encode(req.body.text),
		isText:true,
		age:new Date()
	})

	textModel.save((err)=>{
		if (err) {
			throw err;
		}else{
			res.redirect('/user')
		}
	})
	}else{
		res.render('content',{error:`the ${req.body.email} email id not found`,text:`${req.body.text}`,subject:`${req.body.subject}`})
	}
	}
	} catch(e) {
		
		console.log("Some error occured",e);
	}
})



routes.post('/full_post',async(req,res)=>{
	console.log(req.session)
	try {
		if (req.session==undefined) {
		res.redirect('/login')
	}else if(req.session.email==undefined){
		res.redirect('/login')

	}else{

	const userData = await userModel.findOne({email:req.body.email})

	if (userData) {
		console.log('the userData is ',userData)
	const textModel = await new  textPostModel({

		from_email:req.session.email,
		to_email:userData.email,
		from_id:'not defined',
		to_id:userData._id,
		isOur:true,
		from_image:req.session.image,
		to_image:userData.image,
		subject:req.body.subject,
		message:Html5Entities.decode(req.body.content),
		isText:false,
		age:new Date()
	})

	textModel.save((err)=>{
		if (err) {
			throw err;
		}else{
			res.redirect('/user')
		}
	})
	}else{
		res.render('content',{error:`the ${req.body.email} email id not found`,text:`${req.body.text}`,subject:`${req.body.subject}`})
	}
	}
	} catch(e) {
		
		console.log("Some error occured",e);
	}
})



routes.get('/show/:searchId',(req,res)=>{
	textPostModel.findById(req.params.searchId,(err,data)=>{
		if(err){
			throw err;
		}
		data.message = Html5Entities.decode(data.message)
		// console.log("the data message is ",data.message)
		res.render('show',{data:data})
	})
})

module.exports = routes






































