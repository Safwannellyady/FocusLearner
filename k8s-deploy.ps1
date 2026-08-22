# FocusLearner Kubernetes Deployment Script (PowerShell)
# Usage: .\k8s-deploy.ps1 build|deploy|logs|status|delete

param(
    [Parameter(Position=0)]
    [ValidateSet("build", "deploy", "build-deploy", "logs", "status", "delete", "init-db")]
    [string]$Command = "status",
    
    [Parameter(Position=1)]
    [string]$Component = "backend"
)

# Configuration
$REGISTRY = $env:REGISTRY -or "your-registry"
$NAMESPACE = "focuslearner"
$MANIFEST = "k8s-manifest.yaml"

# Colors
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Green }
function Write-Warn { Write-Host "[WARN] $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Docker
    try { docker version | Out-Null } catch {
        Write-Error "Docker is not installed or not running"
        exit 1
    }
    
    # Check kubectl
    try { kubectl version --client | Out-Null } catch {
        Write-Error "kubectl is not installed"
        exit 1
    }
    
    # Check cluster connection
    try { kubectl cluster-info | Out-Null } catch {
        Write-Error "Not connected to a Kubernetes cluster"
        Write-Host "Set up a cluster: Docker Desktop K8s, Minikube, GKE, EKS, etc."
        exit 1
    }
    
    Write-Info "All prerequisites met"
}

# Build and push images
function Invoke-BuildImages {
    if ($REGISTRY -eq "your-registry") {
        Write-Error "REGISTRY not set. Run: `$env:REGISTRY='your-registry'"
        exit 1
    }
    
    Write-Info "Building backend image..."
    docker build -t "$REGISTRY/focuslearner-backend:latest" ./backend
    
    Write-Info "Pushing backend image..."
    docker push "$REGISTRY/focuslearner-backend:latest"
    
    Write-Info "Building frontend image..."
    docker build -t "$REGISTRY/focuslearner-frontend:latest" ./frontend
    
    Write-Info "Pushing frontend image..."
    docker push "$REGISTRY/focuslearner-frontend:latest"
    
    Write-Info "Images built and pushed successfully"
}

# Update manifest
function Update-Manifest {
    Write-Info "Updating manifest with registry: $REGISTRY"
    
    $content = Get-Content $MANIFEST -Raw
    $content = $content -replace "your-registry", $REGISTRY
    Set-Content $MANIFEST $content
    
    Write-Info "Manifest updated"
}

# Deploy to Kubernetes
function Invoke-Deploy {
    Test-Prerequisites
    
    if (!(Test-Path $MANIFEST)) {
        Write-Error "Manifest file not found: $MANIFEST"
        exit 1
    }
    
    Write-Info "Deploying to Kubernetes..."
    kubectl apply -f $MANIFEST
    
    Write-Info "Waiting for deployment to be ready..."
    kubectl rollout status deployment/backend -n $NAMESPACE --timeout=5m
    kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=5m
    
    Write-Info "Deployment complete!"
    Write-Info "Check status with: kubectl get all -n $NAMESPACE"
}

# View logs
function Get-Logs {
    Write-Info "Showing logs for: $Component"
    kubectl logs -f deployment/$Component -n $NAMESPACE --all-containers=true
}

# Show status
function Show-Status {
    Write-Info "FocusLearner Status"
    Write-Host ""
    
    Write-Host "Namespace: $NAMESPACE"
    kubectl get namespace $NAMESPACE
    Write-Host ""
    
    Write-Host "Services:"
    kubectl get svc -n $NAMESPACE
    Write-Host ""
    
    Write-Host "Pods:"
    kubectl get pods -n $NAMESPACE
    Write-Host ""
    
    Write-Host "PersistentVolumeClaims:"
    kubectl get pvc -n $NAMESPACE
    Write-Host ""
    
    Write-Info "To access the frontend:"
    $externalIP = kubectl get svc frontend -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
    
    if ($externalIP) {
        Write-Host "  External IP: http://$externalIP"
    } else {
        Write-Host "  Use port-forward: kubectl port-forward svc/frontend 8080:80 -n $NAMESPACE"
        Write-Host "  Then visit: http://localhost:8080"
    }
}

# Delete deployment
function Remove-Deployment {
    Write-Warn "This will delete the entire FocusLearner namespace and all resources"
    $response = Read-Host "Are you sure? (yes/no)"
    
    if ($response -eq "yes") {
        Write-Info "Deleting namespace $NAMESPACE..."
        kubectl delete namespace $NAMESPACE
        Write-Info "Namespace deleted"
    } else {
        Write-Info "Cancelled"
    }
}

# Initialize database
function Initialize-Database {
    Write-Info "Initializing database..."
    
    # Wait for backend pod
    Write-Info "Waiting for backend pod to be ready..."
    kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s
    
    # Get pod name
    $pod = kubectl get pod -l app=backend -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}'
    Write-Info "Running migrations in pod: $pod"
    
    kubectl exec -it $pod -n $NAMESPACE -- `
        python -c "from models import db; from app import app; app.app_context().push(); db.create_all()"
    
    Write-Info "Database initialized"
}

# Main execution
try {
    switch ($Command) {
        "build" {
            Test-Prerequisites
            Invoke-BuildImages
        }
        "deploy" {
            Update-Manifest
            Invoke-Deploy
            Initialize-Database
            Show-Status
        }
        "build-deploy" {
            Invoke-BuildImages
            Update-Manifest
            Invoke-Deploy
            Initialize-Database
            Show-Status
        }
        "logs" {
            Get-Logs
        }
        "status" {
            Show-Status
        }
        "delete" {
            Remove-Deployment
        }
        "init-db" {
            Initialize-Database
        }
        default {
            Write-Error "Unknown command: $Command"
            Write-Host @"
FocusLearner Kubernetes Deployment Script (PowerShell)

Usage: .\k8s-deploy.ps1 [Command] [Component]

Commands:
  build           Build and push Docker images to registry
  deploy          Deploy to Kubernetes cluster
  build-deploy    Build images, then deploy (recommended)
  logs [Component] Show logs (default: backend)
  status          Show deployment status
  init-db         Initialize database
  delete          Delete deployment from cluster

Environment Variables:
  REGISTRY        Docker registry (default: your-registry)
              Example: `$env:REGISTRY='docker.io/yourusername'

Examples:
  `$env:REGISTRY='docker.io/yourusername'
  .\k8s-deploy.ps1 build
  .\k8s-deploy.ps1 deploy
  .\k8s-deploy.ps1 logs backend
  .\k8s-deploy.ps1 status
  .\k8s-deploy.ps1 delete

"@
            exit 1
        }
    }
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
