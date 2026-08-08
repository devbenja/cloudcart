# ADR-008: Apache Kafka como bus de eventos en producción

- **Estado:** Aceptado
- **Fecha:** 2026-08-08
- **Área:** Arquitectura de eventos

---

## Contexto

CloudCart es un monólito modular que crecerá hacia microservicios. Al confirmar
un pedido (`POST /api/v1/orders`) hoy el sistema sólo persiste la orden y
descuenta stock; no existe una forma de que **otros componentes** se enteren y
reaccionen (notificaciones, auditoría, analytics, inventario, etc.).

Necesitamos un mecanismo de **comunicación asíncrona entre componentes** que:

- Desacople al que produce el evento del que lo consume (el producer no debe
  conocer a los consumidores).
- Permita que múltiples consumidores reaccionen a un mismo evento sin acoplarse
  entre sí.
- Sea observable y auditable (quién publicó qué, cuándo).
- Escale cuando el monólito se divida en servicios.

Además, el README del proyecto ya declara como stack objetivo
**"Apache Kafka (KRaft mode) + Debezium CDC"**.

## Decisión

Adoptamos **Apache Kafka** como bus de eventos de dominio.

### Implementación actual (desarrollo local)

- **Kafka 3.7 en modo KRaft** (un solo nodo, **sin Zookeeper**) en
  `infra/compose/docker-compose.base.yml`, puerto `9092`.
- **Kafka UI** (`provectuslabs/kafka-ui`) en `http://localhost:8280` para
  visualizar topics y mensajes en vivo.
- **Producer** (`KafkaService`): módulo global `infrastructure/kafka` que envía
  eventos a topics. Conecta en el arranque; si Kafka está caído, no derriba la
  app y reintenta por mensaje.
- **Consumer** (`KafkaConsumer`): grupo `cloudcart-main-orders` suscrito a
  `order.events`. Hoy procesa `order.created` simulando una notificación y
  dejando un registro en Redis (`events:order.created:<id>`) para auditoría.
- **Contrato de evento** (envelope):
  ```json
  {
    "type": "order.created",
    "occurredAt": "2026-08-08T07:06:05.442Z",
    "data": { "id": "...", "userId": "...", "status": "pending", "total": "34.50", "currency": "USD", "items": [...] }
  }
  ```
  Se usa **un topic** (`order.events`) con el tipo dentro del mensaje y la clave
  = `order.id` (preserva el orden por entidad).

### Tolerancia a fallos

- El producer no crashea la app si Kafka no responde: loguea y continúa (el
  checkout no debe depender de la disponibilidad del bus para completarse).
- El consumer registra `processedAt` en Redis, lo que permite **verificar
  end-to-end** que el evento fluyó: producer → topic → consumer.

## Consecuencias

### Positivas

- **Desacoplamiento real**: `OrdersService` publica `order.created` sin saber
  quién lo escucha. Al dividir el monólito, el consumer migra a un servicio
  aparte (ej. `notifications`) **sin tocar el producer**.
- **Múltiples consumidores**: se pueden sumar consumidores nuevos (stock,
  analytics, email) suscribiéndose al mismo topic, sin cambios en el productor.
- **Observabilidad**: Kafka UI permite inspeccionar topics y mensajes; los
  offsets y el registro en Redis dan trazabilidad.
- **Es el estándar de la industria** para event-driven; demostrable en un
  portafolio.

### Negativas / costos

- **Complejidad operativa**: Kafka es un sistema distribuido; operarlo bien
  (particiones, replicación, rebalanceo) requiere conocimiento.
- **Latencia** en el pipeline completo (producer → broker → consumer) frente a
  llamadas síncronas, aunque para eventos de dominio es irrelevante.
- **Consistencia eventual**: un consumidor puede procesar el evento después de
  que el usuario recibió el 201 del checkout.

## Alternativas consideradas

| Opción | Por qué se descartó |
|---|---|
| **RabbitMQ** | Buen AMQP, pero no retiene el log de eventos con offsets por consumidor ni permite re-procesar históricos tan naturalmente; para event-sourcing/auditoría Kafka gana. |
| **Redis Pub/Sub** | Simple, pero **volátil**: si no hay suscriptor, el mensaje se pierde. No sirve para eventos de dominio que deben quedar registrados. |
| **AWS SQS / SNS** | Excelente opción **si el despliegue final es AWS** (ver Futuro). Requiere estar en AWS desde ya; hoy el stack local es Docker. |
| **Sin bus (llamadas directas)** | El estado actual. No escala al dividir servicios y acopla los componentes. |

## Futuro (Fase de producción)

Esta ADR decide **Kafka como tecnología**, pero el **operador** dependerá del
target de despliegue (se documentará en su ADR propio):

- **Si el destino es AWS**: usar **Amazon MSK** (Kafka administrado) o
  **EventBridge/SQS** si el volumen no justifica Kafka.
- **Si es self-managed (k8s)**: Kafka KRaft multi-nodo vía **Strimzi**
  (operator de Kubernetes) con al menos 3 brokers y replicación `>= 2`.
- **Debezium CDC**: evaluar para propagar cambios de PostgreSQL/MongoDB hacia
  Kafka sin escribir en el código de la aplicación (patrón que complementa los
  eventos de dominio explícitos).
