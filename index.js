const express = require('express');
const app = express();

const path = require('path');
const routes = require('./app.js')
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
const static_path = path.join(__dirname,'public')
app.use(express.static(static_path))


app.get('/',routes)
app.get('/signin',routes)
app.get('/login',routes)
app.get('/logout',routes)
app.get('/content',routes)

app.post('/signin',routes)
app.post('/login',routes)


app.get('/user',routes)
app.get('/show/:searchId',routes)


//for adding email 
app.post('/full_post',routes)
app.post('/text_post',routes)
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log("Server Stated At Port", PORT));
