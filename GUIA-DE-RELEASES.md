# Guia de Releases - Tela de Avisos

Este guia explica como criar releases oficiais do projeto no GitHub.

## 📋 Pré-requisitos

1. Repositório Git configurado e conectado ao GitHub
2. Node.js e npm instalados
3. Conta no GitHub com acesso ao repositório

---

## 🚀 Processo Completo de Release

### Passo 1: Preparar o Código

1. **Certifique-se de que todas as mudanças estão commitadas:**
   ```bash
   git status
   git add .
   git commit -m "Preparação para release v1.2.0"
   ```

2. **Atualize a versão no `package.json`** (se ainda não fez):
   - A versão atual é `1.2.0`
   - Para próxima release, atualize para `1.3.0`, `1.2.1`, etc.

### Passo 2: Gerar o Executável

```bash
npm run build
```

Isso criará o executável em `dist/TelaDeAvisos.exe`

### Passo 3: Criar Tag Git

Crie uma tag Git com a versão:

```bash
# Criar tag anotada (recomendado)
git tag -a v1.2.0 -m "Release v1.2.0 - Suporte apenas para vídeos locais"

# Ou criar tag simples
git tag v1.2.0
```

**Verificar tags existentes:**
```bash
git tag
```

**Enviar tag para o GitHub:**
```bash
git push origin v1.2.0
# Ou para enviar todas as tags:
git push origin --tags
```

### Passo 4: Criar Release no GitHub

#### Opção A: Via Interface Web do GitHub (Recomendado)

1. Acesse seu repositório no GitHub
2. Clique em **"Releases"** (no menu lateral direito)
3. Clique em **"Create a new release"** ou **"Draft a new release"**
4. Preencha os campos:
   - **Tag version**: Selecione a tag criada (ex: `v1.2.0`)
   - **Release title**: `Tela de Avisos v1.2.0`
   - **Description**: Adicione as notas da release:

   ```markdown
   ## 🎉 Tela de Avisos v1.2.0

   ### ✨ Novidades
   - Removido suporte ao YouTube
   - Adicionado suporte exclusivo para vídeos locais de pasta do sistema
   - Reprodução automática em sequência com loop infinito
   - Monitoramento automático de novos vídeos na pasta
   - Detecção automática quando novos vídeos são adicionados

   ### 🔧 Melhorias
   - Interface simplificada
   - Melhor desempenho com vídeos locais
   - Suporte a múltiplos formatos de vídeo (MP4, AVI, MOV, MKV, WMV, FLV, WEBM, M4V, 3GP, OGV)

   ### 📥 Download
   Baixe o arquivo `TelaDeAvisos.exe` abaixo e execute diretamente (não requer instalação).
   ```

5. **Arraste e solte o arquivo** `dist/TelaDeAvisos.exe` na área de upload
6. Marque como **"Set as the latest release"** (se for a versão mais recente)
7. Clique em **"Publish release"**

#### Opção B: Via GitHub CLI (gh)

Se você tem o GitHub CLI instalado:

```bash
gh release create v1.2.0 dist/TelaDeAvisos.exe \
  --title "Tela de Avisos v1.2.0" \
  --notes "Release v1.2.0 - Suporte apenas para vídeos locais"
```

---

## 📝 Template de Notas de Release

Use este template para suas releases:

```markdown
## 🎉 Tela de Avisos v1.2.0

### ✨ Novidades
- [Liste as principais funcionalidades novas]

### 🔧 Melhorias
- [Liste as melhorias feitas]

### 🐛 Correções
- [Liste os bugs corrigidos]

### 📥 Como Usar
1. Baixe o arquivo `TelaDeAvisos.exe`
2. Execute o arquivo (não requer instalação)
3. Configure a pasta de vídeos através do ícone na bandeja do sistema

### 📋 Requisitos
- Windows 7 ou superior
- Pasta contendo vídeos nos formatos suportados

### 🔗 Links
- [Documentação completa](README.md)
- [Reportar problemas](https://github.com/seu-usuario/telaavisos/issues)
```

---

## 🔄 Workflow Completo (Script)

Um script está disponível para automatizar o processo: `release.sh`

### Como usar o script:

```bash
# Dar permissão de execução (apenas na primeira vez)
chmod +x release.sh

# Executar o script
./release.sh
```

O script `release.sh` já está incluído no projeto e faz:
- Verifica o status do Git
- Gera o executável automaticamente
- Cria a tag Git
- Envia a tag para o GitHub (opcional)
- Fornece instruções para finalizar no GitHub

### Conteúdo do script (release.sh):

```bash
#!/bin/bash

echo "===================================="
echo "Criando Release do Tela de Avisos"
echo "===================================="

echo ""
echo "1. Verificando status do Git..."
git status

echo ""
echo "2. Gerando executável..."
npm run build

echo ""
read -p "Digite a versão (ex: 1.2.0): " VERSION

echo ""
echo "3. Criando tag Git..."
git tag -a v$VERSION -m "Release v$VERSION"

echo ""
echo "4. Enviando tag para GitHub..."
git push origin v$VERSION

echo ""
echo "===================================="
echo "Release criada com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Acesse: https://github.com/seu-usuario/telaavisos/releases/new"
echo "2. Selecione a tag v$VERSION"
echo "3. Faça upload do arquivo: dist/TelaDeAvisos.exe"
echo "4. Adicione as notas da release"
echo "5. Publique a release"
echo "===================================="
```

---

## 📦 Estrutura de Versões (Semantic Versioning)

Use o padrão **SemVer** (Semantic Versioning):

- **MAJOR** (1.0.0): Mudanças incompatíveis com versões anteriores
- **MINOR** (0.1.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.1): Correções de bugs compatíveis

**Exemplos:**
- `1.2.0` → `1.3.0` (nova funcionalidade)
- `1.2.0` → `1.2.1` (correção de bug)
- `1.2.0` → `2.0.0` (mudança incompatível)

---

## ✅ Checklist Antes de Criar Release

- [ ] Código testado e funcionando
- [ ] Versão atualizada no `package.json`
- [ ] README.md atualizado
- [ ] CHANGELOG.md atualizado (se existir)
- [ ] Executável gerado e testado
- [ ] Tag Git criada
- [ ] Tag enviada para GitHub
- [ ] Notas de release preparadas
- [ ] Executável pronto para upload

---

## 🎯 Dicas Importantes

1. **Sempre teste o executável** antes de fazer release
2. **Mantenha um CHANGELOG.md** para histórico de mudanças
3. **Use tags anotadas** (`git tag -a`) em vez de tags simples
4. **Adicione screenshots** nas notas da release se possível
5. **Mencione breaking changes** claramente se houver
6. **Link para documentação** nas notas da release

---

## 📚 Recursos Adicionais

- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Semantic Versioning](https://semver.org/)
- [Git Tags Documentation](https://git-scm.com/book/en/v2/Git-Basics-Tagging)

