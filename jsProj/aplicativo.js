class Despesa {
    constructor(ano, mes, dia, tipo, descricao, valor) {
        this.ano = ano;
        this.mes = mes;
        this.dia = dia;
        this.tipo = tipo;
        this.descricao = descricao;
        this.valor = valor;
    }

    validarDados() {
        for (let i in this) {
            if (this[i] == undefined || this[i] == '' || this[i] == null) {
                return false;
            }
        }
        return true;
    }
}

class Bd {
    constructor() {
        let id = localStorage.getItem('id');

        if (id === null) {
            localStorage.setItem('id', 0);
        }
    }

    getProximoId() {
        let proximoId = localStorage.getItem('id');
        return parseInt(proximoId) + 1;
    }

    gravar(d) {
        let id = this.getProximoId();
        localStorage.setItem(id, JSON.stringify(d));
        localStorage.setItem('id', id);
    }

    recuperarTodosRegistros() {
        let despesas = Array();
        let id = localStorage.getItem('id');

        for (let i = 1; i <= id; i++) {
            let despesa = JSON.parse(localStorage.getItem(i));

            if (despesa === null) {
                continue;
            }
            despesa.id = i;
            despesas.push(despesa);
        }

        return despesas;
    }

    pesquisar(despesa) {
        let despesasFiltradas = Array();
        despesasFiltradas = this.recuperarTodosRegistros();

        // Ano
        if (despesa.ano != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.ano == despesa.ano);
        }

        // Mês
        if (despesa.mes != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.mes == despesa.mes);
        }

        // Dia
        if (despesa.dia != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.dia == despesa.dia);
        }

        // Tipo
        if (despesa.tipo != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.tipo == despesa.tipo);
        }

        // Descrição
        if (despesa.descricao != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.descricao == despesa.descricao);
        }

        // Valor
        if (despesa.valor != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.valor == despesa.valor);
        }

        return despesasFiltradas;
    }

    remover(id) {
        localStorage.removeItem(id);
    }
}

let bd = new Bd();

function calcularINSS(salarioBruto) {
    let minimoFaixaSalarial = [   0.00, 1621.00, 2902.84, 4354.27];
    let maximoFaixaSalarial = [1621.00, 2902.84, 4354.27, 8475.55];
    let aliquotas           = [    7.5,     9.0,    12.0,    14.0];
    let descontoTotal = 0;

    aliquotas.forEach(function(aliquota, i) {
        let descontoDaAliquota = salarioBruto;
        if (salarioBruto >= minimoFaixaSalarial[i]) {
            if (salarioBruto > maximoFaixaSalarial[i]) {
                let diferencaDoMaximo = salarioBruto - maximoFaixaSalarial[i];
                descontoDaAliquota -= diferencaDoMaximo;
            }
            descontoDaAliquota -= minimoFaixaSalarial[i];
            descontoDaAliquota *= (aliquota/100);
            descontoTotal += descontoDaAliquota;
        }
    });
    let salarioDescontadoINSS = salarioBruto - descontoTotal;
    return salarioDescontadoINSS;
}

function calcularIRPF(salarioDescontadoINSS) {
    if (salarioDescontadoINSS <= 5000.00)
    {
        return salarioDescontadoINSS;
    }
    let imposto = ((salarioDescontadoINSS * (27.5/100)) - 908.73);
    if (salarioDescontadoINSS >= 5000.01 && salarioDescontadoINSS <= 7350.00)
    {
        let reducaoDoImposto = 978.62 - (0.133145 * salarioDescontadoINSS);
        imposto -=  reducaoDoImposto;
    }
    return salarioDescontadoINSS - imposto;
}

function cadastrarDespesa() {
    let ano = document.getElementById('ano').value;
    let mes = document.getElementById('mes').value;
    let dia = document.getElementById('dia').value;
    let tipo = document.getElementById('tipo').value;
    let descricao = document.getElementById('descricao').value;
    let valor = document.getElementById('valor').value;

    if (tipo == 7) {
        valor = calcularIRPF(calcularINSS(valor));
    }

    let despesa = new Despesa(ano, mes, dia, tipo, descricao, valor);

    if (despesa.validarDados()) {
        bd.gravar(despesa);
        alert('Despesa cadastrada com sucesso!');
    } else {
        alert('Todos os campos devem ser preenchidos!');
    }
}

function carregaListaDespesas() {
    let listaDespesas = document.getElementById('listaDespesas');
    let despesas = bd.recuperarTodosRegistros();
    let total = 0;
    let totalSalarios = 0; 

    // Limpar a tabela antes de carregar
    listaDespesas.innerHTML = '';

    despesas.forEach(function(d) {
        let linha = listaDespesas.insertRow();
        linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`;
        
        switch (d.tipo) {
            case '1':
                d.tipo = 'Alimentação';
                break;
            case '2':
                d.tipo = 'Educação';
                break;
            case '3':
                d.tipo = 'Lazer';
                break;
            case '4':
                d.tipo = 'Saúde';
                break;
            case '5':
                d.tipo = 'Transporte';
                break;
            case '6':
                d.tipo = 'Moradia';
                break;
            case '7':
                d.tipo = 'Salário';
        }
        
        linha.insertCell(1).innerHTML = d.tipo;
        linha.insertCell(2).innerHTML = d.descricao;
        linha.insertCell(3).innerHTML = parseFloat(d.valor).toFixed(2);
        linha.insertCell(4).innerHTML = `<button class="btn btn-danger" onclick="removerDespesa(${d.id})">Excluir</button>`;
        
        if (d.tipo != 7) {
            total += parseFloat(d.valor);
        } else {
            totalSalarios += parseFloat(d.valor);
        }
    });
    let diferencaSalarioDespesas = totalSalarios - total;

    document.getElementById('totalValor').innerHTML = total.toFixed(2);
    document.getElementById('totalDiferencaSalarioDespesas').innerHTML = diferencaSalarioDespesas.toFixed(2);
}

function pesquisarDespesa() {
    let ano = document.getElementById('ano').value;
    let mes = document.getElementById('mes').value;
    let tipo = document.getElementById('tipo').value;
    let descricao = document.getElementById('descricao').value;
    let valor = document.getElementById('valor').value;

    let despesa = new Despesa(ano, mes, '', tipo, descricao, valor);
    let despesas = bd.pesquisar(despesa);
    
    let listaDespesas = document.getElementById('listaDespesas');
    let total = 0;
    let totalSalarios = 0;

    // Limpar a tabela antes de carregar
    listaDespesas.innerHTML = '';

    despesas.forEach(function(d) {
        let linha = listaDespesas.insertRow();
        linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`;
        
        switch (d.tipo) {
            case '1':
                d.tipo = 'Alimentação';
                break;
            case '2':
                d.tipo = 'Educação';
                break;
            case '3':
                d.tipo = 'Lazer';
                break;
            case '4':
                d.tipo = 'Saúde';
                break;
            case '5':
                d.tipo = 'Transporte';
                break;
            case '6':
                d.tipo = 'Moradia';
                break;
            case '7':
                d.tipo = 'Salário';
        }
        
        linha.insertCell(1).innerHTML = d.tipo;
        linha.insertCell(2).innerHTML = d.descricao;
        linha.insertCell(3).innerHTML = parseFloat(d.valor).toFixed(2);
        linha.insertCell(4).innerHTML = `<button class="btn btn-danger" onclick="removerDespesa(${d.id})">Excluir</button>`;
        
        if (d.tipo != 7) {
            total += parseFloat(d.valor);
        } else {
            totalSalarios += parseFloat(d.valor);
        }
    });
    let diferencaSalarioDespesas = totalSalarios - total;

    document.getElementById('totalValor').innerHTML = total.toFixed(2);
    document.getElementById('totalDiferencaSalarioDespesas').innerHTML = diferencaSalarioDespesas.toFixed(2);
}

function removerDespesa(id) {
    bd.remover(id);
    alert('Despesa removida com sucesso!');
    carregaListaDespesas();
}
