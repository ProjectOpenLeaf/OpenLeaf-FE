# deploy-frontend.ps1
# PowerShell script to deploy/update Frontend to Kubernetes

param(
    [string]$Namespace = "openleaf",
    [string]$ImageTag = "latest",
    [string]$ConfigFile = "k8s-frontend-config.yaml",
    [string]$DeploymentFile = "k8s-frontend-deployment.yaml",
    [switch]$WatchRollout,
    [switch]$LoadTest
)

Write-Host "🎨 OpenLeaf Frontend Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if kubectl is available
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl is not installed" -ForegroundColor Red
    exit 1
}

# Check if cluster is accessible
kubectl cluster-info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to Kubernetes cluster" -ForegroundColor Red
    Write-Host "   Make sure your cluster is running (k3d or minikube)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Connected to cluster:" -ForegroundColor Green
kubectl config current-context
Write-Host ""

# Check if namespace exists
$namespaceExists = kubectl get namespace $Namespace 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "📦 Creating namespace: $Namespace" -ForegroundColor Yellow
    kubectl create namespace $Namespace
    Write-Host "✅ Namespace created" -ForegroundColor Green
} else {
    Write-Host "✅ Namespace exists: $Namespace" -ForegroundColor Green
}

Write-Host ""

# Apply configuration
if (Test-Path $ConfigFile) {
    Write-Host "⚙️ Applying configuration..." -ForegroundColor Yellow
    kubectl apply -f $ConfigFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Configuration applied" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to apply configuration" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️ Configuration file not found: $ConfigFile" -ForegroundColor Yellow
}

Write-Host ""

# Update image tag if not latest
if ($ImageTag -ne "latest") {
    Write-Host "🏷️ Updating image tag to: $ImageTag" -ForegroundColor Yellow
    
    # Read deployment file
    $content = Get-Content $DeploymentFile -Raw
    
    # Replace image tag
    $content = $content -replace 'openleaf-frontend:latest', "openleaf-frontend:$ImageTag"
    
    # Save to temporary file
    $tempFile = "temp-deployment.yaml"
    $content | Set-Content $tempFile
    
    $DeploymentFile = $tempFile
}

# Apply deployment
if (Test-Path $DeploymentFile) {
    Write-Host "🚀 Deploying frontend..." -ForegroundColor Yellow
    kubectl apply -f $DeploymentFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment applied" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to apply deployment" -ForegroundColor Red
        
        # Cleanup temp file if exists
        if (Test-Path "temp-deployment.yaml") {
            Remove-Item "temp-deployment.yaml"
        }
        
        exit 1
    }
} else {
    Write-Host "❌ Deployment file not found: $DeploymentFile" -ForegroundColor Red
    exit 1
}

# Cleanup temp file if exists
if (Test-Path "temp-deployment.yaml") {
    Remove-Item "temp-deployment.yaml"
}

Write-Host ""

# Wait for rollout
if ($WatchRollout) {
    Write-Host "⏳ Watching rollout status..." -ForegroundColor Yellow
    kubectl rollout status deployment/frontend -n $Namespace --timeout=5m
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Rollout completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Rollout failed or timed out" -ForegroundColor Red
    }
} else {
    Write-Host "⏳ Waiting for pods to be ready (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

Write-Host ""

# Display status
Write-Host "📊 Current Status:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pods:" -ForegroundColor Yellow
kubectl get pods -n $Namespace -l app=frontend
Write-Host ""

Write-Host "Service:" -ForegroundColor Yellow
kubectl get svc -n $Namespace -l app=frontend
Write-Host ""

Write-Host "HPA:" -ForegroundColor Yellow
kubectl get hpa -n $Namespace frontend-hpa 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   HPA not found or metrics-server not running" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Ingress:" -ForegroundColor Yellow
kubectl get ingress -n $Namespace frontend-ingress 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Ingress not configured" -ForegroundColor Gray
}
Write-Host ""

# Run load test if requested
if ($LoadTest) {
    Write-Host "🔥 Running Load Test..." -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    Write-Host ""
    
    # Port forward to access frontend
    Write-Host "Setting up port forward..." -ForegroundColor Yellow
    $portForwardJob = Start-Job -ScriptBlock {
        kubectl port-forward -n openleaf svc/frontend 8080:80
    }
    
    Start-Sleep -Seconds 5
    
    # Run k6 load test
    Write-Host "Running k6 load test..." -ForegroundColor Yellow
    k6 run --vus 50 --duration 30s --out influxdb=http://localhost:8086/k6 loadtest-frontend.js
    
    # Stop port forward
    Stop-Job $portForwardJob
    Remove-Job $portForwardJob
}

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. View logs:" -ForegroundColor White
Write-Host "   kubectl logs -n $Namespace -l app=frontend --tail=50 -f" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Access frontend (port-forward):" -ForegroundColor White
Write-Host "   kubectl port-forward -n $Namespace svc/frontend 8080:80" -ForegroundColor Gray
Write-Host "   Then visit: http://localhost:8080" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Watch pods:" -ForegroundColor White
Write-Host "   kubectl get pods -n $Namespace -l app=frontend -w" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Watch HPA (autoscaling):" -ForegroundColor White
Write-Host "   kubectl get hpa -n $Namespace --watch" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Describe deployment:" -ForegroundColor White
Write-Host "   kubectl describe deployment frontend -n $Namespace" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Check rollout history:" -ForegroundColor White
Write-Host "   kubectl rollout history deployment/frontend -n $Namespace" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Rollback if needed:" -ForegroundColor White
Write-Host "   kubectl rollout undo deployment/frontend -n $Namespace" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy deployment! 🎉" -ForegroundColor Cyan