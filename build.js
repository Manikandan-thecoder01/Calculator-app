#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple minification functions (for basic optimization without external dependencies)
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around specific characters
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove trailing semicolons before }
        .replace(/;}/g, '}')
        // Remove leading/trailing whitespace
        .trim();
}

function minifyJS(js) {
    return js
        // Remove single-line comments (but preserve URLs)
        .replace(/\/\/(?![^\n]*https?:\/\/)[^\n]*/g, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace (basic)
        .replace(/\s+/g, ' ')
        // Remove spaces around operators and brackets
        .replace(/\s*([=+\-*/{}();,<>!&|])\s*/g, '$1')
        .trim();
}

function minifyHTML(html) {
    return html
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove unnecessary whitespace between tags
        .replace(/>\s+</g, '><')
        // Remove leading/trailing whitespace
        .trim();
}

function createBuildDirectory() {
    const buildDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir);
    }
    return buildDir;
}

function getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2) + ' KB';
}

async function build() {
    console.log('🚀 Building optimized calculator app...\n');
    
    const buildDir = createBuildDirectory();
    
    // Read source files
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    const cssContent = fs.readFileSync('style.css', 'utf8');
    const jsContent = fs.readFileSync('main.js', 'utf8');
    
    console.log('📊 Original file sizes:');
    console.log(`  HTML: ${getFileSize('index.html')}`);
    console.log(`  CSS:  ${getFileSize('style.css')}`);
    console.log(`  JS:   ${getFileSize('main.js')}`);
    
    // Minify files
    const minifiedHTML = minifyHTML(htmlContent);
    const minifiedCSS = minifyCSS(cssContent);
    const minifiedJS = minifyJS(jsContent);
    
    // Create inline version for maximum performance
    const inlineHTML = minifiedHTML
        .replace('<link rel="stylesheet" href="style.css">', `<style>${minifiedCSS}</style>`)
        .replace('<script src="main.js" defer></script>', `<script>${minifiedJS}</script>`);
    
    // Write minified files
    fs.writeFileSync(path.join(buildDir, 'index.html'), minifiedHTML);
    fs.writeFileSync(path.join(buildDir, 'style.css'), minifiedCSS);
    fs.writeFileSync(path.join(buildDir, 'main.js'), minifiedJS);
    fs.writeFileSync(path.join(buildDir, 'index-inline.html'), inlineHTML);
    
    console.log('\n📦 Minified file sizes:');
    console.log(`  HTML: ${getFileSize(path.join(buildDir, 'index.html'))}`);
    console.log(`  CSS:  ${getFileSize(path.join(buildDir, 'style.css'))}`);
    console.log(`  JS:   ${getFileSize(path.join(buildDir, 'main.js'))}`);
    console.log(`  Inline HTML: ${getFileSize(path.join(buildDir, 'index-inline.html'))}`);
    
    // Calculate compression ratios
    const originalSize = fs.statSync('index.html').size + fs.statSync('style.css').size + fs.statSync('main.js').size;
    const minifiedSize = fs.statSync(path.join(buildDir, 'index.html')).size + 
                        fs.statSync(path.join(buildDir, 'style.css')).size + 
                        fs.statSync(path.join(buildDir, 'main.js')).size;
    const inlineSize = fs.statSync(path.join(buildDir, 'index-inline.html')).size;
    
    const compressionRatio = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    const inlineRatio = ((originalSize - inlineSize) / originalSize * 100).toFixed(1);
    
    console.log('\n✨ Optimization Results:');
    console.log(`  Total size reduction: ${compressionRatio}%`);
    console.log(`  Inline version reduction: ${inlineRatio}%`);
    console.log(`  Files saved to: ./dist/`);
    
    // Create .htaccess for Apache servers
    const htaccess = `# Performance optimizations
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

<IfModule mod_headers.c>
    <FilesMatch "\\.(css|js)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</IfModule>`;
    
    fs.writeFileSync(path.join(buildDir, '.htaccess'), htaccess);
    
    console.log('\n🎯 Performance Tips:');
    console.log('  • Use index-inline.html for maximum performance (single HTTP request)');
    console.log('  • Use separate files (index.html) for better caching');
    console.log('  • .htaccess file created for Apache server optimizations');
    console.log('  • Enable gzip compression on your server for additional 60-80% size reduction');
    
    console.log('\n✅ Build complete!');
}

// Run the build
build().catch(console.error);