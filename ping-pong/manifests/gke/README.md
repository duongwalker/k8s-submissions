# Exercise 3.1: Deploy Ping-Pong to GKE with LoadBalancer Service

This directory contains the manifests for deploying the ping-pong application to Google Kubernetes Engine (GKE).

## Key Differences from Local Deployment:

1. **LoadBalancer Service**: Uses `type: LoadBalancer` to expose the service with a public IP
2. **PostgreSQL with subPath**: Uses `subPath: postgres` to avoid the "directory not empty" error
3. **Larger Storage**: 10Gi storage for persistent volume claims
4. **Image Pull Policy**: Set to `Always` to ensure fresh images

## Deployment Steps:

1. Ensure your GKE cluster is running:
```bash
gcloud container clusters get-credentials k8s-submissions-cluster --zone europe-north1-b
```

2. Create the namespace:
```bash
kubectl apply -f namespace.yaml
```

3. Deploy PostgreSQL:
```bash
kubectl apply -f postgres-configmap.yaml
kubectl apply -f postgres-service.yaml
kubectl apply -f postgres-statefulset.yaml
```

4. Wait for PostgreSQL to be ready:
```bash
kubectl rollout status statefulset/postgres -n exercises
```

5. Deploy ping-pong application:
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service-loadbalancer.yaml
```

6. Get the LoadBalancer external IP:
```bash
kubectl get service ping-pong-loadbalancer -n exercises
```

The external IP will be available after a few minutes. Use it to access the ping-pong service.

## Files:

- `namespace.yaml` - Exercises namespace
- `postgres-configmap.yaml` - PostgreSQL initialization script
- `postgres-service.yaml` - Headless service for PostgreSQL StatefulSet
- `postgres-statefulset.yaml` - PostgreSQL database with persistent storage and subPath
- `deployment.yaml` - Ping-pong application deployment
- `service-loadbalancer.yaml` - LoadBalancer service exposing ping-pong publicly
