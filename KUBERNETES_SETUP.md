# Kubernetes Setup Guide for FocusLearner Pro

## Prerequisites

Before starting, you need:

1. **Kubernetes Cluster** - choose one:
   - **Local**: Docker Desktop (built-in K8s), Minikube, or Kind
   - **Cloud**: GKE (Google Cloud), EKS (AWS), AKS (Azure), DigitalOcean, Linode

2. **kubectl** - Kubernetes command-line tool
   ```bash
   # Install kubectl: https://kubernetes.io/docs/tasks/tools/
   kubectl version --client
   ```

3. **Docker images pushed to a registry**:
   - Docker Hub, GitHub Container Registry (GHCR), Google Container Registry (GCR), ECR, etc.

---

## Step 1: Build & Push Docker Images

### Build Backend Image
```bash
cd backend
docker build -t your-registry/focuslearner-backend:latest .
docker push your-registry/focuslearner-backend:latest
```

### Build Frontend Image
```bash
cd frontend
docker build -t your-registry/focuslearner-frontend:latest .
docker push your-registry/focuslearner-frontend:latest
```

Replace `your-registry` with:
- Docker Hub: `docker.io/yourusername`
- GitHub: `ghcr.io/yourusername`
- Google Cloud: `gcr.io/your-project-id`
- AWS: `your-account-id.dkr.ecr.region.amazonaws.com`

---

## Step 2: Update the Manifest

Edit `k8s-manifest.yaml`:

### Replace Image Names (2 places)
```yaml
# Line ~240 (Backend Deployment)
image: your-registry/focuslearner-backend:latest

# Line ~370 (Frontend Deployment)
image: your-registry/focuslearner-frontend:latest
```

### Update Secrets (Line ~60-75)
Replace placeholder values with your actual credentials:

```yaml
stringData:
  POSTGRES_PASSWORD: "YourStrongPassword123!"
  SECRET_KEY: "<run: python -c 'import secrets; print(secrets.token_hex(32))'>'"
  JWT_SECRET_KEY: "<run: python -c 'import secrets; print(secrets.token_hex(32))'>'"
  GEMINI_API_KEY: "your-actual-gemini-key"
  YOUTUBE_API_KEY: "your-actual-youtube-key"
  GOOGLE_SEARCH_API_KEY: "your-actual-google-search-key"
  GOOGLE_CLIENT_ID: "your-actual-client-id"
  GOOGLE_CLIENT_SECRET: "your-actual-client-secret"
  PINECONE_API_KEY: "your-actual-pinecone-key"
```

### Update Ingress Domain (Line ~410, optional)
```yaml
- host: "focuslearner.example.com"  # Change to your domain
```

### Update Storage Class (optional, Line ~32 & ~41)
If your cluster uses a specific storage class:
```yaml
storageClassName: "standard"  # or "gp2" (AWS), "fast" (GKE), etc.
```

---

## Step 3: Deploy to Kubernetes

### Apply the Manifest
```bash
# Deploy all resources (namespace, secrets, configmap, deployments, services)
kubectl apply -f k8s-manifest.yaml

# Verify creation
kubectl get all -n focuslearner
```

### Check Pod Status
```bash
# Watch pods start up
kubectl get pods -n focuslearner --watch

# Example output (wait for all to be Running/Ready):
NAME                        READY   STATUS    RESTARTS   AGE
postgres-7d5f8c6b9c-xk2w9   1/1     Running   0          2m
backend-5b7f9e3a2c-gqx1j    1/1     Running   0          1m
backend-5b7f9e3a2c-mzpqr    1/1     Running   0          1m
frontend-3c8a5d2f1b-nqjkl   1/1     Running   0          1m
frontend-3c8a5d2f1b-xyzwq   1/1     Running   0          1m
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/backend -n focuslearner --all-containers=true

# Frontend logs
kubectl logs -f deployment/frontend -n focuslearner

# PostgreSQL logs
kubectl logs -f deployment/postgres -n focuslearner
```

### Check Service Status
```bash
kubectl get svc -n focuslearner

# Example output:
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP    PORT(S)        AGE
postgres   ClusterIP      10.0.1.234      <none>         5432/TCP       3m
backend    ClusterIP      10.0.1.235      <none>         5000/TCP       3m
frontend   LoadBalancer   10.0.1.236      35.192.1.100   80:31234/TCP   3m
```

---

## Step 4: Initialize Database (First Time Only)

Once all pods are running:

```bash
# Port-forward backend to your machine
kubectl port-forward svc/backend 5000:5000 -n focuslearner &

# In another terminal, initialize the database:
curl -X POST http://localhost:5000/api/db/init

# Or from inside the container:
kubectl exec -it deployment/backend -n focuslearner -- \
  python -c "from models import db; from app import app; \
  app.app_context().push(); db.create_all()"

# Optional: seed sample data
kubectl exec -it deployment/backend -n focuslearner -- \
  python seed_data.py
```

---

## Step 5: Access Your Application

### Get External IP/URL

**Using LoadBalancer (frontend service):**
```bash
kubectl get svc frontend -n focuslearner

# Wait for EXTERNAL-IP to show (may take 1-2 minutes on cloud platforms)
# Then visit: http://<EXTERNAL-IP>
```

**Using Port-Forward (for testing):**
```bash
# Forward frontend to localhost:8080
kubectl port-forward svc/frontend 8080:80 -n focuslearner

# Visit: http://localhost:8080
```

**Using Ingress (if configured):**
- Point your domain DNS to the Ingress IP
- Visit: https://focuslearner.example.com

---

## Step 6: Verify Health & Persistence

### Check API Health
```bash
# From outside the cluster (via LoadBalancer or port-forward)
curl http://<EXTERNAL-IP>/api/health

# Response should be:
# {"database": "connected", "message": "FocusLearner Pro API is running", "status": "healthy", "version": "1.0.0"}
```

### Verify Persistent Storage
```bash
# Check PVCs
kubectl get pvc -n focuslearner

# Check PV usage
kubectl exec -it deployment/postgres -n focuslearner -- \
  df -h /var/lib/postgresql/data
```

### Test Data Persistence
```bash
# Delete a pod to test if data survives
kubectl delete pod -l app=postgres -n focuslearner

# Kubernetes will automatically restart it with the same data
kubectl get pods -n focuslearner --watch
```

---

## Step 7: Scaling & Auto-Scaling

### Manual Scaling
```bash
# Scale backend to 3 replicas
kubectl scale deployment backend --replicas=3 -n focuslearner

# Scale frontend to 4 replicas
kubectl scale deployment frontend --replicas=4 -n focuslearner
```

### Auto-Scaling (already configured in manifest)
The manifest includes HPA that automatically scales based on CPU usage:
- Backend: scales between 2-5 replicas (70% CPU threshold)
- Frontend: scales between 2-5 replicas (80% CPU threshold)

Check HPA status:
```bash
kubectl get hpa -n focuslearner
kubectl describe hpa backend-hpa -n focuslearner
```

---

## Step 8: Monitoring & Debugging

### Check Events
```bash
kubectl describe node
kubectl get events -n focuslearner --sort-by='.lastTimestamp'
```

### Debug Pod Issues
```bash
# Get detailed pod info
kubectl describe pod <pod-name> -n focuslearner

# SSH into a running pod
kubectl exec -it <pod-name> -n focuslearner -- /bin/bash

# View resource usage
kubectl top nodes
kubectl top pods -n focuslearner
```

### View Secrets
```bash
# List secrets
kubectl get secrets -n focuslearner

# View secret value (base64 decoded)
kubectl get secret focuslearner-secrets -n focuslearner -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d
```

---

## Step 9: Updates & Redeployment

### Update Image
```bash
# Rebuild and push new image
docker build -t your-registry/focuslearner-backend:v1.1 .
docker push your-registry/focuslearner-backend:v1.1

# Update deployment to use new image
kubectl set image deployment/backend \
  backend=your-registry/focuslearner-backend:v1.1 \
  -n focuslearner

# Check rollout status
kubectl rollout status deployment/backend -n focuslearner
```

### Update Configuration (without redeploying)
```bash
# Edit ConfigMap
kubectl edit configmap focuslearner-config -n focuslearner

# Edit Secrets
kubectl edit secret focuslearner-secrets -n focuslearner

# Pods will pick up changes on next restart (can force with):
kubectl rollout restart deployment/backend -n focuslearner
```

---

## Step 10: Cleanup

### Delete Everything
```bash
# Delete entire namespace (removes all resources)
kubectl delete namespace focuslearner

# Or just delete specific resources:
kubectl delete -f k8s-manifest.yaml
```

---

## Cloud-Specific Setup

### GKE (Google Kubernetes Engine)
```bash
# Create cluster
gcloud container clusters create focuslearner --zone us-central1-a

# Get credentials
gcloud container clusters get-credentials focuslearner --zone us-central1-a

# Deploy
kubectl apply -f k8s-manifest.yaml
```

### EKS (AWS)
```bash
# Create cluster (requires AWS CLI and eksctl)
eksctl create cluster --name focuslearner --region us-east-1

# Deploy
kubectl apply -f k8s-manifest.yaml
```

### DigitalOcean Kubernetes (DOKS)
```bash
# Create via web console or CLI
doctl kubernetes cluster create focuslearner

# Get kubeconfig
doctl kubernetes cluster kubeconfig save focuslearner

# Deploy
kubectl apply -f k8s-manifest.yaml
```

---

## Troubleshooting

### Pods stuck in Pending
```bash
kubectl describe pod <pod-name> -n focuslearner
# Usually: insufficient resources, storage not available, image pull issues
```

### Backend can't connect to PostgreSQL
```bash
# Check postgres is running
kubectl logs deployment/postgres -n focuslearner

# Verify DNS within container
kubectl exec -it deployment/backend -n focuslearner -- nslookup postgres

# Verify connection
kubectl exec -it deployment/backend -n focuslearner -- \
  python -c "import psycopg2; psycopg2.connect('postgresql://focususer:password@postgres:5432/focuslearner')"
```

### Frontend shows "Cannot reach API"
```bash
# Verify backend service
kubectl get svc backend -n focuslearner

# Check if nginx is proxying correctly
kubectl exec -it deployment/frontend -n focuslearner -- \
  curl http://backend:5000/api/health
```

### Storage Issues
```bash
# Check PVC status
kubectl describe pvc postgres-pvc -n focuslearner

# Check available storage
kubectl get pv
```

---

## Next Steps

1. **Enable HTTPS with cert-manager** (for production)
2. **Set up monitoring** (Prometheus + Grafana)
3. **Configure backups** (Velero for backup/restore)
4. **Set up CI/CD** (GitHub Actions, GitLab CI to auto-deploy on push)
5. **Add health checks & alerts** (email/Slack on failures)

---

## Resources

- Kubernetes Docs: https://kubernetes.io/docs/
- kubectl Cheat Sheet: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- Best Practices: https://kubernetes.io/docs/concepts/configuration/overview/
