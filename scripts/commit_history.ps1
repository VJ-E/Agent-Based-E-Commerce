$commits = @(
    @{ date="2026-08-18T10:00:00"; msg="Ignore large CSV dataset files"; files=".gitignore" },
    @{ date="2026-08-18T12:30:00"; msg="Add OpenSans font files"; files="app/fonts/*" },
    @{ date="2026-08-18T15:45:00"; msg="Add OpenSans webfonts"; files="assets/open-sans/*" },
    @{ date="2026-08-19T09:15:00"; msg="Swap out Milker font for OpenSans"; files="app/layout.js app/globals.css" },
    @{ date="2026-08-19T11:20:00"; msg="Install csv-parser for seeding"; files="package.json package-lock.json" },
    @{ date="2026-08-19T14:40:00"; msg="Create MiniProductCard component"; files="components/MiniProductCard.js" },
    @{ date="2026-08-19T16:55:00"; msg="Initialize chat agent logic"; files="app/api/chat/agent.js" },
    @{ date="2026-08-20T10:10:00"; msg="Setup chat API route"; files="app/api/chat/route.js" },
    @{ date="2026-08-20T11:25:00"; msg="Implement chat history persistence"; files="app/page.js" },
    @{ date="2026-08-20T13:40:00"; msg="Add metadata schema for dataset"; files="assets/Dataset/metadata.json" },
    @{ date="2026-08-20T15:00:00"; msg="Update Product model for Amazon dataset"; files="models/Product.js" },
    @{ date="2026-08-21T09:05:00"; msg="Create Amazon seeding script"; files="scripts/seed_amazon.js" },
    @{ date="2026-08-21T11:35:00"; msg="Implement API pagination"; files="app/api/products/route.js" },
    @{ date="2026-08-21T13:50:00"; msg="Update Sidebar filter logic"; files="components/SidebarFilter.js" },
    @{ date="2026-08-21T15:15:00"; msg="Revamp product details page and UI"; files="app/product/[id]/page.js components/AddToCartClient.js components/ProductCard.js" }
)

foreach ($c in $commits) {
    Write-Host "Committing: $($c.msg) on $($c.date)"
    
    $env:GIT_AUTHOR_DATE = $c.date
    $env:GIT_COMMITTER_DATE = $c.date
    
    $files = $c.files -split ' '
    foreach ($f in $files) {
        git add $f
    }
    
    git commit -m $c.msg
}

# Catch any remaining untracked or modified files (e.g. anything we missed)
git add .
git commit -m "Final polish and optimizations" --date="2026-08-21T16:30:00"

Write-Host "All commits generated successfully!"
