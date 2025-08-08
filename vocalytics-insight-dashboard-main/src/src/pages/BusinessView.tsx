
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { businessApi } from "@/lib/api";
import { ChartCard } from "@/components/ChartCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

export default function BusinessView() {
  // Fetch business data
  const { data: callCountByTag = [] } = useQuery({
    queryKey: ["business", "callCountByTag"],
    queryFn: () => businessApi.getCallCountByTag(),
  });

  const { data: sentimentByTag = [] } = useQuery({
    queryKey: ["business", "sentimentByTag"],
    queryFn: () => businessApi.getSentimentByTag(),
  });

  const { data: escalationByTag = [] } = useQuery({
    queryKey: ["business", "escalationByTag"],
    queryFn: () => businessApi.getEscalationByTag(),
  });

  // Process data for charts
  // Group sentiment by tag
  const tagSentimentGroups = {};
  sentimentByTag.forEach((item: any) => {
    if (!tagSentimentGroups[item.tag]) {
      tagSentimentGroups[item.tag] = {
        tag: item.tag,
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0,
      };
    }
    tagSentimentGroups[item.tag][item.overall_sentiment] = item.count;
    tagSentimentGroups[item.tag].total += item.count;
  });

  // Create derived data
  const sentimentPercentageByTag = Object.values(tagSentimentGroups).map((tag: any) => ({
    ...tag,
    positivePercent: Math.round((tag.positive / tag.total) * 100),
    neutralPercent: Math.round((tag.neutral / tag.total) * 100),
    negativePercent: Math.round((tag.negative / tag.total) * 100),
  }));

  // Match escalations with call count
  const escalationRateByTag = callCountByTag.map((callItem: any) => {
    const escalationItem = escalationByTag.find((item: any) => item.tag === callItem.tag) || { count: 0 };
    const escalationRate = callItem.count > 0 ? 
      Math.round((escalationItem.count / callItem.count) * 100) : 0;
    
    return {
      tag: callItem.tag,
      callCount: callItem.count,
      escalationCount: escalationItem.count,
      escalationRate: escalationRate,
    };
  });

  // Color map for sentiment
  const sentimentColors = {
    positive: "#4ade80",
    neutral: "#f59e0b",
    negative: "#ef4444",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Business Analytics</h1>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">All Products & Services</span>
        </div>
      </div>

      {/* Overall Sentiment Distribution */}
      <Card>
        <Tabs defaultValue="calls">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Product Analytics Overview</CardTitle>
                <CardDescription>Analyze performance metrics across product categories</CardDescription>
              </div>
              <TabsList className="mt-2 md:mt-0">
                <TabsTrigger value="calls">Call Volume</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="escalation">Escalations</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <TabsContent value="calls" className="mt-0">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callCountByTag}>
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Number of Calls" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Billing and Technical support categories receive the highest call volumes.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="sentiment" className="mt-0">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.values(tagSentimentGroups)}>
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="positive" name="Positive" stackId="a" fill="#4ade80" />
                    <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Account and Product categories show the highest positive sentiment ratios.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="escalation" className="mt-0">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={escalationRateByTag}>
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="escalationRate" name="Escalation Rate (%)" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Technical support has the highest escalation rate at 17.8%, followed by Billing at 10%.</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Detailed Analysis by Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Sentiment Distribution by Product"
          description="Percentage breakdown of call sentiment for each product"
        >
          <div className="h-96 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentPercentageByTag} layout="vertical">
                <XAxis type="number" unit="%" />
                <YAxis type="category" dataKey="tag" width={100} />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Legend />
                <Bar dataKey="positivePercent" name="Positive" stackId="a" fill="#4ade80" />
                <Bar dataKey="neutralPercent" name="Neutral" stackId="a" fill="#f59e0b" />
                <Bar dataKey="negativePercent" name="Negative" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Escalation Analysis"
          description="Number of escalations by product category"
        >
          <div className="h-96 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={escalationByTag}>
                <XAxis dataKey="tag" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Number of Escalations" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Business Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Business Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-accent/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Top Performing Product</h3>
                <div className="text-2xl font-bold">Account Services</div>
                <p className="text-sm mt-1 text-muted-foreground">
                  57% positive sentiment ratio
                </p>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Highest Call Volume</h3>
                <div className="text-2xl font-bold">Billing Support</div>
                <p className="text-sm mt-1 text-muted-foreground">
                  50 calls in the last 30 days
                </p>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Most Escalations</h3>
                <div className="text-2xl font-bold">Technical Support</div>
                <p className="text-sm mt-1 text-muted-foreground">
                  8 escalations (17.8% rate)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Technical Support</h4>
                  <p className="text-sm">
                    High escalation rate indicates need for improved agent training and better documentation. Consider implementing a technical knowledge base for agents.
                  </p>
                </div>

                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Billing Support</h4>
                  <p className="text-sm">
                    High call volume with moderate negative sentiment. Streamline billing processes and improve self-service options to reduce call volume.
                  </p>
                </div>

                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Product Information</h4>
                  <p className="text-sm">
                    Good sentiment but could improve documentation clarity. Collect common questions to enhance product guides and FAQs.
                  </p>
                </div>

                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Account Services</h4>
                  <p className="text-sm">
                    Strong performance area. Use successful strategies here as a model for other areas. Identify what's working well and apply elsewhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
