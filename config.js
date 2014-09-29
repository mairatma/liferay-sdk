'use strict';

module.exports = {
  /**
   * The defaultConfig provides the base configuration for all flavors and
   * each flavor can override any value.
   */
  defaultConfig: {
    /**
     * If front matter variables should be applied to the contents of the files
     * they are defined on.
     */
    applyFrontMatterVariables: true,

    /**
     * Autoprefixer parses CSS files and adds vendor prefixes to CSS rules.
     */
    autoprefixer: [
      'android >= 4.4',
      'bb >= 10',
      'chrome >= 34',
      'ff >= 30',
      'ie >= 8',
      'ie_mob >= 10',
      'ios >= 7',
      'opera >= 23',
      'safari >= 7'
    ],

    /**
     * Compass options.
     */
    compass: {
      config_file: __dirname + '/tasks/fixture/config.rb',
      css: 'dist/public/styles',
      image: 'dist/public/images',
      logging: false,
      sass: 'src/public/styles'
    },

    /**
     * The default locale of the app, or null if it shouldn't be translated at all.
     */
    defaultLocale: null,

    /**
     * Build pattern matching for HTML files.
     */
    globHtml: '**/*.html',

    /**
     * Build pattern matching for icon files.
     */
    globIconfont: '**/*.svg',

    /**
     * Build pattern matching for image files.
     */
    globImage: '**/*.{gif,jpeg,jpg,png,svg}',

    /**
     * Build pattern matching for markdown files.
     */
    globMarkdown: '**/*.md',

    /**
     * Build pattern matching for JavaScript files.
     */
    globScript: '**/*.js',

    /**
     * Build pattern matching for SASS files.
     */
    globScss: '**/*.scss',

    /**
     * Build pattern matching for CSS files.
     */
    globStyle: '**/*.css',

    /**
     * Build pattern matching for Soy template files.
     */
    globTemplate: '**/*.soy',

    /**
     * Icon font options.
     */
    iconfont: {
      fontName: 'icons',
      normalize: true,
      log: function() {}
    },

    /**
     * Icon font css options.
     */
    iconfontCss: {
      fontName: 'icons',
      path: __dirname + '/tasks/fixture/.icons',
      targetPath: '../fonts/icons.css'
    },

    /**
     * The path of the file that will contain all the messages extracted from
     * the app by the `lang` gulp task.
     */
    extractedMessagesFilepath: 'src/translations/default.xlf',

    /**
     * Reduces payload size of HTML document.
     */
    optimizeHtml: false,

    /**
     * Parses build blocks in HTML files to replace references.
     */
    optimizeHtmlResource: true,

    /**
     * Minifies images.
     */
    optimizeImage: false,

    /**
     * Minifies JavaScript files.
     */
    optimizeScript: false,

    /**
     * Minifies CSS files.
     */
    optimizeStyle: false,

    /**
     * Outputs markdown files as HTML.
     */
    outputMarkdownAsHtml: true,

    /**
     * Outputs rendered template files.
     */
    outputTemplateAsHtml: true,

    /**
     * Outputs template files as js scripts.
     */
    outputTemplateAsJavascript: false,

    /**
     * The format being used for routes. Regex is used by default, but all formats
     * from madvoc are supported, so this can be set to any of the formats defined
     * there.
     */
    routeFormat: null,

    /**
     * The path of the files that contain the translations to be used by the app.
     */
    translationsFilepath: 'src/translations/translations_{LOCALE}.xlf',

    /**
     * Uglify options.
     */
    uglify: {
      preserveComments: 'some'
    }
  },

  /***
   * A product flavor defines a customized version of the application build by
   * the project. A single project can have different flavors which change the
   * generated application.
   *
   * Example:
   * gulp build --flavor production
   * gulp watch --flavor production
   */
  productFlavors: {
    production: {
      optimizeHtml: true,
      optimizeHtmlResource: true,
      optimizeImage: true,
      optimizeScript: true,
      optimizeStyle: true
    }
  }
};
