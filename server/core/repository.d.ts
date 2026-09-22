import type {PgTable} from '@vetisuite/database/pg-core.js';
import type {InferSelectModel} from '@vetisuite/database/orm.js';

export type ReadOptions = {
  select?: Record<string, true>;
  join?: Record<string, true | string>;
  limit?: number;
  page?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  search?: string;
  searchFields?: string[];
};

export type RepositoryConfig = {
  relations?: Record<string, PgTable>;
};

export type RepositoryInstance<T extends PgTable> = {
  find: (filters?: Partial<InferSelectModel<T>>, options?: ReadOptions) => Promise<Array<InferSelectModel<T>>>;
  findOne: (filters?: Partial<InferSelectModel<T>>, options?: ReadOptions) => Promise<InferSelectModel<T> | null>;
  count: (filters?: Partial<InferSelectModel<T>>, options?: ReadOptions) => Promise<number>;
};

export type Repository = <T extends PgTable>(table: T, config?: RepositoryConfig) => RepositoryInstance<T>;

declare const repository: Repository;

export default repository;
