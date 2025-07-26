"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import { Chart, ChartData, registerables } from "chart.js";
import { format } from "date-fns";
import MapChart from "@/components/map-chart";

Chart.register(...registerables);

interface AnalyticsData {
  shortCode: string;
  totalClicks: number;
  createdAt: number;
  referrers: Record<string, number>;
  devices: Record<string, number>;
  dailyClicks: Record<string, number>;
  originalUrl: string;
  geoClicks?: { country: string; count: number }[];
}

export default function AnalyticsPage() {
  const { code } = useParams();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartColors, setChartColors] = useState<string[]>([]);

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setChartColors([
      style.getPropertyValue("--chart-1"),
      style.getPropertyValue("--chart-2"),
      style.getPropertyValue("--chart-3"),
      style.getPropertyValue("--chart-4"),
      style.getPropertyValue("--chart-5"),
    ]);
  }, [setChartColors]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shortCode: code }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  // Prepare chart data
  const dates = Object.keys(data.dailyClicks).sort();
  const clicksData = dates.map((date) => data.dailyClicks[date]);

  const lineChartData: ChartData<"line", number[], string> = {
    labels: dates.map((date) => format(new Date(date), "MMM dd")),
    datasets: [
      {
        label: "Daily Clicks",
        data: clicksData,
        borderColor: chartColors[0],
        tension: 0.1,
      },
    ],
  };

  const referrerData = {
    labels: Object.keys(data.referrers),
    datasets: [
      {
        data: Object.values(data.referrers),
        backgroundColor: chartColors,
      },
    ],
  };

  const deviceData = {
    labels: Object.keys(data.devices),
    datasets: [
      {
        data: Object.values(data.devices),
        backgroundColor: chartColors,
      },
    ],
  };

  return (
    <>
      <header className="w-full py-6 mb-4 bg-card rounded-md shadow-md flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          URL Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          View detailed analytics for your shortened URL, including click
          trends, sources, devices, and geographical distribution.
        </p>
      </header>
      <div className="p-4 flex flex-col gap-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col justify-between p-6 bg-card rounded-md shadow-md min-w-[250px]">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="inline-block px-2 py-1 bg-primary text-primary-foreground rounded">
                {data.shortCode}
              </span>
              <span className="text-lg font-normal text-muted-foreground">
                Analytics
              </span>
            </h1>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Original URL:</span>
                <a
                  href={data.originalUrl}
                  target="_blank"
                  className="truncate text-blue-400 hover:underline max-w-[200px]"
                  title={data.originalUrl}
                >
                  {data.originalUrl}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Created:</span>
                <span className="text-muted-foreground">
                  {format(new Date(data.createdAt), "PPPpp")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Total clicks:</span>
                <span className="text-green-400 font-bold text-lg">
                  {data.totalClicks}
                </span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-card rounded-md shadow-md flex flex-col justify-center items-center">
            <h2 className="font-bold mb-2">Daily Clicks</h2>
            <div className="w-full max-w-xl overflow-x-auto">
              <Line
                data={lineChartData}
                options={{ scales: { y: { ticks: { stepSize: 1 } } } }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col p-6 bg-card rounded-md shadow-md gap-4">
            <p className="font-bold text-center">Click Source Distribution</p>
            <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
              <div className="flex-1 flex flex-col items-center bg-background rounded-md shadow p-4">
                <h2 className="font-bold mb-2 text-center">Referrers</h2>
                <div className="w-[220px] h-[220px] flex items-center justify-center">
                  <div className="aspect-square w-full max-w-xs">
                    <Pie
                      data={referrerData}
                      options={{
                        plugins: { legend: { display: false } },
                        maintainAspectRatio: true,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center bg-background rounded-md shadow p-4">
                <h2 className="font-bold mb-2 text-center">Devices</h2>
                <div className="w-[220px] h-[220px] flex items-center justify-center">
                  <div className="aspect-square w-full max-w-xs">
                    <Pie
                      data={deviceData}
                      options={{ maintainAspectRatio: true }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-card rounded-md shadow-md justify-center p-6 w-full min-h-[300px] max-w-3xl mx-auto gap-4">
            <p className="font-bold">Geographical Data</p>
            <div className="w-full h-full flex items-center justify-center min-h-[300px] bg-[#102a43] rounded-md">
              <MapChart geoClicks={data.geoClicks ?? []} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
