/*jshint esversion: 6 */

var paths = {};

// Directory locations.
paths.assetsDir = '_assets/';
paths.jekyllDir = '';
paths.jekyllAssetsDir = 'assets/';
paths.siteDir = '_site/';
paths.siteAssetsDir = '_site/assets/';
paths.nodeDir = 'node_modules/';

// Folder naming conventions.
paths.dataFolderName = '_data';
paths.postFolderName = '_posts';
paths.draftFolderName = '_drafts';
paths.fontFolderName = 'fonts';
paths.imageFolderName = 'images';
paths.scriptFolderName = 'js';
paths.sassFolderName = 'scss';
paths.stylesFolderName = 'css';
paths.gulpFolderName = 'gulp';
paths.faviconFolderName = 'favicons';

// Asset files locations.
paths.sassFiles = paths.assetsDir + paths.sassFolderName;
paths.jsFiles = paths.assetsDir + paths.scriptFolderName;
paths.imageFiles = paths.assetsDir + paths.imageFolderName;
paths.fontFiles = paths.assetsDir + paths.fontFolderName;
paths.gulpFiles = paths.assetsDir + paths.gulpFolderName;
paths.faviconFiles = paths.assetsDir + paths.faviconFolderName;

// Jekyll files locations
paths.jekyllDataFiles = paths.jekyllDir + paths.dataFolderName;
paths.jekyllPostFiles = paths.jekyllDir + paths.postFolderName;
paths.jekyllDraftFiles = paths.jekyllDir + paths.draftFolderName;
paths.jekyllCssFiles = paths.jekyllAssetsDir + paths.stylesFolderName;
paths.jekyllJsFiles = paths.jekyllAssetsDir + paths.scriptFolderName;
paths.jekyllImageFiles = paths.jekyllAssetsDir + paths.imageFolderName;
paths.jekyllFontFiles = paths.jekyllAssetsDir + paths.fontFolderName;
paths.jekyllFaviconFiles = paths.jekyllAssetsDir + paths.faviconFolderName;

// Site files locations.
paths.siteCssFiles = paths.siteAssetsDir + paths.stylesFolderName;
paths.siteJsFiles = paths.siteAssetsDir + paths.scriptFolderName;
paths.siteImageFiles = paths.siteAssetsDir + paths.imageFolderName;
paths.siteFontFiles = paths.siteAssetsDir + paths.fontFolderName;
paths.siteFaviconFiles = paths.siteAssetsDir + paths.faviconFolderName;

// Glob patterns by file type.
paths.dataPattern = '/**/*.+(yml|YML)';
paths.sassPattern = '/**/*.+(scss|SCSS|sass|SASS|css|CSS)';
paths.jsPattern = '/**/*.js';
paths.imagePattern = '/**/*.+(jpg|JPG|jpeg|JPEG|svg|SVG|gif|GIF|webp|WEBP|tif|TIF)';
paths.imagePngPattern = '/**/*.+(png|PNG)';
paths.fontPattern = '/**/*.+(ttf|TTF|woff|WOFF|woff2|WOFF2|svg|SVG|eot|EOT)';
paths.markdownPattern = '/**/*.+(md|MD|markdown|MARKDOWN)';
paths.htmlPattern = '/**/*.html';
paths.xmlPattern = '/**/*.xml';
paths.faviconPattern = '/**/*.+(ico|ICO|png|PNG|webmanifest|WEBMANIFEST|xml|XML)';

// Asset files globs
paths.sassFilesGlob = paths.sassFiles + paths.sassPattern;
paths.jsFilesGlob = paths.jsFiles + paths.jsPattern;
paths.imageFilesGlob = paths.imageFiles + paths.imagePattern;
paths.imagePngFilesGlob = paths.imageFiles + paths.imagePngPattern;
paths.fontFilesGlob = paths.fontFiles + paths.fontPattern;
paths.faviconFilesGlob = paths.faviconFiles + paths.faviconPattern;

// Jekyll files globs
paths.jekyllDataFilesGlob = paths.jekyllDataFiles + paths.dataPattern;
paths.jekyllPostFilesGlob = paths.jekyllPostFiles + paths.markdownPattern;
paths.jekyllDraftFilesGlob = paths.jekyllDraftFiles + paths.markdownPattern;
paths.jekyllHtmlFilesGlob = paths.jekyllDir + paths.htmlPattern;
paths.jekyllXmlFilesGlob = paths.jekyllDir + paths.xmlPattern;
paths.jekyllImageFilesGlob = paths.jekyllImageFiles + paths.imagePattern;
paths.jekyllFaviconFilesGlob = paths.jekyllFaviconFiles + paths.faviconPattern;

// Site files globs
paths.siteHtmlFilesGlob = paths.siteDir + paths.htmlPattern;
// Photo files locations
paths.originalPhotoFiles = paths.imageFiles + '/photos/originals';
paths.originalPhotoFilesGlob = paths.originalPhotoFiles + paths.imagePattern;
paths.excludeOriginalPhotoFilesGlob = '!' + paths.originalPhotoFiles + '{,/**}';
paths.jekyllOriginalPhotoFiles = paths.jekyllImageFiles + '/photos/originals';
paths.siteOriginalPhotoFiles = paths.siteImageFiles + '/photos/originals';

module.exports = paths;
