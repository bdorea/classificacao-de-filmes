# Classificação de Filmes - Pipeline de Integração Contínua

## 📋 Visão Geral

Este projeto implementa uma **pipeline de integração contínua (CI)** utilizando **GitHub Actions** para automatizar a execução de testes, geração de relatórios e validação de qualidade do código. A pipeline é acionada automaticamente em três cenários:

1. **Push**: Executa ao fazer push para branches principais
2. **Manual**: Pode ser acionada manualmente a qualquer momento
3. **Agendada**: Executa em horários pré-definidos (agendamento cron)

---

## 🎯 Objetivos

- ✅ Automatizar execução de testes
- ✅ Gerar relatórios de testes automaticamente
- ✅ Armazenar e publicar relatórios
- ✅ Testar em múltiplas versões do Node.js
- ✅ Garantir qualidade contínua do código
- ✅ Detectar e reportar falhas rapidamente

---

## 📁 Estrutura do Projeto

```
classificacao-de-filmes/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Pipeline de CI (push, manual, agendado)
│       └── npm-publish.yml        # Workflow de publicação (existente)
├── src/
│   └── notas.js                   # Código-fonte principal
├── test/
│   └── mediaNotasDeFilmes.test.js # Testes automatizados
├── .mocharc.json                  # Configuração do Mocha
├── package.json                   # Dependências e scripts
└── README.md                       # Esta documentação
```

---

## 🔧 Conceitos Fundamentais

### O que é Integração Contínua (CI)?

**Integração Contínua** é uma prática de desenvolvimento onde código é frequentemente integrado ao repositório principal. A cada integração, testes automatizados são executados para verificar a qualidade e funcionamento do código.

**Benefícios:**
- 🔍 Detecção rápida de problemas
- 🚀 Entrega mais rápida
- 📊 Visibilidade do status do projeto
- 🛡️ Confiança na qualidade do código
- 📈 Redução de bugs em produção

### O que é GitHub Actions?

**GitHub Actions** é um serviço de CI/CD integrado ao GitHub que permite automatizar workflows. Características principais:

- **Eventos**: Disparadores (push, pull_request, schedule, workflow_dispatch)
- **Jobs**: Conjunto de passos executados sequencialmente
- **Steps**: Ações individuais executadas no job
- **Artifacts**: Artefatos gerados durante a execução (relatórios, logs, etc.)
- **Matrix Strategy**: Executa jobs em múltiplas configurações

### Workflow vs Job vs Step

```
Workflow (ci.yml)
└── Job (test)
    ├── Step 1: Checkout
    ├── Step 2: Setup Node.js
    ├── Step 3: Install dependencies
    ├── Step 4: Run tests
    └── Step 5: Upload artifacts
```

---

## 🚀 Configuração da Pipeline

### Arquivo: `.github/workflows/ci.yml`

Este arquivo define todo o comportamento da pipeline:

#### **1. Eventos de Disparo (ON)**

```yaml
on:
  push:
    branches: [ main, master, develop ]      # Dispara em push para estas branches
  workflow_dispatch:                          # Dispara manualmente
  schedule:
    - cron: '0 2 * * MON-FRI'                # Dispara de seg-sex às 2h da manhã (UTC)
```

- **push**: Executa automaticamente quando você faz push
- **workflow_dispatch**: Permite executar manualmente via UI do GitHub
- **schedule**: Usa expressão cron para agendar execuções periódicas

#### **2. Job: Test**

O job principal que executa os testes:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest                    # Executa em máquina Linux
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]           # Testa em 2 versões do Node.js
```

**Strategy Matrix**: Executa o job 2 vezes (uma para cada versão do Node), totalizando até 4 execuções (2 versões x 1 branch = 2 em push, mais acionamentos manuais).

#### **3. Steps (Passos)**

| # | Step | Propósito |
|---|------|----------|
| 1 | Checkout | Faz download do código do repositório |
| 2 | Setup Node.js | Instala a versão especificada do Node.js |
| 3 | Install dependencies | Instala pacotes npm com cache |
| 4 | Run tests | Executa testes com Mocha (reporter JSON) |
| 5 | Generate readable report | Gera relatório legível com format spec |
| 6 | Process report | Converte JSON para summary |
| 7-8 | Upload artifacts | Armazena relatórios em artifacts |
| 9 | Verify test status | Verifica se todos os testes passaram |
| 10-11 | Notifications | Notifica sucesso ou falha |

---

## 📊 Relatórios de Testes

### Tipos de Relatórios Gerados

#### 1. **JSON Report** (`test-report.json`)
```json
{
  "stats": {
    "tests": 7,
    "passes": 7,
    "failures": 0,
    "duration": 45
  },
  "tests": [
    {
      "fullTitle": "Notas de Filmes Média de notas CT01 - Todas as notas são 10",
      "duration": 5,
      "pass": true
    }
  ]
}
```

**Uso**: Processamento automatizado, integração com outras ferramentas

#### 2. **TXT Report** (`test-report.txt`)
```
Notas de Filmes
  Média de notas
    ✓ CT01 - Todas as notas são 10 (3ms)
    ✓ CT02 - Lista Vazia (2ms)
    ✓ CT02.5 - Lista Vazia (1ms)
  Pesquisa de Notas
    ✓ CT01 - Todas as notas são 10 deve retornar 3 notas encontradas (2ms)
```

**Uso**: Leitura fácil, verificação rápida de resultados

#### 3. **GitHub Summary**
Exibido automaticamente na aba de checks do PR/commit com resumo dos testes

### Acessando os Relatórios

1. **Via GitHub Web UI:**
   - Vá para o commit ou PR
   - Clique em "Checks"
   - Selecione o job
   - Vá para a aba "Artifacts"
   - Download dos relatórios

2. **Via GitHub CLI:**
```bash
gh run list                                    # Lista todas as execuções
gh run download <run-id> -n test-report-json  # Baixa artefato específico
```

3. **Via API GitHub:**
```bash
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/artifacts
```

---

## ⏰ Agendamento (Schedule)

### Expressão Cron Explicada

```
0 2 * * MON-FRI
│ │ │ │ └── Dia da semana (0-6, 0=domingo)
│ │ │ └──── Mês (1-12)
│ │ └────── Dia do mês (1-31)
│ └──────── Hora (0-23)
└────────── Minuto (0-59)
```

**Exemplo atual:** Executa às 2h da manhã, de segunda a sexta-feira

### Exemplos de Agendamento

| Agendamento | Cron | Descrição |
|-------------|------|-----------|
| Diariamente | `0 0 * * *` | Todos os dias à meia-noite |
| Semanalmente | `0 0 * * 0` | Todos os domingos à meia-noite |
| A cada 6h | `0 */6 * * *` | 0h, 6h, 12h, 18h todos os dias |
| Toda segunda 9h | `0 9 * * 1` | Toda segunda-feira às 9h da manhã |
| Trabalhos | `0 9 * * MON-FRI` | De seg-sex às 9h da manhã |

---

## 🎮 Executando a Pipeline

### 1️⃣ **Execução Automática (Push)**

```bash
# Faça uma alteração no código
git add .
git commit -m "feat: implementar nova funcionalidade"
git push origin main
# Pipeline executa automaticamente!
```

### 2️⃣ **Execução Manual**

**Via GitHub Web UI:**
1. Vá para o repositório no GitHub
2. Clique em "Actions"
3. Selecione o workflow "CI - Testes Automatizados"
4. Clique em "Run workflow"
5. Selecione a branch
6. Clique em "Run workflow"

**Via GitHub CLI:**
```bash
gh workflow run ci.yml --ref main
```

### 3️⃣ **Execução Agendada**

Executa automaticamente nos horários configurados (seg-sex às 2h UTC)
- Sem necessidade de ação manual
- Relatórios gerados regularmente
- Histórico disponível em "Actions"

---

## 📦 Dependências

O projeto utiliza as seguintes ferramentas:

| Ferramenta | Versão | Descrição |
|-----------|--------|-----------|
| Node.js | 18.x, 20.x | Runtime JavaScript |
| Mocha | ^11.7.6 | Test runner |
| Chai | ^6.2.2 | Assertion library |
| Ubuntu | latest | Sistema operacional da máquina runner |

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/classificacao-de-filmes.git
cd classificacao-de-filmes

# Instale as dependências
npm install

# Execute os testes localmente
npm test

# Execute os testes com relatório JSON
npx mocha --reporter json > report.json
```

---

## 🧪 Testes Implementados

O projeto contém 7 casos de teste automatizados:

### Grupo 1: Média de Notas
- **CT01**: Todas as notas são 10
- **CT02**: Lista vazia
- **CT02.5**: Lista nula
- **CT03**: Calcula média ignorando notas nulas

### Grupo 2: Pesquisa de Notas
- **CT01**: Encontrar 3 notas de valor 10
- **CT02**: Encontrar 2 notas de valor 10
- **CT03**: Encontrar 0 notas de valor 0

---

## 📈 Monitoramento e Relatórios

### Dashboard GitHub Actions

No repositório, a seção "Actions" mostra:
- ✅ Histórico de execuções
- 📊 Status de cada job
- ⏱️ Duração de execução
- 🔍 Logs detalhados
- 📥 Artifacts disponíveis

### Interpretando Resultados

**✅ Sucesso (Green)**
```
All tests passed! 7/7
Pipeline completed in 45s
Artifacts ready for download
```

**❌ Falha (Red)**
```
Tests failed! 5/7
Failures: 2
Check logs for details
```

---

## 🔐 Segurança e Boas Práticas

### Segurança
- ✅ Workflows executados em containers isolados
- ✅ Nenhuma credencial exposta em logs
- ✅ Cache seguro de dependências npm
- ✅ Retenção de artifacts limitada (30 dias)

### Boas Práticas Implementadas
- ✅ **Fail-fast**: Detecta problemas rapidamente
- ✅ **Matrix Testing**: Testa múltiplas versões
- ✅ **Artifact Storage**: Preserva histórico de testes
- ✅ **Clear Naming**: Steps descritivos com emojis
- ✅ **Error Handling**: `continue-on-error` para etapas não-críticas
- ✅ **Notifications**: Feedback claro de sucesso/falha

---

## 🛠️ Configuração Avançada

### Modificar Agendamento

Edite `.github/workflows/ci.yml`:
```yaml
schedule:
  - cron: '0 9 * * MON-FRI'  # Mude para 9h da manhã
```

### Adicionar Mais Versões Node.js

```yaml
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]  # Adicione 16.x
```

### Executar Apenas em Certos Caminhos

```yaml
push:
  branches: [ main, master ]
  paths:
    - 'src/**'              # Apenas se arquivos em src mudarem
    - 'test/**'
    - '.github/workflows/**'
```

---

## 📚 Recursos e Documentação

### GitHub Actions
- [Documentação Oficial](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)

### Mocha & Chai
- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Mocha Reporters](https://mochajs.org/#reporters)

### Expressões Cron
- [Cron Expression Builder](https://crontab.guru/)
- [Cron Syntax Reference](https://en.wikipedia.org/wiki/Cron)

---

## 🐛 Troubleshooting

### Pipeline não executa após push
**Solução**: Certifique-se que seu branch está em `push.branches` no `ci.yml`

### Testes passam localmente mas falham na pipeline
**Solução**: Verifique diferenças de ambiente (versão Node.js, dependências)

### Artifacts não aparecem
**Solução**: Verifique que a pipeline executou com sucesso e que retention-days não expirou

### Agendamento não funciona
**Solução**: Workflows agendados só funcionam na branch padrão (geralmente `main`)

---

## 📝 Resumo da Implementação

| Requisito | Status | Implementação |
|-----------|--------|----------------|
| Execução por push | ✅ | Configurado em `on.push` |
| Execução manual | ✅ | Configurado `workflow_dispatch` |
| Execução agendada | ✅ | Configurado `schedule` com cron |
| Geração de relatórios | ✅ | JSON + TXT reporters |
| Armazenamento na pipeline | ✅ | `upload-artifact` v4 |
| README documentado | ✅ | Documentação completa |
| Conceitos aplicados | ✅ | CI/CD, GitHub Actions, Automação |
| Pipeline funcionando | ✅ | Pronta para uso |

---

## 📞 Suporte

Para mais informações ou problemas:
1. Consulte a documentação do GitHub Actions
2. Verifique os logs no repositório em "Actions"
3. Valide a sintaxe do YAML usando [yamllint](https://www.yamllint.com/)

---

**Última atualização:** 2024
**Versão:** 1.0.0
**Status:** ✅ Pronto para produção
