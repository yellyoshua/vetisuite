import zod from 'zod';
import {setHeader} from 'h3';
import baseRoute from '@/core/base-route.js';
import profileSessionsRepository from '@/modules/profile-sessions/profile-sessions.repository.js';

export default baseRoute(async (_params, context) => {
  setHeader(context.event, 'Cache-Control', 'no-store');

  const now = new Date();
  const sessions = await profileSessionsRepository.find({user: context.profile.user.id}, {
    select: {id: true, userAgent: true, createdAt: true, expiresAt: true},
    limit: -1
  });

  return sessions
  .filter((session) => session.expiresAt > now)
  .map((session) => ({
    id: session.id,
    userAgent: session.userAgent,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    isCurrent: session.id === context.session.id
  }))
  .sort(byCurrentThenNewest);
}, zod.object({}), {module: 'profile-sessions'});

function byCurrentThenNewest (left, right) {
  if (left.isCurrent !== right.isCurrent) {
    return left.isCurrent ? -1 : 1;
  }

  if (left.createdAt.getTime() !== right.createdAt.getTime()) {
    return right.createdAt.getTime() - left.createdAt.getTime();
  }

  return left.id.localeCompare(right.id);
}
