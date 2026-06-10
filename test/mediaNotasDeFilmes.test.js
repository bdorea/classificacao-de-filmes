import {assert} from 'chai';
import {gerarMediaDeNotas} from '../src/notas.js'

describe('Notas de Filmes', ()=>{
    describe('Média de notas', ()=>{
        it('CT01 - Todas as notas são 10', ()=>{
            //Arrange
            const listaFilmes = [
                {nomeFilme: 'Matrix', nota: 10}, 
                {nomeFilme: 'Matrix', nota: 10}, 
                {nomeFilme: 'Matrix', nota: 10}
            ]
            const resultadoEsperado = 10
            
            //Act
            const resultadoObtido = gerarMediaDeNotas(listaFilmes)
            
            //Assert
            assert.equal(resultadoEsperado, resultadoObtido, 'O resultado esperado é diferente do obtido')
        })

        it('CT02 - Lista Vazia', ()=>{
            //Arrange
            const listaFilmes = []
            const resultadoEsperado = 'Não foi possível calcular a média.'
            
            //Act
            const resultadoObtido = gerarMediaDeNotas(listaFilmes)
            
            //Assert
            assert.equal(resultadoEsperado, resultadoObtido, `O resultado esperado ${resultadoEsperado} é diferente do obtido ${resultadoObtido}`)
        })

        it('CT02.5 - Lista Vazia', ()=>{
            //Arrange
            const listaFilmes = null
            const resultadoEsperado = 'Não foi possível calcular a média pois a lista está nula'
            
            //Act
            const resultadoObtido = gerarMediaDeNotas(listaFilmes)
            
            //Assert
            assert.equal(resultadoEsperado, resultadoObtido, `O resultado esperado ${resultadoEsperado} é diferente do obtido ${resultadoObtido}`)
        })

        it('CT03 - Deve calcular a média quando uma nota estiver vazia', ()=>{
            //Arrange
            const listaFilmes = [
                {nomeFilme: 'Matrix', nota: 10}, 
                {nomeFilme: 'Matrix', nota: 10}, 
                {nomeFilme: 'Matrix', nota: null}
            ]
            const resultadoEsperado = 10
            
            //Act
            const resultadoObtido = gerarMediaDeNotas(listaFilmes)
            
            //Assert
            assert.equal(resultadoEsperado, resultadoObtido, `O resultado esperado ${resultadoEsperado} é diferente do obtido ${resultadoObtido}`)
        })
    })
})