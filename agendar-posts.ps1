# Cria no Windows a tarefa "AC News - Gerar posts do Instagram", que gera 1 post 5 vezes por dia.
# Horarios no relogio do computador (Brasilia): 9h, 12h, 15h, 18h e 21h = 7h, 10h, 13h, 16h e 19h em Rio Branco.
# Roda so com voce logado, sem senha e sem administrador. Nao publica nada: so cria arquivos em posts-instagram.
#
# Para criar:   clique com o botao direito neste arquivo > "Executar com o PowerShell"
# Para remover: Unregister-ScheduledTask -TaskName "AC News - Gerar posts do Instagram" -Confirm:$false

$proj = $PSScriptRoot
$node = (Get-Command node).Source
$cmd = "Set-Location '$proj'; & '$node' node_modules\tsx\dist\cli.mjs scripts\gerar-posts.ts *>> posts-instagram\log.txt"

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -Command `"$cmd`"" -WorkingDirectory $proj
$triggers = foreach ($h in 9, 12, 15, 18, 21) { New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours($h)) }
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName "AC News - Gerar posts do Instagram" -Action $action -Trigger $triggers -Settings $settings `
  -Description "Gera a imagem 4:5 e a legenda do post mais relevante em posts-instagram. Nao publica nada." -Force | Select-Object TaskName, State

Write-Host "Tarefa criada. O computador precisa estar ligado nesses horarios (se estiver desligado, ela roda assim que ligar)."
Read-Host "Pressione Enter para fechar"
