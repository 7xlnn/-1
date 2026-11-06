"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissions = exports.healthCheck = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.healthCheck = (0, pg_core_1.pgTable)("health_check", {
    id: (0, pg_core_1.serial)().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
exports.submissions = (0, pg_core_1.pgTable)("submissions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    student_name: (0, pg_core_1.varchar)("student_name", { length: 64 }).notNull(),
    student_id: (0, pg_core_1.varchar)("student_id", { length: 128 }).notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 32 }).notNull(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    group: (0, pg_core_1.varchar)("group", { length: 128 }),
    sub: (0, pg_core_1.varchar)("sub", { length: 128 }),
    content: (0, pg_core_1.jsonb)("content").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 16 }).notNull().default("pending"),
    score: (0, pg_core_1.integer)("score"),
    comment: (0, pg_core_1.varchar)("comment", { length: 2000 }),
    graded_at: (0, pg_core_1.timestamp)("graded_at", { withTimezone: true, mode: "string" }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("submissions_student_idx").on(table.student_id),
    (0, pg_core_1.index)("submissions_status_idx").on(table.status),
    (0, pg_core_1.index)("submissions_created_idx").on(table.created_at),
]);
//# sourceMappingURL=schema.js.map