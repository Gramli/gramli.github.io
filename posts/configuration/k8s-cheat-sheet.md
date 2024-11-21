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
To be able to work, Virtual Service has tu be in same namespace as gateway or you have to specify namespace of gateway like this:

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