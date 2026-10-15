import { pgTable, serial, timestamp, varchar, jsonb, integer, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 学生作业提交（最小版本：无登录，学生以 student_name + 设备 id 标识）
// type: fragment（片段练习）/ conceptualization（概念化）/ session（完整咨询会谈）/ mood（情绪周记）
// status: pending（待批改）/ graded（已批改）
export const submissions = pgTable(
	"submissions",
	{
		id: serial("id").primaryKey(),
		student_name: varchar("student_name", { length: 64 }).notNull(),
		student_id: varchar("student_id", { length: 128 }).notNull(),
		type: varchar("type", { length: 32 }).notNull(),
		title: varchar("title", { length: 255 }).notNull(),
		group: varchar("group", { length: 128 }),
		sub: varchar("sub", { length: 128 }),
		content: jsonb("content").notNull(),
		status: varchar("status", { length: 16 }).notNull().default("pending"),
		score: integer("score"),
		comment: varchar("comment", { length: 2000 }),
		graded_at: timestamp("graded_at", { withTimezone: true, mode: "string" }),
		created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		index("submissions_student_idx").on(table.student_id),
		index("submissions_status_idx").on(table.status),
		index("submissions_created_idx").on(table.created_at),
	]
);
