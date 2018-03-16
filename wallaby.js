const wallabyWebpack = require('wallaby-webpack');

const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

const path = require('path');

const compilerOptions = Object.assign(
    require('./tsconfig.webpack.json').compilerOptions,
    require('./tsconfig.spec.json').compilerOptions,
);

compilerOptions.module = 'CommonJs';


module.exports = function (wallaby) {

    const webpackPostprocessor = wallabyWebpack({
        entryPatterns: [
            'src/lib-dev/wallabyTest.js',
            'src/**/*spec.js'
        ],

        module: {
            rules: [
                {test: /\.css$/, loader: ['raw-loader']},
                {test: /\.html$/, loader: 'raw-loader'},
                {test: /\.ts$/, loader: '@ngtools/webpack', include: /node_modules/, query: {tsConfigPath: 'tsconfig.json'}},
                {test: /\.js$/, loader: 'angular2-template-loader', exclude: /node_modules/},
                {test: /\.json$/, loader: 'json-loader'},
                {test: /\.scss$|\.sass$/, loaders: ['raw-loader', 'sass-loader']},
                {test: /\.(jpg|png)$/, loader: 'url-loader?limit=128000'}
            ]
        },

        resolve: {
            extensions: ['.js', '.ts'],
            modules: [
                path.join(wallaby.projectCacheDir, 'src'),
                'node_modules'
            ],
            plugins: [
                new TsConfigPathsPlugin({
                    configFileName: './tsconfig.webpack.json'
                })
            ]
        }
    });

    return {
        files: [
            { pattern: 'src/**/*.+(ts|css|scss|sass|html|json|svg)', load: false },
            { pattern: 'src/**/*.d.ts', ignore: true },
            { pattern: 'src/**/*spec.ts', ignore: true }
        ],

        tests: [
            { pattern: 'src/**/*spec.ts', load: false }
        ],

        testFramework: 'jasmine',

        compilers: {
            '**/*.ts': wallaby.compilers.typeScript(compilerOptions),
        },

        env: {
            kind: 'chrome'
        },

        postprocessor: webpackPostprocessor,

        setup: function () {
            window.__moduleBundler.loadTests();
        },

        debug: true
    };
};
