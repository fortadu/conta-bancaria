const express = require('express')
const contas = require('./controladores/contas')
const roteador = express()

const { validarSenha } = require('./intermediarios')
roteador.use(validarSenha)

roteador.get('/contas', contas.listar)
roteador.post('/contas', contas.criar)
roteador.put('/contas/:numeroConta/usuario', contas.atualizar)
roteador.delete('/contas/:numeroConta', contas.deletar)
roteador.post('/transacoes/depositar', contas.depositar)
roteador.post('/transacoes/sacar', contas.sacar)
roteador.post('/transacoes/transferir', contas.transferir)
roteador.get('/contas/saldo', contas.consultar)
roteador.get('/contas/extrato', contas.extrato)

module.exports = { roteador }