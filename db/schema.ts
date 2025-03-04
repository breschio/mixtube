import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const mixes = pgTable("mixes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  leftVideoId: text("left_video_id").notNull(),
  leftTitle: text("left_title"),
  leftChannel: text("left_channel"),
  rightVideoId: text("right_video_id").notNull(),
  rightTitle: text("right_title"),
  rightChannel: text("right_channel"),
  crossFaderValue: integer("cross_fader_value").notNull(),
  template: text("template").notNull(),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mixLikes = pgTable("mix_likes", {
  id: serial("id").primaryKey(),
  mixId: integer("mix_id").references(() => mixes.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const mixesRelations = relations(mixes, ({ one, many }) => ({
  user: one(users, {
    fields: [mixes.userId],
    references: [users.id],
  }),
  likes: many(mixLikes),
}));

export const mixLikesRelations = relations(mixLikes, ({ one }) => ({
  mix: one(mixes, {
    fields: [mixLikes.mixId],
    references: [mixes.id],
  }),
  user: one(users, {
    fields: [mixLikes.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertMixSchema = createInsertSchema(mixes);
export const selectMixSchema = createSelectSchema(mixes);
export const insertMixLikeSchema = createInsertSchema(mixLikes);
export const selectMixLikeSchema = createSelectSchema(mixLikes);

// Types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertMix = typeof mixes.$inferInsert;
export type SelectMix = typeof mixes.$inferSelect;
export type InsertMixLike = typeof mixLikes.$inferInsert;
export type SelectMixLike = typeof mixLikes.$inferSelect;