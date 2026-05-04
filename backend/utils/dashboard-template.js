export const getDashboardTemplate = (role) => {
  if (role === "investor") {
    return {
      stats: [
        { title: "Total Angel Investment", value: "INR 2,50,000", color: "blue" },
        { title: "5 Years Investment Goal", value: "INR 25,00,000", color: "green" },
        { title: "Goal Progress", value: "10%", color: "purple" },
        { title: "Startups Invested", value: "3", color: "amber" },
      ],
      commitmentPortfolio: [
        { startupName: "AgriAI Labs", investment: "INR 1,00,000", date: "12 Mar 2026" },
        { startupName: "HealthGrid", investment: "INR 75,000", date: "28 Mar 2026" },
      ],
      investmentPortfolio: [
        { startupName: "EduSpark", investment: "INR 75,000", date: "06 Apr 2026" },
      ],
    };
  }

  if (role === "founder") {
    return {
      stats: [
        { title: "Pitch Views", value: "128", color: "blue" },
        { title: "Interested Investors", value: "9", color: "green" },
        { title: "Funding Target", value: "INR 40,00,000", color: "purple" },
        { title: "Raised So Far", value: "INR 4,00,000", color: "amber" },
      ],
      commitmentPortfolio: [
        { startupName: "Your Startup", investment: "INR 4,00,000", date: "15 Apr 2026" },
      ],
      investmentPortfolio: [],
    };
  }

  return {
    stats: [
      { title: "Profile Completion", value: "70%", color: "blue" },
      { title: "Communities Joined", value: "4", color: "green" },
      { title: "Mentor Sessions", value: "2", color: "purple" },
      { title: "Saved Opportunities", value: "7", color: "amber" },
    ],
    commitmentPortfolio: [],
    investmentPortfolio: [],
  };
};
