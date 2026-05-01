// js/sidebar.js
// renders the sidebar + handles active nav item + mobile toggle

function renderSidebar(activePage) {
    const user = getCurrentUser();
    if (!user) return;

    const isAdmin = user.role === 'admin';

    // nav items - admins get extra options
    const navItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', href: '/pages/dashboard.html' },
        { id: 'projects',  icon: '📁', label: 'Projects',  href: '/pages/projects.html' },
        { id: 'tasks',     icon: '✅', label: 'Tasks',     href: '/pages/tasks.html' },
        ...(isAdmin ? [
            { id: 'team',   icon: '👥', label: 'Team',     href: '/pages/team.html' },
            { id: 'activity', icon: '📋', label: 'Activity Log', href: '/pages/activity.html' },
        ] : []),
        { id: 'profile',   icon: '👤', label: 'Profile',   href: '/pages/profile.html' },
    ];

    const navHTML = navItems.map(item => `
        <button class="nav-item ${activePage === item.id ? 'active' : ''}"
            onclick="window.location.href='${item.href}'">
            <span class="nav-icon">${item.icon}</span>
            ${item.label}
        </button>
    `).join('');

    const sidebarHTML = `
        <div class="sidebar-logo">
            <h2>⚡ TaskFlow</h2>
            <p>Team Task Manager</p>
        </div>
        <nav class="sidebar-nav">
            ${navHTML}
        </nav>
        <div class="sidebar-footer">
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-role"><span class="badge badge-${user.role}">${user.role}</span></div>
            </div>
            <button class="nav-item" onclick="logout()">
                <span class="nav-icon">🚪</span> Logout
            </button>
        </div>
    `;

    // inject sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.innerHTML = sidebarHTML;

    // mobile hamburger toggle
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('sidebarOverlay');
    if (hamburger) {
        hamburger.onclick = () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        };
    }
    if (overlay) {
        overlay.onclick = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        };
    }
}

window.renderSidebar = renderSidebar;
