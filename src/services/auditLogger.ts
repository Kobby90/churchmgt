import { db } from '@/lib/db';

export interface AuditLogEntry {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  ip_address?: string;
}

export const auditLogger = {
  async log(entry: AuditLogEntry) {
    try {
      await db.query(
        `INSERT INTO audit_logs 
         (user_id, action, entity_type, entity_id, changes, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          entry.user_id,
          entry.action,
          entry.entity_type,
          entry.entity_id,
          JSON.stringify(entry.changes),
          entry.ip_address
        ]
      );
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  },

  async getAuditLogs(filters: {
    user_id?: string;
    entity_type?: string;
    entity_id?: string;
    from_date?: Date;
    to_date?: Date;
  }) {
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (filters.user_id) {
      conditions.push(`user_id = $${paramCount}`);
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.entity_type) {
      conditions.push(`entity_type = $${paramCount}`);
      params.push(filters.entity_type);
      paramCount++;
    }

    if (filters.entity_id) {
      conditions.push(`entity_id = $${paramCount}`);
      params.push(filters.entity_id);
      paramCount++;
    }

    if (filters.from_date) {
      conditions.push(`created_at >= $${paramCount}`);
      params.push(filters.from_date);
      paramCount++;
    }

    if (filters.to_date) {
      conditions.push(`created_at <= $${paramCount}`);
      params.push(filters.to_date);
      paramCount++;
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const { rows } = await db.query(
      `SELECT * FROM audit_logs 
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    return rows;
  }
}; 