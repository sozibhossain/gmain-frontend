import PageHeader from "@/components/sheard/PageHeader";
import React from "react";
import Blog_deatails from "../_component/Blog_deatails";

const page = () => {
  return (
    <div>
      <PageHeader
        image="/asset/blogHeader.png"
        title="Our Blog"
        gradientColor="0, 115, 2"
        gradientOpacity={0.4}
      />
      <div className="container mx-auto py-8">
        <Blog_deatails />
      </div>
    </div>
  );
};

export default page;
