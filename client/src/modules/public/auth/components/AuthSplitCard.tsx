import type { ReactNode } from 'react'

type AuthSplitCardProps = {
  children: ReactNode
}

export default function AuthSplitCard({ children }: AuthSplitCardProps) {
  return (
    <section className="w-full max-w-5xl">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row md:h-[680px]">

        <div className="hidden md:block md:w-5/12 flex-none">
          <div className="relative w-full h-full">
            <img
              src="/assets/images/login-side.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center py-10 px-3">
          <div className="w-1.5 h-full bg-orange-500 rounded-full" />
        </div>

        <div className="flex-1 flex flex-col justify-center p-6 md:p-10 md:pl-4 md:overflow-y-auto">
          {children}
        </div>

      </div>
    </section>
  )
}
