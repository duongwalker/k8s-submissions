# KubernetesSubmissions

## Exercises

### Chapter 2

- [1.1](https://github.com/duongwalker/k8s-submissions/tree/main/log-output)
- [1.2](https://github.com/duongwalker/k8s-submissions/tree/1.2)  
- [1.3](https://github.com/duongwalker/k8s-submissions/tree/1.3)
- [1.4](https://github.com/duongwalker/k8s-submissions/tree/1.4)
- [1.5](https://github.com/duongwalker/k8s-submissions/tree/1.5)
- [1.6](https://github.com/duongwalker/k8s-submissions/tree/1.6)
- [1.7](https://github.com/duongwalker/k8s-submissions/tree/1.7)
- [1.8](https://github.com/duongwalker/k8s-submissions/tree/1.8)
- [1.9](https://github.com/duongwalker/k8s-submissions/tree/1.9)
- [1.10](https://github.com/duongwalker/k8s-submissions/tree/1.10)
- [1.11](https://github.com/duongwalker/k8s-submissions/tree/1.11)
- [1.12](https://github.com/duongwalker/k8s-submissions/tree/1.12)
- [1.13](https://github.com/duongwalker/k8s-submissions/tree/1.13)

### Chapter 3

- [2.1](https://github.com/duongwalker/k8s-submissions/tree/2.1)
- [2.2](https://github.com/duongwalker/k8s-submissions/tree/2.2)
- [2.3](https://github.com/duongwalker/k8s-submissions/tree/2.3)
- [2.4](https://github.com/duongwalker/k8s-submissions/tree/2.4)
- [2.5](https://github.com/duongwalker/k8s-submissions/tree/2.5)
- [2.6](https://github.com/duongwalker/k8s-submissions/tree/2.6)
- [2.7](https://github.com/duongwalker/k8s-submissions/tree/2.7)
- [2.8](https://github.com/duongwalker/k8s-submissions/tree/2.8)
- [2.9](https://github.com/duongwalker/k8s-submissions/tree/2.9)
- [2.10](https://github.com/duongwalker/k8s-submissions/tree/2.10)

### Chapter 4

- [3.1](https://github.com/duongwalker/k8s-submissions/tree/3.1)
- [3.2](https://github.com/duongwalker/k8s-submissions/tree/3.2)
- [3.3](https://github.com/duongwalker/k8s-submissions/tree/3.3)
- [3.4](https://github.com/duongwalker/k8s-submissions/tree/3.4)
- [3.5](https://github.com/duongwalker/k8s-submissions/tree/3.5)
- [3.6](https://github.com/duongwalker/k8s-submissions/tree/3.6)
- [3.7](https://github.com/duongwalker/k8s-submissions/tree/3.7)
- [3.8](https://github.com/duongwalker/k8s-submissions/tree/3.8)
- [3.9](https://github.com/duongwalker/k8s-submissions/tree/3.9)
- [3.10](https://github.com/duongwalker/k8s-submissions/tree/3.10)
- [3.11](https://github.com/duongwalker/k8s-submissions/tree/3.11)
- [3.12](https://github.com/duongwalker/k8s-submissions/tree/3.12)

### Chapter 5

- [4.1](https://github.com/duongwalker/k8s-submissions/tree/4.1)

## 3.9 - DBaaS vs DIY Comparison

| Aspect | DBaaS | DIY (Kubernetes) |
|--------|-------|------------------|
| **Setup Time** | 15-30 min | 2-4 hours |
| **Monthly Cost** | $30-300+ | $30-40 (shared) |
| **Operational Effort** | Low | High |
| **Vendor Lock-in** | High | None |
| **Performance Control** | Limited | Full |
| **Backup** | Automated | Manual |

**Pros/Cons:**

**DBaaS:**
- ✅ Automated backups, patches, HA
- ❌ Vendor lock-in, less control, higher costs at scale

**DIY:**
- ✅ Cost-effective, full control, no lock-in
- ❌ Requires operational expertise, manual backups, 24/7 management needed

**Backup Comparison:**

| Method | DBaaS | DIY |
|--------|-------|-----|
| **Frequency** | Automatic (daily) | Manual (requires setup) |
| **Point-in-time Recovery** | Easy (UI click) | Complex (requires WAL archiving) |
| **Restore Time** | Minutes | Hours (manual validation needed) |
| **Ease** | Very easy | Moderate to hard |

**Conclusion:** Choose DBaaS for simplicity and reliability; choose DIY for cost optimization and control when Kubernetes expertise exists.


