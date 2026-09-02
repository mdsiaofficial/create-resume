import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import { masterData } from "./data";
import type {
  MasterData,
  Experience,
  Education,
  Certification,
  Project,
  Achievement,
  VolunteerExperience,
  LanguageProficiency,
  SocialLinks,
  CustomSection,
  SkillGroup,
} from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_FILE = path.join(__dirname, "template.html");
const OUTPUT_FILE = path.join(__dirname, "resume.pdf");

function transformToResumeContent(data: MasterData) {
  const skillGroups: SkillGroup[] = [
    "languages",
    "frontend",
    "backend",
    "databases",
    "devops",
    "tools",
    "design",
    "competitiveProgramming",
  ].map((category) => ({
    category,
    skills: data.skills
      .filter((s) => s.show_resume && s.category === category)
      .map((s) => s.name),
  })).filter((g) => g.skills.length > 0);

  return {
    personalInfo: data.personalInfo,
    summary: data.summary_resume,
    experience: data.experience.filter((e) => e.show_resume),
    education: data.education.filter((e) => e.show_resume),
    skills: skillGroups,
    certifications: data.certifications?.filter((c) => c.show_resume),
    projects: data.projects.filter((p) => p.show_resume),
    achievements: data.achievements.filter((a) => a.show_resume),
    volunteerExperience: data.volunteerExperience.filter((v) => v.show_resume),
    languages: data.languages?.filter((l) => l.show_resume),
    customSections: data.customSections?.filter((c) => c.show_resume),
    socialLinks: data.socialLinks,
  };
}

function escapeHtml(str: string | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function registerHandlebarsHelpers() {
  Handlebars.registerHelper("if", function (this: unknown, cond: boolean, options: { fn: (ctx: unknown) => string }) {
    return cond ? options.fn(this) : "";
  });

  Handlebars.registerHelper("each", function (this: unknown, arr: unknown[], options: { fn: (ctx: unknown, idx: number) => string }) {
    if (!arr || !Array.isArray(arr)) return "";
    return arr.map((item, idx) => options.fn(item, idx)).join("");
  });

  Handlebars.registerHelper("unless", function (this: unknown, cond: boolean, options: { fn: (ctx: unknown) => string }) {
    return !cond ? options.fn(this) : "";
  });

  Handlebars.registerHelper("last", function (this: number, arrLen: number) {
    return this === arrLen - 1;
  });
}

async function main() {
  registerHandlebarsHelpers();

  const data = transformToResumeContent(masterData);
  const template = fs.readFileSync(TEMPLATE_FILE, "utf-8");

  const compiledTemplate = Handlebars.compile(template, { strict: true });

  const html = compiledTemplate({
    FULL_NAME: escapeHtml(data.personalInfo.fullName),
    EMAIL: escapeHtml(data.personalInfo.email),
    PHONE: escapeHtml(data.personalInfo.phone),
    LOCATION: escapeHtml(data.personalInfo.location),
    WEBSITE: escapeHtml(data.personalInfo.website),
    GITHUB: escapeHtml(data.personalInfo.github),
    LINKEDIN: escapeHtml(data.personalInfo.linkedin),
    SUMMARY: escapeHtml(data.summary),
    EDUCATION: data.education,
    SKILLS: data.skills,
    EXPERIENCE: data.experience,
    PROJECTS: data.projects,
    CERTIFICATIONS: data.certifications,
    ACHIEVEMENTS: data.achievements,
    VOLUNTEER: data.volunteerExperience,
    LANGUAGES: data.languages,
    CUSTOM_SECTIONS: data.customSections,
    SOCIAL_LINKS: data.socialLinks,
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "load" });

  await page.pdf({
    path: OUTPUT_FILE,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "14mm", bottom: "12mm", left: "14mm" },
  });

  await browser.close();
  console.log(`Resume PDF generated: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
