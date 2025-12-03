# Levantamento do Projeto - Tela de Avisos

## 📋 Visão Geral

O **Tela de Avisos** é uma aplicação desktop desenvolvida com **Electron** que reproduz playlists do YouTube em tela cheia, ideal para painéis de avisos, informativos e TVs corporativas.

**Versão atual:** 1.1.0  
**Tecnologias:** Electron 28.1.0, Node.js  
**Plataforma:** Windows (x64 e ia32)

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Arquivos Principais

```
telaavisos/
├── main.js              # Processo principal do Electron (backend)
├── preload.js           # Script de preload para comunicação segura
├── player.html          # Interface do player (tela cheia)
├── config.html          # Interface de configurações
├── icon.png             # Ícone da aplicação
├── package.json         # Configurações e dependências do projeto
└── dist/                # Pasta de saída dos executáveis gerados
```

### Componentes Principais

#### 1. **main.js** (Processo Principal)
- Gerencia as janelas da aplicação
- Controla o ciclo de vida do aplicativo
- Gerencia configurações (salvas em `config.json` no diretório do usuário)
- Implementa sistema de tray icon (ícone na bandeja do sistema)
- Monitora conectividade com a internet
- Gerencia múltiplos monitores
- Sistema de reload automático configurável

**Funcionalidades principais:**
- Criação da janela principal em tela cheia
- Janela de configurações
- Sistema de salvamento/carregamento de configurações
- Detecção e recuperação de falhas de conexão
- Movimentação entre monitores
- Timer de reload automático

#### 2. **preload.js** (Bridge de Segurança)
- Expõe API segura para comunicação entre processos
- Implementa bloqueio de cliques quando configurado
- Permite movimentação da janela entre monitores

#### 3. **player.html** (Interface do Player)
- Layout responsivo com sidebars laterais
- Botões de navegação entre monitores (aparecem ao passar o mouse)
- Sistema de bloqueio de cliques
- Container para iframe do YouTube

#### 4. **config.html** (Interface de Configurações)
- Formulário para configurar URL da playlist
- Opção para bloquear cliques
- Configurações de reload automático (ativar/desativar e intervalo em horas)

---

## ⚙️ Como Funciona o Projeto

### Fluxo de Execução

1. **Inicialização:**
   - O Electron inicia o processo principal (`main.js`)
   - Carrega configurações salvas do arquivo `config.json` (ou usa padrões)
   - Cria a janela principal em tela cheia
   - Cria o ícone na bandeja do sistema
   - Inicia monitoramento de conectividade

2. **Carregamento do Conteúdo:**
   - Carrega `player.html` na janela principal
   - Injeta iframe do YouTube com a URL da playlist configurada
   - Configura eventos dos botões de navegação
   - Aplica bloqueio de cliques se configurado

3. **Funcionamento Contínuo:**
   - Monitora conexão com internet (verifica a cada 5 segundos)
   - Se perder conexão e depois recuperar, recarrega automaticamente
   - Se reload automático estiver ativado, recarrega periodicamente conforme intervalo configurado
   - Salva a posição do monitor quando a janela é movida

### Configurações Persistidas

As configurações são salvas em: `%APPDATA%\Tela de Avisos\config.json`

**Estrutura do arquivo de configuração:**
```json
{
  "playlistUrl": "https://www.youtube.com/embed/...",
  "blockClicks": true,
  "autoReloadEnabled": true,
  "autoReloadHours": 8,
  "lastDisplay": 0
}
```

### Recursos Implementados

✅ **Reprodução Automática** - Inicia automaticamente e reinicia a playlist  
✅ **Tela Cheia Sem Bordas** - Interface limpa sem interferências  
✅ **Múltiplos Monitores** - Suporte completo com lembrança do último monitor usado  
✅ **Configuração via Interface** - Janela gráfica acessível pela bandeja  
✅ **Reconexão Automática** - Detecta perda de internet e reconecta  
✅ **Bloqueio de Cliques** - Proteção contra interação acidental  
✅ **Reload Automático** - Recarrega periodicamente para evitar travamentos  
✅ **Tray Icon** - Controle rápido pelo ícone na bandeja do sistema  

---

## 🔨 Como Gerar o Executável

### Pré-requisitos

1. **Node.js** instalado (versão 14 ou superior recomendada)
2. **npm** (geralmente vem com Node.js)

### Passo a Passo

#### 1. Instalar Dependências

```bash
npm install
```

Isso instalará:
- `electron` (^28.1.0) - Framework Electron
- `electron-builder` (^24.9.1) - Ferramenta de build

#### 2. Gerar o Executável

```bash
npm run build
```

Este comando executa:
```bash
electron-builder --win portable --config.win.signAndEditExecutable=false
```

### Configuração de Build

A configuração está no `package.json`:

```json
"build": {
  "appId": "com.telaavisos",
  "productName": "Tela de Avisos",
  "win": {
    "target": [
      {
        "target": "portable",
        "arch": ["x64", "ia32"]
      }
    ]
  },
  "portable": {
    "artifactName": "TelaDeAvisos.exe"
  },
  "electronVersion": "28.1.0",
  "compression": "maximum",
  "asar": true,
  "forceCodeSigning": false
}
```

### Resultado do Build

Após executar `npm run build`, o executável será gerado em:

```
dist/TelaDeAvisos.exe
```

**Características do executável:**
- ✅ **Portátil** - Não requer instalação, pode ser executado diretamente
- ✅ **Compactado** - Compressão máxima para reduzir tamanho
- ✅ **Empacotado** - Código empacotado em formato ASAR
- ✅ **Multi-arquitetura** - Gera versões para x64 e ia32 (32-bit)

### Estrutura de Saída

```
dist/
├── TelaDeAvisos.exe          # Executável portátil final
├── win-unpacked/             # Versão descompactada (para debug)
│   ├── Tela de Avisos.exe    # Executável principal
│   ├── resources/
│   │   └── app.asar          # Código da aplicação empacotado
│   └── [arquivos do Electron] # Bibliotecas e recursos do Electron
└── builder-effective-config.yaml  # Configuração efetiva usada no build
```

---

## 📦 Instalador

### ❌ **NÃO EXISTE INSTALADOR**

O projeto **NÃO possui instalador**. O executável gerado é do tipo **portátil (portable)**, o que significa:

- ✅ Não precisa instalar - basta executar o `.exe`
- ✅ Não cria entradas no registro do Windows
- ✅ Não cria atalhos no menu Iniciar
- ✅ Não requer permissões de administrador
- ✅ Pode ser executado de qualquer local (pendrive, pasta local, etc.)

### Como Criar um Instalador (Opcional)

Se você quiser criar um instalador no futuro, seria necessário modificar o `package.json` para usar targets diferentes:

**Opções de instaladores disponíveis no electron-builder:**
- `nsis` - Instalador NSIS (recomendado para Windows)
- `squirrel` - Instalador Squirrel.Windows
- `appx` - Pacote AppX (Windows Store)

**Exemplo de configuração para criar instalador NSIS:**

```json
"win": {
  "target": [
    {
      "target": "nsis",
      "arch": ["x64"]
    }
  ]
}
```

E então executar:
```bash
npm run build
```

---

## 🚀 Modo de Desenvolvimento

Para executar o projeto em modo de desenvolvimento (sem gerar executável):

```bash
npm start
```

Isso executa:
```bash
electron .
```

Útil para:
- Testar mudanças rapidamente
- Debug do código
- Desenvolvimento de novas funcionalidades

---

## 📝 Resumo

| Aspecto | Detalhes |
|---------|----------|
| **Tipo de Aplicação** | Desktop (Electron) |
| **Plataforma** | Windows (x64, ia32) |
| **Formato de Distribuição** | Executável Portátil (.exe) |
| **Instalador** | ❌ Não possui (portátil) |
| **Comando de Build** | `npm run build` |
| **Saída do Build** | `dist/TelaDeAvisos.exe` |
| **Configurações** | Salvas em `%APPDATA%\Tela de Avisos\config.json` |
| **Dependências Principais** | electron@28.1.0, electron-builder@24.9.1 |

---

## 🔍 Observações Importantes

1. **Assinatura Digital:** O executável não é assinado digitalmente (`forceCodeSigning: false`). Isso pode gerar avisos do Windows Defender em alguns sistemas.

2. **Tamanho do Executável:** O executável portátil inclui todo o runtime do Electron, então o arquivo pode ser grande (geralmente 100-150 MB).

3. **Versões Geradas:** O build atual gera versões para x64 e ia32. Se quiser apenas uma arquitetura, modifique o array `arch` no `package.json`.

4. **Compressão:** Está configurada como "maximum", o que pode aumentar o tempo de build mas reduz o tamanho final.

5. **ASAR:** O código está empacotado em formato ASAR para proteção e organização, mas ainda pode ser extraído com ferramentas específicas.

---

## 📚 Referências

- [Documentação do Electron](https://www.electronjs.org/docs)
- [Documentação do electron-builder](https://www.electron.build/)
- [README do Projeto](./README.md)

