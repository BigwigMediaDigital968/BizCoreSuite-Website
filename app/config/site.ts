/**
 * Bizcore Suite — Global Site Copy, Navigation & Business Configurations
 * High-impact, concise SaaS copy matching the BOL7 rhythm in Dark Blue.
 */

export const siteConfig = {
  name: "Bizcore Suite",
  tagline: "AI-POWERED HRM + CRM PLATFORM",
  domain: "bizcoresuite.com",
  contact: {
    email: "contact@bizcoresuite.com",
    salesEmail: "sales@bizcoresuite.com",
    supportEmail: "support@bizcoresuite.com",
    phone: "+1 (800) 845-2490",
    intlPhone: "+44 20 7946 0920",
    address: "One Market Plaza, Suite 2400, San Francisco, CA 94105",
    whatsapp: "+18008452490",
    demoUrl: "#final-cta",
    loginUrl: "https://app.bizcoresuite.com/login",
  },
  
  // Links target scenes by id; the link is highlighted while the active scene is
  // within [activeFrom … activeTo] (scene ids, inclusive).
  navLinks: [
    { label: "Home", sceneId: "hero", activeFrom: "hero", activeTo: "impact" },
    { label: "Roles", sceneId: "roles", activeFrom: "roles", activeTo: "roles" },
        { label: "Modules", sceneId: "mod-branch", activeFrom: "mod-branch", activeTo: "mod-activity" },

    { label: "Pricing", sceneId: "pricing", activeFrom: "pricing", activeTo: "pricing-matrix" },
    { label: "Contact", sceneId: "final-cta", activeFrom: "final-cta", activeTo: "final-cta" },
  ],

  pricing: {
    badge: "TRANSPARENT VALUE PRICING",
    headingLead: "Predictable Investment.",
    headingHighlight: "Infinite Scalability.",
    subheading:
      "No hidden fees. Pick the plan that fits your current operational scale, and upgrade as your branches multiply.",
    subheadingShort: "No hidden fees. Start where you are, upgrade as your branches multiply.",
    annualDiscountLabel: "SAVE 20%",
    plans: [
      {
        id: "starter",
        name: "Starter Suite",
        desc: "Essential HRM & CRM capabilities for emerging businesses up to 25 staff members.",
        tagline: "For small teams getting organised.",
        priceMonthly: 36,
        priceAnnual: 29,
        features: [
          "Up to 25 Active User Seats",
          "Lead Ingestion & Visual Sales Funnels",
          "Mobile GPS Geofence & Selfie Punch",
          "Basic Leave & Holiday Calendars",
          "Email & WhatsApp Alerts",
          "Standard Email & Community Support",
        ],
        cta: "Start 14-Day Free Trial",
        popular: false,
      },
      {
        id: "growth",
        name: "Growth Suite",
        desc: "The all-in-one powerhouse for scaling mid-market teams with automated payroll & CRM.",
        tagline: "Everything a growing multi-branch team needs.",
        priceMonthly: 99,
        priceAnnual: 79,
        features: [
          "Up to 100 Active User Seats",
          "All 10 Core Modules (HRM + CRM)",
          "1-Click Automated Statutory Payroll & Payslips",
          "Official WhatsApp Business API Integration",
          "Aadhaar e-Sign & Document Vault",
          "Granular Role-Based Permissions (RBAC)",
          "Priority 24/7 Human + AI Live Support",
          "Custom Webhooks & REST API Access",
        ],
        cta: "Claim Growth Plan Demo",
        popular: true,
      },
      {
        id: "enterprise",
        name: "Enterprise Scale",
        desc: "Maximum security, custom integrations, white-labeling, and dedicated SLAs.",
        tagline: "Security, control and SLAs at scale.",
        priceMonthly: 249,
        priceAnnual: 199,
        features: [
          "Unlimited User Seats & Multi-Branch Hubs",
          "Complete White-Labeling & Custom Domain",
          "Dedicated Cloud Instance / On-Prem Option",
          "Custom Biometric Hardware Gateway Sync",
          "Dedicated Solutions Architect & Migration",
          "99.99% Tier-4 Uptime SLA Guarantee",
          "Custom Legal & InfoSec Audit Packages",
        ],
        cta: "Speak to Enterprise Sales",
        popular: false,
      },
    ],
    matrix: {
      heading: "Comprehensive Feature Matrix Across Tiers",
      // true = included, false = not included, string = value shown in the cell
      rows: [
        { capability: "Lead Ingestion (Meta, Google, Forms)", starter: true, growth: true, enterprise: true },
        { capability: "WhatsApp Business API Rep Inbox", starter: false, growth: true, enterprise: true },
        { capability: "GPS Geofencing & Anti-Spoof Punch", starter: true, growth: true, enterprise: true },
        { capability: "1-Click Automated Statutory Payroll", starter: false, growth: true, enterprise: true },
        { capability: "Direct Corporate Bank NEFT API Sync", starter: false, growth: true, enterprise: true },
        { capability: "White-labeling & Custom Domain", starter: false, growth: false, enterprise: true },
        { capability: "Dedicated Account Manager & SLA", starter: false, growth: "Standard", enterprise: "15-min SLA" },
      ] as { capability: string; starter: boolean | string; growth: boolean | string; enterprise: boolean | string }[],
    },
  },

  hero: {
    badge: "AI-POWERED HRM + CRM PLATFORM",
    headlineLine1: "One Suite.",
    headlineLine2: "Infinite Control.",
    subtext: "Unify your people, sales, payroll and performance in one intelligent workspace — manage every branch, every role, every day.",
    primaryCta: "Explore Suite",
    secondaryCta: "View Presentation",
    floatingChips: [
      { id: "hrm", label: "HRM", icon: "Users" },
      { id: "crm", label: "CRM", icon: "Flame" },
      { id: "payroll", label: "Payroll", icon: "DollarSign" },
      { id: "attendance", label: "Attendance", icon: "Clock" },
      { id: "leads", label: "Leads", icon: "Zap" },
      { id: "analytics", label: "Analytics", icon: "BarChart3" },
      { id: "branches", label: "Branches", icon: "Building2" },
    ],
    statBadges: [
      { label: "Conversion", value: "+247%", sub: "conversion rate", icon: "TrendingUp" },
      { label: "Employees", value: "48.2K+", sub: "active employees", icon: "ShieldCheck" },
      { label: "Performance", value: "Real-Time", sub: "live telemetry", icon: "Activity" },
      { label: "Automations", value: "AI Active", sub: "24,500 tasks / day", icon: "Cpu" },
    ]
  },

  trustedBy: {
    heading: "Trusted by Fast-Growing Businesses",
    subheading: "500+ businesses run their HR and sales on Bizcore Suite",
    clientAvatars: [
      { name: "Sarah Jenkins", role: "VP People", company: "ApexCorp", avatar: "/placeholders/avatars/avatar-1.svg", rating: 5 },
      { name: "David Chen", role: "CRO", company: "CloudNest", avatar: "/placeholders/avatars/avatar-2.svg", rating: 5 },
      { name: "Amina Al-Mansoor", role: "MD", company: "GulfTech", avatar: "/placeholders/avatars/avatar-3.svg", rating: 5 },
    ],
    reviewBadge: "4.9 / 5.0 Average Rating across 1,200+ Verified Enterprise Reviews"
  },

  impactStats: [
    { value: 500, suffix: "+", label: "Businesses", desc: "Powered across 12 countries", icon: "Building2" },
    { value: 50, suffix: "K+", label: "Employees", desc: "Managed with zero error", icon: "Users2" },
    { value: 99.9, suffix: "%", label: "Uptime SLA", desc: "Guaranteed high availability", icon: "Shield" },
    { value: 10, suffix: "X", label: "Faster Operations", desc: "Instant payroll & routing", icon: "Zap" },
    { value: 24, suffix: "/7", label: "Support", desc: "Dedicated account response", icon: "Headphones" },
    { value: 100, suffix: "+", label: "Integrations", desc: "Slack, WhatsApp, Stripe", icon: "Boxes" },
  ],

  roles: [
    {
      id: "head",
      tabLabel: "HEAD",
      title: "Company-wide view, all branches, reports.",
      chips: ["Cross-branch revenue", "1-Click approvals", "Strategic BI reports"],
      image: {
        src: "/placeholders/features/head-dashboard.png",
        alt: "Executive Head & Founder Dashboard - Consolidated Branch Analytics and Approvals",
      },
    },
    {
      id: "admin",
      tabLabel: "ADMIN",
      title: "Users, permissions, branches, logs.",
      chips: ["RBAC permission tree", "Statutory tax rules", "Immutable audit vault"],
      image: {
        src: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&h=750&q=80",
        alt: "System Administrator Portal - RBAC Governance, Branch Setup and Audit Security",
      },
    },
    {
      id: "manager",
      tabLabel: "MANAGER",
      title: "Team attendance, approvals, tasks.",
      chips: ["Live team attendance", "Leave approvals", "Kanban task velocity"],
      image: {
        src: "/placeholders/features/manager-dashboard.png",
        alt: "Department Manager View - Live Attendance Radar, Shift Swaps and Kanban Task Board",
      },
    },
    {
      id: "employee",
      tabLabel: "EMPLOYEE",
      title: "Check-in, leave, tasks, payslips.",
      chips: ["1-Tap mobile clock-in", "Leave balance tracker", "Instant payslips"],
      image: {
        src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&h=750&q=80",
        alt: "Employee Self-Service Portal - Mobile Clock-in, Leave Balances and Instant Payslips",
      },
    }
  ],

  overview: {
    heading: "Everything connected. Nothing missed.",
    subheading: "All 10 modules synchronize in real time under one unified intelligent database."
  },

  comparison: {
    heading: "The Transformation",
    without: {
      title: "Without Bizcore",
      points: [
        "Disconnected spreadsheets with calculation errors",
        "Dropped leads from manual WhatsApp handoffs",
        "Attendance fraud and buddy-punching disputes",
        "Zero audit trail when sensitive payroll leaks"
      ]
    },
    with: {
      title: "With Bizcore Suite",
      points: [
        "Automated payroll in 3 minutes with zero error",
        "Instant lead routing boosting conversions by 247%",
        "GPS geofenced attendance eliminating time theft",
        "Immutable bank-grade audit logs protecting data"
      ]
    }
  },

  security: {
    badge: "ENTERPRISE SECURITY",
    heading: "Engineered for Complete Trust",
    subheading: "Military-grade encryption and strict governance protecting every record.",
    cards: [
      { title: "Role-Based Access", desc: "Granular least-privilege policies isolating branch data.", icon: "UserCheck" },
      { title: "AES-256 Encryption", desc: "Data encrypted at rest and TLS 1.3 in transit.", icon: "Lock" },
      { title: "Activity Logs", desc: "Write-once tamper-resistant audit vault for compliance.", icon: "FileCheck" },
      { title: "Daily Backups", desc: "Hourly geo-redundant snapshots with instant failover.", icon: "Database" },
    ]
  },

  testimonials: [
    {
      name: "Marcus Vance",
      company: "AeroVanguard Logistics (420 Staff)",
      avatar: "/placeholders/avatars/avatar-1.svg",
      resultBadge: "Cut Payroll Time by 72%",
      quote: "Running payroll across 6 hubs took 4 days. With Bizcore Suite, we run 420 payslips in under 10 minutes with zero errors.",
      stars: 5
    },
    {
      name: "Priya Nair",
      company: "OmniHealth Labs (18 Branches)",
      avatar: "/placeholders/avatars/avatar-2.svg",
      resultBadge: "+180% Lead Response",
      quote: "Connecting clinic walk-ins with field staff was chaos. With Bizcore, our patient conversion jumped 38% in the first quarter.",
      stars: 5
    },
    {
      name: "Carlos Rivera",
      company: "FinScale Technologies",
      avatar: "/placeholders/avatars/avatar-3.svg",
      resultBadge: "Replaced 5 Tools",
      quote: "We replaced BambooHR, Pipedrive, and Slack bots with one unified suite. Staff love it and onboarding takes one afternoon.",
      stars: 5
    }
  ],

  finalCta: {
    heading: "Ready to run every branch from one suite?",
    subheading: "Join 500+ forward-thinking organizations that unified their people and pipeline.",
    footerText: "© 2026 Bizcore Suite Inc. All rights reserved. The AI-Powered HRM + CRM Platform."
  }
};
