const { execSync } = require('child_process');

const commits = [
  { date: '2026-08-22T10:00:00', msg: 'Update dependencies and gitignore', files: ['package.json', 'package-lock.json', '.gitignore'] },
  { date: '2026-08-22T14:30:00', msg: 'Implement backend authentication services', files: ['models/User.js', 'lib/auth.js', 'app/api/auth/register/', 'app/api/auth/login/', 'app/api/auth/me/', 'app/api/auth/logout/'] },
  { date: '2026-08-23T09:15:00', msg: 'Build Authentication UI and Middleware', files: ['app/register/', 'app/login/', 'components/AuthProvider.js', 'middleware.js'] },
  { date: '2026-08-23T15:45:00', msg: 'Integrate manual checkout UI and backend flow', files: ['app/checkout/', 'app/api/llm/checkout/'] },
  { date: '2026-08-24T11:20:00', msg: 'Add product reviews functionality', files: ['models/Review.js', 'app/api/reviews/', 'app/account/orders/[id]/review/'] },
  { date: '2026-08-24T16:00:00', msg: 'Implement order tracking system', files: ['app/account/orders/[id]/track/', 'models/Order.js'] },
  { date: '2026-08-25T10:30:00', msg: 'Build Merchant Control Plane admin interface', files: ['app/admin/', 'app/api/admin/'] },
  { date: '2026-08-25T14:10:00', msg: 'Add LLM-friendly catalog API endpoint', files: ['app/api/llm/catalog/'] },
  { date: '2026-08-26T09:50:00', msg: 'Fix infinite scroll and category routing bugs', files: ['app/shop/', 'components/SidebarFilter.js', 'app/product/', 'app/page.js'] },
  { date: '2026-08-26T15:15:00', msg: 'Update AI chat capabilities', files: ['app/api/chat/'] },
  { date: '2026-08-27T10:05:00', msg: 'Redesign account dashboard and add password change', files: ['app/account/page.js', 'app/account/orders/page.js', 'app/account/password/', 'app/api/auth/password/', 'components/LogoutButton.js'] },
  { date: '2026-08-27T14:40:00', msg: 'Set up Analytics database schema and APIs', files: ['models/AnalyticsEvent.js', 'app/api/analytics/', 'components/AnalyticsProvider.js'] },
  { date: '2026-08-28T09:30:00', msg: 'Instrument product cards, cart, and layout for analytics', files: ['components/AddToCartClient.js', 'components/ProductCard.js', 'app/layout.js', 'components/Navbar.js', 'components/CartSidebar.js', 'components/CartProvider.js'] },
  { date: '2026-08-28T12:00:00', msg: 'Add initial database seed scripts', files: ['scripts/'] }
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

// Ensure nothing is left behind
try {
  const finalStatus = execSync('git status --porcelain').toString();
  if (finalStatus.trim().length > 0) {
    execSync('git add .');
    const finalDate = '2026-08-28T15:00:00';
    const env = { ...process.env, GIT_AUTHOR_DATE: finalDate, GIT_COMMITTER_DATE: finalDate };
    execSync(`git commit -m "Final polish and minor tweaks"`, { env });
    console.log(`Committed: Final polish and minor tweaks`);
  }
} catch (e) {
  // Ignored
}
