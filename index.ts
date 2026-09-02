import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import type {
  ResumeContent,
  Experience,
  Education,
  SkillGroup,
  Certification,
  Project,
  RealWorldProject,
  Achievement,
  VolunteerExperience,
  Publication,
  ProfessionalAffiliation,
  LanguageProficiency,
  Reference,
  CustomSection,
  SocialLinks,
} from "./resume.types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "resume-data.json");
const TEMPLATE_FILE = path.join(__dirname, "template.html");
const OUTPUT_FILE = path.join(__dirname, "resume.pdf");

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

function buildEducationHtml(education: Education[]): string {
  return education
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-row">
        <span class="entry-title">${escapeHtml(e.degree)}${e.field ? ` in ${escapeHtml(e.field)}` : ""}</span>
        <span class="entry-date">${e.startYear ?? ""}${e.endYear ? ` – ${e.endYear}` : ""}</span>
      </div>
      <div class="entry-sub">
        ${escapeHtml(e.institution)}
        ${e.gpa ? `<span class="dot">·</span>${escapeHtml(e.gpa)}` : ""}
        ${e.honors ? `<span class="dot">·</span>${escapeHtml(e.honors)}` : ""}
      </div>
      ${e.coursework ? `<div class="entry-tech">Relevant coursework: ${escapeHtml(e.coursework.join(", "))}</div>` : ""}
    </div>`
    )
    .join("");
}

function buildSkillsHtml(skills: SkillGroup[]): string {
  return `<div class="skills-grid">
    ${skills
      .map(
        (s) => `
      <div class="skill-row"><strong>${escapeHtml(s.category)}:</strong> ${escapeHtml(s.skills.join(", "))}</div>
    `
      )
      .join("")}
  </div>`;
}

function buildExperienceHtml(experience: Experience[]): string {
  return experience
    .map(
      (exp) => `
    <div class="entry">
      <div class="entry-row">
        <span class="entry-title">${escapeHtml(exp.title)}${exp.company ? ` — ${escapeHtml(exp.company)}` : ""}</span>
        <span class="entry-date">
          ${escapeHtml(exp.startDate)}${exp.endDate ? ` – ${escapeHtml(exp.endDate)}` : ""}${exp.current ? " – Present" : ""}
        </span>
      </div>
      ${exp.location ? `<div class="entry-sub">${escapeHtml(exp.location)}</div>` : ""}
      <ul class="bullets">
        ${exp.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n        ")}
      </ul>
      ${exp.technologies ? `<div class="tech-line"><strong>Technologies:</strong> ${escapeHtml(exp.technologies.join(", "))}</div>` : ""}
    </div>`
    )
    .join("");
}

function buildProjectsHtml(projects: Project[]): string {
  return projects
    .map(
      (p) => `
    <div class="entry">
      <div class="entry-row">
        <span class="entry-title">${escapeHtml(p.name)}${p.role ? ` — ${escapeHtml(p.role)}` : ""}</span>
        <span class="entry-date">
          ${p.startDate ? escapeHtml(p.startDate) : ""}${p.endDate ? ` – ${escapeHtml(p.endDate)}` : ""}
          ${p.link ? '<span class="live">Live</span>' : ""}
        </span>
      </div>
      <ul class="bullets">
        ${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n        ")}
      </ul>
      ${p.technologies ? `<div class="tech-line"><strong>Technologies:</strong> ${escapeHtml(p.technologies.join(", "))}</div>` : ""}
      ${p.outcomes ? `<div class="entry-tech"><strong>Outcomes:</strong> ${escapeHtml(p.outcomes)}</div>` : ""}
    </div>`
    )
    .join("");
}

function buildRealWorldProjectsHtml(projects: RealWorldProject[]): string {
  return projects
    .map(
      (p) => `
    <div class="entry">
      <div class="entry-row">
        <span class="entry-title">${escapeHtml(p.name)}${p.role ? ` — ${escapeHtml(p.role)}` : ""}</span>
        <span class="entry-date">
          ${p.startDate ? escapeHtml(p.startDate) : ""}${p.endDate ? ` – ${escapeHtml(p.endDate)}` : ""}
          ${p.link ? '<span class="live">Live</span>' : ""}
        </span>
      </div>
      <ul class="bullets">
        ${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n        ")}
      </ul>
      ${p.technologies ? `<div class="tech-line"><strong>Technologies:</strong> ${escapeHtml(p.technologies.join(", "))}</div>` : ""}
      ${p.deployment ? `<div class="entry-tech"><strong>Deployment:</strong> ${escapeHtml(p.deployment)}</div>` : ""}
      ${p.architecture ? `<div class="entry-tech"><strong>Architecture:</strong> ${escapeHtml(p.architecture)}</div>` : ""}
    </div>`
    )
    .join("");
}

function buildCertificationsHtml(certifications: Certification[]): string {
  return `<ul class="certs">
    ${certifications
      .map(
        (c) => `
      <li>
        <strong>${escapeHtml(c.name)}</strong> — ${escapeHtml(c.issuer)}${c.issueDate ? ` (${escapeHtml(c.issueDate)})` : ""}
        ${c.credentialId ? `<span class="dot">·</span>ID: ${escapeHtml(c.credentialId)}` : ""}
      </li>
    `
      )
      .join("\n    ")}
  </ul>`;
}

function buildAchievementsHtml(achievements: Achievement[]): string {
  return `<ul class="certs">
    ${achievements
      .map(
        (a) => `
      <li>
        <strong>${escapeHtml(a.title)}</strong>${a.issuer ? ` — ${escapeHtml(a.issuer)}` : ""}${a.date ? ` (${escapeHtml(a.date)})` : ""}
        ${a.description ? `<br>${escapeHtml(a.description)}` : ""}
      </li>
    `
      )
      .join("\n    ")}
  </ul>`;
}

function buildVolunteerHtml(volunteer: VolunteerExperience[]): string {
  return volunteer
    .map(
      (v) => `
    <div class="entry">
      <div class="entry-row">
        <span class="entry-title">${escapeHtml(v.role)}</span>
        <span class="entry-date">
          ${escapeHtml(v.startDate ?? "")}${v.endDate ? ` – ${escapeHtml(v.endDate)}` : ""}${v.current ? " – Present" : ""}
        </span>
      </div>
      <div class="entry-sub">${escapeHtml(v.organization)}</div>
      ${v.description ? `<p class="summary" style="margin-top:4px;font-size:12.5px;">${escapeHtml(v.description)}</p>` : ""}
    </div>`
    )
    .join("");
}

function buildPublicationsHtml(publications: Publication[]): string {
  return publications
    .map(
      (p) => `
    <div class="entry">
      <div class="entry-row">
        <span class="entry-title">${escapeHtml(p.title)}</span>
        ${p.date ? `<span class="entry-date">${escapeHtml(p.date)}</span>` : ""}
      </div>
      ${p.publisher ? `<div class="entry-sub">${escapeHtml(p.publisher)}</div>` : ""}
      ${p.description ? `<p class="summary" style="margin-top:4px;font-size:12.5px;">${escapeHtml(p.description)}</p>` : ""}
    </div>`
    )
    .join("");
}

function buildAffiliationsHtml(affiliations: ProfessionalAffiliation[]): string {
  return affiliations
    .map(
      (a) => `
    <div class="entry">
      <div class="entry-row">
        <span class="entry-title">${escapeHtml(a.organization)}</span>
        ${a.startDate ? `<span class="entry-date">${escapeHtml(a.startDate)}${a.endDate ? ` – ${escapeHtml(a.endDate)}` : ""}</span>` : ""}
      </div>
      ${a.role ? `<div class="entry-sub">${escapeHtml(a.role)}</div>` : ""}
      ${a.description ? `<p class="summary" style="margin-top:4px;font-size:12.5px;">${escapeHtml(a.description)}</p>` : ""}
    </div>`
    )
    .join("");
}

function buildLanguagesHtml(languages: LanguageProficiency[]): string {
  return languages.map((l) => `<strong>${escapeHtml(l.language)}</strong>${l.proficiency ? ` (${escapeHtml(l.proficiency)})` : ""}`).join(", ");
}

function buildReferencesHtml(references: Reference[]): string {
  return `<div class="two-col">
    ${references
      .map(
        (r) => `
      <div class="entry">
        <div class="entry-title">${escapeHtml(r.name)}</div>
        ${r.relationship ? `<div class="entry-sub">${escapeHtml(r.relationship)}</div>` : ""}
        ${r.company ? `<div class="entry-sub">${escapeHtml(r.company)}</div>` : ""}
        ${r.email ? `<div class="entry-sub"><a href="mailto:${escapeHtml(r.email)}">${escapeHtml(r.email)}</a></div>` : ""}
        ${r.phone ? `<div class="entry-sub"><a href="tel:${escapeHtml(r.phone)}">${escapeHtml(r.phone)}</a></div>` : ""}
      </div>
    `
      )
      .join("")}
  </div>`;
}

function buildCustomSectionsHtml(customSections: CustomSection[]): string {
  return customSections
    .map(
      (cs) => `
    <section>
      <h2>${escapeHtml(cs.heading)}</h2>
      ${cs.items
        .map(
          (item) => `
        <div class="entry">
          <div class="entry-title">${escapeHtml(item.title)}${item.date ? `<span class="entry-date" style="font-size:11.5px;">${escapeHtml(item.date)}</span>` : ""}</div>
          ${item.location ? `<div class="entry-sub">${escapeHtml(item.location)}</div>` : ""}
          ${item.description ? `<p class="summary" style="margin-top:4px;font-size:12.5px;">${escapeHtml(item.description)}</p>` : ""}
        </div>`
        )
        .join("")}
    </section>`
    )
    .join("");
}

async function main() {
  registerHandlebarsHelpers();

  const data: ResumeContent = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  let template = fs.readFileSync(TEMPLATE_FILE, "utf-8");

  const compiledTemplate = Handlebars.compile(template, { strict: true });

  const html = compiledTemplate({
    FULL_NAME: escapeHtml(data.personalInfo.fullName),
    EMAIL: escapeHtml(data.personalInfo.email),
    PHONE: escapeHtml(data.personalInfo.phone),
    LOCATION: escapeHtml(data.personalInfo.location),
    WEBSITE: escapeHtml(data.personalInfo.website),
    GITHUB: escapeHtml(data.personalInfo.github),
    LINKEDIN: escapeHtml(data.personalInfo.linkedin),
    PORTFOLIO: escapeHtml(data.personalInfo.portfolio),
    SUMMARY: escapeHtml(data.summary),
    EDUCATION: data.education,
    SKILLS: data.skills,
    EXPERIENCE: data.experience,
    PROJECTS: data.projects,
    REAL_WORLD_PROJECTS: data.realWorldProjects,
    CERTIFICATIONS: data.certifications,
    ACHIEVEMENTS: data.achievements,
    VOLUNTEER: data.volunteerExperience,
    PUBLICATIONS: data.publications,
    AFFILIATIONS: data.professionalAffiliations,
    LANGUAGES: data.languages,
    REFERENCES: data.references,
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
