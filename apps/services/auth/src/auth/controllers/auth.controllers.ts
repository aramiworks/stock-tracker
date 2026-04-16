import { Injectable } from "@nestjs/common";
import { AuthModels } from "../models/index.js";

const mapUser = (user: {
  id: string;
  supabase_id: string;
  email: string;
  display_name: string | null;
  created_at: Date;
  updated_at: Date;
}) => ({
  id: user.id,
  supabaseId: user.supabase_id,
  email: user.email,
  displayName: user.display_name,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

@Injectable()
export class AuthControllers {
  constructor(private readonly models: AuthModels) {}

  async me(userId?: string) {
    if (!userId) return null;

    const user = await this.models.findBySupabaseId(userId);
    if (!user) return null;

    return mapUser(user);
  }

  async upsertFromSupabase(input: {
    supabaseId: string;
    email: string;
    displayName?: string | null;
  }) {
    const user = await this.models.upsert(input);
    return mapUser(user);
  }
}
