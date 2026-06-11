export function gerarMediaDeNotas(listaFilmes){
    if(listaFilmes == null){
        return 'Não foi possível calcular a média pois a lista está nula'
    }

    if(listaFilmes.length === 0){
        return 'Não foi possível calcular a média.'
    }

    let notasAcumuladas = 0;
    let quantidadeNotasValidas = 0

    listaFilmes.forEach((elemento)=>{
        if(elemento.nota !== null){
            notasAcumuladas = notasAcumuladas + elemento.nota
            quantidadeNotasValidas++
        }
    })

    return notasAcumuladas/quantidadeNotasValidas
}

export const verificarQuantidadeDeNotas = (notaPesquisada, listaNotas) => {
    let novaListaApenasComNotaPesquisada = listaNotas.filter((elemento) => elemento.nota === notaPesquisada)
    return novaListaApenasComNotaPesquisada.length
}