"use client";

import dynamic from "next/dynamic";

const StockChartInternal = dynamic(() => import("./stock-chart").then((mod) => mod.StockChart), { ssr: false });

interface ClientStockChartProps {
    medications: any[];
}

export const ClientStockChart = ({ medications }: ClientStockChartProps) => {
    return <StockChartInternal medications={medications} />;
};
