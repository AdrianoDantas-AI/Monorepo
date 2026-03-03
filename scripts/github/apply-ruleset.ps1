param(
    [string]$Repository = "",
    [string]$RulesetFile = ".github/rulesets/main-protection.json",
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-GhPath {
    $candidates = @(
        "gh",
        "C:\Program Files\GitHub CLI\gh.exe"
    )

    foreach ($candidate in $candidates) {
        if ($candidate -eq "gh") {
            $command = Get-Command gh -ErrorAction SilentlyContinue
            if ($null -ne $command) {
                return $command.Source
            }
            continue
        }

        if (Test-Path $candidate) {
            return $candidate
        }
    }

    throw "GitHub CLI nao encontrado. Instale o gh ou adicione no PATH."
}

function Resolve-Repository {
    param([string]$InputRepository)

    if (-not [string]::IsNullOrWhiteSpace($InputRepository)) {
        return $InputRepository
    }

    $origin = git remote get-url origin
    if (-not $origin) {
        throw "Nao foi possivel detectar o remoto origin."
    }

    if ($origin -match "github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(\.git)?$") {
        return "$($Matches.owner)/$($Matches.repo)"
    }

    throw "Remoto origin nao aponta para github.com no formato esperado."
}

function Invoke-Gh {
    param(
        [string]$GhPath,
        [string[]]$Arguments
    )

    $nativePrefVar = Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue
    $previous = if ($null -ne $nativePrefVar) { $nativePrefVar.Value } else { $null }
    if ($null -ne $nativePrefVar) {
        Set-Variable -Name PSNativeCommandUseErrorActionPreference -Value $false
    }

    try {
        $raw = & $GhPath @Arguments 2>&1
        $exitCode = $LASTEXITCODE
    }
    finally {
        if ($null -ne $nativePrefVar) {
            Set-Variable -Name PSNativeCommandUseErrorActionPreference -Value $previous
        }
    }

    if ($null -eq $raw) {
        $raw = @()
    }

    $combined = @($raw | ForEach-Object { $_.ToString().Trim() } | Where-Object { $_ -ne "" })

    return [PSCustomObject]@{
        ExitCode = $exitCode
        Output = ($combined -join [Environment]::NewLine)
    }
}

$gh = Get-GhPath
$repo = Resolve-Repository -InputRepository $Repository
$rulesetPath = Join-Path (Get-Location) $RulesetFile

if (-not (Test-Path $rulesetPath)) {
    throw "Arquivo de ruleset nao encontrado: $rulesetPath"
}

$rulesetRaw = Get-Content -Raw $rulesetPath
$ruleset = $rulesetRaw | ConvertFrom-Json

Write-Host "Repositorio alvo: $repo"
Write-Host "Ruleset alvo: $($ruleset.name)"
Write-Host "Arquivo: $rulesetPath"

if ($DryRun) {
    Write-Host "Dry-run habilitado. Payload que seria aplicado:"
    Write-Output $rulesetRaw
    exit 0
}

$listResponse = Invoke-Gh -GhPath $gh -Arguments @("api", "repos/$repo/rulesets")
if ($listResponse.ExitCode -ne 0) {
    $listOutput = $listResponse.Output
    if ($listOutput -match "Upgrade to GitHub Pro or make this repository public") {
        throw "GitHub bloqueou rulesets para este repo privado no plano atual. Torne o repo publico ou faca upgrade para aplicar rulesets no servidor."
    }
    throw "Falha ao listar rulesets: $listOutput"
}

$existingRulesets = $listResponse.Output | ConvertFrom-Json
$existing = $existingRulesets | Where-Object { $_.name -eq $ruleset.name } | Select-Object -First 1

if ($existing) {
    Write-Host "Ruleset existente encontrado (id=$($existing.id)). Atualizando..."
    $updateResponse = Invoke-Gh -GhPath $gh -Arguments @(
        "api",
        "--method",
        "PUT",
        "repos/$repo/rulesets/$($existing.id)",
        "--input",
        $rulesetPath
    )

    if ($updateResponse.ExitCode -ne 0) {
        $updateOutput = $updateResponse.Output
        throw "Falha ao atualizar ruleset: $updateOutput"
    }

    Write-Host "Ruleset atualizado com sucesso."
    exit 0
}

Write-Host "Nenhum ruleset com esse nome encontrado. Criando novo..."
$createResponse = Invoke-Gh -GhPath $gh -Arguments @(
    "api",
    "--method",
    "POST",
    "repos/$repo/rulesets",
    "--input",
    $rulesetPath
)

if ($createResponse.ExitCode -ne 0) {
    $createOutput = $createResponse.Output
    throw "Falha ao criar ruleset: $createOutput"
}

Write-Host "Ruleset criado com sucesso."
