const currencyToNumber = (value) => {
  const cleaned = String(value || "")
    .replace(/[^0-9.]/g, "")
    .trim();

  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const buildDashboardPayload = ({ role, fullName, template, roleDetails = {} }) => {
  const stats = template?.stats || [];
  const commitmentPortfolio = template?.commitmentPortfolio || [];
  const investmentPortfolio = template?.investmentPortfolio || [];

  const base = {
    title: `${String(role).charAt(0).toUpperCase() + String(role).slice(1)} Dashboard`,
    kpis: stats.map((item, index) => ({
      key: `kpi_${index + 1}`,
      title: item.title,
      value: item.value,
      color: item.color,
      trend: "stable",
    })),
    tables: {
      commitmentPortfolio,
      investmentPortfolio,
    },
    filters: {
      timeRange: "30d",
      segment: "all",
    },
    widgetsData: {
      welcome: {
        greeting: `Welcome back, ${fullName}`,
      },
    },
    layout: [
      { widgetId: "kpi_grid", x: 0, y: 0, w: 12, h: 2, visible: true },
      { widgetId: "portfolio_commitment", x: 0, y: 2, w: 6, h: 4, visible: true },
      { widgetId: "portfolio_investment", x: 6, y: 2, w: 6, h: 4, visible: true },
    ],
    roleConfig: {},
  };

  if (role === "investor") {
    const totalInvestment = currencyToNumber(stats?.[0]?.value);
    const fiveYearGoal = currencyToNumber(stats?.[1]?.value);
    const goalProgress = Number(String(stats?.[2]?.value || "0").replace(/[^0-9.]/g, "")) || 0;
    const startupsInvested = Number(String(stats?.[3]?.value || "0").replace(/[^0-9]/g, "")) || 0;

    return {
      ...base,
      roleConfig: {
        totalInvestment,
        fiveYearGoal,
        goalProgress,
        startupsInvested,
        riskSpread: { high: 1, medium: 1, low: 1 },
      },
    };
  }

  if (role === "founder") {
    const fundingTarget = currencyToNumber(stats?.[2]?.value);
    const raisedAmount = currencyToNumber(stats?.[3]?.value);
    const investorLeads = Number(String(stats?.[1]?.value || "0").replace(/[^0-9]/g, "")) || 0;

    // Use user's actual startup name from roleDetails
    const startupName = roleDetails?.startupName || "Your Startup";
    const startupStage = roleDetails?.startupStage || "mvp";
    const teamSize = roleDetails?.teamSize || 1;
    const website = roleDetails?.startupWebsite || "";

    // Update commitment portfolio to show user's startup
    const customPortfolio = [{
      startupName,
      investment: raisedAmount > 0 ? `INR ${raisedAmount.toLocaleString()}` : "INR 0",
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    }];

    return {
      ...base,
      tables: {
        commitmentPortfolio: customPortfolio,
        investmentPortfolio: base.tables.investmentPortfolio,
      },
      roleConfig: {
        fundingTarget,
        raisedAmount,
        investorLeads,
        startupStage,
        startupName,
        teamSize,
        website,
      },
    };
  }

  const communitiesJoined = Number(String(stats?.[1]?.value || "0").replace(/[^0-9]/g, "")) || 0;
  const mentorSessions = Number(String(stats?.[2]?.value || "0").replace(/[^0-9]/g, "")) || 0;
  const savedOpportunities = Number(String(stats?.[3]?.value || "0").replace(/[^0-9]/g, "")) || 0;
  const profileCompletion = Number(String(stats?.[0]?.value || "0").replace(/[^0-9]/g, "")) || 0;

  return {
    ...base,
    roleConfig: {
      communitiesJoined,
      mentorSessions,
      savedOpportunities,
      profileCompletion,
    },
  };
};
