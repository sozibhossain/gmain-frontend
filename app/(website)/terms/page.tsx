import PageHeader from "@/components/sheard/PageHeader";
import React from "react";
import TermsConditions from "./_componet/Terms";

const page = () => {
  return (
    <div>
      <PageHeader
        image="/asset/terms.png"
        title="Terms & Conditions"
        gradientColor="0, 115, 2"
        gradientOpacity={0.2}
      />
      <TermsConditions />
    </div>
  );
};

export default page;
