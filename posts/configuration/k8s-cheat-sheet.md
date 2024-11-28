*Posted 11/21/2024*
# Kubernetes, Istio, Argo cheat sheet

## Kubernetes - DNS for Services and Pods inside cluster
### Service
```
my-svc.my-namespace.svc.cluster.local
```
### Pod
```
my-svc.my-namespace.pod.cluster.local
```

[Documentation](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)

## Istio - Gateway and Virtual Service with different namespace
To function properly, the Virtual Service must either be in the same namespace as the gateway, or you need to specify the gateway's namespace like this:

### VirtualService
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: some-name
  namespace: some-namespace
spec:
  gateways:
  - some-gateway-namespace/my-gateway
```
### Gateway
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: my-gateway
  namespace: some-gateway-namespace
```

[Documentation](https://istio.io/latest/docs/reference/config/networking/gateway/)

## ArgoCD Application YAML

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app                         # Unique name for your ArgoCD application
  namespace: argocd                    # The namespace where ArgoCD is deployed (usually argocd).
spec:
  project: default                     # ArgoCD project (default or custom)
  source:
    repoURL: https://github.com/org/repo.git   # The Git repository URL (or Helm chart repository).
    targetRevision: HEAD               # Branch, tag, or commit (e.g., main, v1.0.0)
    path: manifests                    # Path to the directory in the repository containing the Kubernetes manifests.
  destination:
    server: https://kubernetes.default.svc  # Kubernetes cluster API server URL
    namespace: my-namespace            # Kubernetes namespace where the application will be deployed.
  syncPolicy:                          # (Optional) Synchronization settings
    automated:                         # Enable auto-sync
      prune: true                      # Remove resources not in Git
      selfHeal: true                   # Automatically correct drift
    retry:                             # Retry policy for failed syncs
      backoff:
        duration: 5s                   # Initial retry duration
        factor: 2                      # Multiplicative increase
        maxDuration: 3m                # Maximum retry duration
```

## Helm Chart.yaml
```yaml
apiVersion: v2                      # Helm chart API version (v2 for Helm 3) (required)
name: my-app                        # Name of the chart (required)
description: A Helm chart for myapp # Brief description of the chart
type: application                   # Type: 'application' or 'library' (default is application)
version: 1.0.0                      # A SemVer 2 version (required)
appVersion: 1.0.0                   # The version of the app that this contains (optional). Needn't be SemVer. Quotes recommended.
keywords:                           # Optional: keywords to categorize the chart
  - example
  - helm
  - app
home: https://example.com           # Optional: URL to the project's homepage
sources:                            # Optional: URLs for source code
  - https://github.com/org/repo
maintainers:                        # Optional: Chart maintainers
  - name: John Doe
    email: john.doe@example.com
    url: https://example.com/johndoe
icon: https://example.com/icon.png  # Optional: URL to an icon image (used in Helm UIs)
dependencies:                       # Optional: List of chart dependencies
  - name: nginx
    version: 1.0.0
    repository: https://charts.bitnami.com/bitnami
annotations:                        # Optional: Metadata annotations
  category: web
```