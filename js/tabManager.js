// Tab Manager for Multiple Graphs

class TabManager {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.tabCounter = 0;
        
        this.tabsContainer = document.getElementById('tabs');
        this.addTabBtn = document.getElementById('btn-add-tab');
        
        this.setupEventListeners();
        
        // Create first tab
        this.createTab('Graph 1', true);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.addTabBtn?.addEventListener('click', () => {
            this.createTab();
        });

        // Delegate click events for tabs
        this.tabsContainer?.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            const closeBtn = e.target.closest('.tab-close');

            if (closeBtn && tab) {
                e.stopPropagation();
                const tabId = tab.dataset.tabId;
                this.closeTab(tabId);
            } else if (tab) {
                const tabId = tab.dataset.tabId;
                this.switchTab(tabId);
            }
        });
    }

    /**
     * Create a new tab
     */
    createTab(name = null, isFirstTab = false) {
        const tabId = `tab_${++this.tabCounter}`;
        const tabName = name || `Graph ${this.tabCounter}`;

        const tab = {
            id: tabId,
            name: tabName,
            graphData: null, // Will store serialized graph
            filename: null // Track filename for this tab
        };

        this.tabs.push(tab);
        this.renderTabs();
        
        // For new tabs (not the first one), initialize with empty graph
        if (!isFirstTab) {
            // Save current tab before switching
            this.saveCurrentTab();
            this.switchTab(tabId);
            
            // Initialize new empty graph for the new tab
            if (window.app) {
                window.app.graph.clear();
                window.app.graph.metadata = {
                    name: tabName,
                    title: '',
                    description: '',
                    created: Utils.getCurrentDate(),
                    modified: Utils.getCurrentDate()
                };
                window.app.fileManager.clearCurrentFilename();
                window.app.renderer.clearSelection();
                window.app.renderer.render();
                window.app.propertiesPanel.hide();
                window.app.updateStats();
                window.app.history.clear();
                window.app.saveState();
            }
        } else {
            this.switchTab(tabId);
        }

        return tabId;
    }

    /**
     * Close a tab
     */
    closeTab(tabId) {
        if (this.tabs.length === 1) {
            alert('Cannot close the last tab');
            return;
        }

        const index = this.tabs.findIndex(t => t.id === tabId);
        if (index === -1) return;

        // Confirm if tab has content
        if (this.tabs[index].graphData) {
            if (!Utils.confirm('Close this tab? Unsaved changes will be lost.')) {
                return;
            }
        }

        this.tabs.splice(index, 1);

        // Switch to another tab if active tab was closed
        if (this.activeTabId === tabId) {
            const newActiveTab = this.tabs[Math.max(0, index - 1)];
            this.switchTab(newActiveTab.id);
        }

        this.renderTabs();
    }

    /**
     * Switch to a tab
     */
    switchTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Don't switch if already active
        if (this.activeTabId === tabId) {
            return;
        }

        // Save current tab's graph and filename
        if (this.activeTabId && window.app) {
            const currentTab = this.tabs.find(t => t.id === this.activeTabId);
            if (currentTab) {
                currentTab.graphData = window.app.graph.toJSON();
                currentTab.filename = window.app.fileManager.getCurrentFilename();
            }
        }

        this.activeTabId = tabId;

        // Load new tab's graph and filename
        if (window.app) {
            if (tab.graphData) {
                // Tab has existing data, load it
                window.app.loadGraph(tab.graphData);
                window.app.fileManager.setCurrentFilename(tab.filename);
            } else {
                // Tab is empty, but don't call newGraph() - just clear
                window.app.graph.clear();
                window.app.graph.metadata = {
                    name: tab.name,
                    title: '',
                    description: '',
                    created: Utils.getCurrentDate(),
                    modified: Utils.getCurrentDate()
                };
                window.app.fileManager.clearCurrentFilename();
                window.app.renderer.clearSelection();
                window.app.renderer.render();
                window.app.propertiesPanel.hide();
                window.app.updateStats();
                window.app.history.clear();
                window.app.saveState();
            }
        }

        this.renderTabs();
    }

    /**
     * Render tabs
     */
    renderTabs() {
        if (!this.tabsContainer) return;

        this.tabsContainer.innerHTML = this.tabs.map(tab => `
            <div class="tab ${tab.id === this.activeTabId ? 'active' : ''}" data-tab-id="${tab.id}">
                <span>${Utils.sanitizeHtml(tab.name)}</span>
                <button class="tab-close" title="Close tab">✕</button>
            </div>
        `).join('');
    }

    /**
     * Rename active tab
     */
    renameActiveTab(newName) {
        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (tab) {
            tab.name = newName;
            this.renderTabs();
        }
    }

    /**
     * Get active tab
     */
    getActiveTab() {
        return this.tabs.find(t => t.id === this.activeTabId);
    }

    /**
     * Save current tab data
     */
    saveCurrentTab() {
        if (this.activeTabId && window.app) {
            const currentTab = this.tabs.find(t => t.id === this.activeTabId);
            if (currentTab) {
                currentTab.graphData = window.app.graph.toJSON();
                currentTab.filename = window.app.fileManager.getCurrentFilename();
            }
        }
    }

    /**
     * Get all tabs data
     */
    getAllTabsData() {
        this.saveCurrentTab();
        return this.tabs.map(tab => ({
            id: tab.id,
            name: tab.name,
            graphData: tab.graphData,
            filename: tab.filename
        }));
    }

    /**
     * Load tabs from data
     */
    loadTabs(tabsData) {
        if (!tabsData || tabsData.length === 0) return;

        this.tabs = tabsData.map((data, index) => ({
            id: data.id || `tab_${index + 1}`,
            name: data.name || `Graph ${index + 1}`,
            graphData: data.graphData,
            filename: data.filename || null
        }));

        this.tabCounter = this.tabs.length;
        this.renderTabs();

        if (this.tabs.length > 0) {
            this.switchTab(this.tabs[0].id);
        }
    }
}

// Export
window.TabManager = TabManager;