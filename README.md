# CloudCart

CloudCart es un proyecto de portafolio que demuestra una arquitectura
profesional de nivel producción: **monólito modular** con event-driven (Kafka),
que crecerá hacia microservicios, GraphQL BFF, Kubernetes, observabilidad y CI/CD.

## Stack

### Implementado ✔

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, next-auth (Keycloak OIDC)
- **Backend:** NestJS + Fastify (BFF REST, Swagger en `/api/docs`)
- **Databases:** PostgreSQL (transaccional — usuarios, órdenes), MongoDB (catálogo), Redis (carrito, eventos)
- **Events:** Apache Kafka (KRaft, sin Zookeeper) + Kafka UI
- **Auth:** Keycloak 25 (OIDC, realm con roles admin/customer)
- **Containerización:** Docker + Docker Compose + k3d (Kubernetes local)

### Roadmap (por implementar)

- **API Gateway:** Kong
- **IaC:** Terraform + Helm
- **CI/CD:** GitHub Actions
- **Observabilidad:** Prometheus, Grafana, Loki, Tempo, OpenTelemetry
- **Load Testing:** k6

## Estado

En desarrollo — Fase 4 completada (carrito, órdenes, stock atómico y eventos Kafka).

## Quick Start

Requisitos: Docker, Node 20+, pnpm, fnm.

```bash
# 1. Levantar infraestructura (PostgreSQL, MongoDB, Redis, Keycloak, Kafka, Kafka UI)
docker compose -f infra/compose/docker-compose.base.yml up -d

# 2. Backend (servicio principal NestJS en :3001)
cd services/main
pnpm install
pnpm run start:dev

# 3. Frontend (Next.js en :3000)
cd apps/web
pnpm install
pnpm dev
```

**URLs útiles**

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API + Swagger | http://localhost:3001/api/docs |
| Keycloak admin | http://localhost:8180/admin (`admin` / `admin`) |
| Kafka UI | http://localhost:8280 |

**Usuarios de prueba (Keycloak)**

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin-user` | `admin123` | admin |
| `customer-user` | `customer123` | customer |

## Documentación

- [ADRs](docs/adr/) — decisiones de arquitectura
- [Diagramas C4](docs/architecture/) _(próximamente)_

## Licencia

MIT
