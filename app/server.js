#!/usr/bin/env node

const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const data = require('./books.json')

const port = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

router.get('/', function(req, res) {
  res.send(data)
})

router.get('/:id', function(req, res, next) {
  let dataId = req.params.id

  res.send(data[dataId])
})

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

router.delete('/:id', function(req, res, next) {
  let dataId = req.params.id

  data.splice(dataId, 1)
  res.send(data)
})

app.use('/api', router)

const server = app.listen(port, function () {
  console.log("Server running on Port: ", port);
})

module.exports = server
