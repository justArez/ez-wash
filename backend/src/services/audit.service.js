function createId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
export function logAudit(store, log) {
    const record = {
        id: createId(),
        timestamp: new Date().toISOString(),
        ...log,
    };
    store.auditLogs.push(record);
    return record;
}
