import _ from 'underscore';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import events from '@/utils/events.js';
import {permissionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import permissions from '@/permissions/permissions.js';
import {hashPassword} from '@/utils/hashing.js';

export default function accountManager (config) {
  const {profileTable, role} = config;

  return {
    async generate (data, {requestId}) {
      const validated = await validateSchema(config.create.schema, data);
      const {user: userData, ...profileData} = validated;

      await assertEmailNotTaken(userData.email);

      const password = await hashPassword(userData.password);

      const [user] = await db.insert(usersTable).values({
        organization: profileData.organization,
        email: userData.email,
        password,
        role
      }).returning({id: usersTable.id});

      const [profile] = await db.insert(profileTable).values({
        ...profileData,
        user: user.id
      }).returning({id: profileTable.id});

      await createPermissionsForRole(role, {userId: user.id});

      await events.emailAccountManager.publish({action: 'account_created', userId: user.id, email: userData.email}, {requestId});

      return {...profile, user};
    },
    async update (changes, {requestId}) {
      const validated = await validateSchema(config.update.schema, changes);
      const {user: userData, ...profileData} = validated;

      const [updatedProfile] = await db.update(profileTable)
      .set({...profileData, updatedAt: new Date()})
      .where(eq(profileTable.id, profileData.id))
      .returning({id: profileTable.id, user: profileTable.user});

      if (!updatedProfile) {
        throw {error: 'Perfil no encontrado', status: 404};
      }

      const userId = userData.id || updatedProfile.user;
      const currentUser = await findUserOrFail(userId);

      await handleEmailChange({...userData, id: userId}, currentUser, {requestId});
      await handleDisabledChange({...userData, id: userId}, currentUser, {requestId});

      return {...updatedProfile, user: {...userData, id: userId}};
    }
  };
}

async function validateSchema (schema, data) {
  const result = await schema.safeParseAsync(data);

  if (result.error) {
    throw {error: 'errors.invalid_form', status: 400, fields: Object.keys(result.error.flatten().fieldErrors)};
  }

  return result.data;
}

async function handleEmailChange (userData, currentUser, {requestId}) {
  if (!userData.email || userData.email === currentUser.email) {
    return;
  }

  await assertEmailNotTaken(userData.email);

  await db.update(usersTable).set({
    email: userData.email,
    emailConfirmed: false,
    emailConfirmedAt: null,
    updatedAt: new Date()
  }).where(eq(usersTable.id, userData.id)).returning({id: usersTable.id});

  await events.emailAccountManager.publish({
    action: 'email_changed',
    userId: userData.id,
    previousEmail: currentUser.email,
    newEmail: userData.email
  }, {requestId});
}

async function handleDisabledChange (userData, currentUser, {requestId}) {
  if (typeof userData.disabled !== 'boolean') {
    return;
  }

  if (userData.disabled === currentUser.disabled) {
    return;
  }

  await db.update(usersTable).set({
    disabled: userData.disabled,
    updatedAt: new Date()
  }).where(eq(usersTable.id, userData.id)).returning({id: usersTable.id});

  if (userData.disabled) {
    await events.emailAccountManager.publish({action: 'account_disabled', email: currentUser.email}, {requestId});
  }
}

async function createPermissionsForRole (role, {userId}) {
  const rolePermissions = _(permissions.permissions.named).keys().filter((permission) => permission.startsWith(`${role}::`));

  await db.insert(permissionsTable).values({user: userId, name: 'general', permissions: rolePermissions}).returning({id: permissionsTable.id});
}

async function assertEmailNotTaken (email) {
  const [existing] = await db.select({id: usersTable.id})
  .from(usersTable)
  .where(eq(usersTable.email, email))
  .limit(1);

  if (existing) {
    throw {error: 'El correo electrónico ya está registrado', status: 409};
  }
}

async function findUserOrFail (userId) {
  const [user] = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    disabled: usersTable.disabled,
    role: usersTable.role
  }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  if (!user) {
    throw {error: 'Usuario no encontrado', status: 404};
  }

  return user;
}
