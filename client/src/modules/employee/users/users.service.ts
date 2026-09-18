import type { ListPage } from '@/hooks/use-list-query'
import type { User, UserListQuery } from './users.schema'

const usersService = {
  list(_query: UserListQuery): Promise<ListPage<User>> {
    throw new Error('Not implemented: usersService.list')
  },
}

export default usersService
