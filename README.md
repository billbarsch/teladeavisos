# Tela de Avisos

Aplicativo Electron para exibição de playlist do YouTube em tela cheia, ideal para painéis de avisos e informativos.

## Características

- Reprodução automática de playlist do YouTube
- Modo tela cheia sem bordas ou controles
- Reinício automático da playlist
- Bloqueio de interações do usuário
- Reconexão automática em caso de perda de internet
- Suporte a múltiplos monitores

## Requisitos

- Node.js (versão 14 ou superior)
- npm (geralmente vem com o Node.js)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/billbarsch/teladeavisos.git
cd teladeavisos
```

2. Instale as dependências:
```bash
npm install
```

## Configuração

1. Abra o arquivo `main.js` e substitua a URL da playlist:
```javascript
const PLAYLIST_URL = 'SUA_URL_DA_PLAYLIST_AQUI';
```

2. Para selecionar um monitor específico, ajuste o índice em:
```javascript
const targetDisplay = displays[0]; // 0 para primeiro monitor, 1 para segundo, etc.
```

## Desenvolvimento

Para executar em modo de desenvolvimento:
```bash
npm start
```

## Compilação

Para gerar o executável:
```bash
npm run build
```

O executável será gerado na pasta `dist`.

## Uso

- O aplicativo iniciará em tela cheia no monitor configurado
- A playlist será reproduzida automaticamente
- Em caso de perda de conexão, tentará reconectar automaticamente
- Para fechar o aplicativo, use o Gerenciador de Tarefas do Windows

## Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Autor

Bill Barsch - [GitHub](https://github.com/billbarsch)