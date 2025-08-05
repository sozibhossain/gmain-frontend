import PageHeader from "@/components/sheard/PageHeader";
import React from "react";
import Blog from "./_component/Blog";

const page = () => {
  return (
    <div>
      <PageHeader
        image="/asset/blogbanner.jpg"
        title="Our Blog"
        gradientColor="0, 115, 2"
        gradientOpacity={0.2}
      />
      <Blog />
    </div>
  );
};

export default page;
