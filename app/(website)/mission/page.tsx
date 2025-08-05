import PageHeader from "@/components/sheard/PageHeader";
import React from "react";
import MissionTableFresh from "./_component/MissionTableFresh";

const page = () => {
  return (
    <div>
      <PageHeader title="Our Mission" image="/asset/mission-banner.png" />
      <MissionTableFresh />
    </div>
  );
};

export default page;
