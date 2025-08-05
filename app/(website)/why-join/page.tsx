import PageHeader from "@/components/sheard/PageHeader";
import React from "react";
import Reasons from "./_component/Reasons";

const page = () => {
  return (
    <div>
      <PageHeader
        image="/asset/whyJoin.png"
        title="Join the Food Revolution with Tablefresh"
        gradientColor="0, 115, 2"
        gradientOpacity={0.0}
      />
      <Reasons />
    </div>
  );
};

export default page;
