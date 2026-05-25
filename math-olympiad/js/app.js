/* ===================================================================
   app.js — 应用主逻辑：状态管理、渲染、事件绑定
   =================================================================== */

const userAnswers = {};

// 草稿弹窗状态
const draftModal = {
    currentProblemId: null,
    spInstance: null,
    open(problemId, questionText) {
        this.currentProblemId = problemId;
        document.getElementById('spModalQuestion').textContent = questionText;
        // 重置弹窗内联宽高（清除拖拽缩放遗留的 inline 样式）
        const m = document.getElementById('scratchpadModalInner');
        if (m) {
            m.style.width = '';
            m.style.maxWidth = '';
            m.style.height = '';
        }
        // 清除容器上的初始化标记，确保 MiniScratchpad 能正常重建
        const container = document.getElementById('mini-sp-modal-draft');
        if (container) delete container.dataset.initialized;
        document.getElementById('scratchpadModal').style.display = 'flex';
        requestAnimationFrame(() => {
            this.spInstance = new MiniScratchpad('mini-sp-modal-draft', 'modal-draft', { initialHeight: 450 });
        });
    },
    close() {
        document.getElementById('scratchpadModal').style.display = 'none';
        if (this.spInstance) {
            this.spInstance.dispose();
            this.spInstance = null;
        }
        this.currentProblemId = null;
    },
    isResizing: false,
    _resizeStartX: 0, _resizeStartY: 0,
    _resizeStartW: 0, _resizeStartH: 0,
    startResize(e) {
        this.isResizing = true;
        const modal = document.getElementById('scratchpadModalInner');
        const rect = modal.getBoundingClientRect();
        this._resizeStartX = e.clientX;
        this._resizeStartY = e.clientY;
        this._resizeStartW = rect.width;
        this._resizeStartH = rect.height;
        modal.style.maxWidth = 'none';
        document.body.style.cursor = 'nwse-resize';
        document.body.style.userSelect = 'none';
        const onMove = (ev) => {
            const dw = ev.clientX - this._resizeStartX;
            const dh = ev.clientY - this._resizeStartY;
            modal.style.width = Math.max(400, this._resizeStartW + dw) + 'px';
            modal.style.height = Math.max(300, this._resizeStartH + dh) + 'px';
            if (this.spInstance) {
                // 动态计算画板高度：弹窗总高度 - 固定元素高度
                const headerEl = modal.querySelector('.modal-header');
                const questionEl = document.getElementById('spModalQuestion');
                const toolbarEl = modal.querySelector('.mini-sp-toolbar');
                const handleEl = modal.querySelector('.mini-sp-resize-handle');
                const hH = headerEl ? headerEl.offsetHeight : 50;
                const qH = questionEl ? questionEl.offsetHeight : 40;
                const tH = toolbarEl ? toolbarEl.offsetHeight : 36;
                const rH = handleEl ? handleEl.offsetHeight : 24;
                const pad = 28; // sp-modal-canvas padding: 12 top + 16 bottom
                const availableH = modal.clientHeight - hH - qH - tH - rH - pad;
                if (availableH > 80) this.spInstance.setHeight(availableH);
            }
        };
        const onUp = () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            setTimeout(() => { this.isResizing = false; }, 0);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }
};

const app = {
    currentCategory: CATEGORIES[0].id,
    difficultyFilter: 'all',
    schoolLevelFilter: 'all',
    problems: {},

    init: function () {
        loadCustomProblems();
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
                const sp = cat.hasScratchpad ? ' 📐' : '';
                return `<div class="nav-item ${active}" data-cat="${cat.id}">
                            <span class="icon">${cat.icon}</span>
                            <span>${cat.name}${sp}</span>
                            <span class="count">${count}</span>
                        </div>`;
            }).join('');
    },

    renderContent: function () {
        const main = document.getElementById('mainContent');
        const cat = CATEGORIES.find(c => c.id === this.currentCategory);
        if (!cat) { main.innerHTML = '<div class="empty-state"><p>分类加载失败</p></div>'; return; }

        let problems = this.problems[this.currentCategory] || [];

        if (this.schoolLevelFilter !== 'all') {
            problems = problems.filter(p => p.schoolLevel === this.schoolLevelFilter);
        }

        if (problems.length === 0) {
            main.innerHTML = `
                <div class="category-header">
                    <div class="category-title">${cat.icon} ${cat.name}</div>
                    <div class="category-desc">${cat.desc}</div>
                </div>
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <p>当前分类暂无题目，请刷新题库或调整筛选</p>
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

        // 事件委托
        grid.addEventListener('click', function (e) {
            const card = e.target.closest('.problem-card');
            if (!card) return;
            const pid = card.dataset.problemId;

            // 解析按钮
            const btn = e.target.closest('.btn-analyze');
            if (btn) { self.toggleSolution(pid, card, btn); return; }

            // 提交答案
            const submit = e.target.closest('.btn-submit-answer');
            if (submit) { self.checkAnswer(pid, card); return; }

            // 重新作答
            const retry = e.target.closest('.btn-retry');
            if (retry) { self.resetAnswer(pid, card); return; }

            // 草稿按钮
            const draft = e.target.closest('.btn-draft');
            if (draft) {
                const qel = card.querySelector('.question-text');
                draftModal.open(pid, qel ? qel.textContent : '');
                return;
            }

            // 删除自定义
            const del = e.target.closest('.btn-del-custom');
            if (del) { removeCustomProblem(pid); self.refresh(); }
        });

        // 回车提交答案
        grid.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const input = e.target.closest('.answer-input');
                if (input) {
                    const card = input.closest('.problem-card');
                    if (card) self.checkAnswer(card.dataset.problemId, card);
                }
            }
        });

        // 可视化 canvas + 草稿板
        problems.forEach((p) => {
            if (p.showSolution && p.visualizationType && p.vizData) {
                const canvas = grid.querySelector(`[data-problem-id="${p.id}"] .viz-canvas`);
                if (canvas) requestAnimationFrame(() => renderVisualization(canvas, p));
            }
            if ((cat.hasScratchpad || p.hasScratchpad) && !scratchpadInstances[p.id]) {
                const spContainer = grid.querySelector(`[data-problem-id="${p.id}"] .scratchpad-container`);
                if (spContainer && spContainer.id) {
                    requestAnimationFrame(() => initScratchpad(spContainer.id));
                }
            }
        });
    },

    renderCard: function (p, idx) {
        const diffClass = p.difficulty === '普通' ? 'easy' : (p.difficulty === '进阶' ? 'medium' : 'hard');
        const hasViz = p.visualizationType && p.vizData;
        const isCustom = p.isCustom;
        const hasGeoScratch = p.hasScratchpad;
        const schoolLevelLabel = p.schoolLevel || '';
        const ua = userAnswers[p.id] || {};

        const answerStatusClass = ua.status === 'correct' ? 'answer-correct' : (ua.status === 'wrong' ? 'answer-wrong' : '');
        const answerStatusText = ua.status === 'correct' ? '✅ 回答正确！' : (ua.status === 'wrong' ? '❌ 回答错误，再想想' : '');

        return `
            <div class="problem-card" data-problem-id="${p.id}">
                <div class="card-header">
                    <span class="card-id">#${idx + 1}</span>
                    <span style="display:flex;gap:6px;align-items:center">
                        ${schoolLevelLabel ? `<span class="school-level-badge">${schoolLevelLabel}</span>` : ''}
                        <span class="difficulty-badge ${diffClass}">${p.difficulty}</span>
                        ${isCustom ? `<span class="custom-badge">自定义</span>` : ''}
                    </span>
                </div>
                <div class="card-body">
                    <div class="question-text">${p.question}</div>

                    <!-- 草稿按钮（点击弹出大屏草稿） -->
                    <button class="btn-draft" data-problem-id="${p.id}">📝 草稿</button>

                    <!-- 答题区 -->
                    <div class="answer-area ${answerStatusClass}">
                        <div class="answer-row">
                            <span class="answer-label">我的答案：</span>
                            <input class="answer-input" type="text" placeholder="输入你的答案..." value="${ua.input || ''}" ${ua.status ? 'disabled' : ''}>
                            ${!ua.status
                                ? `<button class="btn-submit-answer">提交</button>`
                                : `<button class="btn-retry">重新作答</button>`
                            }
                        </div>
                        ${answerStatusText ? `<div class="answer-feedback">${answerStatusText}</div>` : ''}
                    </div>

                    <!-- 操作按钮 -->
                    <div class="card-actions" style="margin-top:10px">
                        <button class="btn-analyze ${p.showSolution ? 'active' : ''}">
                            ${p.showSolution ? '🔍 收起解析' : '📖 显示解析'}
                        </button>
                        ${isCustom ? `<button class="btn-del-custom" data-problem-id="${p.id}">🗑️</button>` : ''}
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

                ${hasGeoScratch ? `<div class="scratchpad-container" id="sp-${p.id}"></div>` : ''}
            </div>`;
    },

    // ---------- 答案检查 ----------
    checkAnswer: function (pid, card) {
        const problems = this.problems[this.currentCategory] || [];
        const p = problems.find(x => x.id === pid);
        if (!p) return;

        const input = card.querySelector('.answer-input');
        if (!input) return;
        const val = input.value.trim();
        if (!val) { alert('请先输入答案！'); return; }

        const correct = this._normalize(p.answer);
        const userAns = this._normalize(val);
        const isCorrect = userAns === correct || val.trim().toLowerCase() === p.answer.trim().toLowerCase();

        userAnswers[pid] = { input: val, status: isCorrect ? 'correct' : 'wrong', attempted: true };
        this._updateAnswerUI(card, pid);
    },

    resetAnswer: function (pid, card) {
        delete userAnswers[pid];
        this._updateAnswerUI(card, pid);
        // 重新渲染该题
        const input = card.querySelector('.answer-input');
        if (input) { input.disabled = false; input.value = ''; input.focus(); }
        const fb = card.querySelector('.answer-feedback');
        if (fb) fb.remove();
        const submitBtn = card.querySelector('.btn-submit-answer');
        const retryBtn = card.querySelector('.btn-retry');
        if (submitBtn) submitBtn.style.display = '';
        if (retryBtn) retryBtn.style.display = 'none';
        card.querySelector('.answer-area').classList.remove('answer-correct', 'answer-wrong');
    },

    _normalize: function (str) {
        // 去空格、去单位、去特殊字符，仅保留数字和小数点/分数/负号
        let s = str.trim().toLowerCase();
        // 尝试提取数字部分
        const nums = s.match(/-?\d+(\.\d+)?|\d+\/\d+/g);
        if (nums) return nums.join('');
        return s.replace(/[^a-z0-9]/g, '');
    },

    _updateAnswerUI: function (card, pid) {
        const ua = userAnswers[pid];
        if (!ua) return;
        const area = card.querySelector('.answer-area');
        if (!area) return;
        area.classList.remove('answer-correct', 'answer-wrong');
        area.classList.add(ua.status === 'correct' ? 'answer-correct' : 'answer-wrong');

        const input = card.querySelector('.answer-input');
        if (input) input.disabled = true;

        const submitBtn = card.querySelector('.btn-submit-answer');
        const retryBtn = card.querySelector('.btn-retry');
        if (submitBtn) submitBtn.style.display = 'none';
        if (retryBtn) retryBtn.style.display = '';

        let fb = card.querySelector('.answer-feedback');
        if (!fb) {
            fb = document.createElement('div');
            fb.className = 'answer-feedback';
            input.parentNode.appendChild(fb);
        }
        fb.textContent = ua.status === 'correct' ? '✅ 回答正确！' : '❌ 回答错误，再想想';
        fb.className = 'answer-feedback ' + (ua.status === 'correct' ? 'fb-correct' : 'fb-wrong');
    },

    // ---------- 解析开关 ----------
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
            if (p.visualizationType && p.vizData) {
                const canvas = card.querySelector('.viz-canvas');
                if (canvas) requestAnimationFrame(() => renderVisualization(canvas, p));
            }
            if (p.hasScratchpad || CATEGORIES.find(c => c.id === this.currentCategory)?.hasScratchpad) {
                const spContainer = card.querySelector('.scratchpad-container');
                if (spContainer && spContainer.id) {
                    requestAnimationFrame(() => initScratchpad(spContainer.id));
                }
            }
        } else {
            sol.classList.remove('open');
            btn.textContent = '📖 显示解析';
            btn.classList.remove('active');
        }
    },

    // ---------- 刷新 / 切换 ----------
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

    setSchoolLevel: function (level) {
        this.schoolLevelFilter = level;
        document.querySelectorAll('.filter-btn.school').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
        this.renderContent();
    },

    // ---------- 自定义题目 ----------
    showCustomForm: function () {
        const overlay = document.getElementById('customFormOverlay');
        if (overlay) overlay.style.display = 'flex';
    },

    hideCustomForm: function () {
        const overlay = document.getElementById('customFormOverlay');
        if (overlay) overlay.style.display = 'none';
    },

    submitCustomProblem: function () {
        const cat = document.getElementById('cf-category').value;
        const diff = document.getElementById('cf-difficulty').value;
        const level = document.getElementById('cf-schoolLevel').value;
        const question = document.getElementById('cf-question').value.trim();
        const steps = document.getElementById('cf-steps').value.trim();
        const answer = document.getElementById('cf-answer').value.trim();
        const hasScratch = document.getElementById('cf-scratchpad').checked;

        if (!question || !steps || !answer) {
            alert('请填写完整的题目信息（题目、解题步骤、答案为必填）');
            return;
        }

        const catObj = CATEGORIES.find(c => c.id === cat);
        addCustomProblem({
            categoryId: cat, categoryName: catObj ? catObj.name : '自定义',
            difficulty: diff, schoolLevel: level,
            question, solutionSteps: steps, answer,
            hasScratchpad: hasScratch
        });

        this.hideCustomForm();
        document.getElementById('customForm').reset();
        this.refresh();
        if (cat !== this.currentCategory) this.switchCategory(cat);
        alert('题目已添加成功！');
    },

    bindEvents: function () {
        const self = this;
        document.getElementById('categoryNav').addEventListener('click', function (e) {
            const item = e.target.closest('.nav-item');
            if (item) self.switchCategory(item.dataset.cat);
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function () { self.setDifficulty(this.dataset.difficulty); });
        });
        document.querySelectorAll('.filter-btn.school').forEach(btn => {
            btn.addEventListener('click', function () { self.setSchoolLevel(this.dataset.level); });
        });
        const overlay = document.getElementById('customFormOverlay');
        if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) self.hideCustomForm(); });
        document.getElementById('cf-submit')?.addEventListener('click', () => self.submitCustomProblem());
        document.getElementById('cf-cancel')?.addEventListener('click', () => self.hideCustomForm());

        // 草稿弹窗
        const spOverlay = document.getElementById('scratchpadModal');
        if (spOverlay) {
            spOverlay.addEventListener('click', function (e) {
                if (e.target === spOverlay && !draftModal.isResizing) draftModal.close();
            });
        }
        document.getElementById('spModalClose')?.addEventListener('click', () => draftModal.close());
        const resizeHandle = document.querySelector('.sp-modal-resize-handle');
        if (resizeHandle) resizeHandle.addEventListener('mousedown', (e) => { e.stopPropagation(); e.preventDefault(); draftModal.startResize(e); });
    }
};

document.addEventListener('DOMContentLoaded', function () { app.init(); });
