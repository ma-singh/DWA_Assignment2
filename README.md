# Creating a Basic API

#### Prerequisites

At this point, you should have:

* A server with Nginx installed and configured
* Node.js and NPM installed
* PM2 installed

If at this point you don't have Nginx set up as a proxy for your Node applications, do so now.

## Project Setup

Clone this repository into your server

```
git clone git@github.com:ma-singh/DWA_Assignment2.git
```
Change into the */app* directory. There should already be a `books.json` file inside.

```
cd app
```
Create your *package.json* and install your `node_modules`

```
npm init
```
Follow along with the prompts, and when finished, install Express.js and the body-parser module

```
npm i express --save
npm i body-parser --save
```
Make sure you include `--save` in the commands to save the modules as dependencies in your *package.json*.

### Creating your Server

Next, Create a server file for your application. Alternatively, you can create this file on your local machine and then use `scp` to transfer it into the directory.

```
nano server.js
```
Import your modules first

```
#!/usr/bin/env node

const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const data = require('./books.json')

```
Set your port for your application to run on

```
...
const port = 3000
```
Make sure that your app uses the `body-parser` module so it can easily get form data

```
...
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

```
Create a `GET` route for your API data. Have your application access that route at the API path rather than the root index of the application

```
...
router.get('/', function(req, res) {
  res.send(data)
})

app.use('/api', router)

```
Make sure your application is listening on the right port and export the application.

```
...
const server = app.listen(port, function () {
  console.log("Server running on Port: ", port);
})

module.exports = server
```
Press `CTRL+X` to exit the file, then answer *yes* and press `ENTER` to save and close the file.

We're going to make our server file executable now so that we can actually use it

```
chmod +x ./server.js
```
We can now run our file

```
nodejs server.js
```
We should see a console output that the server is running on port 3000, and to test our application further we can open another terminal session on the server and connect to **localhost** with `curl`

```
curl http://localhost:3000/api
```
You should see JSON data, and you can end the application from the intial session with `CTRL+C`

Stop the previous hello world application, and start our serverfile using PM2

```
pm2 stop hello.js
pm2 start server.js
```
Again, run the PM2 startup command

```
pm2 startup systemd
```
Copy the command that it outputs and run it

```
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u USERNAME --hp /home/USERNAME
```


### Editing the Nginx Configuration

When we created our 'Hello World' test application, we edited our `.config` file for Nginx. We no longer need that configuration, so we're going to overwrite it.

```
sudo nano /etc/nginx/sites-available/default
```
Find the `location /` block within the `server block that was previously edited. Update the port to the one that you are currently using with your server file.

```
...
location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```
You could also simply add another location block, but as our original test application is no longer necessary, it's fine to overwrite it.

Save and exit the file with `CTRL+X` then answering *yes* and pressing `ENTER`

Check for any errors after editing the file

```
sudo nginx -t
```
Next, restart Nginx

```
sudo systemctl restart nginx
```
You should now be able to navigate to your server's IP or domain in your browser and view your API route.

> **NOTE**: *The root index of your application will still have an error, as we haven't created anything to point there.*

```
http://YOUR_DOMAIN_OR_IP_ADDRESS/api
```

## Building Out API

We now have an application that retrieve's our API data from our JSON file. We're going to continue building out the functionality for our API. Test your API by using [Postman](https://www.getpostman.com/)

### Retrieving a Single Book from API

From your server session in terminal, open your `server.js` file from the `/app` directory

```
nano ~/app/server.js
```
Underneath your initial `router.get` make a new `GET` route

```
...
router.get('/', function(req, res) {
  res.send(data)
})

router.get('/:id', function(req, res, next) {
  let dataId = req.params.id

  res.send(data[dataId])
})
...
```
What this is does is allow the user to pass an ID into the URL, and the application will return the information for the book located at that index in our JSON file.

```
http://DOMAIN_OR_IP_ADDRESS/api/3

	{
    	"title": "Harry Potter and the Sorcerer's Stone",
    	"author": "J.K. Rowling",
    	"language": "Spanish",
    	"published": "1997",
    	"ISBN": "0-7475-3269-9"
  	}
```


### Adding a Book to the API

We're now going to add a `POST` route to our file

```
...
router.post('/', function(req, res, next) {
  let newBook = {
    "title": req.body.title,
    "author": req.body.author,
    "language": req.body.language,
    "published": req.body.published,
    "ISBN": req.body.ISBN
  }

  data.push(newBook)
  res.redirect('/api')
})
...
```
What this route does is `POST` to our `/api` and create a new object using `body-parser` to create key/value pairs for a book. It then redirects you to the `/api` route where you can see the new book added to the collection.
> **NOTE**: Our response is currently set to redirect to `/api` and not `/` as the latter would lead to the root index, where there is currrently no content. 

### Updating a Book from the API

To update a single book from the collection, we're going to use a `PUT` route

```
...
router.put('/:id', function(req, res, next) {
  let dataId = req.params.id
  let updatedBook = {
    "title": req.body.title,
    "author": req.body.author,
    "language": req.body.language,
    "published": req.body.published,
    "ISBN": req.body.ISBN
  }

  data[dataId] = updatedBook
  res.send(data[dataId])
})
...
```
This route saves the ID sent as a URL parameter as a variable. It then creates an object and uses the `body-parser` module to create key/value pairs out of the form data sent by the request. That object is then updated by using the ID from the URL parameter as the index location for our JSON data. 

### Removing a Book from the API

Removing a book from our collection is simple. Add a `DELETE` route to your file

```
...
router.delete('/:id', function(req, res, next) {
  let dataId = req.params.id

  data.splice(dataId, 1)
  res.send(data)
})
...
```
This takes the ID from the URL parameter, and then splices from our JSON file the element at that index. If we use `delete` instead, the object at that index would instead be `null`. This method removes the book, and preserves the indexes in the JSON file accordingly.
> **NOTE**: When working with a database rather than a local file, you would use the `delete` method, as objects would be added to the database with uniquely identifying ID's, which do not need to update accordingly as you remove or add to the database.
