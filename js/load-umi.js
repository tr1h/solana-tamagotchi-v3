// ============================================
// DYNAMIC UMI SDK LOADER
// ============================================

const UmiLoader = {
    loaded: false,
    loading: false,
    
    async loadUmiSDK() {
        if (this.loaded) return true;
        if (this.loading) {
            // Wait for current loading to complete
            while (this.loading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.loaded;
        }
        
        this.loading = true;
        console.log('🔄 Loading Umi SDK dynamically...');
        
        try {
            // Load Umi core (try multiple CDNs)
            const umiUrls = [
                'https://cdn.jsdelivr.net/npm/@metaplex-foundation/umi@0.8.0/dist/index.umd.js',
                'https://unpkg.com/@metaplex-foundation/umi@0.8.0/dist/index.umd.js',
                'https://cdn.skypack.dev/@metaplex-foundation/umi@0.8.0'
            ];
            
            let umiLoaded = false;
            for (const url of umiUrls) {
                try {
                    await this.loadScript(url);
                    console.log('✅ Umi core loaded from:', url);
                    umiLoaded = true;
                    break;
                } catch (error) {
                    console.warn('⚠️ Failed to load Umi from:', url);
                }
            }
            
            if (!umiLoaded) {
                throw new Error('All Umi CDN sources failed');
            }
            
            // Load Umi bundle defaults
            const bundleUrls = [
                'https://cdn.jsdelivr.net/npm/@metaplex-foundation/umi-bundle-defaults@0.8.0/dist/index.umd.js',
                'https://unpkg.com/@metaplex-foundation/umi-bundle-defaults@0.8.0/dist/index.umd.js'
            ];
            
            let bundleLoaded = false;
            for (const url of bundleUrls) {
                try {
                    await this.loadScript(url);
                    console.log('✅ Umi bundle defaults loaded from:', url);
                    bundleLoaded = true;
                    break;
                } catch (error) {
                    console.warn('⚠️ Failed to load bundle from:', url);
                }
            }
            
            if (!bundleLoaded) {
                throw new Error('All bundle CDN sources failed');
            }
            
            // Load Candy Machine
            const candyUrls = [
                'https://cdn.jsdelivr.net/npm/@metaplex-foundation/mpl-candy-machine@0.1.0/dist/index.umd.js',
                'https://unpkg.com/@metaplex-foundation/mpl-candy-machine@0.1.0/dist/index.umd.js'
            ];
            
            let candyLoaded = false;
            for (const url of candyUrls) {
                try {
                    await this.loadScript(url);
                    console.log('✅ Candy Machine loaded from:', url);
                    candyLoaded = true;
                    break;
                } catch (error) {
                    console.warn('⚠️ Failed to load Candy Machine from:', url);
                }
            }
            
            if (!candyLoaded) {
                throw new Error('All Candy Machine CDN sources failed');
            }
            console.log('✅ Candy Machine loaded');
            
            // Verify all objects are available
            if (window['@metaplex-foundation/umi'] && 
                window['@metaplex-foundation/umi-bundle-defaults'] && 
                window['@metaplex-foundation/mpl-candy-machine']) {
                this.loaded = true;
                console.log('✅ All Umi SDK components loaded successfully!');
                return true;
            } else {
                throw new Error('Some Umi SDK components failed to load');
            }
            
        } catch (error) {
            console.error('❌ Failed to load Umi SDK:', error);
            this.loading = false;
            return false;
        } finally {
            this.loading = false;
        }
    },
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    async waitForUmiSDK() {
        const maxAttempts = 100; // 10 секунд максимум
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (this.loaded) {
                return true;
            }
            
            // Try to load if not already loading
            if (!this.loading) {
                await this.loadUmiSDK();
            }
            
            if (this.loaded) {
                return true;
            }
            
            console.log(`⏳ Waiting for Umi SDK... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.log('❌ Umi SDK failed to load after 10 seconds');
        return false;
    }
};

// Export for global use
window.UmiLoader = UmiLoader;

console.log('🔧 UmiLoader ready');

