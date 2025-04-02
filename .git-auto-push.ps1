# Script de auto-push para Git
$ErrorActionPreference = "Stop"

# Função para fazer commit e push
function Git-AutoPush {
    param (
        [string]$commitMessage = "auto: Atualização automática"
    )
    
    try {
        # Adiciona todas as alterações
        git add .
        
        # Faz o commit
        git commit -m $commitMessage
        
        # Faz o push
        git push origin main
        
        Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao fazer push: $_" -ForegroundColor Red
    }
}

# Executa o auto-push
Git-AutoPush 