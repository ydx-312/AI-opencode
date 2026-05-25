/* ===================================================================
   scratchpad.js — 几何草稿面板 & 智能解题画板
   支持：画笔 ✏️ 线段 圆 半圆 矩形 文字 橡皮 拖拽缩放
   =================================================================== */

// =============================================================
//  MiniScratchpad — 每道题的智能草稿板
// =============================================================
class MiniScratchpad {
    constructor(containerId, problemId, options = {}) {
        this.container = document.getElementById(containerId);
        this.problemId = problemId;
        if (!this.container || this.container.dataset.initialized === '1') return;
        this.container.dataset.initialized = '1';

        this._disposed = false;

        this.objects = [];       // { type, ... }
        this.texts = [];         // { type:'text', x, y, text, color, size }
        this.state = {
            tool: 'pen',
            color: '#2c3e50',
            lineWidth: 2,
            fontSize: 16,
            isDrawing: false,
            startX: 0, startY: 0,
            lastX: 0, lastY: 0,
            tempObj: null,       // 预览中的图形
            currentPen: null,    // 画笔当前笔触
            isResizing: false,
            resizeStartY: 0,
            resizeStartH: 0,
            dashed: false,       // 实线/虚线切换
            polygonPoints: [],   // 多边形顶点
            polygonActive: false
        };

        this.defaultH = options.initialHeight || 140;
        this.canvasH = this.defaultH;

        this._createUI();
        this._bindEvents();
        this.render();
    }

    dispose() {
        if (this._disposed) return;
        this._disposed = true;
        delete this.container.dataset.initialized;
        this.objects = [];
        this.texts = [];
        if (this._docMouseUp) document.removeEventListener('mouseup', this._docMouseUp);
        this.container.innerHTML = '';
    }

    _createUI() {
        this.container.innerHTML = `
            <div class="mini-scratchpad">
                <div class="mini-sp-toolbar">
                    <button class="mini-sp-btn active" data-tool="pen" title="自由画笔">✏️</button>
                    <button class="mini-sp-btn" data-tool="line" title="直线段">📏</button>
                    <button class="mini-sp-btn" data-tool="arrow" title="箭头">➤</button>
                    <button class="mini-sp-btn" data-tool="polygon" title="多边形">⬠</button>
                    <button class="mini-sp-btn" data-tool="circle" title="圆">⭕</button>
                    <button class="mini-sp-btn" data-tool="semicircle" title="半圆">🌓</button>
                    <button class="mini-sp-btn" data-tool="rect" title="矩形">▭</button>
                    <button class="mini-sp-btn" data-tool="cone" title="圆锥">△</button>
                    <button class="mini-sp-btn" data-tool="cylinder" title="圆柱">⬡</button>
                    <span class="mini-sp-sep"></span>
                    <button class="mini-sp-btn state-solid active" data-tool="dash-toggle" title="实线模式">━</button>
                    <button class="mini-sp-btn state-dashed" data-tool="dash-toggle" title="虚线模式">┅</button>
                    <span class="mini-sp-sep"></span>
                    <button class="mini-sp-btn" data-tool="text" title="文字">Ａ</button>
                    <button class="mini-sp-btn" data-tool="eraser" title="擦除">🧹</button>
                    <button class="mini-sp-btn mini-sp-danger" data-tool="clear" title="清空所有">🗑️</button>
                    <span class="mini-sp-sep"></span>
                    <input type="color" class="mini-sp-color" value="#2c3e50" title="颜色">
                    <select class="mini-sp-size" title="线粗">
                        <option value="1">极细</option>
                        <option value="2" selected>细</option>
                        <option value="4">中</option>
                        <option value="6">粗</option>
                    </select>
                </div>
                <div class="mini-sp-canvas-wrap">
                    <canvas class="mini-sp-canvas" style="height:${this.canvasH}px"></canvas>
                </div>
                <div class="mini-sp-resize-handle" title="拖拽调整高度">⋮</div>
            </div>`;

        this.canvas = this.container.querySelector('.mini-sp-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeHandle = this.container.querySelector('.mini-sp-resize-handle');
        this._resizeCanvas();
    }

    _resizeCanvas() {
        const wrap = this.container.querySelector('.mini-sp-canvas-wrap');
        const rect = wrap.getBoundingClientRect();
        const dpr = devicePixelRatio || 1;
        this.canvasW = Math.max(Math.round(rect.width) || 400, 200);
        this.canvas.style.width = this.canvasW + 'px';
        this.canvas.style.height = this.canvasH + 'px';
        this.canvas.width = this.canvasW * dpr;
        this.canvas.height = this.canvasH * dpr;
        this.ctx.scale(dpr, dpr);
    }

    // ----- 工具切换 -----
    _setTool(tool) {
        if (tool === 'clear') { this._clearAll(); return; }
        if (tool === 'dash-toggle') {
            this.state.dashed = !this.state.dashed;
            this.container.querySelectorAll('.mini-sp-btn.state-solid').forEach(b =>
                b.classList.toggle('active', !this.state.dashed));
            this.container.querySelectorAll('.mini-sp-btn.state-dashed').forEach(b =>
                b.classList.toggle('active', this.state.dashed));
            return;
        }
        // 切出多边形时，若顶点>=3则保存当前多边形
        if (this.state.tool === 'polygon' && tool !== 'polygon' && this.state.polygonPoints.length >= 3) {
            this._finishPolygon();
        } else if (this.state.tool === 'polygon' && tool !== 'polygon') {
            this.state.polygonPoints = [];
        }
        this.state.tool = tool;
        this.container.querySelectorAll('.mini-sp-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.tool === tool));
        this.canvas.style.cursor = tool === 'text' ? 'text' :
            tool === 'eraser' ? 'not-allowed' : 'crosshair';
    }

    // ----- 对外：设置画板高度 -----
    setHeight(h) {
        this.canvasH = Math.max(80, Math.min(h, 600));
        this.canvas.style.height = this.canvasH + 'px';
        this._resizeCanvas();
        this.render();
    }

    // ----- 对外：适配容器尺寸变化 -----
    resize() {
        this._resizeCanvas();
        this.render();
    }

    // ----- 清空 -----
    _clearAll() {
        this.objects = [];
        this.texts = [];
        this.state.currentPen = null;
        this.state.tempObj = null;
        this.state.polygonPoints = [];
        this.state.polygonActive = false;
        this.render();
    }

    // ----- 完成多边形 -----
    _finishPolygon() {
        const pts = this.state.polygonPoints;
        if (pts.length < 3) return;
        this.objects.push({
            type: 'polygon',
            points: pts.map(p => ({ x: p.x, y: p.y })),
            color: this.state.color,
            width: this.state.lineWidth,
            dashed: this.state.dashed
        });
        this.state.polygonPoints = [];
        this.state.polygonActive = false;
        this.render();
    }

    // ==================== 事件绑定 ====================
    _bindEvents() {
        const self = this;

        // 工具按钮
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.mini-sp-btn');
            if (btn) { self._setTool(btn.dataset.tool); return; }
        });

        // 颜色 / 粗细
        this.container.querySelector('.mini-sp-color').addEventListener('input', (e) => {
            self.state.color = e.target.value;
        });
        this.container.querySelector('.mini-sp-size').addEventListener('change', (e) => {
            self.state.lineWidth = parseInt(e.target.value);
        });

        // --- 画布鼠标/触摸事件 ---
        const canvas = this.canvas;

        const getPos = (e) => {
            const r = canvas.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: cx - r.left, y: cy - r.top };
        };

        // --- mousedown ---
        const onStart = (e) => {
            const pos = getPos(e);
            const tool = self.state.tool;

            if (tool === 'text') {
                const txt = prompt('输入文字：');
                if (txt && txt.trim()) {
                    self.texts.push({
                        type: 'text',
                        x: pos.x, y: pos.y,
                        text: txt.trim(),
                        color: self.state.color,
                        size: self.state.lineWidth * 6 + 8
                    });
                    self.render();
                }
                return;
            }

            if (tool === 'eraser') {
                self._eraseAt(pos.x, pos.y);
                return;
            }

            // --- 多边形：点击加顶点 ---
            if (tool === 'polygon') {
                const pts = self.state.polygonPoints;
                // 如果点击靠近第一个顶点并且至少3个点，闭合
                if (pts.length >= 3 && Math.hypot(pos.x - pts[0].x, pos.y - pts[0].y) < 12) {
                    self._finishPolygon();
                    return;
                }
                pts.push({ x: pos.x, y: pos.y });
                self.state.polygonActive = true;
                self.state.tempObj = { x2: pos.x, y2: pos.y }; // 用于预览
                self.render();
                return;
            }

            // --- 圆锥 / 圆柱：拖动定义 ---
            if (tool === 'cone' || tool === 'cylinder') {
                self.state.isDrawing = true;
                self.state.startX = pos.x;
                self.state.startY = pos.y;
                self.state.tempObj = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
                return;
            }

            self.state.isDrawing = true;
            self.state.startX = pos.x;
            self.state.startY = pos.y;
            self.state.lastX = pos.x;
            self.state.lastY = pos.y;

            if (tool === 'pen') {
                self.state.currentPen = {
                    type: 'pen',
                    points: [{ x: pos.x, y: pos.y }],
                    color: self.state.color,
                    width: self.state.lineWidth
                };
            } else {
                // 其他几何图形（line, circle, semicircle, rect, arrow）
                self.state.tempObj = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
            }
        };

        // --- mousemove ---
        const onMove = (e) => {
            const pos = getPos(e);

            // 拖拽调大小
            if (self.state.isResizing) {
                const dh = pos.y - self.state.resizeStartY;
                const newH = self.state.resizeStartH + dh;
                self.setHeight(newH);
                return;
            }

            // 多边形：从最后顶点到光标的预览线
            if (self.state.tool === 'polygon' && self.state.polygonActive) {
                self.state.tempObj.x2 = pos.x;
                self.state.tempObj.y2 = pos.y;
                self.render();
                self._drawTempPolygonPreview(pos);
                return;
            }

            if (!self.state.isDrawing) return;

            if (self.state.tool === 'pen' && self.state.currentPen) {
                self.state.currentPen.points.push({ x: pos.x, y: pos.y });
                const ctx = self.ctx;
                ctx.save();
                ctx.strokeStyle = self.state.currentPen.color;
                ctx.lineWidth = self.state.currentPen.width;
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(self.state.lastX, self.state.lastY);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.restore();
                self.state.lastX = pos.x; self.state.lastY = pos.y;
            } else if (self.state.tempObj) {
                // 几何图形预览
                self.state.tempObj.x2 = pos.x;
                self.state.tempObj.y2 = pos.y;
                self.render();
                self._drawTemp(self.state.tempObj);
            }
        };

        // --- mouseup ---
        const onEnd = (e) => {
            if (self.state.isResizing) {
                self.state.isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                return;
            }

            if (self.state.tool === 'polygon') {
                // 多边形用点击，不用 drag 结束
                return;
            }

            if (!self.state.isDrawing) return;
            self.state.isDrawing = false;

            if (self.state.tool === 'pen' && self.state.currentPen) {
                self.objects.push(self.state.currentPen);
                self.state.currentPen = null;
                return;
            }

            if (self.state.tempObj) {
                const dx = self.state.tempObj.x2 - self.state.tempObj.x1;
                const dy = self.state.tempObj.y2 - self.state.tempObj.y1;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 5) {
                    const obj = {
                        type: self.state.tool,
                        x1: self.state.tempObj.x1, y1: self.state.tempObj.y1,
                        x2: self.state.tempObj.x2, y2: self.state.tempObj.y2,
                        color: self.state.color,
                        width: self.state.lineWidth,
                        dashed: self.state.tool === 'line' || self.state.tool === 'arrow' ? self.state.dashed : false
                    };
                    if (self.state.tool === 'circle' || self.state.tool === 'semicircle') {
                        obj.cx = self.state.tempObj.x1;
                        obj.cy = self.state.tempObj.y1;
                        obj.r = dist;
                    }
                    if (self.state.tool === 'rect') {
                        obj.x = Math.min(obj.x1, obj.x2);
                        obj.y = Math.min(obj.y1, obj.y2);
                        obj.w = Math.abs(dx);
                        obj.h = Math.abs(dy);
                    }
                    if (self.state.tool === 'cone' || self.state.tool === 'cylinder') {
                        obj.cx = self.state.tempObj.x1;
                        obj.cy = self.state.tempObj.y1;
                        obj.r = Math.abs(dx);
                        obj.h = Math.abs(dy);
                        obj.dashed = self.state.dashed;
                    }
                    self.objects.push(obj);
                }
                self.state.tempObj = null;
                self.render();
            }
        };

        // 注册画布事件
        canvas.addEventListener('mousedown', onStart);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onEnd);
        canvas.addEventListener('mouseleave', (e) => { if (self.state.isDrawing) onEnd(e); });
        canvas.addEventListener('touchstart', onStart, { passive: false });
        canvas.addEventListener('touchmove', onMove, { passive: false });
        canvas.addEventListener('touchend', onEnd, { passive: false });

        // 双击完成多边形
        canvas.addEventListener('dblclick', (e) => {
            if (self.state.tool === 'polygon' && self.state.polygonPoints.length >= 3) {
                e.preventDefault();
                self._finishPolygon();
            }
        });

        // --- 拖拽调大小 ---
        this.resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            self.state.isResizing = true;
            self.state.resizeStartY = e.clientY;
            self.state.resizeStartH = self.canvasH;
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';
        });
        this.resizeHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            self.state.isResizing = true;
            self.state.resizeStartY = e.touches[0].clientY;
            self.state.resizeStartH = self.canvasH;
        }, { passive: false });

        // 全局 mouseup 确保释放
        self._docMouseUp = () => {
            if (self.state.isResizing) {
                self.state.isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };
        document.addEventListener('mouseup', self._docMouseUp);
    }

    // ==================== 擦除 ====================
    _eraseAt(ex, ey) {
        const r = 12;
        this.objects = this.objects.filter(obj => {
            if (obj.type === 'pen')
                return !obj.points.some(p => Math.hypot(p.x - ex, p.y - ey) < r);
            if (obj.type === 'line' || obj.type === 'arrow')
                return Math.hypot((obj.x1 + obj.x2) / 2 - ex, (obj.y1 + obj.y2) / 2 - ey) > r;
            if (obj.type === 'polygon') {
                const cx = obj.points.reduce((s, p) => s + p.x, 0) / obj.points.length;
                const cy = obj.points.reduce((s, p) => s + p.y, 0) / obj.points.length;
                return Math.hypot(cx - ex, cy - ey) > r;
            }
            if (obj.type === 'circle' || obj.type === 'semicircle')
                return Math.hypot(obj.cx - ex, obj.cy - ey) > r;
            if (obj.type === 'rect')
                return Math.hypot((obj.x + obj.w / 2) - ex, (obj.y + obj.h / 2) - ey) > r;
            if (obj.type === 'cone' || obj.type === 'cylinder')
                return Math.hypot(obj.cx - ex, (obj.cy + obj.h / 2) - ey) > r;
            return true;
        });
        this.texts = this.texts.filter(t => Math.hypot(t.x - ex, t.y - ey) > r);
        this.render();
    }

    // ==================== 绘图 ====================
    render() {
        const ctx = this.ctx;
        const w = this.canvasW, h = this.canvasH;
        const dpr = devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        // 背景
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, w, h);

        // 网格
        ctx.save();
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        ctx.restore();

        // 绘制所有对象
        this.objects.forEach(obj => this._drawObject(ctx, obj));

        // 绘制多边形预览（已完成但正在显示的顶点）
        if (this.state.polygonActive && this.state.polygonPoints.length > 0) {
            const pts = this.state.polygonPoints;
            ctx.save();
            ctx.fillStyle = this.state.color;
            pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });
            ctx.restore();
        }

        this.texts.forEach(t => {
            ctx.save();
            ctx.fillStyle = t.color;
            ctx.font = `bold ${t.size}px "Microsoft YaHei", sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        });
    }

    _drawObject(ctx, obj) {
        ctx.save();
        ctx.strokeStyle = obj.color || '#2c3e50';
        ctx.lineWidth = obj.width || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (obj.dashed) ctx.setLineDash([8, 5]);

        switch (obj.type) {
            case 'pen': {
                if (obj.points.length < 2) break;
                ctx.beginPath();
                ctx.moveTo(obj.points[0].x, obj.points[0].y);
                for (let i = 1; i < obj.points.length; i++)
                    ctx.lineTo(obj.points[i].x, obj.points[i].y);
                ctx.stroke();
                break;
            }
            case 'line': {
                ctx.beginPath();
                ctx.moveTo(obj.x1, obj.y1);
                ctx.lineTo(obj.x2, obj.y2);
                ctx.stroke();
                break;
            }
            case 'arrow': {
                const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
                const headLen = Math.max(14, obj.width * 5);
                ctx.beginPath();
                ctx.moveTo(obj.x1, obj.y1);
                ctx.lineTo(obj.x2, obj.y2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(obj.x2, obj.y2);
                ctx.lineTo(obj.x2 - headLen * Math.cos(angle - Math.PI / 7),
                    obj.y2 - headLen * Math.sin(angle - Math.PI / 7));
                ctx.moveTo(obj.x2, obj.y2);
                ctx.lineTo(obj.x2 - headLen * Math.cos(angle + Math.PI / 7),
                    obj.y2 - headLen * Math.sin(angle + Math.PI / 7));
                ctx.stroke();
                break;
            }
            case 'polygon': {
                const pts = obj.points;
                if (pts.length < 2) break;
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.closePath();
                ctx.stroke();
                // 顶点小点
                ctx.fillStyle = obj.color;
                pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill(); });
                break;
            }
            case 'circle': {
                ctx.beginPath();
                ctx.arc(obj.cx, obj.cy, obj.r, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            case 'semicircle': {
                const angle = Math.atan2(obj.y2 - obj.cy, obj.x2 - obj.cx);
                ctx.beginPath();
                ctx.arc(obj.cx, obj.cy, obj.r, angle, angle + Math.PI);
                ctx.stroke();
                break;
            }
            case 'rect': {
                ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
                break;
            }
            case 'cone': {
                const bcx = obj.cx, bcy = obj.cy + obj.h;
                ctx.beginPath();
                ctx.ellipse(bcx, bcy, obj.r, obj.r * 0.35, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(bcx - obj.r, bcy);
                ctx.lineTo(obj.cx, obj.cy);
                ctx.lineTo(bcx + obj.r, bcy);
                ctx.stroke();
                break;
            }
            case 'cylinder': {
                const tCy = obj.cy, bCy = obj.cy + obj.h;
                ctx.beginPath();
                ctx.ellipse(obj.cx, tCy, obj.r, obj.r * 0.3, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(obj.cx - obj.r, tCy);
                ctx.lineTo(obj.cx - obj.r, bCy);
                ctx.moveTo(obj.cx + obj.r, tCy);
                ctx.lineTo(obj.cx + obj.r, bCy);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(obj.cx, bCy, obj.r, obj.r * 0.3, 0, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            default: break;
        }
        ctx.restore();
    }

    // ----- 多边形顶点到光标的预览线 -----
    _drawTempPolygonPreview(pos) {
        const ctx = this.ctx;
        const pts = this.state.polygonPoints;
        if (pts.length === 0) return;
        ctx.save();
        ctx.strokeStyle = this.state.color;
        ctx.lineWidth = this.state.lineWidth;
        ctx.lineCap = 'round';
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        // 如果是闭合位置，画闭合提示
        if (pts.length >= 3 && Math.hypot(pos.x - pts[0].x, pos.y - pts[0].y) < 12) {
            ctx.strokeStyle = '#27ae60';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
            ctx.lineTo(pts[0].x, pts[0].y);
            ctx.stroke();
        }
        ctx.restore();
    }

    // ----- 预览图形（仅用 stroke，不保存）-----
    _drawTemp(temp) {
        if (!temp) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = this.state.color;
        ctx.lineWidth = this.state.lineWidth;
        ctx.lineCap = 'round';
        ctx.setLineDash([5, 4]);

        const t = this.state.tool;
        const dx = temp.x2 - temp.x1, dy = temp.y2 - temp.y1;
        const dist = Math.hypot(dx, dy);

        if (t === 'line') {
            ctx.beginPath(); ctx.moveTo(temp.x1, temp.y1); ctx.lineTo(temp.x2, temp.y2); ctx.stroke();
        } else if (t === 'arrow') {
            const angle = Math.atan2(dy, dx);
            const headLen = Math.max(14, this.state.lineWidth * 5);
            ctx.beginPath(); ctx.moveTo(temp.x1, temp.y1); ctx.lineTo(temp.x2, temp.y2); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(temp.x2, temp.y2);
            ctx.lineTo(temp.x2 - headLen * Math.cos(angle - Math.PI / 7), temp.y2 - headLen * Math.sin(angle - Math.PI / 7));
            ctx.moveTo(temp.x2, temp.y2);
            ctx.lineTo(temp.x2 - headLen * Math.cos(angle + Math.PI / 7), temp.y2 - headLen * Math.sin(angle + Math.PI / 7));
            ctx.stroke();
        } else if (t === 'circle' || t === 'semicircle') {
            if (t === 'circle') {
                ctx.beginPath(); ctx.arc(temp.x1, temp.y1, dist, 0, Math.PI * 2); ctx.stroke();
            } else {
                const angle = Math.atan2(dy, dx);
                ctx.beginPath(); ctx.arc(temp.x1, temp.y1, dist, angle, angle + Math.PI); ctx.stroke();
            }
        } else if (t === 'rect') {
            const x = Math.min(temp.x1, temp.x2), y = Math.min(temp.y1, temp.y2);
            const w = Math.abs(dx), h = Math.abs(dy);
            ctx.strokeRect(x, y, w, h);
        } else if (t === 'cone') {
            const bcx = temp.x1, bcy = temp.y1 + Math.abs(dy);
            const r = Math.abs(dx);
            ctx.beginPath(); ctx.ellipse(bcx, bcy, r, r * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bcx - r, bcy); ctx.lineTo(temp.x1, temp.y1); ctx.lineTo(bcx + r, bcy); ctx.stroke();
        } else if (t === 'cylinder') {
            const r = Math.abs(dx), h = Math.abs(dy);
            ctx.beginPath(); ctx.ellipse(temp.x1, temp.y1, r, r * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(temp.x1 - r, temp.y1); ctx.lineTo(temp.x1 - r, temp.y1 + h);
            ctx.moveTo(temp.x1 + r, temp.y1); ctx.lineTo(temp.x1 + r, temp.y1 + h); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(temp.x1, temp.y1 + h, r, r * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }
}

// =============================================================
//  GeometryScratchpad — 几何专用画板（未改）
// =============================================================
class GeometryScratchpad {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.state = {
            tool: 'pen',
            points: [], lines: [], strokes: [],
            currentStroke: null, tempLine: null,
            pointLabelIdx: 0, pointRadius: 5,
            isDrawing: false, lastX: 0, lastY: 0,
            color: '#e74c3c', lineWidth: 2
        };
        this._createUI();
        this._bindEvents();
        this.render();
    }

    _createUI() {
        this.container.innerHTML = `
            <div class="scratchpad">
                <div class="scratchpad-toolbar">
                    <button class="sp-btn active" data-tool="pen" title="自由画笔">✏️ 画笔</button>
                    <button class="sp-btn" data-tool="point" title="标记点">📍 标点</button>
                    <button class="sp-btn" data-tool="line" title="画直线">📏 直线</button>
                    <button class="sp-btn" data-tool="auxline" title="辅助线（虚线）">┅ 辅助线</button>
                    <button class="sp-btn" data-tool="eraser" title="橡皮擦">🧹 橡皮</button>
                    <span class="sp-separator"></span>
                    <button class="sp-btn sp-btn-danger" data-tool="clear" title="清空画板">🗑️ 清空</button>
                    <span class="sp-separator"></span>
                    <label class="sp-color-label"><span>颜色</span><input type="color" class="sp-color" value="#e74c3c"></label>
                    <label class="sp-size-label"><span>粗细</span>
                        <select class="sp-size">
                            <option value="1">细</option><option value="2" selected>中</option>
                            <option value="4">粗</option><option value="6">特粗</option>
                        </select>
                    </label>
                </div>
                <div class="scratchpad-canvas-wrap">
                    <canvas class="sp-canvas"></canvas>
                </div>
                <div class="scratchpad-hint">标点工具点击标点；直线/辅助线工具拖拽画线；画笔工具自由书写</div>
            </div>`;
        this.canvas = this.container.querySelector('.sp-canvas');
        this.ctx = this.canvas.getContext('2d');
        this._resizeCanvas();
    }

    _resizeCanvas() {
        const wrap = this.container.querySelector('.scratchpad-canvas-wrap');
        const rect = wrap.getBoundingClientRect();
        const w = rect.width || 600, h = rect.height || 350;
        const dpr = devicePixelRatio || 1;
        this.canvas.width = w * dpr; this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
        this.ctx.scale(dpr, dpr); this.width = w; this.height = h;
    }

    _bindEvents() {
        const self = this;
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.sp-btn');
            if (!btn) return;
            const tool = btn.dataset.tool;
            if (tool === 'clear') { self._clearAll(); return; }
            self.state.tool = tool;
            self.container.querySelectorAll('.sp-btn').forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
        });
        this.container.querySelector('.sp-color').addEventListener('input', (e) => { self.state.color = e.target.value; });
        this.container.querySelector('.sp-size').addEventListener('change', (e) => { self.state.lineWidth = parseInt(e.target.value); });

        const canvas = this.canvas;
        const getPos = (e) => {
            const r = canvas.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: cx - r.left, y: cy - r.top };
        };
        const start = (e) => {
            e.preventDefault();
            const pos = getPos(e);
            self.state.isDrawing = true; self.state.lastX = pos.x; self.state.lastY = pos.y;
            if (self.state.tool === 'point') {
                const label = String.fromCharCode(65 + self.state.pointLabelIdx);
                self.state.points.push({ x: pos.x, y: pos.y, label, color: self.state.color });
                self.state.pointLabelIdx++; self.render();
            } else if (self.state.tool === 'pen') {
                self.state.currentStroke = { points: [{ x: pos.x, y: pos.y }], color: self.state.color, width: self.state.lineWidth };
            } else if (self.state.tool === 'line' || self.state.tool === 'auxline') {
                self.state.tempLine = { x1: pos.x, y1: pos.y, color: self.state.color, width: self.state.lineWidth, dashed: self.state.tool === 'auxline' };
            }
        };
        const move = (e) => {
            e.preventDefault();
            if (!self.state.isDrawing) return;
            const pos = getPos(e);
            if (self.state.tool === 'pen' && self.state.currentStroke) {
                self.state.currentStroke.points.push({ x: pos.x, y: pos.y });
                const ctx = self.ctx; ctx.save();
                ctx.strokeStyle = self.state.currentStroke.color; ctx.lineWidth = self.state.currentStroke.width;
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                ctx.beginPath(); ctx.moveTo(self.state.lastX, self.state.lastY); ctx.lineTo(pos.x, pos.y); ctx.stroke(); ctx.restore();
                self.state.lastX = pos.x; self.state.lastY = pos.y;
            } else if ((self.state.tool === 'line' || self.state.tool === 'auxline') && self.state.tempLine) {
                self.render();
                const ctx = self.ctx; ctx.save();
                ctx.strokeStyle = self.state.color; ctx.lineWidth = self.state.lineWidth; ctx.lineCap = 'round';
                if (self.state.tempLine.dashed) ctx.setLineDash([6, 4]);
                ctx.beginPath(); ctx.moveTo(self.state.tempLine.x1, self.state.tempLine.y1); ctx.lineTo(pos.x, pos.y); ctx.stroke(); ctx.restore();
            }
        };
        const end = (e) => {
            if (!self.state.isDrawing) return;
            self.state.isDrawing = false;
            const pos = getPos(e);
            if (self.state.tool === 'pen' && self.state.currentStroke) {
                self.state.strokes.push(self.state.currentStroke); self.state.currentStroke = null;
            } else if ((self.state.tool === 'line' || self.state.tool === 'auxline') && self.state.tempLine) {
                if (Math.hypot(pos.x - self.state.tempLine.x1, pos.y - self.state.tempLine.y1) > 5) {
                    self.state.lines.push({ x1: self.state.tempLine.x1, y1: self.state.tempLine.y1, x2: pos.x, y2: pos.y, color: self.state.color, width: self.state.lineWidth, dashed: self.state.tool === 'auxline' });
                }
                self.state.tempLine = null; self.render();
            } else if (self.state.tool === 'eraser') { self._eraseAt(pos.x, pos.y); }
        };
        canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
        canvas.addEventListener('mouseup', end); canvas.addEventListener('mouseleave', (e) => { if (self.state.isDrawing) end(e); });
        canvas.addEventListener('touchstart', start, { passive: false }); canvas.addEventListener('touchmove', move, { passive: false });
        canvas.addEventListener('touchend', end, { passive: false });
    }

    _eraseAt(ex, ey) {
        const r = 15;
        this.state.strokes = this.state.strokes.filter(s => !s.points.some(p => Math.hypot(p.x - ex, p.y - ey) < r));
        this.state.lines = this.state.lines.filter(l => Math.hypot((l.x1 + l.x2) / 2 - ex, (l.y1 + l.y2) / 2 - ey) > r);
        this.state.points = this.state.points.filter(p => Math.hypot(p.x - ex, p.y - ey) > r);
        this.render();
    }
    _clearAll() { this.state.points = []; this.state.lines = []; this.state.strokes = []; this.state.currentStroke = null; this.state.tempLine = null; this.state.pointLabelIdx = 0; this.render(); }

    render() {
        const ctx = this.ctx; const w = this.width, h = this.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
        ctx.save(); ctx.strokeStyle = '#f0f0f0'; ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        ctx.restore();
        this.state.lines.forEach(l => {
            ctx.save(); ctx.strokeStyle = l.color; ctx.lineWidth = l.width;
            if (l.dashed) ctx.setLineDash([8, 5]);
            ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke(); ctx.restore();
        });
        this.state.strokes.forEach(s => {
            if (s.points.length < 2) return;
            ctx.save(); ctx.strokeStyle = s.color; ctx.lineWidth = s.width;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(s.points[0].x, s.points[0].y);
            for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
            ctx.stroke(); ctx.restore();
        });
        this.state.points.forEach(p => {
            ctx.save(); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#333'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
            ctx.fillText(p.label, p.x, p.y - 9); ctx.restore();
        });
    }
}

// ========== 全局管理器 ==========
const scratchpadInstances = {};
const miniScratchpadInstances = {};

function initScratchpad(problemId) {
    const id = 'sp-' + problemId;
    const el = document.getElementById(id);
    if (!el) return null;
    if (scratchpadInstances[problemId]) return scratchpadInstances[problemId];
    const sp = new GeometryScratchpad(id);
    scratchpadInstances[problemId] = sp;
    return sp;
}

function initMiniScratchpad(problemId, options = {}) {
    const id = 'mini-sp-' + problemId;
    const el = document.getElementById(id);
    if (!el || miniScratchpadInstances[problemId]) return;
    const sp = new MiniScratchpad(id, problemId, options);
    miniScratchpadInstances[problemId] = sp;
    return sp;
}
