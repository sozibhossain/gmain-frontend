import React, { Suspense } from "react";
import VerifyOtpContent from "./_components/VerifyOtpContent";

function page() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}

export default page;
