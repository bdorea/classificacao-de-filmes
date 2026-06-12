# Guia Prático - Pipeline CI/CD

## 📋 Índice Rápido
- [Exemplos de Triggers](#exemplos-de-triggers)
- [Interpretando Logs](#interpretando-logs)
- [Downloadando Artifacts](#downlaodando-artifacts)
- [Scripts Úteis](#scripts-úteis)

---

## Exemplos de Triggers

### Scenario 1: Desenvolvimento Local - Push Simples

```bash
# Você faz uma alteração
echo "console.log('test')" >> src/notas.js

# Commit e push
git add src/notas.js
git commit -m "test: adicionar log de debug"
git push origin main

# GitHub Actions detecta o push e executa a pipeline automaticamente! ✅
# Duração: ~30-60 segundos
```

**O que acontece:**
1. Workflow é disparado automaticamente
2. Código é testado em Node 18.x e 20.x
3. Relatórios são gerados
4. Artifacts ficam disponíveis por 30 dias

---

### Scenario 2: Teste Manual - Pull Request

```bash
# Você quer testar antes de fazer push
git add .
git commit -m "feature: nova funcionalidade"
git push origin feature-branch

# Abra um Pull Request no GitHub
# A pipeline executa automaticamente! ✅
```

---

### Scenario 3: Execução Manual - Sem Alterações

**Via GitHub CLI:**
```bash
# Instale gh: https://cli.github.com/

# Listar workflows
gh workflow list

# Executar workflow específico
gh workflow run ci.yml --ref main

# Acompanhar execução
gh run list
gh run watch <run-id>

# Ver logs de um job específico
gh run view <run-id> --log
```

**Via GitHub Web:**
1. Vá para repositório → **Actions**
2. Selecione **CI - Testes Automatizados**
3. Clique em **Run workflow**
4. Escolha a branch
5. Clique em **Run workflow** novamente

---

### Scenario 4: Agendamento - Testes Periódicos

```
Configurado para: 🕑 Seg-sex às 2h da manhã (UTC)

Timezone: UTC (Coordinated Universal Time)
Sua hora local: UTC + diferença do seu fuso
  • São Paulo: UTC-3 → 23h (noite anterior)
  • Lisboa: UTC+0 → 2h (madrugada)
  • Sydney: UTC+10 → 12h (meio-dia)
```

**Modificar agendamento:**

Edite `.github/workflows/ci.yml`:

```yaml
schedule:
  # Adicione mais horários se desejar:
  - cron: '0 2 * * MON-FRI'      # Seg-sex às 2h
  - cron: '0 14 * * SAT'          # Sábado às 14h
  - cron: '0 */6 * * *'           # A cada 6 horas
```

**Expressões Cron Comuns:**

| Expressão | Significado |
|-----------|-----------|
| `0 0 * * *` | Meia-noite todo dia |
| `0 9 * * MON-FRI` | 9h da manhã, seg-sex |
| `0 */4 * * *` | A cada 4 horas |
| `0 0 1 * *` | Primeiro dia do mês |
| `0 0 * * 0` | Todos os domingos |

---

## Interpretando Logs

### ✅ Execução Bem-Sucedida

```
✓ Test passing
✓ All 7 tests passed
✓ JSON report generated
✓ TXT report generated
✓ Artifacts uploaded
```

**Tempo esperado:** 45-60 segundos

---

### ❌ Execução com Falha

```
✗ Test failed
✗ 2 tests failing
- Error: expected value

Logs:
  AssertionError: expected 5 to equal 10
  at mediaNotasDeFilmes.test.js:23:5
```

**Ações:**
1. Clique em **Annotations** para ver erros
2. Verifique o arquivo de teste
3. Corrija o erro
4. Faça push novamente

---

### ⚠️ Warnings Comuns

```
⚠️ WARNING: npm audit - vulnerabilities found
  → Não é crítico para a execução
  → Execute `npm audit fix` para resolver

⚠️ Deprecated package detected
  → Considere atualizar dependência
  → Adicione ao backlog
```

---

## Downlaodando Artifacts

### Via GitHub Web UI

1. **Vá para Actions → Workflow run específico**
2. **Scroll até "Artifacts"**
3. **Clique para expandir**
4. **Clique no arquivo para baixar**

```
Artifacts Available:
├── test-report-json-node-18.x (11.3 KB)
├── test-report-json-node-20.x (11.3 KB)
├── test-report-txt-node-18.x (978 B)
└── test-report-txt-node-20.x (978 B)
```

### Via GitHub CLI

```bash
# Listar runs
gh run list --workflow=ci.yml

# Ver detalhes de um run
gh run view <run-id>

# Download de artifact
gh run download <run-id> -n test-report-json-node-18.x

# Download todos os artifacts
gh run download <run-id>

# Extrair múltiplos artifacts
gh run download <run-id> -d ./reports
```

### Via API GitHub

```bash
# Listar artifacts
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/artifacts

# Download artifact (link via JSON)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  -L https://api.github.com/repos/OWNER/REPO/actions/artifacts/ARTIFACT_ID/zip \
  -o artifact.zip
```

---

## Scripts Úteis

### Script Local - Simular Execução da Pipeline

```bash
#!/bin/bash
# Arquivo: test-local.sh

echo "🔄 Simulando execução local da pipeline..."

echo "📥 Checando Node.js"
node --version
npm --version

echo "📦 Instalando dependências"
npm install --silent

echo "🧪 Executando testes"
npm test

echo "📊 Gerando relatórios"
npx mocha --reporter json > test-report.json
npx mocha --reporter spec > test-report.txt

echo "✅ Testes completos!"
echo "📄 Relatórios:"
echo "  - JSON: $(wc -c < test-report.json) bytes"
echo "  - TXT: $(wc -c < test-report.txt) bytes"
```

**Uso:**
```bash
chmod +x test-local.sh
./test-local.sh
```

---

### Script - Processar Relatório JSON

```bash
#!/bin/bash
# Arquivo: parse-report.sh

if [ ! -f "test-report.json" ]; then
  echo "❌ Relatório não encontrado"
  exit 1
fi

echo "📊 Resumo de Testes"
echo "===================="

PASSES=$(jq '.stats.passes' test-report.json)
FAILURES=$(jq '.stats.failures' test-report.json)
DURATION=$(jq '.stats.duration' test-report.json)

echo "✅ Sucessos: $PASSES"
echo "❌ Falhas: $FAILURES"
echo "⏱️  Duração: ${DURATION}ms"

echo ""
echo "Testes executados:"
jq -r '.tests[] | "  \(.fullTitle)"' test-report.json
```

---

### Workflow - Integração com Slack

Adicione esta step ao `ci.yml` para notificações:

```yaml
- name: 🔔 Notificar Slack
  if: always()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "CI Pipeline - ${{ job.status }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*CI Pipeline Result*\nStatus: ${{ job.status }}\nBranch: ${{ github.ref }}\nCommit: ${{ github.sha }}"
            }
          }
        ]
      }
```

**Configurar Secret:**
```bash
gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/..."
```

---

### Workflow - Deploy após Testes Passarem

```yaml
- name: 🚀 Deploy (se testes passarem)
  if: success()
  run: |
    echo "✅ Testes passaram! Iniciando deploy..."
    # Seus comandos de deploy aqui
```

---

## 🔍 Troubleshooting

### Problema: Pipeline não dispara após push

**Verificar:**
```bash
# 1. Confirme que está fazendo push para a branch correta
git branch

# 2. Verifique o histórico de commits
git log --oneline -5

# 3. Veja se o arquivo workflow existe
ls -la .github/workflows/

# 4. Valide o YAML
cat .github/workflows/ci.yml | python3 -c "import yaml, sys; yaml.safe_load(sys.stdin)"
```

---

### Problema: Testes falham na pipeline mas passam localmente

**Causas possíveis:**
- Versão diferente do Node.js
- Dependências desatualizadas
- Variáveis de ambiente não configuradas

**Solução:**
```bash
# Teste com a mesma versão
nvm install 18.0.0
nvm use 18.0.0
npm test

# Limpe cache
npm ci  # ao invés de npm install
npm test
```

---

### Problema: Artifacts expiram

**Padrão:** 30 dias de retenção

**Modificar retenção:**
```yaml
- uses: actions/upload-artifact@v4
  with:
    retention-days: 90  # Aumentar para 90 dias
```

---

## 📊 Métricas e Monitoramento

### Acompanhando Performance

```bash
# Ver tempo de execução de cada workflow
gh run list --workflow=ci.yml --limit 10

# Exportar histórico (últimas 30 execuções)
gh run list --workflow=ci.yml --limit 30 --json conclusion,durationMinutes
```

---

### Criando Dashboard Local

```bash
#!/bin/bash
# Arquivo: dashboard.sh

echo "📊 Dashboard - Últimos 10 Runs"
echo "=============================="

gh run list --workflow=ci.yml --limit 10 --json \
  status,conclusion,createdAt,durationMinutes,headBranch \
  --template '{{range .}}
Status: {{.status}} | Conclusão: {{.conclusion}} | Branch: {{.headBranch}} | Duração: {{.durationMinutes}}m
{{end}}'
```

---

## ✅ Checklist - Validar Setup

- [ ] Arquivo `.github/workflows/ci.yml` existe
- [ ] Testes passam localmente com `npm test`
- [ ] Relatórios JSON são gerados com sucesso
- [ ] Relatórios TXT são legíveis
- [ ] Artifacts aparecem em Actions → Run
- [ ] README.md está documentado
- [ ] .gitignore exclui arquivos de teste
- [ ] Primeiro push dispara a pipeline
- [ ] Execução manual funciona via GitHub UI
- [ ] Agendamento está configurado corretamente

---

**Última atualização:** 2024
**Versão:** 1.0.0
