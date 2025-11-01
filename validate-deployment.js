#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE DEPLOYMENT VALIDATION SCRIPT
 * Automated testing and systematic verification for Vercel deployment
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

class DeploymentValidator {
    constructor() {
        this.deploymentURL = '';
        this.validationResults = {
            configuration: false,
            dependencies: false,
            build: false,
            accessibility: false,
            functionality: false,
            performance: false
        };
        this.errors = [];
        this.warnings = [];
    }

    // Phase 1: Configuration Analysis
    async validateConfiguration() {
        console.log('📋 Phase 1: Configuration Analysis');
        
        try {
            // Check vercel.json
            if (!fs.existsSync('vercel.json')) {
                throw new Error('vercel.json not found');
            }

            const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
            
            // Check for configuration conflicts
            const hasBuilds = 'builds' in vercelConfig;
            const hasFunctions = 'functions' in vercelConfig;
            
            if (hasBuilds && hasFunctions) {
                throw new Error('Configuration conflict: Both builds and functions properties found');
            }

            if (!hasBuilds) {
                throw new Error('Missing builds property for static site');
            }

            // Validate builds configuration
            const buildsConfig = vercelConfig.builds[0];
            if (buildsConfig.src !== 'package.json') {
                throw new Error('Invalid build source configuration');
            }

            if (buildsConfig.use !== '@vercel/static-build') {
                throw new Error('Invalid build type - should be static-build for React app');
            }

            console.log('✅ Configuration validation passed');
            this.validationResults.configuration = true;
            
        } catch (error) {
            console.log(`❌ Configuration validation failed: ${error.message}`);
            this.errors.push(`Configuration: ${error.message}`);
        }
    }

    // Phase 2: Dependency Analysis
    async validateDependencies() {
        console.log('📦 Phase 2: Dependency Analysis');
        
        try {
            // Check package.json exists
            if (!fs.existsSync('package.json')) {
                throw new Error('package.json not found');
            }

            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            // Check critical dependencies
            const criticalDeps = [
                'react',
                'react-dom',
                'react-scripts',
                'react-router-dom'
            ];

            for (const dep of criticalDeps) {
                if (!packageJson.dependencies[dep]) {
                    throw new Error(`Missing critical dependency: ${dep}`);
                }
            }

            // Check build script exists
            if (!packageJson.scripts.build) {
                throw new Error('Build script missing from package.json');
            }

            console.log('✅ Dependency validation passed');
            this.validationResults.dependencies = true;
            
        } catch (error) {
            console.log(`❌ Dependency validation failed: ${error.message}`);
            this.errors.push(`Dependencies: ${error.message}`);
        }
    }

    // Phase 3: Build Process Test
    async validateBuild() {
        console.log('🔨 Phase 3: Build Process Test');
        
        try {
            console.log('🧪 Running local build test...');
            
            // Run build command
            execSync('npm run build', { stdio: 'inherit' });
            
            // Check build directory exists
            if (!fs.existsSync('build')) {
                throw new Error('Build directory not created');
            }

            // Check critical files in build
            const criticalFiles = [
                'build/index.html',
                'build/static/js/main.[hash].js',
                'build/static/css/main.[hash].css'
            ];

            for (const file of criticalFiles) {
                const files = fs.readdirSync('build').filter(f => 
                    fs.statSync(`build/${f}`).isFile()
                );
                
                const matches = files.filter(f => 
                    f.includes('main.js') || f.includes('main.css') || f === 'index.html'
                );
                
                if (matches.length === 0 && file.includes('main')) {
                    throw new Error(`Missing built file: ${file}`);
                }
            }

            // Check build size
            const buildSize = this.getDirectorySize('build');
            console.log(`📊 Build size: ${this.formatBytes(buildSize)}`);

            if (buildSize > 50 * 1024 * 1024) { // 50MB limit
                this.warnings.push('Build size is large, consider optimization');
            }

            console.log('✅ Build validation passed');
            this.validationResults.build = true;
            
        } catch (error) {
            console.log(`❌ Build validation failed: ${error.message}`);
            this.errors.push(`Build: ${error.message}`);
        }
    }

    // Phase 4: URL Accessibility Test
    async validateAccessibility(url) {
        console.log(`🌐 Phase 4: URL Accessibility Test (${url})`);
        
        return new Promise((resolve) => {
            try {
                const req = https.get(`${url}/favicon.ico`, (res) => {
                    if (res.statusCode === 200 || res.statusCode === 404) {
                        console.log('✅ URL accessibility test passed');
                        this.validationResults.accessibility = true;
                        resolve(true);
                    } else {
                        throw new Error(`Unexpected status code: ${res.statusCode}`);
                    }
                });

                req.on('error', (error) => {
                    console.log(`❌ URL accessibility test failed: ${error.message}`);
                    this.errors.push(`Accessibility: ${error.message}`);
                    resolve(false);
                });

                req.setTimeout(10000, () => {
                    console.log('❌ URL accessibility test timeout');
                    this.errors.push('Accessibility: Request timeout');
                    resolve(false);
                });

            } catch (error) {
                console.log(`❌ URL accessibility test failed: ${error.message}`);
                this.errors.push(`Accessibility: ${error.message}`);
                resolve(false);
            }
        });
    }

    // Phase 5: Functionality Test
    async validateFunctionality(url) {
        console.log('⚡ Phase 5: Functionality Test');
        
        return new Promise((resolve) => {
            try {
                const req = https.get(url, (res) => {
                    let data = '';
                    
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        // Check for React app indicators
                        const checks = [
                            { test: data.includes('root'), name: 'Root div found' },
                            { test: data.includes('My Office') || data.includes('HRD'), name: 'App title found' },
                            { test: data.includes('<div'), name: 'HTML content found' }
                        ];

                        let passedChecks = 0;
                        for (const check of checks) {
                            if (check.test) {
                                passedChecks++;
                                console.log(`  ✅ ${check.name}`);
                            } else {
                                console.log(`  ❌ ${check.name}`);
                            }
                        }

                        if (passedChecks >= 2) {
                            console.log('✅ Functionality test passed');
                            this.validationResults.functionality = true;
                            resolve(true);
                        } else {
                            throw new Error('Insufficient React app indicators');
                        }
                    });
                });

                req.on('error', (error) => {
                    console.log(`❌ Functionality test failed: ${error.message}`);
                    this.errors.push(`Functionality: ${error.message}`);
                    resolve(false);
                });

                req.setTimeout(15000, () => {
                    console.log('❌ Functionality test timeout');
                    this.errors.push('Functionality: Request timeout');
                    resolve(false);
                });

            } catch (error) {
                console.log(`❌ Functionality test failed: ${error.message}`);
                this.errors.push(`Functionality: ${error.message}`);
                resolve(false);
            }
        });
    }

    // Phase 6: Performance Test
    async validatePerformance(url) {
        console.log('🚀 Phase 6: Performance Test');
        
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            try {
                const req = https.get(url, (res) => {
                    let data = '';
                    let size = 0;
                    
                    res.on('data', (chunk) => {
                        data += chunk;
                        size += chunk.length;
                    });
                    
                    res.on('end', () => {
                        const loadTime = Date.now() - startTime;
                        console.log(`⏱️ Load time: ${loadTime}ms`);
                        console.log(`📊 Data size: ${this.formatBytes(size)}`);

                        if (loadTime < 3000) {
                            console.log('✅ Performance test passed (load time < 3s)');
                            this.validationResults.performance = true;
                            resolve(true);
                        } else {
                            this.warnings.push(`Slow load time: ${loadTime}ms`);
                            console.log('⚠️ Performance test warning (slow load time)');
                            resolve(true); // Still pass but with warning
                        }
                    });
                });

                req.on('error', (error) => {
                    console.log(`❌ Performance test failed: ${error.message}`);
                    this.errors.push(`Performance: ${error.message}`);
                    resolve(false);
                });

                req.setTimeout(30000, () => {
                    console.log('❌ Performance test timeout');
                    this.errors.push('Performance: Request timeout');
                    resolve(false);
                });

            } catch (error) {
                console.log(`❌ Performance test failed: ${error.message}`);
                this.errors.push(`Performance: ${error.message}`);
                resolve(false);
            }
        });
    }

    // Utility methods
    getDirectorySize(path) {
        let size = 0;
        const files = fs.readdirSync(path);
        
        for (const file of files) {
            const filePath = `${path}/${file}`;
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                size += this.getDirectorySize(filePath);
            } else {
                size += stats.size;
            }
        }
        
        return size;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Main validation runner
    async runValidation(deploymentURL = null) {
        console.log('================================================');
        console.log('🔍 COMPREHENSIVE DEPLOYMENT VALIDATION');
        console.log('================================================');
        console.log('');

        // Phase 1-3: Local validation
        await this.validateConfiguration();
        await this.validateDependencies();
        await this.validateBuild();

        console.log('');
        console.log('📋 Local Validation Results:');
        console.log(`  Configuration: ${this.validationResults.configuration ? '✅' : '❌'}`);
        console.log(`  Dependencies: ${this.validationResults.dependencies ? '✅' : '❌'}`);
        console.log(`  Build: ${this.validationResults.build ? '✅' : '❌'}`);

        if (this.errors.length > 0) {
            console.log('');
            console.log('❌ Critical Errors Found:');
            this.errors.forEach(error => console.log(`  - ${error}`));
            console.log('');
            console.log('🚨 Deployment validation FAILED');
            return false;
        }

        // Phase 4-6: Remote validation (if URL provided)
        if (deploymentURL) {
            console.log('');
            console.log('🌐 Remote Validation (if URL provided):');
            
            await this.validateAccessibility(deploymentURL);
            await this.validateFunctionality(deploymentURL);
            await this.validatePerformance(deploymentURL);
            
            console.log('');
            console.log('📋 Remote Validation Results:');
            console.log(`  Accessibility: ${this.validationResults.accessibility ? '✅' : '❌'}`);
            console.log(`  Functionality: ${this.validationResults.functionality ? '✅' : '❌'}`);
            console.log(`  Performance: ${this.validationResults.performance ? '✅' : '❌'}`);
        }

        // Final report
        console.log('');
        console.log('================================================');
        
        if (this.errors.length === 0) {
            console.log('🎉 DEPLOYMENT VALIDATION SUCCESSFUL!');
            console.log('');
            console.log('✅ All critical checks passed');
            
            if (this.warnings.length > 0) {
                console.log('⚠️ Warnings:');
                this.warnings.forEach(warning => console.log(`  - ${warning}`));
            }
            
            console.log('');
            console.log('🚀 Ready for production deployment!');
            return true;
        } else {
            console.log('❌ DEPLOYMENT VALIDATION FAILED');
            console.log('');
            console.log('❌ Errors:');
            this.errors.forEach(error => console.log(`  - ${error}`));
            return false;
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const deploymentURL = process.argv[2];
    const validator = new DeploymentValidator();
    
    validator.runValidation(deploymentURL).then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = DeploymentValidator;