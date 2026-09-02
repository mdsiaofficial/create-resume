export interface PersonalInfo {
  fullName: string;
  nickname?: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  titles?: string[];
}

export interface Experience {
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

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  gpa?: string;
  honors?: string;
  coursework?: string[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  logo?: string;
  certificate?: string;
}

export interface Project {
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
}

export interface RealWorldProject extends Project {
  deployment?: string;
  architecture?: string;
}

export interface Achievement {
  title: string;
  issuer?: string;
  date?: string;
  location?: string;
  description?: string;
  logo?: string;
  certificate?: string;
  icon?: string;
}

export interface VolunteerExperience {
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  website?: string;
  image?: string;
}

export interface Publication {
  title: string;
  publisher?: string;
  date?: string;
  link?: string;
  description?: string;
}

export interface ProfessionalAffiliation {
  organization: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  website?: string;
}

export interface LanguageProficiency {
  language: string;
  proficiency?: string;
}

export interface Reference {
  name: string;
  relationship?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface CustomSectionItem {
  title: string;
  description?: string;
  date?: string;
  location?: string;
}

export interface CustomSection {
  heading: string;
  items: CustomSectionItem[];
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  medium?: string;
  email?: string;
  leetcode?: string;
  codeforces?: string;
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: SkillGroup[];
  certifications?: Certification[];
  projects?: Project[];
  realWorldProjects?: RealWorldProject[];
  achievements?: Achievement[];
  volunteerExperience?: VolunteerExperience[];
  publications?: Publication[];
  professionalAffiliations?: ProfessionalAffiliation[];
  languages?: LanguageProficiency[];
  references?: Reference[];
  customSections?: CustomSection[];
  socialLinks?: SocialLinks;
}
