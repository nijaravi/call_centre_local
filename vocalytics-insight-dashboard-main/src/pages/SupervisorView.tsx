import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supervisorApi } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Award,
  Calendar,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RPieChart,
  Pie,
  Legend,
} from "recharts";

// Sample supervisor ID
const SUPERVISOR_ID = "1";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  style?: React.CSSProperties; // <-- Add this
  className?: string; // Optional: support Tailwind/utility classes
};

type DataTableProps<T> = {
  title: string;
  columns: Column<T>[];
  data: T[];
};

const SupervisorView = () => {
  const [selectedAgent1, setSelectedAgent1] = useState("A101");
  const [selectedAgent2, setSelectedAgent2] = useState("A102");
  const [selectedSupervisor_ID, setSelectedSupervisor_ID] = useState("1");
  const [statusUpdate, setStatusUpdate] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: escalations = [], refetch: refetchEscalations } = useQuery({
    queryKey: ["supervisor", selectedSupervisor_ID, "escalations"],
    queryFn: () => supervisorApi.getEscalations(selectedSupervisor_ID),
  });

  useEffect(() => {
    setStatusUpdate(escalations);
  }, [escalations]);

  // Fetch supervisor data
  const { data: callsToday = 0 } = useQuery({
    queryKey: ["supervisor", selectedSupervisor_ID, "callsToday"],
    queryFn: () => supervisorApi.getCallsToday(selectedSupervisor_ID),
  });

  const { data: weeklyVolume = 0 } = useQuery({
    queryKey: ["supervisor", selectedSupervisor_ID, "weeklyVolume"],
    queryFn: () => supervisorApi.getWeeklyVolume(selectedSupervisor_ID),
  });

  const { data: monthlyEscalations = 0 } = useQuery({
    queryKey: ["supervisor", selectedSupervisor_ID, "monthlyEscalations"],
    queryFn: () => supervisorApi.getMonthlyEscalations(selectedSupervisor_ID),
  });

  const { data: agentPerformance = [] } = useQuery({
    queryKey: ["supervisor", selectedSupervisor_ID, "agentPerformance"],
    queryFn: () => supervisorApi.getAgentPerformance(selectedSupervisor_ID),
  });

  const { data: tagSentimentHeatmap = [] } = useQuery({
    queryKey: ["supervisor", selectedSupervisor_ID, "tagSentimentHeatmap"],
    queryFn: () => supervisorApi.getTagSentimentHeatmap(selectedSupervisor_ID),
  });

  const { data: teamSentiment = [] } = useQuery({
    queryKey: ["supervisor", selectedSupervisor_ID, "teamSentiment"],
    queryFn: () => supervisorApi.getTeamSentiment(selectedSupervisor_ID),
  });

  const { data: learderboad = [] } = useQuery({
    queryKey: ["supervisor", selectedSupervisor_ID, "learderboad"],
    queryFn: () => supervisorApi.getLeaderBoard(selectedSupervisor_ID),
  });

  const { data: agentComparison = [] } = useQuery({
    queryKey: [
      "supervisor",
      SUPERVISOR_ID,
      "agentComparison",
      selectedAgent1,
      selectedAgent2,
    ],
    queryFn: () => supervisorApi.compareAgents(selectedAgent1, selectedAgent2),
  });

  // Transform data for charts
  const agentPerformanceChart = agentPerformance.map((agent: any) => ({
    name: agent.name,
    calls: agent.call_count,
    positive: agent.positive_calls,
    negative: agent.negative_calls,
  }));

  // Color map for sentiment
  const sentimentColors = {
    positive: "#4ade80",
    neutral: "#f59e0b",
    negative: "#ef4444",
  };

  // Prepare tag sentiment heatmap data
  const tagGroups = {};
  tagSentimentHeatmap.forEach((item: any) => {
    if (!tagGroups[item.tag]) {
      tagGroups[item.tag] = {
        tag: item.tag,
        positive: 0,
        neutral: 0,
        negative: 0,
      };
    }
    tagGroups[item.tag][item.overall_sentiment] = item.count;
  });
  const heatmapData = Object.values(tagGroups);

  const handleStatusChange = async (callId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      await supervisorApi.updateStatus(callId, newStatus);

      setStatusUpdate((prev) =>
        prev.map((item) =>
          item.call_id === callId ? { ...item, status: newStatus } : item
        )
      );

      await refetchEscalations(); // Optionally refetch updated data
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: "InProgress", label: "In Progress" },
    { value: "Reopen", label: "Reopen" },
    { value: "Closed", label: "Closed" },
  ];

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
        </div>
      )}{" "}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            <Select
              value={selectedSupervisor_ID}
              onValueChange={setSelectedSupervisor_ID}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Aisha Al Mansoori</SelectItem>
                <SelectItem value="2">Mohammed Al Rashed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Team Calls Today"
            value={callsToday}
            icon={<Activity className="h-4 w-4" />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Weekly Call Volume"
            value={weeklyVolume}
            icon={<BarChart3 className="h-4 w-4" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Monthly Escalations"
            value={monthlyEscalations}
            icon={<Award className="h-4 w-4" />}
            trend={{ value: 12, isPositive: false }}
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          {/* Left column: Table */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="flex-grow min-h-full">
              <DataTable
                title="Leaderboard"
                columns={[
                  {
                    key: "rank",
                    header: "Rank",
                    render: (row) => {
                      const rank = row.rank;
                      let medal = null;

                      if (rank === 1) {
                        medal = "🥇"; // Gold
                      } else if (rank === 2) {
                        medal = "🥈"; // Silver
                      } else if (rank === 3) {
                        medal = "🥉"; // Bronze
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <span>{rank}</span>
                          {medal && <span>{medal}</span>}
                        </div>
                      );
                    },
                  },
                  { key: "name", header: "Name" },
                  { key: "positive_calls", header: "Positive Calls" },
                  { key: "negative_calls", header: "Negative Calls" },
                  { key: "performance_score", header: "Performance Score" },
                ]}
                data={learderboad}
              />
            </div>
          </div>

          {/* Right column: Charts */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <ChartCard
              title="Sentiment by Product/Tag"
              description="Call sentiment breakdown by product or conversation tag"
              className="flex-grow"
            >
              <div className="h-80 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatmapData}>
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="positive"
                      name="Positive"
                      stackId="a"
                      fill="#4ade80"
                    />
                    <Bar
                      dataKey="neutral"
                      name="Neutral"
                      stackId="a"
                      fill="#f59e0b"
                    />
                    <Bar
                      dataKey="negative"
                      name="Negative"
                      stackId="a"
                      fill="#ef4444"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Team Sentiment Distribution"
              description="Overall call sentiment distribution across team"
              className="flex-grow"
            >
              <div className="h-80 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie
                      data={teamSentiment}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="overall_sentiment"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {teamSentiment.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            sentimentColors[
                              entry.overall_sentiment as keyof typeof sentimentColors
                            ] || "#8884d8"
                          }
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Escalation Tracker */}
        <DataTable
          title="Escalation Tracker"
          columns={[
            { key: "call_id", header: "Call ID", style: { width: "10%" } },
            { key: "name", header: "Agent", style: { width: "15%" } },
            {
              key: "escalation_reason",
              header: "Reason",
              style: { width: "25%" },
            },
            {
              key: "possible_action",
              header: "Possible Action",
              style: { width: "20%" },
            },
            {
              key: "status_display",
              header: "Status",
              style: { width: "15%" },
              render: (row) => {
                const status = row.status_display;

                const getColor = (status: string) => {
                  if (status === "Resolved")
                    return "bg-green-100 text-green-800";
                  if (status.includes("Open"))
                    return "bg-yellow-100 text-yellow-800";
                  if (status.includes("Not actioned"))
                    return "bg-red-100 text-red-800";
                  if (status.includes("Last actioned"))
                    return "bg-blue-100 text-blue-800";
                  return "bg-gray-100 text-gray-800";
                };

                return (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${getColor(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                );
              },
            },
            {
              key: "status_update",
              header: "Action",
              style: { width: "15%" },
              render: (row) => (
                <Select
                  value={row.status}
                  onValueChange={(value) =>
                    handleStatusChange(row.call_id, value)
                  }
                >
                  <SelectTrigger className="w-[140px] border rounded px-2 py-1 text-sm">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              ),
            },
          ]}
          data={statusUpdate}
        />

        {/* Agent Comparison Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Agent Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="agent1">Select First Agent</Label>
                <Select
                  value={selectedAgent1}
                  onValueChange={setSelectedAgent1}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Sara Al Amiri</SelectItem>
                    <SelectItem value="4">Hassan Al Farsi</SelectItem>
                    <SelectItem value="5">Aisha Al Zeyoudi</SelectItem>
                    <SelectItem value="6">Omar Al Hammadi</SelectItem>
                    <SelectItem value="7">Latifa Al Mazrouei</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="agent2">Select Second Agent</Label>
                <Select
                  value={selectedAgent2}
                  onValueChange={setSelectedAgent2}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Sara Al Amiri</SelectItem>
                    <SelectItem value="4">Hassan Al Farsi</SelectItem>
                    <SelectItem value="5">Aisha Al Zeyoudi</SelectItem>
                    <SelectItem value="6">Omar Al Hammadi</SelectItem>
                    <SelectItem value="7">Latifa Al Mazrouei</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Metric</th>
                    {agentComparison.map((agent: any) => (
                      <th key={agent.name} className="text-left py-2 px-3">
                        {agent.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-medium">Total Calls</td>
                    {agentComparison.map((agent: any) => (
                      <td key={agent.name} className="py-2 px-3">
                        {agent.call_count}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-medium">Avg Sentiment</td>
                    {agentComparison.map((agent: any) => (
                      <td key={agent.name} className="py-2 px-3">
                        {Number(agent.avg_sentiment).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-medium">Negative Calls</td>
                    {agentComparison.map((agent: any) => (
                      <td key={agent.name} className="py-2 px-3">
                        {agent.negative_calls}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupervisorView;
