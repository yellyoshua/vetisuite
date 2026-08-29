import { badRequest, notFound } from "@/core/http";
import * as repository from "./repository";

/** Reglas de negocio de clientes. Las rutas no hablan con el repositorio. */

export function listClients(opts: { search?: string; limit: number; offset: number }) {
  return repository.findMany(opts);
}

export async function getClient(id: string) {
  const client = await repository.findById(id);
  if (!client) throw notFound("Cliente");
  return client;
}

export function createClient(input: { name?: unknown; phone?: unknown; email?: unknown }) {
  const name = String(input.name ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  if (name.length < 2) throw badRequest("El nombre del cliente es obligatorio.");
  if (phone.replace(/\D/g, "").length < 7) throw badRequest("El teléfono no es válido.");
  const email = input.email ? String(input.email).trim() : null;
  return repository.insert({ name, phone, email });
}
