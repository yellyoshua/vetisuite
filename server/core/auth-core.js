import _ from 'underscore';
import {addDays} from 'date-fns';
import {createHmac, timingSafeEqual} from 'node:crypto';
import {db} from '@vetisuite/database/db.js';
import logger from '@/utils/logger.js';
import {isPasswordValid} from '@/utils/hashing.js';
import {and, eq, getTableColumns, gt, sql} from '@vetisuite/database/orm.js';
import {employeesTable, organizationsTable, ownersTable, permissionsTable, sessionsTable, superadminsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 2;

const JWT_SECRET = process.env.JWT_SECRET;

const PROFILE_TABLES = {superadmin: superadminsTable, owner: ownersTable, employee: employeesTable};

const safeUserColumns = _(getTableColumns(usersTable)).omit('password');

const authCore = {
  session: {
    async create (userId, {ip = null, userAgent = null} = {}) {
      const expiresAt = addDays(new Date(), 2);

      const [session] = await db.insert(sessionsTable).values({user: userId, expiresAt, ip, userAgent}).returning();
      const token = generateToken({session: session.id});

      return {session, token};
    },
    async destroy (sessionId) {
      await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
    },
    fromToken (token) {
      if (!token) {
        return null;
      }

      try {
        return decodeToken(token);
      } catch {
        return null;
      }
    },

    async claim (sessionId, {userAgent = null} = {}) {
      try {
        const [row] = await db.select({
          session: getTableColumns(sessionsTable),
          user: safeUserColumns,
          superadmin: getTableColumns(superadminsTable),
          owner: getTableColumns(ownersTable),
          employee: getTableColumns(employeesTable),
          permission: getTableColumns(permissionsTable),
          organization: {id: organizationsTable.id, name: organizationsTable.name, timezone: organizationsTable.timezone}
        })
        .from(sessionsTable)
        .innerJoin(usersTable, eq(sessionsTable.user, usersTable.id))
        .leftJoin(superadminsTable, eq(superadminsTable.user, usersTable.id))
        .leftJoin(ownersTable, eq(ownersTable.user, usersTable.id))
        .leftJoin(employeesTable, eq(employeesTable.user, usersTable.id))
        .leftJoin(permissionsTable, eq(permissionsTable.user, usersTable.id))
        .leftJoin(organizationsTable, eq(organizationsTable.id, sql`coalesce(${superadminsTable.organization}, ${ownersTable.organization}, ${employeesTable.organization})`))
        .where(and(
          eq(sessionsTable.id, sessionId),
          gt(sessionsTable.expiresAt, new Date()),
          eq(sessionsTable.userAgent, userAgent)
        ))
        .limit(1);

        if (!row) {
          return null;
        }

        const {role} = row.user;

        return {
          session: row.session,
          permissions: row.permission.permissions,
          profile: {...row[role], user: row.user},
          organization: row.organization
        };
      } catch (error) {
        logger.error('[authCore.session.claim]: Error', error);

        return null;
      }
    }
  },
  user: {
    async findByEmail (email) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

      return user || null;
    },

    async verifyCredentials (email, password) {
      const user = await authCore.user.findByEmail(email);

      if (!user || !await isPasswordValid(password, user.password)) {
        return null;
      }

      return user;
    },

    async getProfile (userId) {
      const [user] = await db.select(safeUserColumns).from(usersTable)
      .where(eq(usersTable.id, userId)).limit(1);

      const profileTable = PROFILE_TABLES[user.role];

      const [profile] = await db.select().from(profileTable)
      .where(eq(profileTable.user, userId)).limit(1);

      return {...profile, user: user};
    }
  }
};

export default authCore;

export function isAccountBlocked (user) {
  if (user.disabled) {
    return true;
  }

  return Boolean(user.bannedUntil && new Date(user.bannedUntil) > new Date());
}

function decodeToken (token) {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    throw new Error('Token de sesión inválido');
  }

  const expectedSignature = signPayload(encodedPayload);

  if (!isSafeEqual(signature, expectedSignature)) {
    throw new Error('Token de sesión inválido');
  }

  return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
}

function generateToken (payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

function signPayload (payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado');
  }

  return createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
}

function isSafeEqual (left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
