/**
 * ImageManager - Handles image paste, storage, and retrieval
 */
class ImageManager {
    constructor() {
		this.dbName = 'NodeBookImages';
		this.storeName = 'images';
		this.db = null;
		this.loadedImages = {}; // Images loaded from companion JSON
		this.ready = this.init(); // Store promise for ready state
	}

    /**
     * Initialize IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }
	
	/**
	 * Check storage quota and estimate usage
	 * @returns {Object} {available: boolean, usedMB: number, totalMB: number, percentUsed: number}
	 */
	async checkStorageQuota() {
		try {
			if (navigator.storage && navigator.storage.estimate) {
				const estimate = await navigator.storage.estimate();
				const usedBytes = estimate.usage || 0;
				const totalBytes = estimate.quota || 0;
				const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
				const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
				const percentUsed = totalBytes > 0 ? ((usedBytes / totalBytes) * 100).toFixed(1) : 0;
				
				// Consider storage full if over 90% used
				const available = percentUsed < 90;
				
				return {
					available,
					usedMB: parseFloat(usedMB),
					totalMB: parseFloat(totalMB),
					percentUsed: parseFloat(percentUsed),
					usedBytes,
					totalBytes
				};
			} else {
				// Fallback if Storage API not available
				console.warn('Storage API not available, quota check skipped');
				return { available: true, usedMB: 0, totalMB: 0, percentUsed: 0 };
			}
		} catch (error) {
			console.error('Error checking storage quota:', error);
			return { available: true, usedMB: 0, totalMB: 0, percentUsed: 0 };
		}
	}

    /**
	 * Store image in IndexedDB with quota management
	 */
	async storeImage(imageId, dataUrl) {
		// Check storage quota before attempting to store
		const quota = await this.checkStorageQuota();
		
		if (!quota.available) {
			const error = new Error(`Storage quota exceeded: ${quota.percentUsed}% used (${quota.usedMB}MB / ${quota.totalMB}MB)`);
			error.code = 'QUOTA_EXCEEDED';
			error.quotaInfo = quota;
			throw error;
		}
		
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([this.storeName], 'readwrite');
			const store = transaction.objectStore(this.storeName);
			const request = store.put(dataUrl, imageId);

			request.onsuccess = () => resolve(imageId);
			request.onerror = (event) => {
				const error = event.target.error;
				
				// Handle quota exceeded error specifically
				if (error.name === 'QuotaExceededError') {
					const quotaError = new Error('Storage quota exceeded. Please free up space or export images.');
					quotaError.code = 'QUOTA_EXCEEDED';
					quotaError.originalError = error;
					reject(quotaError);
				} else {
					reject(error);
				}
			};
		});
	}

    /**
     * Retrieve image from IndexedDB or loaded images
     */
    async getImage(imageId) {
        // Check loaded images first
        if (this.loadedImages[imageId]) {
            return this.loadedImages[imageId];
        }

        // Check IndexedDB
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(imageId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all images for export
     */
    async getAllImages() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.openCursor();
            const images = {};

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    images[cursor.key] = cursor.value;
                    cursor.continue();
                } else {
                    resolve(images);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Load images from companion JSON
     */
    loadImagesFromJSON(imagesData) {
        this.loadedImages = { ...imagesData };
    }

    /**
     * Check if there are any image references in graph
     */
    hasImageReferences(graph) {
        for (const node of graph.nodes) {
            if (node.link1?.startsWith('image://') ||
                node.link2?.startsWith('image://') ||
                node.link3?.startsWith('image://') ||
                node.link4?.startsWith('image://')) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate unique image ID
     */
    generateImageId() {
        return 'image_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
	
	/**
	 * Get storage usage information for display
	 * @returns {string} Formatted storage info
	 */
	async getStorageInfo() {
		const quota = await this.checkStorageQuota();
		
		if (quota.totalMB > 0) {
			return `Storage: ${quota.usedMB}MB / ${quota.totalMB}MB (${quota.percentUsed}%)`;
		} else {
			return 'Storage: Unknown';
		}
	}
	
}