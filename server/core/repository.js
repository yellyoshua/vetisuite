import _ from 'underscore';
import {db} from '@vetisuite/database/db.js';
import logger from '@/utils/logger.js';
import {and, asc, count, desc, eq, getTableColumns, ilike, isNull, or} from '@vetisuite/database/orm.js';

/** @type {import('./repository.js').Repository} */
export default function repository (table, config = {}) {
  const relations = config.relations || {};

  return {
    async find (filters = {}, options = {}) {
      try {
        const rows = await buildSelect(table, relations, filters, options);

        return withoutPasswords(rows);
      } catch (error) {
        throw readError('find', error);
      }
    },

    async findOne (filters = {}, options = {}) {
      try {
        const [row] = await buildSelect(table, relations, filters, options).limit(1);

        return withoutPasswords(row || null);
      } catch (error) {
        throw readError('findOne', error);
      }
    },

    async count (filters = {}, options = {}) {
      try {
        const instance = db.select({value: count()}).from(table);
        const [row] = await applyFilters(instance, table, filters, {search: options.search, searchFields: options.searchFields});

        return row.value;
      } catch (error) {
        throw readError('count', error);
      }
    }
  };
}

function buildSelect (table, relations, filters, options) {
  const joins = joinedRelations(table, relations, options.join);
  const joinedColumns = Object.fromEntries(joins.map(({key, columns}) => [key, columns]));
  const baseColumns = _(getTableColumns(table)).omit(_(joinedColumns).keys());
  const selection = {...pickColumns(baseColumns, options.select), ...joinedColumns};
  const instance = joins.reduce(
    (query, {key, relation}) => query.leftJoin(relation, eq(table[key], relation.id)),
    db.select(selection).from(table)
  );

  return applyPagination(applyFilters(instance, table, filters, options), table, options);
}

function applyFilters (instance, table, filters, options) {
  const conditions = Object.entries(filters)
  .filter(([key]) => table[key])
  .map(([key, value]) => (value === null ? isNull(table[key]) : eq(table[key], value)));

  const search = searchCondition(table, options);

  if (search) {
    conditions.push(search);
  }

  if (conditions.length === 0) {
    return instance;
  }

  return instance.where(and(...conditions));
}

function searchCondition (table, options) {
  if (!options.search || !options.searchFields?.length) {
    return null;
  }

  const tokens = _(_(options.search.trim().toLowerCase().slice(0, 100).split(/\s+/)).compact()).first(5);

  const tokenConditions = _(tokens.map((token) => {
    const escaped = token.replace(/[%_\\]/g, '\\$&');
    const fields = options.searchFields.filter((field) => table[field]);

    if (fields.length === 0) {
      return null;
    }

    return or(...fields.map((field) => ilike(table[field], `%${escaped}%`)));
  })).compact();

  if (tokenConditions.length === 0) {
    return null;
  }

  return and(...tokenConditions);
}

function applyPagination (instance, table, options) {
  const field = Object.keys(options.orderBy || {})[0];
  const direction = {asc, desc}[options.orderBy?.[field]];
  const ordered = table[field] && direction ? instance.orderBy(direction(table[field])) : instance;
  const limit = options.limit ?? 10;

  if (limit < 0) {
    return ordered;
  }

  const limited = ordered.limit(limit);

  if (options.page && options.page > 1) {
    return limited.offset((options.page - 1) * limit);
  }

  return limited;
}

function joinedRelations (table, relations, join = {}) {
  return Object.entries(join)
  .filter(([key]) => relations[key] && table[key])
  .map(([key, request]) => ({key, relation: relations[key], columns: pickColumns(getTableColumns(relations[key]), request)}))
  .filter(({columns}) => !_(columns).isEmpty());
}

function pickColumns (columns, request = true) {
  const readable = _(columns).omit('password');

  if (request === true) {
    return readable;
  }

  if (request === false) {
    return {};
  }

  if (typeof request === 'string') {
    const names = _(request.split(' ')).compact();

    return _(readable).pick(names);
  }

  if (typeof request === 'object') {
    const names = _(request).keys().filter((name) => request[name] === true);

    return _(readable).pick(names);
  }

  throw new Error(`[repository.pickColumns]: selección de columnas no soportada: ${request}`);
}

function readError (method, error) {
  logger.error(`[repository.${method}]: Error`, error);

  return {error: 'No se pudo consultar la información', status: 500};
}

function withoutPasswords (data) {
  if (Array.isArray(data)) {
    return data.map(withoutPasswords);
  }

  if (!isPlainObject(data)) {
    return data;
  }

  const cleaned = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, withoutPasswords(value)]));

  delete cleaned.password;

  return cleaned;
}

function isPlainObject (value) {
  if (typeof value !== 'object' || value === null || value instanceof Date) {
    return false;
  }

  const prototype = Reflect.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}
