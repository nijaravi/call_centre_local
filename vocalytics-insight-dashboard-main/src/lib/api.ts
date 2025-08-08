
import { toast } from "sonner";

// Database connection configuration
const DB_CONFIG = {
  host: "cxo-concierge.postgres.database.azure.com",
  port: 5432,
  database: "postgres",
  schema: "vocalytics",
  username: "cxoadmin",
  password: "dbadmin@2024"
};

// API base URL for a hypothetical API service
// In a real app, this would be an actual backend service
const API_BASE_URL = "/api";

// export async function executeQuery(sql: string, params?: Record<string, any>) {
//   try {
//     const agentId = params?.agent_id;
//     const response = await fetch(`http://localhost:3001/api/calls-today/${agentId}`);
//     if (!response.ok) throw new Error("Failed to fetch");

//     const data = await response.json();
//     return { data: [{ count: data.count }] };
//   } catch (error) {
//     console.error("API call failed:", error);
//     return { data: [], error: "Query failed" };
//   }
// }

export async function apiGet<T>(endpoint: string): Promise<{ data: T | []; error?: string }> {
  try {
    const response = await fetch(`http://localhost:3001/api/${endpoint}`);
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    return { data: [], error: "Query failed" };
  }
}

export async function apiPost<T>(endpoint: string, payload: any): Promise<{ data: T | []; error?: string }> {
  try {
    const response = await fetch(`http://localhost:3001/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`API POST to ${endpoint} failed:`, error);
    return { data: [], error: "Query failed" };
  }
}




// Function to execute SQL queries (mocked for now)
// export async function executeQuery(sql: string, params?: Record<string, any>) {
//   console.log("Executing query:", sql, params);
  
//   // In a real app, this would make an actual API call
//   try {
//     // Simulate API call
//     const response = await mockApiCall(sql, params);
//     return response;
//   } catch (error) {
//     console.error("Query failed:", error);
//     toast.error("Failed to fetch data. Please try again later.");
//     return { data: [], error: "Query failed" };
//   }
// }

// Mock function to simulate API calls with sample data
async function mockApiCall(sql: string, params?: Record<string, any>) {
  // Wait a bit to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock data based on the SQL query
  if (sql.includes("COUNT(*)") && sql.includes("DATE(analyzed_at) = CURRENT_DATE")) {
    return { data: [{ count: Math.floor(Math.random() * 20) + 5 }] };
  }
  
  if (sql.includes("Weekly Volume") || sql.includes("DATE(analyzed_at) AS day")) {
    return {
      data: [
        { day: "2023-05-01", count: Math.floor(Math.random() * 30) + 10 },
        { day: "2023-05-02", count: Math.floor(Math.random() * 30) + 10 },
        { day: "2023-05-03", count: Math.floor(Math.random() * 30) + 10 },
        { day: "2023-05-04", count: Math.floor(Math.random() * 30) + 10 },
        { day: "2023-05-05", count: Math.floor(Math.random() * 30) + 10 },
        { day: "2023-05-06", count: Math.floor(Math.random() * 30) + 10 },
        { day: "2023-05-07", count: Math.floor(Math.random() * 30) + 10 }
      ]
    };
  }
  
  if (sql.includes("Performance Score")) {
    return { data: [{ score: (Math.random() * 0.5 + 0.5).toFixed(2) }] };
  }
  
  if (sql.includes("Leaderboard Rank")) {
    return { data: [{ rank: Math.floor(Math.random() * 10) + 1 }] };
  }
  
  if (sql.includes("Monthly Escalations")) {
    return { data: [{ count: Math.floor(Math.random() * 15) + 3 }] };
  }
  
  if (sql.includes("Agent-wise Performance")) {
    return {
      data: [
        { name: "Alex Johnson", call_count: 45, positive_calls: 32, negative_calls: 8 },
        { name: "Maria Garcia", call_count: 38, positive_calls: 29, negative_calls: 5 },
        { name: "John Smith", call_count: 42, positive_calls: 28, negative_calls: 9 },
        { name: "Sarah Lee", call_count: 36, positive_calls: 24, negative_calls: 7 }
      ]
    };
  }
  
  if (sql.includes("Tag-Sentiment Heatmap")) {
    return {
      data: [
        { tag: "Billing", overall_sentiment: "positive", count: 25 },
        { tag: "Billing", overall_sentiment: "neutral", count: 15 },
        { tag: "Billing", overall_sentiment: "negative", count: 10 },
        { tag: "Technical", overall_sentiment: "positive", count: 18 },
        { tag: "Technical", overall_sentiment: "neutral", count: 12 },
        { tag: "Technical", overall_sentiment: "negative", count: 15 },
        { tag: "Account", overall_sentiment: "positive", count: 30 },
        { tag: "Account", overall_sentiment: "neutral", count: 10 },
        { tag: "Account", overall_sentiment: "negative", count: 5 },
        { tag: "Product", overall_sentiment: "positive", count: 22 },
        { tag: "Product", overall_sentiment: "neutral", count: 18 },
        { tag: "Product", overall_sentiment: "negative", count: 8 }
      ]
    };
  }
  
  if (sql.includes("Pie Chart")) {
    return {
      data: [
        { overall_sentiment: "positive", count: 85 },
        { overall_sentiment: "neutral", count: 55 },
        { overall_sentiment: "negative", count: 35 }
      ]
    };
  }
  
  if (sql.includes("Escalations")) {
    return {
      data: [
        { call_id: "C123", name: "John Smith", escalation_reason: "Angry customer", possible_action: "Issue refund", escalated_at: "2023-05-01 14:23:45" },
        { call_id: "C124", name: "Maria Garcia", escalation_reason: "Technical issue", possible_action: "Tech support", escalated_at: "2023-05-02 10:15:30" },
        { call_id: "C125", name: "Alex Johnson", escalation_reason: "Billing dispute", possible_action: "Review account", escalated_at: "2023-05-03 16:45:20" },
        { call_id: "C126", name: "Sarah Lee", escalation_reason: "Account cancellation", possible_action: "Retention offer", escalated_at: "2023-05-04 09:30:15" }
      ]
    };
  }
  
  if (sql.includes("Compare Agents")) {
    return {
      data: [
        { name: "John Smith", call_count: 42, avg_sentiment: 0.78, negative_calls: 9 },
        { name: "Maria Garcia", call_count: 38, avg_sentiment: 0.85, negative_calls: 5 }
      ]
    };
  }
  
  if (sql.includes("Call Count by Tag")) {
    return {
      data: [
        { tag: "Billing", count: 50 },
        { tag: "Technical", count: 45 },
        { tag: "Account", count: 35 },
        { tag: "Product", count: 30 },
        { tag: "Other", count: 20 }
      ]
    };
  }
  
  if (sql.includes("Sentiment by Tag")) {
    return {
      data: [
        { tag: "Billing", overall_sentiment: "positive", count: 25 },
        { tag: "Billing", overall_sentiment: "neutral", count: 15 },
        { tag: "Billing", overall_sentiment: "negative", count: 10 },
        { tag: "Technical", overall_sentiment: "positive", count: 18 },
        { tag: "Technical", overall_sentiment: "neutral", count: 12 },
        { tag: "Technical", overall_sentiment: "negative", count: 15 },
        { tag: "Account", overall_sentiment: "positive", count: 20 },
        { tag: "Account", overall_sentiment: "neutral", count: 10 },
        { tag: "Account", overall_sentiment: "negative", count: 5 },
        { tag: "Product", overall_sentiment: "positive", count: 15 },
        { tag: "Product", overall_sentiment: "neutral", count: 10 },
        { tag: "Product", overall_sentiment: "negative", count: 5 },
        { tag: "Other", overall_sentiment: "positive", count: 10 },
        { tag: "Other", overall_sentiment: "neutral", count: 7 },
        { tag: "Other", overall_sentiment: "negative", count: 3 }
      ]
    };
  }
  
  if (sql.includes("Escalation by Tag")) {
    return {
      data: [
        { tag: "Billing", count: 5 },
        { tag: "Technical", count: 8 },
        { tag: "Account", count: 3 },
        { tag: "Product", count: 4 },
        { tag: "Other", count: 2 }
      ]
    };
  }
  
  return { data: [] };
}

export const agentApi = {
  getCallsToday: async (agentId: string) => {
    const { data }: any = await apiGet<{ count: number }>(`calls-today/${agentId}`);
    return data?.count || 0;
  },

  getWeeklyVolume: async (agentId: string) => {
    const { data }: any = await apiGet(`weekly-volume/${agentId}`);
    console.log("data",data)
    return data || [];
  },

  getPerformanceScore: async (agentId: string) => {
    const { data }: any = await apiGet<{ score: number }>(`performance-score/${agentId}`);
    return data?.score || 0;
  },

  getLeaderboardRank: async (agentId: string) => {
    const { data }: any = await apiGet<{ rank: number }>(`leaderboard-rank/${agentId}`);
    return data?.rank || 0;
  },

  getSentimentDistribution: async (agentId: string) => {
    const { data }: any = await apiGet(`sentiment-distribution/${agentId}`);
    return data?.sentiment || [];
  },

  getCallsByTag: async (agentId: string) => {
    const { data }: any = await apiGet(`calls-by-tag/${agentId}`);
    return data?.calls || [];
  },

  getRecentEscalations: async (agentId: string) => {
    const { data }: any = await apiGet(`recent-escalations/${agentId}`);
    return data?.escalations || [];
  },

  getRecentCalls: async (agentId: string) => {
    const { data }: any = await apiGet(`recent-calls/${agentId}`);
    return data?.calls || [];
  },

  getAgentInsights: async (agentId: string) => {
    const { data }: any = await apiGet(`agent-insights/${agentId}`);
    return data?.insights || [];
  },
};

export const supervisorApi = {
  getCallsToday: async (supervisorId: string) => {
    const { data }: any = await apiGet<{ count: number }>(`supervisor/calls-today/${supervisorId}`);
    return data?.count || 0;
  },

  getWeeklyVolume: async (supervisorId: string) => {
    const { data }: any = await apiGet<{ count: number }>(`supervisor/weekly-volume/${supervisorId}`);
    return data?.count || 0;
  },

  getMonthlyEscalations: async (supervisorId: string) => {
    const { data }: any = await apiGet<{ count: number }>(`supervisor/monthly-escalations/${supervisorId}`);
    return data?.count || 0;
  },

  getAgentPerformance: async (supervisorId: string) => {
    const { data }: any = await apiGet(`supervisor/agent-performance/${supervisorId}`);
    return data || [];
  },

  getTagSentimentHeatmap: async (supervisorId: string) => {
    const { data }: any = await apiGet(`supervisor/tag-sentiment-heatmap/${supervisorId}`);
    return data || [];
  },

  getTeamSentiment: async (supervisorId: string) => {
    const { data }: any = await apiGet(`supervisor/team-sentiment/${supervisorId}`);
    return data || [];
  },

  getEscalations: async (supervisorId: string) => {
    const { data }: any = await apiGet(`supervisor/escalations/${supervisorId}`);
    return data || [];
  },

  getLeaderBoard: async (supervisorId: string) => {
    const { data }: any = await apiGet(`supervisor/learderboad`);
    return data || [];
  },

  compareAgents: async (agent1Id: string, agent2Id: string) => {
    const { data }: any = await apiGet(`supervisor/compare-agents?agent1=${agent1Id}&agent2=${agent2Id}`);
    return data || [];
  },

  updateStatus: async (callId: string, newStatus: string) => {
    const payload = { callId, newStatus };
    const { data, error } = await apiPost('supervisor/update-status', payload);
    
    if (error) {
      console.error("Failed to update status:", error);
      return [];
    }
  
    return data || [];
  }
};

export const businessApi = {
  getCallCountByTag: async () => {
    const { data }: any = await apiGet<{ tag: string; count: number }[]>("call-count-by-tag");
    return data || [];
  },

  getSentimentByTag: async () => {
    const { data }: any = await apiGet<{ tag: string; overall_sentiment: string; count: number }[]>("sentiment-by-tag");
    return data || [];
  },

  getEscalationByTag: async () => {
    const { data }: any = await apiGet<{ tag: string; count: number }[]>("escalation-by-tag");
    return data || [];
  }
};




// API functions for each view
// export const agentApi = {
//   getCallsToday: async (agentId: string) => {
//     const sql = "SELECT COUNT(*) FROM vocalytics.calls WHERE user_id = :agent_id AND DATE(analyzed_at) = CURRENT_DATE";
//     const result = await executeQuery(sql, { agent_id: agentId });
//     return result.data?.[0]?.count || 0;
//   },
  
//   getWeeklyVolume: async (agentId: string) => {
//     const sql = "SELECT DATE(analyzed_at) AS day, COUNT(*) FROM vocalytics.calls WHERE user_id = :agent_id AND analyzed_at >= CURRENT_DATE - INTERVAL '7 days' GROUP BY day";
//     const result = await executeQuery(sql, { agent_id: agentId });
//     return result.data || [];
//   },
  
//   getPerformanceScore: async (agentId: string) => {
//     const sql = "SELECT user_id, ROUND(AVG(CASE WHEN cs.overall_sentiment = 'positive' THEN 1.0 WHEN cs.overall_sentiment = 'neutral' THEN 0.5 ELSE 0 END), 2) as score FROM vocalytics.calls c JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id WHERE c.user_id = :agent_id AND analyzed_at >= date_trunc('month', CURRENT_DATE) GROUP BY user_id";
//     const result = await executeQuery(sql, { agent_id: agentId });
//     return result.data?.[0]?.score || 0;
//   },
  
//   getLeaderboardRank: async (agentId: string) => {
//     const sql = "WITH scores AS (SELECT user_id, COUNT(*) AS call_volume FROM vocalytics.calls WHERE analyzed_at >= date_trunc('month', CURRENT_DATE) GROUP BY user_id) SELECT user_id, RANK() OVER (ORDER BY call_volume DESC) AS rank FROM scores WHERE user_id = :agent_id";
//     const result = await executeQuery(sql, { agent_id: agentId });
//     return result.data?.[0]?.rank || 0;
//   },
  
//   getSentimentDistribution: async (agentId: string) => {
//     const sql = "SELECT overall_sentiment, COUNT(*) FROM vocalytics.call_sentiments JOIN vocalytics.calls USING (call_id) WHERE user_id = :agent_id AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days' GROUP BY overall_sentiment";
//     const result = await executeQuery("Pie Chart", { agent_id: agentId });
//     return result.data || [];
//   },
  
//   getCallsByTag: async (agentId: string) => {
//     const sql = "SELECT tag, COUNT(*) FROM (SELECT jsonb_array_elements_text(conversation_tags) AS tag FROM vocalytics.call_sentiments JOIN vocalytics.calls USING (call_id) WHERE user_id = :agent_id) t GROUP BY tag";
//     const result = await executeQuery("Call Count by Tag", { agent_id: agentId });
//     return result.data || [];
//   },
  
//   getRecentEscalations: async (agentId: string) => {
//     const sql = "SELECT e.call_id, e.escalation_reason, e.possible_action, e.escalated_at FROM vocalytics.escalations e WHERE agent_id = :agent_id ORDER BY escalated_at DESC LIMIT 5";
//     const result = await executeQuery("Escalations", { agent_id: agentId });
//     return result.data || [];
//   },
  
//   getRecentCalls: async (agentId: string) => {
//     const sql = "SELECT c.call_id, c.duration_sec, c.language, cs.overall_sentiment, cs.analyzed_at FROM vocalytics.calls c JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id WHERE c.user_id = :agent_id ORDER BY cs.analyzed_at DESC LIMIT 10";
//     const result = await executeQuery("Recent Calls", { agent_id: agentId });
//     return {
//       data: [
//         { call_id: "C123", duration_sec: 240, language: "English", overall_sentiment: "positive", analyzed_at: "2023-05-01 14:23:45" },
//         { call_id: "C124", duration_sec: 180, language: "English", overall_sentiment: "neutral", analyzed_at: "2023-05-02 10:15:30" },
//         { call_id: "C125", duration_sec: 360, language: "Spanish", overall_sentiment: "negative", analyzed_at: "2023-05-03 16:45:20" },
//         { call_id: "C126", duration_sec: 120, language: "English", overall_sentiment: "positive", analyzed_at: "2023-05-04 09:30:15" },
//         { call_id: "C127", duration_sec: 300, language: "English", overall_sentiment: "positive", analyzed_at: "2023-05-05 11:20:05" }
//       ]
//     }.data;
//   }
// };

// export const supervisorApi = {
//   getCallsToday: async (supervisorId: string) => {
//     const sql = "SELECT COUNT(*) FROM vocalytics.calls WHERE user_id IN (SELECT user_id FROM vocalytics.users WHERE supervisor_id = :supervisor_id) AND DATE(analyzed_at) = CURRENT_DATE";
//     const result = await executeQuery(sql, { supervisor_id: supervisorId });
//     return result.data?.[0]?.count || 0;
//   },
  
//   getWeeklyVolume: async (supervisorId: string) => {
//     const sql = "SELECT COUNT(*) FROM vocalytics.calls WHERE user_id IN (SELECT user_id FROM vocalytics.users WHERE supervisor_id = :supervisor_id) AND analyzed_at >= CURRENT_DATE - INTERVAL '7 days'";
//     const result = await executeQuery(sql, { supervisor_id: supervisorId });
//     return result.data?.[0]?.count || 0;
//   },
  
//   getMonthlyEscalations: async (supervisorId: string) => {
//     const sql = "SELECT COUNT(*) FROM vocalytics.escalations WHERE supervisor_id = :supervisor_id AND escalated_at >= date_trunc('month', CURRENT_DATE)";
//     const result = await executeQuery("Monthly Escalations", { supervisor_id: supervisorId });
//     return result.data?.[0]?.count || 0;
//   },
  
//   getAgentPerformance: async (supervisorId: string) => {
//     const sql = "SELECT u.name, COUNT(c.call_id) as call_count, SUM(CASE WHEN cs.overall_sentiment = 'positive' THEN 1 ELSE 0 END) as positive_calls, SUM(CASE WHEN cs.overall_sentiment = 'negative' THEN 1 ELSE 0 END) as negative_calls FROM vocalytics.users u LEFT JOIN vocalytics.calls c ON u.user_id = c.user_id LEFT JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id WHERE u.supervisor_id = :supervisor_id GROUP BY u.name";
//     const result = await executeQuery("Agent-wise Performance", { supervisor_id: supervisorId });
//     return result.data || [];
//   },
  
//   getTagSentimentHeatmap: async (supervisorId: string) => {
//     const sql = "SELECT tag, overall_sentiment, COUNT(*) FROM (SELECT jsonb_array_elements_text(conversation_tags) AS tag, overall_sentiment FROM vocalytics.call_sentiments JOIN vocalytics.calls USING (call_id) WHERE user_id IN (SELECT user_id FROM vocalytics.users WHERE supervisor_id = :supervisor_id)) AS t GROUP BY tag, overall_sentiment";
//     const result = await executeQuery("Tag-Sentiment Heatmap", { supervisor_id: supervisorId });
//     return result.data || [];
//   },
  
//   getTeamSentiment: async (supervisorId: string) => {
//     const sql = "SELECT overall_sentiment, COUNT(*) FROM vocalytics.call_sentiments JOIN vocalytics.calls USING (call_id) WHERE user_id IN (SELECT user_id FROM vocalytics.users WHERE supervisor_id = :supervisor_id) GROUP BY overall_sentiment";
//     const result = await executeQuery("Pie Chart", { supervisor_id: supervisorId });
//     return result.data || [];
//   },
  
//   getEscalations: async (supervisorId: string) => {
//     const sql = "SELECT e.call_id, u.name, e.escalation_reason, e.possible_action, e.escalated_at FROM vocalytics.escalations e JOIN vocalytics.users u ON e.agent_id = u.user_id WHERE supervisor_id = :supervisor_id";
//     const result = await executeQuery("Escalations", { supervisor_id: supervisorId });
//     return result.data || [];
//   },
  
//   compareAgents: async (agent1Id: string, agent2Id: string) => {
//     const sql = "SELECT u.name, COUNT(c.call_id) as call_count, AVG(cs.sentiment_score) as avg_sentiment, SUM(CASE WHEN cs.overall_sentiment = 'negative' THEN 1 ELSE 0 END) as negative_calls FROM vocalytics.users u LEFT JOIN vocalytics.calls c ON u.user_id = c.user_id LEFT JOIN vocalytics.call_sentiments cs ON c.call_id = cs.call_id WHERE u.user_id IN (:id1, :id2) GROUP BY u.name";
//     const result = await executeQuery("Compare Agents", { id1: agent1Id, id2: agent2Id });
//     return result.data || [];
//   }
// };

// export const businessApi = {
//   getCallCountByTag: async () => {
//     const sql = "SELECT tag, COUNT(*) FROM (SELECT jsonb_array_elements_text(conversation_tags) AS tag FROM vocalytics.call_sentiments) t GROUP BY tag";
//     const result = await executeQuery("Call Count by Tag");
//     return result.data || [];
//   },
  
//   getSentimentByTag: async () => {
//     const sql = "SELECT tag, overall_sentiment, COUNT(*) FROM (SELECT jsonb_array_elements_text(conversation_tags) AS tag, overall_sentiment FROM vocalytics.call_sentiments) t GROUP BY tag, overall_sentiment";
//     const result = await executeQuery("Sentiment by Tag");
//     return result.data || [];
//   },
  
//   getEscalationByTag: async () => {
//     const sql = "SELECT tag, COUNT(*) FROM (SELECT jsonb_array_elements_text(cs.conversation_tags) AS tag FROM vocalytics.call_sentiments cs JOIN vocalytics.escalations e ON cs.call_id = e.call_id) t GROUP BY tag";
//     const result = await executeQuery("Escalation by Tag");
//     return result.data || [];
//   }
// };
