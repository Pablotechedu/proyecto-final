#!/bin/bash

# Script para desplegar índices de Firestore
# Este script despliega los índices definidos en firestore.indexes.json

echo "🔥 Desplegando índices de Firestore..."
echo ""

# Verificar que Firebase CLI esté instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI no está instalado."
    echo "Instálalo con: npm install -g firebase-tools"
    exit 1
fi

# Verificar que estés logueado
echo "📋 Verificando autenticación..."
firebase login:list

echo ""
echo "🚀 Desplegando índices..."
firebase deploy --only firestore:indexes

echo ""
echo "✅ ¡Índices desplegados exitosamente!"
echo ""
echo "📊 Los índices pueden tardar unos minutos en estar completamente disponibles."
echo "Puedes verificar el estado en:"
echo "https://console.firebase.google.com/project/learning-models-hub/firestore/indexes"
