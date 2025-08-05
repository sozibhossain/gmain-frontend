import React, { Suspense } from "react";
import RegisterContent from "./_components/sign-up-content";

function page() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}

export default page;
