

"use client";

import Featured_Farms from "@/components/Featured_Farms";
import HeroSection from "@/components/Hero";
import Searchbar from "@/components/Searchbar";
import React, { Suspense } from "react";

const Page = () => {
  return (
    <div>
      <div className="relative">
        <HeroSection />
        <div className="absolute w-full lg:max-w-5xl bottom-[-30px] md:bottom-[-50px] left-[50%] translate-x-[-50%] right-0 z-10">
          <Searchbar />
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <Featured_Farms />
      </Suspense>
     
    </div>
  );
};

export default Page;