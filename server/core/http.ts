import { defineHandler, HTTPError } from "nitro";
import { getQuery, getRequestPath, type H3Event } from "nitro/h3";
import { DEFAULT_PAGE_SIZE, HTTP_STATUS, MAX_PAGE_SIZE } from "@/constants";

// Nitro 3 no auto-importa utilidades h3: todo import es explícito.
type ApiEvent = H3Event;

/** Error esperado del dominio. Cualquier otro error es un 500 sin detalle. */
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (what: string) => new ApiError(HTTP_STATUS.NOT_FOUND, `${what} no encontrado`);
export const badRequest = (msg: string) => new ApiError(HTTP_STATUS.BAD_REQUEST, msg);

/**
 * Capa por la que pasa toda petición: ejecuta el handler y normaliza el error.
 * `ApiError` sale con su status y mensaje; todo lo demás es 500 y se registra
 * — nunca se filtra un stack ni un mensaje de Postgres al cliente.
 */
export function defineApiHandler<T>(handler: (event: ApiEvent) => T | Promise<T>) {
  return defineHandler(async (event) => {
    try {
      return await handler(event);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new HTTPError({ status: error.statusCode, message: error.message });
      }
      console.error("[unhandled]", getRequestPath(event), error);
      throw new HTTPError({ status: HTTP_STATUS.INTERNAL_ERROR, message: "Error interno" });
    }
  });
}

/** Paginación normalizada desde el query string: `?page=0&pageSize=20`. */
export function readPagination(event: ApiEvent) {
  const q = getQuery(event);
  const page = Math.max(0, Number(q.page) || 0);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(q.pageSize) || DEFAULT_PAGE_SIZE));
  return { page, pageSize, offset: page * pageSize };
}
