// Dashboard.tsx

import { Card,  } from "@/components/ui/card";

import StatsCard from "./_components/StatsCard";
import SellReportChart from "./_components/SellReportChart";
import ProductsReportChart from "./_components/ProductsReportChart";

export default function Dashboard() {
  return (
    <div className=" space-y-6 bg-slate-50 ">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Dashboard</p>
      </div>

      <div className="flex justify-between items-center w-full  ">
        <StatsCard />
      </div>

      <div className="grid gap-6 grid-cols-6">
        <Card className="col-span-4">
          <SellReportChart />
        </Card>
        <Card className="col-span-2">
          <ProductsReportChart />
        </Card>
      </div>
    </div>
  );
}
