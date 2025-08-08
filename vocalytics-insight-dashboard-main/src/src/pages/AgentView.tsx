import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { agentApi } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Award,
  Calendar,
  Clock,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample agent ID
const AGENT_ID = "25";

// Helper function to format date to readable format
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function AgentView() {
  const [selectedAgent1, setSelectedAgent1] = useState("3");
  // Fetch agent data
  const { data: callsToday = 0 } = useQuery({
    queryKey: ["agent", selectedAgent1, "callsToday"],
    queryFn: () => agentApi.getCallsToday(selectedAgent1),
  });

  const { data: weeklyVolume = [] } = useQuery({
    queryKey: ["agent", selectedAgent1, "weeklyVolume"],
    queryFn: () => agentApi.getWeeklyVolume(selectedAgent1),
  });

  const { data: performanceScore = 0 } = useQuery({
    queryKey: ["agent", selectedAgent1, "performanceScore"],
    queryFn: () => agentApi.getPerformanceScore(selectedAgent1),
  });

  const { data: leaderboardRank = 0 } = useQuery({
    queryKey: ["agent", selectedAgent1, "leaderboardRank"],
    queryFn: () => agentApi.getLeaderboardRank(selectedAgent1),
  });

  const { data: sentimentDistribution = [] } = useQuery({
    queryKey: ["agent", selectedAgent1, "sentimentDistribution"],
    queryFn: () => agentApi.getSentimentDistribution(selectedAgent1),
  });

  const { data: callsByTag = [] } = useQuery({
    queryKey: ["agent", selectedAgent1, "callsByTag"],
    queryFn: () => agentApi.getCallsByTag(selectedAgent1),
  });

  const { data: recentEscalations = [] } = useQuery({
    queryKey: ["agent", selectedAgent1, "recentEscalations"],
    queryFn: () => agentApi.getRecentEscalations(selectedAgent1),
  });

  const { data: recentCalls = [] } = useQuery({
    queryKey: ["agent", selectedAgent1, "recentCalls"],
    queryFn: () => agentApi.getRecentCalls(selectedAgent1),
  });

  const { data: agentInsights = [] } = useQuery({
    queryKey: ["agent", selectedAgent1, "agentInsights"],
    queryFn: () => agentApi.getAgentInsights(selectedAgent1),
  });

  // Format data for charts
  const formattedWeeklyVolume = weeklyVolume.map((day: any) => ({
    ...day,
    day: formatDate(day.day),
  }));

  // Color map for sentiment
  const sentimentColors = {
    positive: "#4ade80",
    neutral: "#f59e0b",
    negative: "#ef4444",
  };

  const colors = ["#4CAF50", "#2196F3", "#FFC107", "#F44336", "#9C27B0"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agent Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {/* <span className="font-medium">Welcome, Jane Doe</span> */}
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
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Calls Today"
          value={callsToday}
          icon={<Activity className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Weekly Call Volume"
          value={formattedWeeklyVolume.reduce(
            (sum: number, day: any) => sum + day.count,
            0
          )}
          icon={<BarChart3 className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Performance Score"
          value={`${(Number(performanceScore) * 100).toFixed(0)}%`}
          icon={<Award className="h-4 w-4" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Leaderboard Rank"
          value={`#${leaderboardRank}`}
          icon={<Award className="h-4 w-4" />}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Call Trends */}
        <ChartCard
          title="Call Trends"
          description="Daily call volume for the past 7 days"
        >
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedWeeklyVolume}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Sentiment Distribution */}
        <ChartCard
          title="Sentiment Distribution"
          description="Call sentiment breakdown"
        >
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={sentimentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="overall_sentiment"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {sentimentDistribution.map((entry: any, index: number) => (
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
                {/* <Legend /> */}
                <Tooltip />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Calls per Tag */}
        <ChartCard
          title="Calls per Tag"
          description="Distribution of calls by conversation tag"
        >
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={callsByTag}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="tag"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {callsByTag.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index] || "#8884d8"}
                    />
                  ))}
                </Pie>
                {/* <Legend /> */}
                <Tooltip />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row with Tables and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Escalations */}
        <DataTable
          title="Recent Escalations"
          columns={[
            { key: "call_id", header: "Call ID" },
            { key: "escalation_reason", header: "Reason" },
            { key: "possible_action", header: "Action" },
            { key: "escalated_at", header: "When" },
          ]}
          data={recentEscalations}
        />

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-accent/50 p-3 rounded-md">
                <h3 className="font-medium text-sm mb-1">Strengths</h3>
                <p className="text-sm">{agentInsights?.[0]?.strengths}</p>
              </div>

              <div className="bg-accent/50 p-3 rounded-md">
                <h3 className="font-medium text-sm mb-1">
                  Areas for Improvement
                </h3>
                <p className="text-sm">{agentInsights?.[0]?.area_of_improvement}</p>
              </div>

              <div className="bg-accent/50 p-3 rounded-md">
                <h3 className="font-medium text-sm mb-1">Action Items</h3>
                <ul className="text-sm list-disc pl-5">
                  {agentInsights?.[0]?.action_items
                    ?.split("\n")
                    .map((item) => item.replace(/^-\s*/, "").trim())
                    .filter((item) => item.length > 0)
                    .map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline of Recent Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Recent Calls Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCalls.map((call: any, index: number) => (
              <div key={call.call_id} className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      call.overall_sentiment === "positive"
                        ? "bg-green-500"
                        : call.overall_sentiment === "neutral"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                  {index < recentCalls.length - 1 && (
                    <div className="h-14 w-0.5 bg-border" />
                  )}
                </div>
                <div className="pb-4">
                  <div className="text-sm font-medium">
                    Call ID: {call.call_id}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(call.analyzed_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="inline-flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Duration: {Math.floor(call.duration_sec / 60)}m{" "}
                      {call.duration_sec % 60}s
                    </span>
                    <span className="mx-2">•</span>
                    <span>Language: {call.language}</span>
                    <span className="mx-2">•</span>
                    <span
                      className={`capitalize ${
                        call.overall_sentiment === "positive"
                          ? "text-green-500"
                          : call.overall_sentiment === "neutral"
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {call.overall_sentiment} sentiment
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
