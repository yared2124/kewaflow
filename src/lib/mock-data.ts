export interface AdminUser {
  name: string;
  role: string;
  avatarUrl: string;
  email: string;
}

export interface ConnectedPage {
  name: string;
  status: "Connected" | "Disconnected" | "Reauth Needed";
  platform: string;
}

export interface KpiMetric {
  id: string;
  title: string;
  count: number;
  subtitle: string;
  iconName: "drafts" | "approval" | "scheduled" | "leads";
}

export interface ReviewPost {
  id: string;
  platform: string;
  timeAgo: string;
  statusText: string;
  statusType: "awaiting" | "ready";
  title: string;
  body: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCta: string;
  bannerImage: string;
}

export interface ScheduleItem {
  day: string;
  date: string;
  topic: string;
}

export interface FollowUpLead {
  id: string;
  name: string;
  company: string;
  initials: string;
  tag: string;
  tagColor: "amber" | "peach" | "emerald";
  dueDate: string;
}

export interface ActivityItem {
  id: string;
  timeAgo: string;
  action: string;
  actionIcon: "approval" | "lead" | "published";
  details: string;
  status: "Pending" | "Approved" | "New" | "Published";
  statusColor: "amber" | "emerald" | "cyan" | "teal";
}

export const MOCK_ADMIN_USER: AdminUser = {
  name: "Yared Aregayehu",
  role: "Admin",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  email: "admin@kewakibt.com",
};

export const MOCK_CONNECTED_PAGE: ConnectedPage = {
  name: "Kewakibt Software Solutions",
  status: "Connected",
  platform: "Facebook Page",
};

export const MOCK_KPI_METRICS: KpiMetric[] = [
  {
    id: "drafts",
    title: "Drafts",
    count: 8,
    subtitle: "AI-generated content waiting for your review",
    iconName: "drafts",
  },
  {
    id: "awaiting",
    title: "Awaiting approval",
    count: 3,
    subtitle: "Content ready for final review",
    iconName: "approval",
  },
  {
    id: "scheduled",
    title: "Scheduled",
    count: 5,
    subtitle: "Posts set for automatic publishing",
    iconName: "scheduled",
  },
  {
    id: "leads",
    title: "Leads this month",
    count: 12,
    subtitle: "New inquiries from your content",
    iconName: "leads",
  },
];

export const MOCK_REVIEW_POSTS: ReviewPost[] = [
  {
    id: "post-1",
    platform: "Facebook Post",
    timeAgo: "2 hours ago",
    statusText: "Awaiting approval",
    statusType: "awaiting",
    title: "Custom Software Development",
    body: "Turn your ideas into powerful digital solutions. We build scalable, secure and user-friendly software tailored to your business needs.",
    bannerTitle: "Custom Software Development",
    bannerSubtitle: "Web • Mobile • Cloud",
    bannerCta: "Let's Build Together →",
    bannerImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "post-2",
    platform: "Facebook Post",
    timeAgo: "5 hours ago",
    statusText: "Ready for review",
    statusType: "ready",
    title: "Business Process Automation",
    body: "Streamline your operations, reduce manual work, and increase productivity with intelligent automation solutions.",
    bannerTitle: "Automate Your Business Processes",
    bannerSubtitle: "Save Time • Reduce Errors • Grow Faster",
    bannerCta: "Learn More →",
    bannerImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
  },
];

export const MOCK_WEEKLY_SCHEDULE: ScheduleItem[] = [
  { day: "Mon", date: "Oct 13", topic: "Brand awareness post" },
  { day: "Tue", date: "Oct 14", topic: "Service highlight" },
  { day: "Wed", date: "Oct 15", topic: "Client success story" },
  { day: "Thu", date: "Oct 16", topic: "Educational post" },
  { day: "Fri", date: "Oct 17", topic: "Company update" },
];

export const MOCK_FOLLOW_UP_LEADS: FollowUpLead[] = [
  {
    id: "lead-1",
    name: "Abebe S.",
    company: "TechNova Solutions",
    initials: "AS",
    tag: "Follow up",
    tagColor: "amber",
    dueDate: "Today",
  },
  {
    id: "lead-2",
    name: "Dawit B.",
    company: "Global Trade PLC",
    initials: "DB",
    tag: "Proposal",
    tagColor: "peach",
    dueDate: "Tomorrow",
  },
  {
    id: "lead-3",
    name: "Mekdes S.",
    company: "Sunrise Logistics",
    initials: "MS",
    tag: "Follow up",
    tagColor: "amber",
    dueDate: "16 Oct",
  },
  {
    id: "lead-4",
    name: "Tsegaye G.",
    company: "FreshMart",
    initials: "TG",
    tag: "Interested",
    tagColor: "emerald",
    dueDate: "18 Oct",
  },
];

export const MOCK_RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    timeAgo: "2 hours ago",
    action: "Content approval",
    actionIcon: "approval",
    details: "Custom Software Development (Facebook Post)",
    status: "Pending",
    statusColor: "amber",
  },
  {
    id: "act-2",
    timeAgo: "5 hours ago",
    action: "Content approval",
    actionIcon: "approval",
    details: "Business Process Automation (Facebook Post)",
    status: "Approved",
    statusColor: "emerald",
  },
  {
    id: "act-3",
    timeAgo: "8 hours ago",
    action: "Lead captured",
    actionIcon: "lead",
    details: "From Facebook - TechNova Solutions",
    status: "New",
    statusColor: "cyan",
  },
  {
    id: "act-4",
    timeAgo: "12 hours ago",
    action: "Post published",
    actionIcon: "published",
    details: "Business Process Automation",
    status: "Published",
    statusColor: "teal",
  },
];
