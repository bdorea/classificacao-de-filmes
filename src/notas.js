export function gerarMediaDeNotas(listaFilmes){
    if(listaFilmes == null){
        return 'Não foi possível calcular a média pois a lista está nula'
    }

    if(listaFilmes.length === 0){
        return 'Não foi possível calcular a média.'
    }

    let notasAcumuladas = 0;
    let quantidadeNotasValidas = 0

    for(let i = 0; i < listaFilmes.length; i++){
        if(listaFilmes[i].nota !== null){
            notasAcumuladas = notasAcumuladas + listaFilmes[i].nota
            quantidadeNotasValidas++
        } 
    }

    return notasAcumuladas/quantidadeNotasValidas
}