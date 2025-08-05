import PageHeader from "@/components/sheard/PageHeader";
import React from "react";
import ContactFrom from "./_component/ContactFrom";

const page = () => {
  return (
    <div>
      <PageHeader
        image="/asset/contactHeader.png"
        title="Contact Us"
        gradientColor="0, 115, 2"
        gradientOpacity={0.2}
      />
      <ContactFrom />
    </div>
  );
};

export default page;
