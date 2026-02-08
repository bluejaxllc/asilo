"use client";

import dynamic from "next/dynamic";

const StockChartInternal = dynamic(() => import("./stock-chart").then((mod) => mod.StockChart), { ssr: false });

export const ClientStockChart = () => {
    return <StockChartInternal />;
};
