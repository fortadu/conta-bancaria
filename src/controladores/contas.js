const bancoDeDados = require('../bancodedados')
const datefns = require('date-fns')
const { format } = datefns

let numeroContas = 1

const listar = (req, res) => {
    return res.send(bancoDeDados.contas)
}

const criar = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    const nomeString = Object.keys({ nome })[0]
    const cpfString = (Object.keys({ cpf })[0]).toUpperCase()
    const telefoneString = Object.keys({ telefone })[0]
    const emailString = Object.keys({ email })[0]
    const senhaString = Object.keys({ senha })[0]

    const primeiraLetraMaiuscula = (propriedade) => {
        const primeiraLetra = propriedade.slice(0, 1)
        const outrasLetras = propriedade.slice(1)
        return primeiraLetra.toUpperCase() + outrasLetras
    }

    if (!nome) { return res.status(404).json({ mensagem: `${primeiraLetraMaiuscula(nomeString)} não informado(a)` }) }
    if (!cpf) { return res.status(404).json({ mensagem: `${cpfString} não informado` }) }
    if (!data_nascimento) { return res.status(404).json({ mensagem: `Data de nascimento não informada` }) }
    if (!telefone) { return res.status(404).json({ mensagem: `${primeiraLetraMaiuscula(telefoneString)} não informado` }) }
    if (!email) { return res.status(404).json({ mensagem: `${primeiraLetraMaiuscula(emailString)} não informado` }) }
    if (!senha) { return res.status(404).json({ mensagem: `${primeiraLetraMaiuscula(senhaString)} não informada` }) }

    if (bancoDeDados.contas.some(conta => { return conta.usuario.cpf === cpf })) {
        return res.status(400).json({ mensagem: 'CPF já cadastrado' })
    } if (bancoDeDados.contas.some(conta => { return conta.usuario.email === email })) {
        return res.status(400).json({ mensagem: 'Email já cadastrado' })
    }

    const conta = {
        numero: String(numeroContas++),
        saldo: 0,
        usuario: req.body
    }

    bancoDeDados.contas.push(conta)
    return res.status(201).json(conta)
}

const atualizar = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body
    const { numeroConta } = req.params

    if (bancoDeDados.contas.some(conta => { return conta.usuario.nome === nome })) {
        return res.status(400).json({ mensagem: 'Nome já cadastrado' })
    } else if (bancoDeDados.contas.some(conta => { return conta.usuario.cpf === cpf })) {
        return res.status(400).json({ mensagem: 'CPF já cadastrado' })
    } else if (bancoDeDados.contas.some(conta => { return conta.usuario.data_nascimento === data_nascimento })) {
        return res.status(400).json({ mensagem: 'Data de nascimento já cadastrada' })
    } else if (bancoDeDados.contas.some(conta => { return conta.usuario.telefone === telefone })) {
        return res.status(400).json({ mensagem: 'Telefone já cadastrado' })
    } else if (bancoDeDados.contas.some(conta => { return conta.usuario.email === email })) {
        return res.status(400).json({ mensagem: 'Email já cadastrado' })
    } else if (bancoDeDados.contas.some(conta => { return conta.usuario.senha === senha })) {
        return res.status(400).json({ mensagem: 'Senha já cadastrada' })
    }

    const contaProcurada = bancoDeDados.contas.find(conta => { return conta.numero === numeroConta })
    if (!contaProcurada) { return res.status(404).json({ mensagem: `Não há conta de número ${numeroConta}` }) }

    if (nome || cpf || data_nascimento || telefone || email || senha) { }
    else if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(404).json({ mensagem: 'Requsição vazia' })
    }

    if (nome) { contaProcurada.usuario.nome = nome }
    if (cpf) { contaProcurada.usuario.cpf = cpf }
    if (data_nascimento) { contaProcurada.usuario.data_nascimento = data_nascimento }
    if (telefone) { contaProcurada.usuario.telefone = telefone }
    if (email) { contaProcurada.usuario.email = email }
    if (senha) { contaProcurada.usuario.senha = senha }

    return res.json({ mensagem: 'Conta atualizada com sucesso' })
}

const deletar = (req, res) => {
    const { numeroConta } = req.params

    const contaProcurada = bancoDeDados.contas.find(conta => { return conta.numero === numeroConta })
    if (!contaProcurada) { return res.status(404).json({ mensagem: `Não há conta de número ${numeroConta}` }) }
    if (contaProcurada.saldo > 0) { return res.status(403).json({ mensagem: 'Saldo em conta' }) }
    bancoDeDados.contas = bancoDeDados.contas.filter(conta => { return conta.numero !== numeroConta })

    return res.json({ mensagem: 'Conta excluída com sucesso' })
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body

    if (!numero_conta) { return res.status(404).json({ mensagem: 'Número da conta não informado' }) }
    if (!valor) { return res.status(404).json({ mensagem: 'Valor não informado' }) }

    const contaProcurada = bancoDeDados.contas.find(conta => { return conta.numero === numero_conta })
    if (!contaProcurada) { return res.status(404).json({ mensagem: `Não há conta de número ${numero_conta}` }) }
    if (valor < 1) { return res.status(400).json({ mensagem: 'Valor inválido' }) }

    contaProcurada.saldo += valor

    bancoDeDados.depositos.push({
        data: format(new Date(), "yyyy'-'MM'-'dd' 'H':'mm':'ss"),
        ...req.body
    })

    return res.json({ mensagem: 'Depósito realizado com sucesso' })
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body

    if (!numero_conta) { return res.status(404).json({ mensagem: 'Número da conta não informado' }) }
    if (!valor) { return res.status(404).json({ mensagem: 'Valor não informado' }) }
    if (!senha) { return res.status(404).json({ mensagem: 'Senha não informada' }) }

    const contaProcurada = bancoDeDados.contas.find(conta => { return conta.numero === numero_conta })
    if (!contaProcurada) { return res.status(404).json({ mensagem: `Não há conta de número ${numero_conta}` }) }
    if (contaProcurada.usuario.senha !== senha) { return res.status(404).json({ mensagem: 'Senha incorreta' }) }
    if (contaProcurada.saldo < valor) { return res.status(400).json({ mensagem: 'Valor maior que saldo' }) }

    contaProcurada.saldo -= valor

    bancoDeDados.saques.push({
        data: format(new Date(), "yyyy'-'MM'-'dd' 'H':'mm':'ss"),
        numero_conta,
        valor
    })

    return res.json({ mensagem: 'Saque realizado com sucesso' })
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!numero_conta_origem) { return res.status(404).json({ mensagem: 'Número da conta de origem não informado' }) }
    if (!numero_conta_destino) { return res.status(404).json({ mensagem: 'Número da conta de destino não informado' }) }
    if (!valor) { return res.status(404).json({ mensagem: 'Valor não informado' }) }
    if (!senha) { return res.status(404).json({ mensagem: 'Senha não informada' }) }

    const contaOrigem = bancoDeDados.contas.find(conta => { return conta.numero === numero_conta_origem })
    const contaDestino = bancoDeDados.contas.find(conta => { return conta.numero === numero_conta_destino })
    if (!contaOrigem) { return res.status(404).json({ mensagem: `Não há conta de número ${numero_conta_origem}` }) }
    if (!contaDestino) { return res.status(404).json({ mensagem: `Não há conta de número ${numero_conta_destino}` }) }
    if (contaOrigem.usuario.senha !== senha) { return res.status(400).json({ mensagem: 'Senha incorreta' }) }
    if (contaOrigem.saldo < valor) { return res.status(400).json({ mensagem: 'Valor maior que saldo' }) }

    contaOrigem.saldo -= Number(valor)
    contaDestino.saldo += Number(valor)

    bancoDeDados.transferencias.push({
        data: format(new Date(), "yyyy'-'MM'-'dd' 'H':'mm':'ss"),
        numero_conta_origem,
        numero_conta_destino,
        valor
    })

    return res.json({ mensagem: 'Transferência realizado com sucesso' })
}

const consultar = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta) { return res.status(404).json({ mensagem: 'Número da conta não informado' }) }
    if (!senha) { return res.status(404).json({ mensagem: 'Senha da conta não informada' }) }

    const contaProcurada = bancoDeDados.contas.find(conta => { return conta.numero === numero_conta })
    if (!contaProcurada) { return res.status(404).json({ mensagem: `Não há conta de número ${numero_conta}` }) }
    if (contaProcurada.usuario.senha !== senha) { return res.status(400).json({ mensagem: 'Senha da conta incorreta' }) }

    return res.json({ saldo: contaProcurada.saldo })
}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta) { return res.status(404).json({ mensagem: 'Número da conta não informado' }) }
    if (!senha) { return res.status(404).json({ mensagem: 'Senha não informada' }) }

    const contaProcurada = bancoDeDados.contas.find(conta => { return conta.numero === numero_conta })
    if (!contaProcurada) { return res.status(404).json({ mensagem: `Não há conta de número ${numero_conta}` }) }
    if (contaProcurada.usuario.senha !== senha) { return res.status(400).json({ mensagem: 'Senha incorreta' }) }

    const depositosSelecionados = bancoDeDados.depositos.filter(deposito => {
        return deposito.numero_conta === numero_conta
    })

    const saquesSelecionados = bancoDeDados.saques.filter(saque => {
        return saque.numero_conta === numero_conta
    })

    const transferenciasEnviadasSelecionados = bancoDeDados.transferencias.filter(transferencia => {
        return transferencia.numero_conta_origem === numero_conta
    })

    const transferenciasRecebidasSelecionados = bancoDeDados.transferencias.filter(transferencia => {
        return transferencia.numero_conta_destino === numero_conta
    })

    const resposta = {
        depositos: depositosSelecionados,
        saques: saquesSelecionados,
        transferenciasEnviadas: transferenciasEnviadasSelecionados,
        transferenciasRecebidas: transferenciasRecebidasSelecionados
    }

    return res.json(resposta)
}

module.exports = {
    listar,
    criar,
    atualizar,
    deletar,
    depositar,
    sacar,
    transferir,
    consultar,
    extrato
}