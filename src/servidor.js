const express = require('express')
const { roteador } = require('./roteador')
const { validarSenha } = require('./intermediarios')
const app = express()

app.use(express.json())
app.use(validarSenha)
app.use(roteador)

module.exports = { app }