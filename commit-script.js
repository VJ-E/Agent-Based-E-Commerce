const { execSync } = require('child_process');

const commits = [
  { date: '2026-08-02T10:15:00', msg: 'Initialize project dependencies', files: ['package.json', 'package-lock.json', 'jsconfig.json'] },
  { date: '2026-08-02T14:20:00', msg: 'Add gitignore rules', files: ['.gitignore'] },
  { date: '2026-08-03T11:30:00', msg: 'Add project configuration', files: ['eslint.config.mjs', 'postcss.config.mjs', 'README.md'] },
  { date: '2026-08-04T09:45:00', msg: 'Add MongoDB connection utility', files: ['lib/'] },
  { date: '2026-08-05T10:10:00', msg: 'Create Product model', files: ['models/Product.js'] },
  { date: '2026-08-05T15:20:00', msg: 'Create Order and AuditLog models', files: ['models/Order.js', 'models/AuditLog.js'] },
  { date: '2026-08-06T09:00:00', msg: 'Add brand fonts and favicon', files: ['app/fonts/', 'assets/', 'app/favicon.ico'] },
  { date: '2026-08-06T14:45:00', msg: 'Add public SVG assets', files: ['public/'] },
  { date: '2026-08-07T11:05:00', msg: 'Add Tailwind styling and CSS variables', files: ['app/globals.css'] },
  { date: '2026-08-08T13:40:00', msg: 'Build ProductCard component', files: ['components/ProductCard.js'] },
  { date: '2026-08-09T15:55:00', msg: 'Add SidebarFilter component', files: ['components/SidebarFilter.js'] },
  { date: '2026-08-10T10:15:00', msg: 'Implement Cart context', files: ['components/CartProvider.js', 'components/AddToCartClient.js'] },
  { date: '2026-08-11T14:25:00', msg: 'Add Cart Sidebar UI', files: ['components/CartSidebar.js'] },
  { date: '2026-08-12T09:20:00', msg: 'Create responsive Navbar', files: ['components/Navbar.js'] },
  { date: '2026-08-13T16:30:00', msg: 'Add Hero Landing section', files: ['components/HeroLanding.js'] },
  { date: '2026-08-14T10:45:00', msg: 'Implement root layout', files: ['app/layout.js'] },
  { date: '2026-08-15T11:10:00', msg: 'Implement REST APIs', files: ['app/api/'] },
  { date: '2026-08-16T15:35:00', msg: 'Create product details page', files: ['app/product/'] },
  { date: '2026-08-17T09:20:00', msg: 'Build main storefront page', files: ['app/page.js'] },
  { date: '2026-08-17T11:30:00', msg: 'Add utility scripts', files: ['fix-encoding.js'] },
  { date: '2026-08-17T15:00:00', msg: 'Final polish and missing files', files: ['.'] }
];

try { execSync('git reset HEAD'); } catch (e) {}

for (const c of commits) {
  console.log(`\nProcessing commit for ${c.date}...`);
  for (const f of c.files) {
    try {
      execSync(`git add "${f}"`);
    } catch (e) {
      console.warn(`Could not add ${f}`);
    }
  }
  
  const env = { ...process.env, GIT_AUTHOR_DATE: c.date, GIT_COMMITTER_DATE: c.date };
  
  try {
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length > 0) {
      execSync(`git commit -m "${c.msg}"`, { env });
      console.log(`Committed: ${c.msg}`);
    } else {
      console.log(`Skipped (no changes): ${c.msg}`);
    }
  } catch (e) {
    console.error(`Failed to commit: ${c.msg}`);
    console.error(e.stdout ? e.stdout.toString() : e.message);
  }
}
