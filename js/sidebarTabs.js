// Sidebar Tab Manager

class SidebarTabManager {
    constructor() {
        this.setupTabSwitching();
    }

    /**
     * Setup tab switching functionality
     */
    setupTabSwitching() {
        const sidebarTabs = document.querySelectorAll('.sidebar-tab');
        
        sidebarTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab);
            });
        });
    }

    /**
     * Switch to a specific tab
     */
    switchTab(clickedTab) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Add active class to clicked tab
        clickedTab.classList.add('active');
        
        // Show corresponding panel
        const tabName = clickedTab.getAttribute('data-tab');
        const targetPanel = document.getElementById(`${tabName}-tab`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    /**
     * Switch to tab by name
     */
    switchToTab(tabName) {
        const tab = document.querySelector(`.sidebar-tab[data-tab="${tabName}"]`);
        if (tab) {
            this.switchTab(tab);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SidebarTabManager();
});

// Export
window.SidebarTabManager = SidebarTabManager;