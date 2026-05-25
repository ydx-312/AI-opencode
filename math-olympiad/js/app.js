/* ===================================================================
   app.js — 应用主逻辑：状态管理、渲染、事件绑定
   =================================================================== */

const app = {
    currentCategory: CATEGORIES[0].id,
    difficultyFilter: 'all',
    problems: {},

    init: function () {
        this.problems = refreshAllProblems(this.difficultyFilter);
        this.renderSidebar();
        this.renderContent();
        this.bindEvents();
    },

    renderSidebar: function () {
        const nav = document.getElementById('categoryNav');
        nav.innerHTML = '<div class="sidebar-title">题型分类</div>' +
            CATEGORIES.map(cat => {
                const count = (this.problems[cat.id] || []).length;
                const active = cat.id === this.currentCategory ? 'active' : '';
                return `<div class="nav-item ${active}" data-cat="${cat.id}">
                            <span class="icon">${cat.icon}</span>
                            <span>${cat.name}</span>
                            <span class="count">${count}</span>
                        </div>`;
            }).join('');
    },

    renderContent: function () {
        const main = document.getElementById('mainContent');
        const cat = CATEGORIES.find(c => c.id === this.currentCategory);
        if (!cat) { main.innerHTML = '<div class="empty-state"><p>分类加载失败</p></div>'; return; }

        const problems = this.problems[this.currentCategory] || [];

        if (problems.length === 0) {
            main.innerHTML = `
                <div class="category-header">
                    <div class="category-title">${cat.icon} ${cat.name}</div>
                    <div class="category-desc">${cat.desc}</div>
                </div>
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <p>当前分类暂无题目，请刷新题库</p>
                </div>`;
            return;
        }

        main.innerHTML = `
            <div class="category-header">
                <div class="category-title">${cat.icon} ${cat.name}</div>
                <div class="category-desc">${cat.desc} — 共 ${problems.length} 题</div>
            </div>
            <div class="problems-grid" id="problemsGrid">
                ${problems.map((p, idx) => this.renderCard(p, idx)).join('')}
            </div>`;

        const grid = document.getElementById('problemsGrid');
        const self = this;

        // 使用事件委托处理所有解析按钮点击
        grid.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-analyze');
            if (!btn) return;
            const card = btn.closest('.problem-card');
            if (!card) return;
            const pid = card.dataset.problemId;
            self.toggleSolution(pid, card, btn);
        });

        // 渲染所有 canvas
        problems.forEach((p) => {
            if (p.visualizationType && p.vizData) {
                const canvas = grid.querySelector(`[data-problem-id="${p.id}"] .viz-canvas`);
                if (canvas && p.showSolution) {
                    requestAnimationFrame(() => renderVisualization(canvas, p));
                }
            }
        });
    },

    renderCard: function (p, idx) {
        const diffClass = p.difficulty === '普通' ? 'easy' : (p.difficulty === '进阶' ? 'medium' : 'hard');
        const hasViz = p.visualizationType && p.vizData;
        return `
            <div class="problem-card" data-problem-id="${p.id}">
                <div class="card-header">
                    <span class="card-id">#${idx + 1}</span>
                    <span class="difficulty-badge ${diffClass}">${p.difficulty}</span>
                </div>
                <div class="card-body">
                    <div class="question-text">${p.question}</div>
                    <div class="card-actions">
                        <button class="btn-analyze ${p.showSolution ? 'active' : ''}">
                            ${p.showSolution ? '🔍 收起解析' : '📖 显示解析'}
                        </button>
                    </div>
                </div>
                <div class="solution-section ${p.showSolution ? 'open' : ''}">
                    <div class="solution-title">📝 解题步骤</div>
                    <ol class="solution-steps">
                        ${p.solutionSteps.map(s => `<li class="solution-step">${s}</li>`).join('')}
                    </ol>
                    <div class="solution-answer">
                        答案：<span class="num">${p.answer}</span>
                    </div>
                    ${hasViz ? `
                        <div class="canvas-wrapper">
                            <canvas class="viz-canvas"></canvas>
                            <div class="canvas-label">📊 图解分析（辅助理解）</div>
                        </div>
                    ` : ''}
                </div>
            </div>`;
    },

    toggleSolution: function (pid, card, btn) {
        const problems = this.problems[this.currentCategory] || [];
        const p = problems.find(x => x.id === pid);
        if (!p) return;

        p.showSolution = !p.showSolution;
        const sol = card.querySelector('.solution-section');
        if (p.showSolution) {
            sol.classList.add('open');
            btn.textContent = '🔍 收起解析';
            btn.classList.add('active');
            // 如果有 canvas，渲染
            if (p.visualizationType && p.vizData) {
                const canvas = card.querySelector('.viz-canvas');
                if (canvas) requestAnimationFrame(() => renderVisualization(canvas, p));
            }
        } else {
            sol.classList.remove('open');
            btn.textContent = '📖 显示解析';
            btn.classList.remove('active');
        }
    },

    refresh: function () {
        this.problems = refreshAllProblems(this.difficultyFilter);
        this.renderSidebar();
        this.renderContent();
    },

    switchCategory: function (catId) {
        this.currentCategory = catId;
        this.renderSidebar();
        this.renderContent();
    },

    setDifficulty: function (diff) {
        this.difficultyFilter = diff;
        this.problems = refreshAllProblems(this.difficultyFilter);
        this.renderSidebar();
        this.renderContent();
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === diff);
        });
    },

    bindEvents: function () {
        const self = this;
        document.getElementById('categoryNav').addEventListener('click', function (e) {
            const item = e.target.closest('.nav-item');
            if (item) self.switchCategory(item.dataset.cat);
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                self.setDifficulty(this.dataset.difficulty);
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', function () { app.init(); });
