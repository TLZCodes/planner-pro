
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$cfg = Get-Content -Raw -LiteralPath 'C:\Users\TLZCodes\Desktop\ProPlanner\sound\narration\.tmp-sc24-l1.json' | ConvertFrom-Json
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $s.SelectVoice($cfg.voice) } catch { Write-Error "Voice not found: $($cfg.voice)"; exit 3 }
$s.Rate = [int]$cfg.rate
$s.SetOutputToWaveFile($cfg.out)
$s.Speak($cfg.text)
$s.Dispose()
