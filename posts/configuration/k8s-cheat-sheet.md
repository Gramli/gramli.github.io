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