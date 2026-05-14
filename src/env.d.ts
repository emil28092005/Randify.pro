/// <reference path="../.astro/types.d.ts" />

interface User {
  id: number;
  vkId: string | null;
  yandexId: string | null;
  email: string | null;
  name: string;
  avatar: string | null;
  createdAt: Date;
}

declare namespace App {
  interface Locals {
    user: User | null;
  }
}
