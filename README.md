# CloudCart

CloudCart es un proyecto de portafolio que demuestra una arquitectura
profesional de nivel producción: microservicios, event-driven con Kafka,
GraphQL BFF, Kubernetes, observabilidad completa, y CI/CD.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** NestJS + Fastify + Apollo GraphQL (BFF)
- **Databases:** PostgreSQL (transaccional), MongoDB (catálogo), Redis (carrito)
- **Events:** Apache Kafka (KRaft mode) + Debezium CDC
- **API Gateway:** Kong
- **Auth:** Keycloak
- **Containerización:** Docker + Docker Compose + k3d (Kubernetes local)
- **IaC:** Terraform + Helm
- **CI/CD:** GitHub Actions
- **Observabilidad:** Prometheus, Grafana, Loki, Tempo, OpenTelemetry
- **Load Testing:** k6

## Estado

En desarrollo

## Quick Start

_(Próximamente)_

## Documentación

- [Diagramas C4](docs/architecture/) _(próximamente)_
- [ADRs](docs/adr/) _(próximamente)_

## Licencia

MIT