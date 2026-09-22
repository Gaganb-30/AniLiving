<?php
/**
 * Dynamic Sitemap Proxy for Hostinger
 *
 * Google Search Console requires the sitemap to be served from the frontend domain
 * (e.g., https://aniliving.com/sitemap.xml).
 * This script proxies the dynamic sitemap from the backend API, ensuring Google
 * receives fresh XML with the proper Content-Type header directly on the frontend domain.
 */

// If a physical sitemap.xml exists and is fresh (< 6 hours old), serve it directly
$staticFile = __DIR__ . '/sitemap.xml';
if (file_exists($staticFile) && (time() - filemtime($staticFile) < 21600)) {
    header('Content-Type: application/xml; charset=utf-8');
    header('Cache-Control: public, max-age=3600');
    readfile($staticFile);
    exit;
}

// Otherwise, fetch fresh XML from backend API
$backendUrl = getenv('BACKEND_URL') ?: (getenv('VITE_API_URL') ?: 'http://127.0.0.1:5000');
$backendUrl = rtrim($backendUrl, '/');
$sitemapUrl = $backendUrl . '/sitemap.xml';

$ch = curl_init($sitemapUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_USERAGENT => 'AniLiving-Sitemap-Proxy/1.0',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && !empty($response)) {
    // Cache the response locally for fast subsequent crawler requests
    @file_put_contents($staticFile, $response);
    header('Content-Type: application/xml; charset=utf-8');
    header('Cache-Control: public, max-age=3600');
    echo $response;
    exit;
}

// Fallback to existing static file if backend is temporarily unreachable
if (file_exists($staticFile)) {
    header('Content-Type: application/xml; charset=utf-8');
    readfile($staticFile);
    exit;
}

http_response_code(502);
header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
