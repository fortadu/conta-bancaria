const bancoDeDados = require('./bancodedados')

const validarSenha = (req, res, next) => {
    const senha_banco = req.query.senha_banco
    if (!senha_banco) { return res.status(401).json('Informe a senha do banco') }
    if (senha_banco !== bancoDeDados.banco.senha) { return res.status(401).json('Senha do banco incorreta') }
    next()
}

module.exports = { validarSenha }