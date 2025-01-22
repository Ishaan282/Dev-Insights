import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return <SignUp afterSignUpUrl="/sync-user"/>
}

// sign up means creating a new account