'use strict';

var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var es = require('event-stream');
var plugins = require('gulp-load-plugins')();
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();
var SoyTemplateEngine = require('../src/template/SoyTemplateEngine');

gulp.task('templates:html', function(done) {
  gulp.src(path.join('src/public', config.globHtml))
    .pipe(gulp.dest('dist/public'))
    .on('end', function() {
      if (config.optimizeHtmlResource) {
        extractUserefAssets(path.join('dist/public', config.globHtml), function() {
          replaceUserefBlocks(path.join('dist/public', config.globHtml), 'dist/public', function() {
            minifyHtml(done);
          });
        });
      } else {
        replaceUserefBlocks(path.join('dist/public', config.globHtml), 'dist/public', function() {
          minifyHtml(done);
        });
      }
    });
});

gulp.task('templates:markdown', ['templates:soy'], function(done) {
  gulp.src(path.join('src/' + config.globMarkdown))
    .pipe(gulp.dest('dist'))
    .on('end', function() {
      if (config.optimizeHtmlResource) {
        extractUserefAssets(path.join('dist', config.globMarkdown), function() {
          replaceUserefBlocks(path.join('dist', config.globMarkdown), 'dist', function() {
            buildMarkdown(path.join('dist', config.globMarkdown), done);
          });
        });
      } else {
        replaceUserefBlocks(path.join('dist', config.globMarkdown), 'dist', function() {
          buildMarkdown(path.join('dist', config.globMarkdown), done);
        });
      }
    });
});

gulp.task('templates:soy', function(done) {
  gulp.src(path.join('src/' + config.globTemplate))
    .pipe(gulp.dest('dist'))
    .on('end', function() {
      if (config.optimizeHtmlResource) {
        extractUserefAssets(path.join('dist', config.globTemplate), function() {
          replaceUserefBlocks(path.join('dist', config.globTemplate), 'dist', function() {
            buildSoy(path.join('dist', config.globTemplate), true, done);
          });
        });
      } else {
        replaceUserefBlocks(path.join('dist', config.globTemplate), 'dist', function() {
          buildSoy(path.join('dist', config.globTemplate), true, done);
        });
      }
    });
});

gulp.task('templates', ['templates:soy', 'templates:markdown', 'templates:html']);

function buildMarkdown(glob, done) {
  var namespace = 0;
  var soyedMarkdownFilepaths = [];
  var soyedMarkdownNamespaces = [];
  var soyedMarkdownFrontmatters = [];

  gulp.src(glob)
    .pipe(plugins.if(config.outputMarkdownAsHtml, plugins.frontMatter()))
    .pipe(es.mapSync(function(file) {
      soyedMarkdownFrontmatters.push(file.frontMatter);
      return file;
    }))
    .pipe(plugins.if(config.outputMarkdownAsHtml, plugins.markdown()))
    .pipe(plugins.if(glob.globMarkdown, plugins.copy('dist')))
    .pipe(plugins.ignore.include('*.html'))
    .pipe(plugins.wrapper({
      header: function(file) {
        file.soyNamespace = 'temp' + namespace++;
        return '{namespace ' + file.soyNamespace + '}\n' + getSoyParamsDoc(file) + '{template .fm}\n';
      },
      footer: '\n{/template}'
    }))
    .pipe(es.mapSync(function(file) {
      soyedMarkdownFilepaths.push(file.path);
      soyedMarkdownNamespaces.push(file.soyNamespace);
      return file;
    }))
    .pipe(gulp.dest('dist'))
    .on('end', function() {
      if (soyedMarkdownFilepaths.length === 0) {
        done();
        return;
      }
      buildSoy(soyedMarkdownFilepaths, false, function() {
        soyedMarkdownFilepaths.forEach(function(soyedFilepath, i) {
          var soyEngine = new SoyTemplateEngine();
          var content = soyEngine.render(
            soyedMarkdownNamespaces[i] + '.fm',
            soyedMarkdownFrontmatters[i],
            config.defaultLocale,
            null,
            {
              config: config
            }
          );
          fs.writeFileSync(soyedFilepath, content);
        });
        done();
      });
    });
}

function buildSoy(glob, outputFiles, done) {
  gulp.src(glob)
    .pipe(plugins.soynode({
      loadCompiledTemplates: true,
      locales: config.defaultLocale ? [config.defaultLocale] : null,
      messageFilePathFormat: config.translationsFilepath,
      renderSoyWeb: config.outputTemplateAsHtml,
      renderSoyWebContext: {
        config: config
      }
    }).on('error', function(err) {
      console.log(err);
    }))
    .pipe(plugins.if(!config.outputTemplateAsJavascript, plugins.ignore.exclude('*.soy.js')))
    .pipe(plugins.if(config.globScript, plugins.if(config.optimizeScript, plugins.uglify(config.uglify))))
    .pipe(plugins.if(outputFiles, gulp.dest('dist')))
    .on('finish', function() {
      done();
    });
}

function extractUserefAssets(glob, done) {
  var assets = plugins.useref.assets({
    searchPath: ['src/public', 'dist/public']
  });
  gulp.src(glob)
    .pipe(assets)
    .pipe(plugins.if(config.globScript, plugins.if(config.optimizeScript, plugins.uglify(config.uglify))))
    .pipe(plugins.if(config.globStyle, plugins.if(config.optimizeStyle, plugins.autoprefixer(config.autoprefixer))))
    .pipe(plugins.if(config.globStyle, plugins.if(config.optimizeStyle, plugins.csso())))
    .pipe(gulp.dest('dist/public'))
    .on('end', function() {
      done();
    });
}

function getSoyParamsDoc(file) {
  var content = file.contents.toString();
  var regex = new RegExp('{\\$([^{}]+)}', 'g');
  var matched;
  var paramsDoc = '';
  while ((matched = regex.exec(content))) {
    if (matched[1].indexOf('ij.') === -1) {
      paramsDoc += '@param ' + matched[1] + '\n';
    }
  }

  return '/**\n' + paramsDoc + '**/\n';
}

function minifyHtml(done) {
  gulp.src(path.join('dist/public', config.globHtml))
    .pipe(plugins.if(config.optimizeHtml, plugins.minifyHtml()))
    .pipe(gulp.dest('dist/public'))
    .on('end', done);
}

function replaceUserefBlocks(glob, dest, done) {
  gulp.src(glob)
    .pipe(plugins.useref())
    .pipe(gulp.dest(dest))
    .on('end', function() {
      done();
    });
}
