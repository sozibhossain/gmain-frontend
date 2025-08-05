import PageHeader from "@/components/sheard/PageHeader";
import React from "react";
import Faq from "./Faq";

const page = () => {
  return (
    <div>
      <PageHeader
        image="/asset/faqbanner.jpg"
        title="Questions You Ask Us Often"
        gradientColor="0, 115, 2"
        gradientOpacity={0.2}
      />
      <Faq />
    </div>
  );
};

export default page;
