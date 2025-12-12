import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Find all admin route files
const files = glob.sync('src/app/api/admin/**/route.ts');

console.log(`Found ${files.length} admin route files to secure\n`);

files.forEach((file) => {
  let content = readFileSync(file, 'utf-8');
  let modified = false;

  // Check if already using verifyAdminAccess
  if (content.includes('verifyAdminAccess')) {
    console.log(`✓ ${file} - Already secured`);
    return;
  }

  // Pattern 1: Replace auth import with verifyAdminAccess
  if (content.includes('import { auth } from "@/lib/auth"')) {
    content = content.replace(
      /import { auth } from "@\/lib\/auth";\s*\nimport { headers } from "next\/headers";\s*\n/g,
      ''
    );
    modified = true;
  }

  // Add verifyAdminAccess import if not present
  if (!content.includes('verifyAdminAccess')) {
    const importMatch = content.match(/import .* from ["']@\/lib\/prisma["'];/);
    if (importMatch) {
      content = content.replace(
        importMatch[0],
        `${importMatch[0]}\nimport { verifyAdminAccess } from "@/lib/auth-session";`
      );
    } else {
      const firstImport = content.match(/import .* from ["'].*["'];/);
      if (firstImport) {
        content = content.replace(
          firstImport[0],
          `${firstImport[0]}\nimport { verifyAdminAccess } from "@/lib/auth-session";`
        );
      }
    }
    modified = true;
  }

  // Pattern 2: Replace auth check in function handlers
  const authPatterns = [
    // Pattern: const session = await auth.api.getSession...
    {
      pattern: /const session = await auth\.api\.getSession\(\{\s*headers: await headers\(\),\s*\}\);[\s\S]*?if \(!session.*?\) \{[\s\S]*?return NextResponse\.json\([\s\S]*?\);\s*\}/g,
      replacement: '// Verify admin authentication\n  const authError = await verifyAdminAccess();\n  if (authError) return authError;'
    },
    // Pattern with optional chaining and multi-line check
    {
      pattern: /try \{\s*const session = await auth\.api\.getSession\(\{\s*headers: await headers\(\),\s*\}\);[\s\S]*?if \(!session[\s\S]*?role !== ["']admin["']\) \{[\s\S]*?return NextResponse\.json[\s\S]*?\);[\s\S]*?\}/g,
      replacement: 'try {\n    // Verify admin authentication\n    const authError = await verifyAdminAccess();\n    if (authError) return authError;'
    }
  ];

  authPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    writeFileSync(file, content, 'utf-8');
    console.log(`✓ ${file} - Secured`);
  } else {
    console.log(`⚠ ${file} - No changes made (manual review needed)`);
  }
});

console.log('\n✓ Admin routes security update complete!');
