// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const posts=sqliteTable("posts",{
 id:text("id").primaryKey(),title:text("title").notNull(),category:text("category").notNull(),content:text("content").notNull(),excerpt:text("excerpt").notNull(),date:text("date").notNull(),status:text("status").notNull(),attachmentKey:text("attachment_key"),attachmentName:text("attachment_name"),updatedAt:text("updated_at").notNull()
},t=>[index("idx_posts_status_date").on(t.status,t.date)]);
