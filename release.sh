#!/bin/bash

echo "===================================="
echo "Criando Release do Tela de Avisos"
echo "===================================="

echo ""
echo "1. Verificando status do Git..."
git status

echo ""
read -p "Deseja continuar? (S/N): " CONTINUE
if [[ ! "$CONTINUE" =~ ^[Ss]$ ]]; then
    exit 0
fi

echo ""
echo "2. Gerando executável..."
npm run build

if [ ! -f "dist/TelaDeAvisos.exe" ]; then
    echo "ERRO: Executável não foi gerado!"
    exit 1
fi

echo ""
echo "Executável gerado com sucesso: dist/TelaDeAvisos.exe"

echo ""
read -p "Digite a versão (ex: 1.2.0): " VERSION

echo ""
echo "3. Criando tag Git v$VERSION..."
git tag -a v$VERSION -m "Release v$VERSION"

echo ""
read -p "Deseja enviar a tag para o GitHub? (S/N): " PUSH_TAG
if [[ "$PUSH_TAG" =~ ^[Ss]$ ]]; then
    echo "Enviando tag para GitHub..."
    git push origin v$VERSION
fi

echo ""
echo "===================================="
echo "Release preparada com sucesso!"
echo ""
echo "Versão: v$VERSION"
echo "Executável: dist/TelaDeAvisos.exe"
echo ""
echo "Próximos passos:"
echo "1. Acesse: https://github.com/billbarsch/teladeavisos/releases/new"
echo "2. Selecione a tag v$VERSION"
echo "3. Adicione o título: Tela de Avisos v$VERSION"
echo "4. Faça upload do arquivo: dist/TelaDeAvisos.exe"
echo "5. Adicione as notas da release"
echo "6. Publique a release"
echo "===================================="

