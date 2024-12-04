# Tela de Avisos

Aplicativo para exibição automática de playlist do YouTube em tela cheia, ideal para painéis de avisos, informativos e TVs corporativas.

## Características

- **Reprodução Automática**
  - Inicia automaticamente a reprodução
  - Reinicia a playlist quando termina
  - Continua reproduzindo mesmo após reiniciar o computador

- **Interface Limpa**
  - Modo tela cheia sem bordas
  - Sem controles visíveis
  - Sem interferência do usuário
  - Cursor do mouse oculto

- **Configuração Fácil**
  - Interface gráfica para configuração
  - Suporta qualquer URL de playlist do YouTube
  - Salva as configurações automaticamente
  - Acesso rápido pelo ícone na bandeja

- **Recursos Avançados**
  - Suporte a múltiplos monitores
  - Lembra o último monitor utilizado
  - Reconexão automática se perder internet
  - Proteção contra cliques acidentais
  - Ícone na bandeja do sistema para controle

## Download

Baixe a última versão do executável em:
[Releases](https://github.com/billbarsch/teladeavisos/releases)

## Instalação

1. Baixe o arquivo `TelaDeAvisos.exe` da página de releases
2. Execute o arquivo (não precisa instalar)
3. O programa iniciará automaticamente em tela cheia
4. Configure a URL da playlist através do ícone na bandeja do sistema

## Como Usar

### Configuração Inicial
1. Clique no ícone do programa na bandeja do sistema (próximo ao relógio)
2. Selecione "Configurações"
3. Cole a URL da playlist do YouTube
4. Clique em "Salvar"

### URLs Suportadas
- URLs de playlist: `https://www.youtube.com/playlist?list=...`
- URLs de vídeo com playlist: `https://www.youtube.com/watch?v=...&list=...`
- URLs de vídeo único: `https://www.youtube.com/watch?v=...`

### Controles
- Para fechar: clique com botão direito no ícone da bandeja e selecione "Fechar"
- Para configurar: clique com botão direito no ícone da bandeja e selecione "Configurações"
- Para mudar de monitor: mova a janela para o monitor desejado usando o Gerenciador de Tarefas do Windows

## Recursos Técnicos

- Desenvolvido com Electron
- Suporte a Windows 7 ou superior
- Executável portátil (não requer instalação)
- Baixo consumo de recursos
- Configurações persistentes entre reinicializações

## Solução de Problemas

1. **Vídeo não inicia**
   - Verifique sua conexão com a internet
   - Confirme se a URL da playlist está correta
   - Verifique se a playlist não está privada

2. **Tela preta**
   - O programa tentará reconectar automaticamente
   - Verifique sua conexão com a internet
   - Reinicie o programa se necessário

3. **Monitor errado**
   - Use o Gerenciador de Tarefas para mover para o monitor correto
   - O programa lembrará a última posição

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