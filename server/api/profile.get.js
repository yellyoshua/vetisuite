import zod from 'zod';
import baseRoute from '@/core/base-route.js';
import employeesRepository from '@/modules/employees/employees.repository.js';
import ownersRepository from '@/modules/owners/owners.repository.js';
import superadminsRepository from '@/modules/superadmins/superadmins.repository.js';

export default baseRoute(async (_params, context) => {
  if (context.profile.user.role === 'owner') {
    return ownersRepository.findOne({id: context.profile.id}, {
      select: {avatar: true, firstName: true, lastName: true, phone: true, description: true, position: true, occupation: true, createdAt: true},
      join: {user: 'email emailConfirmed', organization: 'id name slug'}
    });
  }

  if (context.profile.user.role === 'employee') {
    return employeesRepository.findOne({id: context.profile.id}, {
      select: {avatar: true, firstName: true, lastName: true, phone: true, position: true, color: true, createdAt: true},
      join: {user: 'email emailConfirmed', organization: 'id name slug'}
    });
  }

  return superadminsRepository.findOne({id: context.profile.id}, {
    select: {avatar: true, firstName: true, lastName: true},
    join: {user: 'email emailConfirmed emailConfirmedAt createdAt lastSignInAt disabled bannedUntil'}
  });
}, zod.object({}), {module: 'profile'});
