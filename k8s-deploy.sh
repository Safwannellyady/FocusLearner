#!/bin/bash

# FocusLearner Kubernetes Quick-Start Script
# Usage: ./k8s-deploy.sh [build|deploy|logs|delete|status]

set -e

REGISTRY="${REGISTRY:-your-registry}"
NAMESPACE="focuslearner"
MANIFEST="k8s-manifest.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    # Check if connected to a cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Not connected to a Kubernetes cluster"
        echo "Set up a cluster (Docker Desktop K8s, Minikube, GKE, EKS, etc.)"
        exit 1
    fi
    
    log_info "All prerequisites met"
}

# Build and push Docker images
build_images() {
    if [ "$REGISTRY" == "your-registry" ]; then
        log_error "REGISTRY not set. Set it with: export REGISTRY=your-registry"
        exit 1
    fi
    
    log_info "Building backend image..."
    docker build -t $REGISTRY/focuslearner-backend:latest ./backend
    
    log_info "Pushing backend image..."
    docker push $REGISTRY/focuslearner-backend:latest
    
    log_info "Building frontend image..."
    docker build -t $REGISTRY/focuslearner-frontend:latest ./frontend
    
    log_info "Pushing frontend image..."
    docker push $REGISTRY/focuslearner-frontend:latest
    
    log_info "Images built and pushed successfully"
}

# Update manifest with registry
update_manifest() {
    log_info "Updating manifest with registry: $REGISTRY"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|your-registry|$REGISTRY|g" $MANIFEST
    else
        # Linux
        sed -i "s|your-registry|$REGISTRY|g" $MANIFEST
    fi
    
    log_info "Manifest updated"
}

# Deploy to Kubernetes
deploy() {
    check_prerequisites
    
    if [ ! -f "$MANIFEST" ]; then
        log_error "Manifest file not found: $MANIFEST"
        exit 1
    fi
    
    log_info "Deploying to Kubernetes..."
    kubectl apply -f $MANIFEST
    
    log_info "Deployment submitted. Waiting for pods to be ready..."
    kubectl rollout status deployment/backend -n $NAMESPACE --timeout=5m
    kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=5m
    
    log_info "Deployment complete!"
    log_info "Check status with: kubectl get all -n $NAMESPACE"
}

# View logs
view_logs() {
    COMPONENT=$1
    if [ -z "$COMPONENT" ]; then
        COMPONENT="backend"
    fi
    
    log_info "Showing logs for: $COMPONENT"
    kubectl logs -f deployment/$COMPONENT -n $NAMESPACE --all-containers=true
}

# Get service info
show_status() {
    log_info "FocusLearner Status"
    echo ""
    
    echo "Namespace: $NAMESPACE"
    kubectl get namespace $NAMESPACE
    echo ""
    
    echo "Services:"
    kubectl get svc -n $NAMESPACE
    echo ""
    
    echo "Pods:"
    kubectl get pods -n $NAMESPACE
    echo ""
    
    echo "PersistentVolumeClaims:"
    kubectl get pvc -n $NAMESPACE
    echo ""
    
    log_info "To access the frontend:"
    EXTERNAL_IP=$(kubectl get svc frontend -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ ! -z "$EXTERNAL_IP" ]; then
        echo "  External IP: http://$EXTERNAL_IP"
    else
        echo "  Use port-forward: kubectl port-forward svc/frontend 8080:80 -n $NAMESPACE"
        echo "  Then visit: http://localhost:8080"
    fi
}

# Delete deployment
delete_deployment() {
    log_warn "Deleting FocusLearner namespace (this will delete all resources)..."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete namespace $NAMESPACE
        log_info "Namespace deleted"
    else
        log_info "Cancelled"
    fi
}

# Initialize database
init_db() {
    log_info "Initializing database..."
    
    # Wait for backend to be ready
    kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s
    
    # Run migration
    POD=$(kubectl get pod -l app=backend -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    log_info "Running migrations in pod: $POD"
    
    kubectl exec -it $POD -n $NAMESPACE -- \
        python -c "from models import db; from app import app; app.app_context().push(); db.create_all()"
    
    log_info "Database initialized"
}

# Main
case "${1:-status}" in
    build)
        check_prerequisites
        build_images
        ;;
    deploy)
        update_manifest
        deploy
        init_db
        show_status
        ;;
    build-deploy)
        build_images
        update_manifest
        deploy
        init_db
        show_status
        ;;
    logs)
        view_logs $2
        ;;
    status)
        show_status
        ;;
    delete)
        delete_deployment
        ;;
    init-db)
        init_db
        ;;
    *)
        cat << EOF
FocusLearner Kubernetes Deployment Script

Usage: $0 [COMMAND]

Commands:
  build           Build and push Docker images to registry
  deploy          Deploy to Kubernetes cluster
  build-deploy    Build images, then deploy (recommended)
  logs [COMPONENT] Show logs (default: backend)
  status          Show deployment status
  init-db         Initialize database
  delete          Delete deployment from cluster

Environment Variables:
  REGISTRY        Docker registry (default: your-registry)

Examples:
  export REGISTRY=docker.io/yourusername
  $0 build
  $0 deploy
  $0 logs backend
  $0 status
  $0 delete

EOF
        exit 1
        ;;
esac
