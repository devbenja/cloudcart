/** Nombres de topics y claves de eventos compartidos entre publisher y consumer. */
export const KAFKA_TOPICS = {
    ORDERS: 'order.events',
} as const;

export const KAFKA_EVENTS = {
    ORDER_CREATED: 'order.created',
    ORDER_STATUS_CHANGED: 'order.status.changed',
} as const;

export const KAFKA_CLIENT_ID = 'cloudcart-main';
export const KAFKA_CONSUMER_GROUP = 'cloudcart-main-orders';
