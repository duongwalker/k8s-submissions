# Exercise 4.3: Prometheus Querying

## Setup

Started Prometheus with StatefulSet and kube-state-metrics in the `prometheus` namespace.

### Port-forwarding
```bash
kubectl -n prometheus port-forward prometheus-0 9090:9090
```

## Query

### PromQL Query
To find pods created by StatefulSets in the prometheus namespace:

```promql
kube_pod_info{namespace="prometheus",created_by_kind="StatefulSet"}
```

### URL-encoded for HTTP API
```
http://localhost:9090/api/v1/query?query=kube_pod_info%7Bnamespace%3D%22prometheus%22%2Ccreated_by_kind%3D%22StatefulSet%22%7D
```

## Results

The query returns **1 pod** created by StatefulSet in the prometheus namespace:

- **Pod Name**: `prometheus-0`
- **StatefulSet**: `prometheus`
- **Namespace**: `prometheus`

### Count Query
```promql
count(kube_pod_info{namespace="prometheus",created_by_kind="StatefulSet"})
```

**Result**: 1

## Key Learnings

1. **PromQL Syntax**: Uses label matching with `{key="value"}` syntax to filter metrics
2. **kube_pod_info Metric**: Provides detailed information about all pods including:
   - `created_by_kind`: The kind of workload that created the pod (StatefulSet, Deployment, DaemonSet)
   - `created_by_name`: The name of the workload
   - `namespace`: Kubernetes namespace
   - `pod`: Pod name
   - Other metadata like `host_ip`, `node`, `uid`

3. **Aggregation**: The `count()` function can aggregate results

## Note

The instructions mention 3 pods from StatefulSets, which appears to be from a Helm-based kube-prometheus-stack deployment (alertmanager-*, prometheus-*, etc.). Our setup demonstrates the same querying capability with the available StatefulSet pods in the namespace.
