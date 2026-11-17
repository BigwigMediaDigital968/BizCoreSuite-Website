/**
 * Bizcore Suite — 10 Platform Modules Configuration
 * SHORT & BENEFIT-DRIVEN: Title, one-liner, and 3 short chips per module.
 */

export interface ModuleItem {
  id: string;
  number: string;
  title: string;
  oneLiner: string;
  chips: string[];
  /** Dashboard image shown in the module card — direct public URL (dummy stock photo; replace with a real screenshot). */
  image: { src: string; alt: string };
  stats: { label: string; value: string }[];
  transitionType: 'slide-up' | 'scale-blur' | 'clip-wipe' | 'horizontal' | 'rotate-in' | 'fade';
}

export const platformModules: ModuleItem[] = [
  {
    id: "branch",
    number: "01",
    title: "Branch Management",
    oneLiner: "Manage every branch from one place.",
    chips: ["Multi-branch sync", "Branch-wise staff", "Comparative reports"],
    image: {
      src: "/placeholders/features/branch-management.jpg",
      alt: "Multi-Branch Management Interface",
    },
    stats: [
      { label: "Active Branches", value: "14 Locations" },
      { label: "Sync Latency", value: "Real-Time 42ms" }
    ],
    transitionType: "slide-up"
  },
  {
    id: "employee",
    number: "02",
    title: "Employee Management",
    oneLiner: "Complete employee records, always organised.",
    chips: ["Digital profiles", "Document vault", "Department hierarchy"],
    image: {
      src: "/placeholders/features/employee-management.png",
      alt: "Employee Lifecycle Directory",
    },
    stats: [
      { label: "Active Staff", value: "48,240 Total" },
      { label: "Retention Rate", value: "98.4% Staff" }
    ],
    transitionType: "scale-blur"
  },
  {
    id: "attendance",
    number: "03",
    title: "Attendance Management",
    oneLiner: "Track presence in real time.",
    chips: ["1-Tap check-in/out", "GPS geo-fencing", "Shift rotas"],
    image: {
      src: "/placeholders/features/attendance-management.png",
      alt: "Smart Attendance Dashboard",
    },
    stats: [
      { label: "Daily Presence", value: "99.4% On-time" },
      { label: "Time Theft", value: "0 Cases" }
    ],
    transitionType: "clip-wipe"
  },
  {
    id: "salary",
    number: "04",
    title: "Salary Management",
    oneLiner: "Accurate payroll, on time.",
    chips: ["Salary structures", "Auto payslips", "Statutory deductions"],
    image: {
      src: "/placeholders/features/salery-management.png",
      alt: "Automated Payroll Panel",
    },
    stats: [
      { label: "Run Duration", value: "< 3 Minutes" },
      { label: "Error Rate", value: "0.00% Verified" }
    ],
    transitionType: "rotate-in"
  },
  {
    id: "leave",
    number: "05",
    title: "Leave Management",
    oneLiner: "Simple leave requests and approvals.",
    chips: ["Leave balance radar", "1-Click approvals", "Holiday calendar"],
    image: {
      src: "/placeholders/features/leave-management.png",
      alt: "Intelligent Leave Governance Calendar",
    },
    stats: [
      { label: "Avg Sign-off", value: "4.2 Minutes" },
      { label: "Conflict Guard", value: "100% Active" }
    ],
    transitionType: "horizontal"
  },
  {
    id: "task",
    number: "06",
    title: "Task Management",
    oneLiner: "Assign, track, deliver.",
    chips: ["Assign tasks", "Deadline alerts", "Visual status boards"],
    image: {
      src: "/placeholders/features/task-management.png",
      alt: "Task Management Kanban Board",
    },
    stats: [
      { label: "Tasks Done Today", value: "1,420 Completed" },
      { label: "Overdue Rate", value: "0% on SLA" }
    ],
    transitionType: "slide-up"
  },
  {
    id: "revenue",
    number: "07",
    title: "Revenue Management",
    oneLiner: "See what every branch earns.",
    chips: ["Revenue tracking", "Target benchmarks", "Collections forecast"],
    image: {
      src: "/placeholders/features/revenue-management.png",
      alt: "Revenue and Quota Intelligence Dashboard",
    },
    stats: [
      { label: "Q3 Target", value: "96.4% Achieved" },
      { label: "Commissions", value: "Auto-Calculated" }
    ],
    transitionType: "scale-blur"
  },
  {
    id: "lead",
    number: "08",
    title: "Lead Management",
    oneLiner: "Never lose a lead.",
    chips: ["Lead auto-capture", "Visual pipeline", "Instant follow-ups"],
    image: {
      src: "/placeholders/features/lead-management.png",
      alt: "Omnichannel CRM Lead Pipeline",
    },
    stats: [
      { label: "Lead Response", value: "45 Seconds" },
      { label: "Win Rate Lift", value: "+247% Growth" }
    ],
    transitionType: "clip-wipe"
  },
  {
    id: "analytics",
    number: "09",
    title: "Performance Analytics",
    oneLiner: "Decisions backed by data.",
    chips: ["Executive KPIs", "Team scorecards", "1-Click PDF reports"],
    image: {
      src: "/placeholders/features/performance-analytics.png",
      alt: "Executive Performance BI Heatmap",
    },
    stats: [
      { label: "Telemetry Feed", value: "2.4M Points" },
      { label: "Digest Delivery", value: "Daily 8 AM" }
    ],
    transitionType: "rotate-in"
  },
  {
    id: "activity-logs",
    number: "10",
    title: "Activity Logs Management",
    oneLiner: "Every action, fully recorded.",
    chips: ["Immutable audit trail", "Granular filters", "Forensic export"],
    image: {
      src: "/placeholders/features/logs-management.png",
      alt: "Tamper-Proof Audit Log Vault",
    },
    stats: [
      { label: "Audit Storage", value: "SOC2 WORM" },
      { label: "Search Speed", value: "< 120ms Query" }
    ],
    transitionType: "horizontal"
  }
];

