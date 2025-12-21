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
     * Store image in IndexedDB
     */
    async storeImage(imageId, dataUrl) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(dataUrl, imageId);

            request.onsuccess = () => resolve(imageId);
            request.onerror = () => reject(request.error);
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
}