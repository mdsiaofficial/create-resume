const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DATA_FILE = path.join(__dirname, 'resume-data.json');
const TEMPLATE_FILE = path.join(__dirname, 'template.html');
const OUTPUT_FILE = path.join(__dirname, 'resume.pdf');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEducation(education) {
  return education.map(e => `
    <div class="entry">
      <div class="entry-row">
        <span class="entry-title">${escapeHtml(e.degree)}</span>
        <span class="entry-date">${escapeHtml(e.date)}</span>
      </div>
      <div class="entry-sub">${escapeHtml(e.institution)}<span class="dot">·</span>${escapeHtml(e.details)}</div>
    </div>
  `).join('');
}

function buildSkills(skills) {
  return Object.entries(skills).map(([label, value]) =>
    `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</div>`
  ).join('\n');
}

function buildExperience(experience) {
  return experience.map(exp => `
    <div class="entry">
      <div class="entry-row">
        <span class="entry-title">${escapeHtml(exp.title)} — ${escapeHtml(exp.company)}</span>
        <span class="entry-date">${escapeHtml(exp.date)}</span>
      </div>
      <ul class="bullets">
        ${exp.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('\n        ')}
      </ul>
    </div>
  `).join('');
}

function buildProjects(projects) {
  return projects.map(p => {
    const liveLink = p.live
      ? `<span class="entry-title"><span class="live">${escapeHtml(p.live)}</span></span>`
      : '';
    const datePart = p.date ? `<span class="entry-date">${escapeHtml(p.date)}</span>` : '';

    let header = '<div class="entry-row">';
    header += `<span class="entry-title">${escapeHtml(p.title)}</span>`;
    if (liveLink || datePart) {
      header += `<div>${liveLink}${datePart}</div>`;
    }
    header += '</div>';

    return `
    <div class="entry">
      ${header}
      <ul class="bullets">
        ${p.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('\n        ')}
      </ul>
      ${p.technologies ? `<div class="tech-line"><strong>Technologies:</strong> ${escapeHtml(p.technologies)}</div>` : ''}
    </div>
  `;
  }).join('');
}

function buildCertifications(certs) {
  return `<ul class="certs">
    ${certs.map(c => `<li>${escapeHtml(c)}</li>`).join('\n    ')}
  </ul>`;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  let template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

  const replacements = {
    '{{NAME}}': escapeHtml(data.name),
    '{{PHONE}}': escapeHtml(data.contact.phone),
    '{{EMAIL}}': escapeHtml(data.contact.email),
    '{{WEBSITE}}': escapeHtml(data.contact.website),
    '{{GITHUB}}': escapeHtml(data.contact.github),
    '{{LINKEDIN}}': escapeHtml(data.contact.linkedin),
    '{{OBJECTIVE}}': escapeHtml(data.objective),
    '{{EDUCATION}}': buildEducation(data.education),
    '{{SKILLS}}': buildSkills(data.skills),
    '{{EXPERIENCE}}': buildExperience(data.experience),
    '{{PROJECTS}}': buildProjects(data.projects),
    '{{CERTIFICATIONS}}': buildCertifications(data.certifications),
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    template = template.replace(placeholder, value);
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(template, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: OUTPUT_FILE,
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', right: '16mm', bottom: '14mm', left: '16mm' },
  });

  await browser.close();
  console.log(`Resume PDF generated: ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
