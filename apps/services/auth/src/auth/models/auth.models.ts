import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class AuthModels {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.auth_users.findUnique({ where: { id } });
  }

  findBySupabaseId(supabaseId: string) {
    return this.prisma.auth_users.findUnique({
      where: { supabase_id: supabaseId },
    });
  }

  upsert(data: {
    supabaseId: string;
    email: string;
    displayName?: string | null;
  }) {
    return this.prisma.auth_users.upsert({
      where: { supabase_id: data.supabaseId },
      create: {
        supabase_id: data.supabaseId,
        email: data.email,
        display_name: data.displayName ?? null,
      },
      update: {
        email: data.email,
        display_name: data.displayName ?? null,
      },
    });
  }
}
