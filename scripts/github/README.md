# GitHub Ruleset

Arquivo de politica versionada:
- `.github/rulesets/main-protection.json`

Script de aplicacao:
- `scripts/github/apply-ruleset.ps1`

Uso:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\github\apply-ruleset.ps1
```

Dry-run:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\github\apply-ruleset.ps1 -DryRun
```

Repositorio explicito:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\github\apply-ruleset.ps1 -Repository owner/repo
```

Observacao:
- Em repositorio privado, o GitHub pode bloquear ruleset/branch protection no plano Free.
