import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import AuthLayout from '../components/AuthLayout'
import AuthSplitCard from '../components/AuthSplitCard'
import ResetPasswordForm from '../components/ResetPasswordForm'

export default function Page() {
  const { error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  return (
    <AuthLayout>
      <AuthSplitCard>
        <ResetPasswordForm />
      </AuthSplitCard>
    </AuthLayout>
  )
}
