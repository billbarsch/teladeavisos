# Tela de Avisos

Aplicativo para exibição automática de vídeos locais em tela cheia, ideal para painéis de avisos, informativos e TVs corporativas. Reproduz vídeos de uma pasta do sistema em sequência e loop infinito.

## Características

- **Reprodução Automática**
  - Inicia automaticamente a reprodução
  - Reproduz vídeos em sequência
  - Loop infinito (volta ao primeiro vídeo após o último)
  - Continua reproduzindo mesmo após reiniciar o computador

- **Interface Limpa**
  - Modo tela cheia sem bordas
  - Sem controles visíveis
  - Sem interferência do usuário
  - Botões de navegação aparecem apenas ao passar o mouse

- **Configuração Fácil**
  - Interface gráfica para configuração
  - Seleção de pasta do sistema contendo vídeos
  - Salva as configurações automaticamente
  - Acesso rápido pelo ícone na bandeja

- **Recursos Avançados**
  - Suporte a múltiplos monitores
  - Lembra o último monitor utilizado
  - Monitoramento automático de novos vídeos na pasta
  - Detecta automaticamente quando novos vídeos são adicionados
  - Proteção contra cliques acidentais
  - Recarga automática periódica configurável
  - Ícone na bandeja do sistema para controle

## Download

Baixe a última versão do executável em:
[Releases](https://github.com/billbarsch/teladeavisos/releases)

## Instalação

1. Baixe o arquivo `TelaDeAvisos.exe` da página de releases
2. Execute o arquivo (não precisa instalar)
3. O programa iniciará automaticamente em tela cheia
4. Configure a pasta de vídeos através do ícone na bandeja do sistema

## Como Usar

### Configuração Inicial
1. Clique no ícone do programa na bandeja do sistema (próximo ao relógio)
2. Selecione "Configurações"
3. Clique em "Selecionar Pasta" e escolha a pasta contendo seus vídeos
4. Configure outras opções conforme necessário:
   - Bloquear cliques na tela (recomendado)
   - Ativar recarga automática periódica
   - Intervalo de recarga em horas
5. Clique em "Salvar"

### Formatos de Vídeo Suportados
O aplicativo suporta os seguintes formatos de vídeo:
- MP4, AVI, MOV, MKV, WMV, FLV, WEBM, M4V, 3GP, OGV

### Como Funciona
- O aplicativo lê todos os vídeos da pasta selecionada
- Reproduz os vídeos em ordem alfabética
- Quando um vídeo termina, passa automaticamente para o próximo
- Ao chegar no último vídeo, volta ao primeiro (loop infinito)
- Detecta automaticamente quando novos vídeos são adicionados à pasta

### Controles
- **Para fechar**: clique com botão direito no ícone da bandeja e selecione "Fechar Tela de Avisos"
- **Para configurar**: clique com botão direito no ícone da bandeja e selecione "Configurações"
- **Para mudar de monitor**: passe o mouse sobre a tela para ver os botões de navegação (← →) e clique neles para alternar entre monitores

## Recursos Técnicos

- Desenvolvido com Electron 28.1.0
- Suporte a Windows 7 ou superior
- Executável portátil (não requer instalação)
- Baixo consumo de recursos
- Configurações persistentes entre reinicializações
- Monitoramento em tempo real de mudanças na pasta de vídeos
- Suporte a múltiplos formatos de vídeo

## Solução de Problemas

1. **Vídeo não inicia**
   - Verifique se a pasta selecionada contém vídeos
   - Confirme se os arquivos são de um formato suportado (MP4, AVI, MOV, etc.)
   - Verifique se você tem permissão para acessar a pasta
   - Certifique-se de que os arquivos de vídeo não estão corrompidos

2. **Tela preta**
   - Verifique se há vídeos na pasta selecionada
   - Confirme se os vídeos estão em formatos suportados
   - Tente selecionar uma pasta diferente e depois voltar para a original
   - Reinicie o programa se necessário

3. **Monitor errado**
   - Passe o mouse sobre a tela para ver os botões de navegação
   - Use os botões ← → para alternar entre monitores
   - O programa lembrará a última posição

4. **Novos vídeos não aparecem**
   - O aplicativo detecta automaticamente novos vídeos adicionados à pasta
   - Aguarde alguns segundos após adicionar novos vídeos
   - Se necessário, recarregue o aplicativo

## Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Desenvolvimento

Para executar o projeto em modo de desenvolvimento:

```bash
# Instalar dependências
npm install

# Executar o aplicativo em modo de desenvolvimento
npm start
```

Para criar o executável portátil:

```bash
# Gerar executável para distribuição
npm run build
```

O executável será gerado na pasta `dist/`.

## Licença

Este projeto está licenciado sob a Licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Autor

Bill Barsch - [GitHub](https://github.com/billbarsch)