export interface BaseItem {
  show_portfolio: boolean;
  show_resume: boolean;
}

export interface PersonalInfo extends BaseItem {
  fullName: string;
  nickname?: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  titles?: string[];
}

export interface Experience extends BaseItem {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
  technologies?: string[];
  website?: string;
  image?: string;
  impact?: string;
  isVolunteer?: boolean;
}

export interface Education extends BaseItem {
  institution: string;
  degree: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  gpa?: string;
  honors?: string;
  coursework?: string[];
}

export type SkillCategoryType =
  | "languages"
  | "frontend"
  | "backend"
  | "databases"
  | "devops"
  | "tools"
  | "design"
  | "competitiveProgramming";

export interface SkillCategoryMeta {
  title: string;
  subtitle: string;
  icon?: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export const SKILL_CATEGORY_META: Record<SkillCategoryType, SkillCategoryMeta> = {
  languages: {
    title: "Languages",
    subtitle: "Languages I use daily to build production systems",
  },
  frontend: {
    title: "Frontend",
    subtitle: "Frameworks, libraries, and UI tools for modern web interfaces",
  },
  backend: {
    title: "Backend",
    subtitle: "Server-side logic, APIs, and application architecture",
  },
  databases: {
    title: "Databases",
    subtitle: "Data persistence, modeling, and query optimization",
  },
  devops: {
    title: "DevOps & Cloud",
    subtitle: "Deployment, CI/CD, infrastructure, and cloud services",
  },
  tools: {
    title: "Developer Tools",
    subtitle: "Editors, AI assistants, and productivity workflows",
  },
  design: {
    title: "Design",
    subtitle: "Visual thinking and user-centered interface design",
  },
  competitiveProgramming: {
    title: "Competitive Programming",
    subtitle: "Algorithms, data structures, and contest strategy",
  },
};

export interface Skill extends BaseItem {
  name: string;
  category: SkillCategoryType;
  description?: string;
  projects?: string[];
  proficiencyLevel?: string;
  yearsOfExperience?: number;
}

export interface Certification extends BaseItem {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  logo?: string;
  certificate?: string;
}

export interface Project extends BaseItem {
  name: string;
  role?: string;
  bullets: string[];
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  link?: string;
  github?: string;
  image?: string;
  outcomes?: string;
  featured?: boolean;
  deployment?: string;
  architecture?: string;
}

export interface Achievement extends BaseItem {
  title: string;
  issuer?: string;
  date?: string;
  location?: string;
  description?: string;
  logo?: string;
  certificate?: string;
  icon?: string;
}

export interface VolunteerExperience extends BaseItem {
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  website?: string;
  image?: string;
}

export interface LanguageProficiency extends BaseItem {
  language: string;
  proficiency?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  medium?: string;
  email?: string;
  leetcode?: string;
  codeforces?: string;
}

export interface CustomSectionItem {
  title: string;
  description?: string;
  date?: string;
  location?: string;
}

export interface CustomSection extends BaseItem {
  heading: string;
  items: CustomSectionItem[];
}

export interface MasterData {
  personalInfo: PersonalInfo;
  summary_portfolio?: string;
  summary_resume?: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  achievements: Achievement[];
  volunteerExperience: VolunteerExperience[];
  languages: LanguageProficiency[];
  customSections?: CustomSection[];
  socialLinks?: SocialLinks;
}
