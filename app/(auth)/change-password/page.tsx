import React, { Suspense } from 'react'
import ResetPasswordcontent from './_components/change-password-content'

function page() {
  return (
    <div>
      
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordcontent />
    </Suspense>
    </div>
  )
}

export default page