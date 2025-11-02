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
        this.createTab('Graph 1');
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
    createTab(name = null) {
        const tabId = `tab_${++this.tabCounter}`;
        const tabName = name || `Graph ${this.tabCounter}`;

        const tab = {
            id: tabId,
            name: tabName,
            graphData: null // Will store serialized graph
        };

        this.tabs.push(tab);
        this.renderTabs();
        this.switchTab(tabId);

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

        // Save current tab's graph
        if (this.activeTabId && window.app) {
            const currentTab = this.tabs.find(t => t.id === this.activeTabId);
            if (currentTab) {
                currentTab.graphData = window.app.graph.toJSON();
            }
        }

        this.activeTabId = tabId;

        // Load new tab's graph
        if (window.app) {
            if (tab.graphData) {
                window.app.loadGraph(tab.graphData);
            } else {
                window.app.newGraph();
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
            graphData: tab.graphData
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
            graphData: data.graphData
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
