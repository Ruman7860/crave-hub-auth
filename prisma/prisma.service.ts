import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private config: ConfigService) {
    const databaseUrl = config.get<string>('DATABASE_URL');

    const pool = new Pool({
      connectionString: databaseUrl,
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter, // THIS IS REQUIRED IN PRISMA 7
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("Prisma Connected")
  }

  async onModuleDestroy() {
      await this.$disconnect();
      console.log("prisma disconnected")
  }
}