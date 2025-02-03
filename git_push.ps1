param (
    [string]$commitMessage
)

if (-not $commitMessage) {
    Write-Host "Error: No commit message provided."
    Write-Host "Usage: .\git_push.ps1 -commitMessage 'Your commit message'"
    exit 1
}

# Add all changes
git add .

# Commit with the provided message
git commit -m $commitMessage

# Push to the current branch
git push