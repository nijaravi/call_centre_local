import React, { useState } from "react";
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

export default function SupervisorView() {
  const [selectedAgent1, setSelectedAgent1] = useState("A101");
  const [selectedAgent2, setSelectedAgent2] = useState("A102");
  const [selectedSupervisor_ID, setSelectedSupervisor_ID] = useState("1");

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

  const { data: escalations = [] } = useQuery({
    queryKey: ["supervisor", selectedSupervisor_ID, "escalations"],
    queryFn: () => supervisorApi.getEscalations(selectedSupervisor_ID),
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

  return (
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

      {/* Agent Performance Chart */}
      <ChartCard
        title="Agent Performance"
        description="Number of calls and sentiment breakdown by agent"
      >
        <div className="h-80 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentPerformanceChart} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="positive"
                name="Positive Calls"
                stackId="a"
                fill="#4ade80"
              />
              <Bar
                dataKey="negative"
                name="Negative Calls"
                stackId="a"
                fill="#ef4444"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tag-Sentiment Heatmap */}
        <ChartCard
          title="Sentiment by Product/Tag"
          description="Call sentiment breakdown by product or conversation tag"
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

        {/* Team Sentiment Pie Chart */}
        <ChartCard
          title="Team Sentiment Distribution"
          description="Overall call sentiment distribution across team"
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

      {/* Escalation Tracker */}
      <DataTable
        title="Escalation Tracker"
        columns={[
          { key: "call_id", header: "Call ID" },
          { key: "name", header: "Agent" },
          { key: "escalation_reason", header: "Reason" },
          { key: "possible_action", header: "Possible Action" },
          { key: "escalated_at", header: "Date/Time" },
        ]}
        data={escalations}
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
              <Select value={selectedAgent1} onValueChange={setSelectedAgent1}>
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
              <Select value={selectedAgent2} onValueChange={setSelectedAgent2}>
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
  );
}
