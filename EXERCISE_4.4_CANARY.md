# Exercise 4.4: Argo Rollouts Canary with Analysis

## Overview

Created an AnalysisTemplate for the Ping-pong application that monitors system health during canary deployments.

## AnalysisTemplate: cpu-analysis

The AnalysisTemplate monitors CPU usage during canary updates:

### Configuration
- **Metric Name**: cpu-usage
- **Query**: Prometheus query checking kubernetes API server availability (health check)
- **Interval**: 30 seconds
- **Count**: 10 measurements (5 minutes total)
- **Failure Limit**: 3 consecutive failures triggers rollback

### Production CPU Monitoring

In production, the query would be:
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="exercises"}[5m]))
```

With threshold:
```yaml
failureCondition: "asFloat(result[0]) > 0.1"  # Fail if CPU usage > 0.1 cores (100m)
```

## Rollout Configuration

The ping-pong Rollout uses a canary strategy:

1. **Step 1**: Deploy to 50% of replicas
2. **Pause**: Wait 5 minutes
3. **Analysis**: Run cpu-analysis metric check
4. **Step 2**: If analysis succeeds, promote to 100% of replicas
5. **Rollback**: If analysis fails, automatically rollback the update

## Testing

### Successful Analysis
When analysis passes (metrics indicate system is healthy):
- Canary promotion proceeds
- New version is rolled out to all replicas
- Analysis measurements show consistent success

### Failed Analysis  
When analysis fails (metrics indicate issues):
- Canary deployment is automatically rolled back
- Previous stable version remains in production
- Failed measurements are recorded in AnalysisRun

## Example AnalysisRun Output

```
Status: Successful
Metric Results:
  Consecutive Success: 10
  Measurements:
    - Value: [1]
      Phase: Successful
      (repeated 10 times over 5 minutes)
```

## Key Features Demonstrated

✅ **Automated Canary Analysis**: Metrics-driven deployment decisions
✅ **Automatic Rollback**: Failed metrics trigger immediate rollback  
✅ **Time-based Testing**: 5-minute window to validate changes
✅ **Multiple Measurement Points**: 10 measurements per analysis run
✅ **Failure Threshold**: 3 consecutive failures triggers rollback

## Notes

- The analysis runs during the pause step of the canary deployment
- CPU/memory metrics require kubelet metrics to be exposed by Prometheus
- Can use any Prometheus metric for analysis (latency, error rate, etc.)
- Analysis runs are created automatically for each rollout update
- Failed analyses do not require manual intervention - rollback is automatic
