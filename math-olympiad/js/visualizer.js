/* ===================================================================
   visualizer.js — 可视化解析绘图模块
   根据题型在 Canvas 上绘制辅助理解的示意图
   =================================================================== */

const VISUALIZERS = {};

// ---------- 绘图辅助 ----------
function setupCanvas(canvas, w, h) {
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    return ctx;
}

function clearCtx(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
}

function drawArrow(ctx, fromX, fromY, toX, toY, color) {
    const headLen = 8;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawLabel(ctx, text, x, y, color, fontSize) {
    ctx.save();
    ctx.fillStyle = color || '#333';
    ctx.font = (fontSize || 13) + 'px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
}

// =============================================================
//  1. 路程问题可视化
// =============================================================
VISUALIZERS.distance = function (canvas, data) {
    const w = 480, h = 200;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    const margin = 60;
    const lineY = 120;
    const startX = margin;
    const endX = w - margin;
    const lineLen = endX - startX;

    // 画路程线
    ctx.save();
    ctx.strokeStyle = '#4a90d9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, lineY);
    ctx.lineTo(endX, lineY);
    ctx.stroke();

    // 端点
    ctx.fillStyle = '#4a90d9';
    ctx.beginPath();
    ctx.arc(startX, lineY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endX, lineY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (data.type === 'easy') {
        // 简单：A→B 标注距离
        drawLabel(ctx, data.from || 'A', startX, lineY + 25, '#e74c3c');
        drawLabel(ctx, data.to || 'B', endX, lineY + 25, '#e74c3c');
        drawLabel(ctx, '速度 ' + data.v + ' km/h', startX + 20, lineY - 30, '#e67e22');
        drawLabel(ctx, '时间 ' + data.t + ' h', (startX + endX) / 2, lineY - 30, '#27ae60');
        // 路程标注
        const midX = (startX + endX) / 2;
        ctx.save();
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX, lineY + 40);
        ctx.lineTo(endX, lineY + 40);
        ctx.stroke();
        ctx.restore();
        drawLabel(ctx, '路程 = ' + data.s + ' km', midX, lineY + 60, '#e74c3c', 13);

        // 箭头
        drawArrow(ctx, startX + 15, lineY, endX - 15, lineY, '#e74c3c');

    } else if (data.type === 'meet') {
        // 相遇问题
        drawLabel(ctx, data.name1 || '甲', startX, lineY + 25, '#e74c3c');
        drawLabel(ctx, data.name2 || '乙', endX, lineY + 25, '#3498db');
        drawLabel(ctx, 'v₁=' + data.v1 + ' km/h', startX + 20, lineY - 25, '#e74c3c');
        drawLabel(ctx, 'v₂=' + data.v2 + ' km/h', endX - 20, lineY - 25, '#3498db');

        // 相遇点 (按速度比例)
        const ratio = data.v1 / (data.v1 + data.v2);
        const meetX = startX + lineLen * ratio;
        ctx.save();
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(meetX, lineY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', meetX, lineY);
        ctx.restore();

        drawLabel(ctx, '相遇点', meetX, lineY - 40, '#e67e22');
        drawLabel(ctx, 't=' + data.t + 'h', meetX, lineY + 45, '#e67e22', 14);

        // 双向箭头
        drawArrow(ctx, startX + 15, lineY, meetX - 10, lineY, '#e74c3c');
        drawArrow(ctx, endX - 15, lineY, meetX + 10, lineY, '#3498db');

        // 总路程
        ctx.save();
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(startX, lineY + 55);
        ctx.lineTo(endX, lineY + 55);
        ctx.stroke();
        ctx.restore();
        drawLabel(ctx, '总路程 ' + data.s + ' km', (startX + endX) / 2, lineY + 75, '#9b59b6', 12);

    } else if (data.type === 'dog') {
        // 小狗往返跑
        drawLabel(ctx, data.name1 || '甲', startX, lineY + 25, '#e74c3c');
        drawLabel(ctx, data.name2 || '乙', endX, lineY + 25, '#3498db');
        drawLabel(ctx, 'v₁=' + data.v1, startX + 20, lineY - 25, '#e74c3c');
        drawLabel(ctx, 'v₂=' + data.v2, endX - 20, lineY - 25, '#3498db');
        drawLabel(ctx, '总路程 ' + data.s + ' km', (startX + endX) / 2, lineY + 45, '#9b59b6', 12);

        // 小狗（画个狗爪和一些波浪线）
        ctx.save();
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        for (let x = startX + 20; x < endX - 20; x += 6) {
            const yy = lineY - 15 * Math.sin((x - startX) / lineLen * Math.PI * 4);
            if (x === startX + 20) ctx.moveTo(x, yy);
            else ctx.lineTo(x, yy);
        }
        ctx.stroke();
        ctx.restore();

        // 狗标记
        drawLabel(ctx, '🐕 狗跑 ' + data.dogRun + ' km', (startX + endX) / 2, lineY - 55, '#e67e22', 14);
        drawLabel(ctx, '狗速度 ' + data.dogSpeed + ' km/h', (startX + endX) / 2, lineY - 75, '#e67e22', 11);
    }
};

// =============================================================
//  2. 等比数列可视化
// =============================================================
VISUALIZERS.sequence = function (canvas, data) {
    const w = 480, h = 220;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    const terms = data.terms || [];
    if (!terms.length) {
        drawLabel(ctx, '数据不足', w / 2, h / 2, '#999');
        return;
    }

    const margin = { left: 50, right: 20, top: 30, bottom: 40 };
    const chartW = w - margin.left - margin.right;
    const chartH = h - margin.top - margin.bottom;
    const maxVal = Math.max(...terms);
    const barW = Math.min(chartW / terms.length * 0.7, 40);
    const gap = chartW / terms.length;

    // 画柱状图
    terms.forEach((val, i) => {
        const barH = (val / maxVal) * chartH;
        const x = margin.left + i * gap + (gap - barW) / 2;
        const y = margin.top + chartH - barH;

        // 渐变颜色
        const gradient = ctx.createLinearGradient(x, y, x, margin.top + chartH);
        const hue = 200 + i * 20;
        gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
        gradient.addColorStop(1, `hsl(${hue}, 70%, 40%)`);
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 4);
        ctx.fill();
        ctx.restore();

        // 值标注
        drawLabel(ctx, val, x + barW / 2, y - 10, '#2c3e50', 12);

        // 序号标注
        const idxLabel = 'a' + (i + 1);
        ctx.save();
        ctx.fillStyle = '#7f8c9b';
        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(idxLabel, x + barW / 2, margin.top + chartH + 5);
        ctx.restore();
    });

    // 等比数列公式提示
    if (data.a1 && data.q) {
        drawLabel(ctx, `a₁=${data.a1}  q=${data.q}  n=${data.n || terms.length}`,
            w / 2, h - 8, '#7f8c9b', 11);
    }
};

// =============================================================
//  3. 浓度问题可视化
// =============================================================
VISUALIZERS.concentration = function (canvas, data) {
    const w = 480, h = 220;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    if (data.type === 'easy') {
        // 一个烧杯
        const cx = w / 2;
        const by = 50;
        const bw = 100;
        const bh = 140;
        const waterH = bh * (data.water / data.total);
        const saltH = bh * (data.salt / data.total);
        const totalH = bh;

        // 烧杯外框
        ctx.save();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - bw / 2, by);
        ctx.lineTo(cx - bw / 2, by + bh);
        ctx.lineTo(cx + bw / 2, by + bh);
        ctx.lineTo(cx + bw / 2, by);
        ctx.stroke();

        // 水（浅蓝）
        ctx.fillStyle = 'rgba(100, 180, 255, 0.35)';
        ctx.fillRect(cx - bw / 2, by + totalH - waterH, bw, waterH);

        // 盐（白色小点）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < data.salt; i++) {
            const sx = cx - bw / 2 + 5 + Math.random() * (bw - 10);
            const sy = by + bh - 8 - Math.random() * (saltH - 10);
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        drawLabel(ctx, `${data.total}克  ${data.pct * 100}%`, cx, by - 16, '#555', 14);
        drawLabel(ctx, `水 ${data.water}克`, cx, by + bh + 20, '#3498db', 13);
        drawLabel(ctx, `盐 ${data.salt}克`, cx, by + bh + 40, '#e74c3c', 13);

    } else if (data.type === 'medium' || data.type === 'hard') {
        // 混合前后对比
        const leftX = 80;
        const rightX = 340;

        // 左边烧杯
        ctx.save();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftX - 40, 40);
        ctx.lineTo(leftX - 40, 170);
        ctx.lineTo(leftX + 40, 170);
        ctx.lineTo(leftX + 40, 40);
        ctx.stroke();
        ctx.restore();

        drawLabel(ctx, `${data.type === 'medium' ? data.m1 + 'g ' + data.p1 + '%' : '初始 ' + data.initial + 'g ' + data.pct + '%'}`,
            leftX, 28, '#555', 12);

        // 右边烧杯
        ctx.save();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rightX - 40, 40);
        ctx.lineTo(rightX - 40, 170);
        ctx.lineTo(rightX + 40, 170);
        ctx.lineTo(rightX + 40, 40);
        ctx.stroke();
        ctx.restore();

        if (data.type === 'medium') {
            const pctMix = data.finalPct;
            drawLabel(ctx, `混合后 ${data.m1 + data.m2}g  ${pctMix}%`, rightX, 28, '#e74c3c', 12);

            // 填充颜色
            ctx.save();
            ctx.fillStyle = 'rgba(100, 180, 255, 0.3)';
            ctx.fillRect(rightX - 38, 50, 76, 120);
            ctx.restore();
        } else {
            drawLabel(ctx, `蒸发后 ${data.newM}g  ${data.newPct}%`, rightX, 28, '#e74c3c', 12);
            ctx.save();
            ctx.fillStyle = 'rgba(100, 180, 255, 0.35)';
            const newH = 120 * (data.newM / data.initial);
            ctx.fillRect(rightX - 38, 50 + 120 - newH, 76, newH);
            ctx.restore();
        }

        // 箭头
        drawArrow(ctx, leftX + 50, 105, rightX - 50, 105, '#999');

        // 填充左杯
        ctx.save();
        ctx.fillStyle = 'rgba(100, 180, 255, 0.3)';
        ctx.fillRect(leftX - 38, 50, 76, 120);
        ctx.restore();
    }
};

// =============================================================
//  4. 牛吃草问题可视化
// =============================================================
VISUALIZERS.cowgrass = function (canvas, data) {
    const w = 480, h = 220;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    // 画草地
    ctx.save();
    const grassGrad = ctx.createLinearGradient(0, 160, 0, 200);
    grassGrad.addColorStop(0, '#a8e063');
    grassGrad.addColorStop(1, '#56ab2f');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(20, 160, w - 40, 50);
    ctx.restore();

    // 画草（短线）
    for (let i = 0; i < 40; i++) {
        const gx = 30 + Math.random() * (w - 60);
        const gh = 5 + Math.random() * 15;
        ctx.save();
        ctx.strokeStyle = '#2d8a2d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gx, 160);
        ctx.lineTo(gx + 2, 160 - gh);
        ctx.stroke();
        ctx.restore();
    }

    // 画牛（简单轮廓）
    const drawCow = (x, y, label) => {
        ctx.save();
        // 身体
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(x, y - 10, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // 头
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(x + 10, y - 16, 6, 0, Math.PI * 2);
        ctx.fill();
        // 角
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 8, y - 22);
        ctx.lineTo(x + 5, y - 30);
        ctx.moveTo(x + 12, y - 22);
        ctx.lineTo(x + 15, y - 30);
        ctx.stroke();
        if (label) {
            ctx.fillStyle = '#333';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y + 10);
        }
        ctx.restore();
    };

    // 显示牛
    const cowCount = data.c3 || data.c1 || 0;
    for (let i = 0; i < Math.min(cowCount, 8); i++) {
        const cx = 40 + (i % 5) * 50 + Math.random() * 20;
        const cy = 130 - Math.floor(i / 5) * 25;
        drawCow(cx, cy);
    }
    if (cowCount > 8) {
        drawLabel(ctx, `...共 ${cowCount} 头牛`, w / 2 + 50, 115, '#555', 12);
    }

    // 数据信息
    if (data.type === 'easy') {
        drawLabel(ctx, `${data.c1}头${data.d1}天 → ${data.c2}头${data.d2}天 → ${data.c3}头${data.d3}天`,
            w / 2, 30, '#2c3e50', 14);
        drawLabel(ctx, `生长率 r=${data.r} /天`, w / 2, 50, '#27ae60', 13);
    } else if (data.type === 'medium') {
        drawLabel(ctx, `生长率 r=${data.r} /天 → 最多养${data.r}头`, w / 2, 30, '#2c3e50', 14);
    } else {
        drawLabel(ctx, `前${data.half}天${data.half}头，之后${data.half + data.rem}头还需${data.dRem}天`,
            w / 2, 30, '#2c3e50', 13);
    }
};

// =============================================================
//  5. 工程问题可视化
// =============================================================
VISUALIZERS.work = function (canvas, data) {
    const w = 480, h = 200;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    const barW = w - 80;
    const barH = 30;
    const startY = [45, 90, 135];

    if (data.type === 'easy') {
        // 单进度条
        const pct = data.w / 100;
        const colors = ['#3498db', '#2ecc71'];
        ctx.save();
        ctx.fillStyle = '#eef0f4';
        ctx.beginPath();
        ctx.roundRect(40, startY[0], barW, barH, 8);
        ctx.fill();
        const grad = ctx.createLinearGradient(40, 0, 40 + barW * pct, 0);
        grad.addColorStop(0, '#3498db');
        grad.addColorStop(1, '#2ecc71');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(40, startY[0], barW * pct, barH, 8);
        ctx.fill();
        ctx.restore();
        drawLabel(ctx, `完成 ${data.w}%  需要 ${data.need} 天`, w / 2, startY[0] + barH / 2 + 1, '#fff', 13);
        drawLabel(ctx, `共 ${data.days} 天`, w / 2, startY[0] + barH + 20, '#7f8c9b', 12);

    } else if (data.type === 'medium') {
        // 两人合作
        const labels = ['甲', '乙', '合作'];
        const days = [data.d1, data.d2, data.total];
        const maxD = Math.max(...days);
        days.forEach((d, i) => {
            const bw = (d / maxD) * barW;
            ctx.save();
            ctx.fillStyle = '#eef0f4';
            ctx.beginPath();
            ctx.roundRect(40, startY[i], barW, barH - 5, 6);
            ctx.fill();
            const hue = i === 2 ? '#e74c3c' : (i === 0 ? '#3498db' : '#2ecc71');
            ctx.fillStyle = hue;
            ctx.beginPath();
            ctx.roundRect(40, startY[i], bw, barH - 5, 6);
            ctx.fill();
            ctx.restore();
            drawLabel(ctx, labels[i] + ' ' + d + '天', 40 + bw / 2, startY[i] + (barH - 5) / 2, '#fff', 12);
            drawLabel(ctx, '1/' + d, 40 + bw + 30, startY[i] + (barH - 5) / 2, '#555', 11);
        });

    } else if (data.type === 'hard') {
        drawLabel(ctx, `三人合作 ${data.days} 天，乙丙继续`, w / 2, 30, '#2c3e50', 14);
        const labels = ['甲', '乙', '丙'];
        const days = [data.d1, data.d2, data.d3];
        days.forEach((d, i) => {
            const bw = (d / Math.max(...days)) * barW;
            ctx.save();
            ctx.fillStyle = '#eef0f4';
            ctx.beginPath();
            ctx.roundRect(40, startY[i], barW, barH - 8, 6);
            ctx.fill();
            const colors = ['#e74c3c', '#3498db', '#2ecc71'];
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.roundRect(40, startY[i], bw, barH - 8, 6);
            ctx.fill();
            ctx.restore();
            drawLabel(ctx, labels[i] + ' ' + d + '天', 40 + bw / 2, startY[i] + (barH - 8) / 2, '#fff', 12);
        });
    }
};

// =============================================================
//  6. 鸡兔同笼可视化
// =============================================================
VISUALIZERS['chicken-rabbit'] = function (canvas, data) {
    const w = 480, h = 220;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    const drawChicken = (x, y) => {
        ctx.save();
        // 身体
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.ellipse(x, y, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // 头
        ctx.beginPath();
        ctx.arc(x + 8, y - 6, 5, 0, Math.PI * 2);
        ctx.fill();
        // 眼睛
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + 10, y - 7, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // 嘴
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.moveTo(x + 13, y - 6);
        ctx.lineTo(x + 18, y - 4);
        ctx.lineTo(x + 13, y - 4);
        ctx.fill();
        // 鸡冠
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(x + 9, y - 12, 2, 0, Math.PI * 2);
        ctx.fill();
        // 脚（2只）
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 3, y + 7);
        ctx.lineTo(x - 5, y + 16);
        ctx.moveTo(x + 3, y + 7);
        ctx.lineTo(x + 5, y + 16);
        ctx.stroke();
        ctx.restore();
    };

    const drawRabbit = (x, y) => {
        ctx.save();
        // 身体
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.ellipse(x, y, 10, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        // 头
        ctx.beginPath();
        ctx.arc(x, y - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        // 眼睛
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(x + 2, y - 11, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // 耳朵（长）
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.ellipse(x - 3, y - 22, 3, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 4, y - 22, 3, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f5c8d5';
        ctx.beginPath();
        ctx.ellipse(x - 3, y - 22, 1.5, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 4, y - 22, 1.5, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // 脚（4只）
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.ellipse(x - 6, y + 7, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 6, y + 7, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x - 3, y + 8, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 3, y + 8, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    const maxPerRow = 8;
    const spacing = 55;
    const startX = 50;
    const rowY = [60, 140];

    // 画鸡
    const chickens = Math.min(data.chickens || 0, 16);
    for (let i = 0; i < chickens; i++) {
        const col = i % maxPerRow;
        const row = Math.floor(i / maxPerRow);
        const x = startX + col * spacing;
        const y = rowY[row] || rowY[rowY.length - 1];
        if (x < w - 20) drawChicken(x, y);
    }

    // 画兔
    const rabbits = Math.min(data.rabbits || 0, 16);
    for (let i = 0; i < rabbits; i++) {
        const col = i % maxPerRow;
        const row = Math.floor(i / maxPerRow);
        const x_rabbit = startX + col * spacing + 25;
        const y_rabbit = rowY[row] || rowY[rowY.length - 1];
        const y_pos = row === 0 ? (rabbits <= maxPerRow ? 60 : 60) : 140;
        const x_pos = startX + col * spacing + 25;
        if (x_pos < w - 20) drawRabbit(x_pos, row === 0 ? 55 : 135);
    }

    drawLabel(ctx, `鸡 ${data.chickens} 只 （各 2 只脚）`, w / 2, 205, '#e67e22', 12);
    drawLabel(ctx, `兔 ${data.rabbits} 只 （各 4 只脚）`, w / 2, 215, '#7f8c9b', 11);
};

// =============================================================
//  7. 盈亏问题可视化
// =============================================================
VISUALIZERS['profit-loss'] = function (canvas, data) {
    const w = 480, h = 200;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    const people = data.people || data.students || 10;
    const items = data.total || 50;
    const perPerson = data.p1 || data.per1 || 3;
    const perPerson2 = data.p2 || data.per2 || 5;

    // 画人头/小人
    const maxShow = Math.min(people, 12);
    const sp = Math.min(40, (w - 60) / maxShow);
    const startX = (w - maxShow * sp) / 2;

    for (let i = 0; i < maxShow; i++) {
        const x = startX + i * sp + sp / 2;
        ctx.save();
        // 头
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(x, 55, 10, 0, Math.PI * 2);
        ctx.fill();
        // 身体
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x - 8, 65, 16, 20);
        // 数字标记
        ctx.fillStyle = '#fff';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, x, 55);
        ctx.restore();
    }

    if (people > maxShow) {
        drawLabel(ctx, `...共 ${people} 人`, startX + maxShow * sp + 20, 55, '#555', 12);
    }

    // 说明
    if (data.type === 'easy') {
        drawLabel(ctx, `每人 ${data.per1} 颗 → 多 ${data.remain} 颗`, w / 2, 115, '#e74c3c', 13);
        drawLabel(ctx, `每人 ${data.per2} 颗 → 少 ${data.lack} 颗`, w / 2, 135, '#3498db', 13);
        const totalCandy = data.per1 * people + data.remain;
        drawLabel(ctx, `人数 ${people}，糖果 ${totalCandy} 颗`, w / 2, 170, '#27ae60', 14);
    } else if (data.type === 'medium') {
        drawLabel(ctx, `每人 ${data.p1} 件 → 多 ${data.surplus} 件`, w / 2, 115, '#e74c3c', 13);
        drawLabel(ctx, `每人 ${data.p2} 件 → 正好`, w / 2, 135, '#27ae60', 13);
        drawLabel(ctx, `人数 ${people}，物资 ${data.p2 * people} 件`, w / 2, 170, '#2c3e50', 14);
    } else {
        drawLabel(ctx, `每人 ${data.p1} 件 → 多 ${data.surplus} 件`, w / 2, 115, '#e74c3c', 13);
        drawLabel(ctx, `每人 ${data.p2} 件 → 少 ${data.lack} 件`, w / 2, 135, '#3498db', 13);
        drawLabel(ctx, `每人 ${data.p2 + 1} 件 → ${w > 200 ? '多出/缺少' : ''} ${Math.abs((data.p2 + 1) * data.people - (data.p1 * data.people + data.surplus))} 件`,
            w / 2, 175, '#e67e22', 12);
    }
};

// =============================================================
//  8. 植树问题可视化
// =============================================================
VISUALIZERS['tree-planting'] = function (canvas, data) {
    const w = 480, h = 200;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    const drawTree = (x, y, size) => {
        const s = size || 8;
        ctx.save();
        // 树干
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 2, y, 4, s);
        // 树冠
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(x, y - 4, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(x - 3, y - 6, s * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 3, y - 6, s * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    if (data.type === 'easy') {
        // 直线植树
        const trees = data.trees;
        const gap = data.gap;
        const len = data.len;
        const count = Math.min(trees, 15);
        const sp = (w - 80) / (count - 1 || 1);

        // 道路基线
        ctx.save();
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 100);
        ctx.lineTo(40 + (count - 1) * sp, 100);
        ctx.stroke();
        ctx.restore();

        for (let i = 0; i < count; i++) {
            const x = 40 + i * sp;
            drawTree(x, 100, 10);
            if (i < count - 1) {
                drawLabel(ctx, `${gap}米`, x + sp / 2, 125, '#7f8c9b', 10);
            }
        }

        drawLabel(ctx, `全长 ${len}米，每 ${gap}米一棵，共 ${trees} 棵`, w / 2, 165, '#2c3e50', 13);

    } else if (data.type === 'medium') {
        // 环形植树
        const cx = w / 2, cy = 95, radius = 65;
        const trees = data.trees;
        const count = Math.min(trees, 12);
        ctx.save();
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            drawTree(x, y, 8);
        }
        drawLabel(ctx, `周长 ${data.len}米，间隔 ${data.gap}米`, w / 2, 175, '#2c3e50', 13);
        drawLabel(ctx, `${trees} 棵树`, cx, cy, '#e74c3c', 16);

    } else {
        // 复杂植树
        drawLabel(ctx, `道路 ${data.road}米`, w / 2, 30, '#2c3e50', 13);
        const trees1 = Math.min(data.trees1, 10);
        const sp2 = (w - 80) / (trees1 - 1 || 1);
        for (let i = 0; i < trees1; i++) {
            drawTree(40 + i * sp2, 80, 10);
        }
        drawLabel(ctx, `梧桐树间隔 ${data.gap1}米，月季花间隔 ${data.gap2}米`, w / 2, 125, '#555', 12);
        drawLabel(ctx, `月季花 ${data.road / data.gap1 * (data.gap1 / data.gap2 - 1)} 棵`, w / 2, 165, '#e67e22', 14);
    }
};

// =============================================================
//  9. 年龄问题可视化
// =============================================================
VISUALIZERS.age = function (canvas, data) {
    const w = 480, h = 200;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    const drawPerson = (x, y, label, age, color) => {
        ctx.save();
        // 人形
        ctx.fillStyle = color || '#3498db';
        ctx.beginPath();
        ctx.arc(x, y - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 10, y, 20, 25);
        // 年龄标注
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(age, x, y - 10);
        // 名字
        ctx.fillStyle = '#333';
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x, y + 30);
        ctx.restore();
    };

    if (data.type === 'easy') {
        drawPerson(120, 60, data.parent >= 40 ? '爸爸' : '妈妈', data.parent, '#3498db');
        drawPerson(340, 60, '小明', data.child, '#e67e22');

        const years = data.parent - data.child * 2;
        if (years >= 0) {
            drawLabel(ctx, `年龄差 ${data.diff} 岁（不变）`, w / 2, 120, '#7f8c9b', 12);
            drawLabel(ctx, `${years} 年后爸爸年龄是小明的 2 倍`, w / 2, 155, '#e74c3c', 14);
        } else {
            drawLabel(ctx, `年龄差 ${data.diff} 岁`, w / 2, 120, '#7f8c9b', 12);
            drawLabel(ctx, `${-years} 年前爸爸年龄是小明的 2 倍`, w / 2, 155, '#e74c3c', 14);
        }

    } else if (data.type === 'medium') {
        drawPerson(100, 55, '妈妈', data.parent, '#e74c3c');
        drawPerson(350, 55, '女儿', data.child, '#e67e22');

        ctx.save();
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(60, 140);
        ctx.lineTo(400, 140);
        ctx.stroke();
        ctx.restore();

        drawLabel(ctx, '现在', 60, 150, '#7f8c9b', 11);
        drawLabel(ctx, `${data.years}年前`, 60, 165, '#7f8c9b', 11);

        drawPerson(100, 130, '妈妈', data.parent - data.years, '#e74c3c');
        drawPerson(350, 130, '女儿', data.child - data.years, '#e67e22');

    } else {
        // 复杂年龄
        drawPerson(100, 50, '父亲', data.p, '#3498db');
        drawPerson(240, 125, '大儿', data.s1, '#e67e22');
        drawPerson(380, 125, '小儿', data.s2, '#27ae60');

        drawLabel(ctx, `年龄和 ${data.s1 + data.s2} 岁`, w / 2, 30, '#7f8c9b', 12);
        drawLabel(ctx, `${data.p - data.s1 - data.s2} 年后相等`, w / 2, 180, '#e74c3c', 14);
    }
};

// =============================================================
//  10. 和差倍问题可视化
// =============================================================
VISUALIZERS['sum-diff'] = function (canvas, data) {
    const w = 480, h = 200;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    const drawBar = (x, y, width, height, color, label, val) => {
        ctx.save();
        ctx.fillStyle = color || '#3498db';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 6);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(val, x + width / 2, y + height / 2);
        ctx.fillStyle = '#333';
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x + width / 2, y + height + 5);
        ctx.restore();
    };

    if (data.type === 'easy') {
        const barH = 36;
        const maxW = 300;
        const scale = maxW / data.a;
        const bwA = data.a * scale;
        const bwB = data.b * scale;
        const startX = 80;

        drawBar(startX, 40, bwA, barH, '#e74c3c', '较大数', data.a);
        drawBar(startX, 100, bwB, barH, '#3498db', '较小数', data.b);

        ctx.save();
        ctx.fillStyle = '#7f8c9b';
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`和 = ${data.sum}`, startX + maxW + 15, 58);
        ctx.fillText(`差 = ${data.diff}`, startX + maxW + 15, 118);
        ctx.restore();

    } else if (data.type === 'medium') {
        const barH = 36;
        const maxW = 300;
        const unitW = maxW / (data.ratio + 1);
        const bwSmall = unitW;
        const bwLarge = unitW * data.ratio;

        drawBar(80, 40, bwLarge, barH, '#e74c3c', '甲', data.a);
        drawBar(80, 95, bwSmall, barH, '#3498db', '乙', data.b);

        // 标注倍数关系
        ctx.save();
        ctx.fillStyle = '#e74c3c';
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`甲是乙的 ${data.ratio} 倍`, 80 + maxW + 15, 58);
        ctx.fillStyle = '#2c3e50';
        ctx.fillText(`和 = ${data.sum}`, 80 + maxW + 15, 113);
        ctx.restore();

    } else {
        // 三个数的和差关系
        const barH = 28;
        const maxW = 280;
        const scale = maxW / data.c;
        const bwA = data.a * scale;
        const bwB = data.b * scale;
        const bwC = data.c * scale;

        drawBar(80, 30, bwC, barH, '#e74c3c', '丙', data.c);
        drawBar(80, 72, bwA, barH, '#3498db', '甲', data.a);
        drawBar(80, 114, bwB, barH, '#2ecc71', '乙', data.b);

        drawLabel(ctx, `和 = ${data.sum}`, 80 + maxW + 30, 58, '#7f8c9b', 12);
        drawLabel(ctx, `和 = ${data.sum}`, 80 + maxW + 30, 100, '#7f8c9b', 12);
        drawLabel(ctx, `和 = ${data.sum}`, 80 + maxW + 30, 142, '#7f8c9b', 12);
    }
};

// =============================================================
//  11. 几何问题可视化
// =============================================================
VISUALIZERS.geometry = function (canvas, data) {
    const w = 480, h = 240;
    const ctx = setupCanvas(canvas, w, h);
    clearCtx(ctx, w, h);

    const cx = w / 2, cy = h / 2;

    if (data.type === 'right-triangle') {
        const a = data.a * 20, b = data.b * 14;
        const ox = 80, oy = h - 50;
        ctx.save();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + b, oy);
        ctx.lineTo(ox, oy - a);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(52, 152, 219, 0.15)';
        ctx.fill();
        // 直角标记
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ox + 12, oy);
        ctx.lineTo(ox + 12, oy - 12);
        ctx.lineTo(ox, oy - 12);
        ctx.stroke();
        // 标注
        drawLabel(ctx, `a=${data.a}cm`, ox - 20, oy - a / 2, '#e74c3c', 12);
        drawLabel(ctx, `b=${data.b}cm`, ox + b / 2, oy + 20, '#3498db', 12);
        drawLabel(ctx, `S=${data.area}cm²`, ox + b / 2, oy - a / 2, '#27ae60', 13);
        ctx.restore();

    } else if (data.type === 'rectangle') {
        const l = data.l * 22, w_ = data.w * 22;
        const ox = (w - l) / 2, oy = (h - w_) / 2;
        ctx.save();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox, oy, l, w_);
        ctx.fillStyle = 'rgba(46, 204, 113, 0.12)';
        ctx.fillRect(ox, oy, l, w_);
        drawLabel(ctx, `${data.l}cm`, ox + l / 2, oy + w_ + 25, '#e74c3c', 13);
        drawLabel(ctx, `${data.w}cm`, ox - 25, oy + w_ / 2, '#3498db', 13);
        ctx.restore();

    } else if (data.type === 'circle') {
        const r = data.r * 18;
        ctx.save();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(155, 89, 182, 0.1)';
        ctx.fill();
        // 半径
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r, cy);
        ctx.stroke();
        drawLabel(ctx, `r=${data.r}cm`, cx + r / 2, cy - 10, '#e74c3c', 13);
        ctx.restore();

    } else if (data.type === 'angle') {
        const deg = data.deg;
        const rad = deg * Math.PI / 180;
        const r2 = 100;
        const ox2 = 80, oy2 = h - 40;
        ctx.save();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox2, oy2);
        ctx.lineTo(ox2 + 150, oy2);
        ctx.moveTo(ox2, oy2);
        ctx.lineTo(ox2 + r2 * Math.cos(rad), oy2 - r2 * Math.sin(rad));
        ctx.stroke();
        // 弧
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ox2, oy2, 40, -rad, 0);
        ctx.stroke();
        drawLabel(ctx, `${deg}°`, ox2 + 50, oy2 - 20, '#e74c3c', 14);
        drawLabel(ctx, `底角 = ${data.comp / 2}°`, ox2 + 100, oy2 + 20, '#27ae60', 13);
        ctx.restore();

    } else if (data.type === 'pythagorean') {
        const a = data.a, b = data.b, c = data.c;
        const scale2 = 15;
        const ax = 80, ay = h - 40;
        const bx = ax + b * scale2, by = ay;
        const cx2 = ax, cy2 = ay - a * scale2;
        ctx.save();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(cx2, cy2);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
        ctx.fill();
        // 直角标记
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ax + 12, ay);
        ctx.lineTo(ax + 12, ay - 12);
        ctx.lineTo(ax, ay - 12);
        ctx.stroke();
        // 平方标注
        const sqSize = 12;
        const drawSquare = (x, y, label, col) => {
            ctx.fillStyle = col + '40';
            ctx.fillRect(x - sqSize / 2, y - sqSize / 2, sqSize, sqSize);
            ctx.strokeStyle = col;
            ctx.lineWidth = 1;
            ctx.strokeRect(x - sqSize / 2, y - sqSize / 2, sqSize, sqSize);
            drawLabel(ctx, label, x, y + 18, col, 11);
        };
        drawSquare(ax + (bx - ax) / 2, ay + sqSize / 2, `b²=${b*b}`, '#3498db');
        drawSquare(ax - sqSize / 2, ay - (ay - cy2) / 2, `a²=${a*a}`, '#e74c3c');
        drawLabel(ctx, `c²=${c.toFixed(2)}²=${(c*c).toFixed(2)}`, (ax + bx + cx2) / 3, (ay + by + cy2) / 3 - 30, '#27ae60', 13);
        ctx.restore();

    } else if (data.type === 'circle-chord') {
        const r = data.r * 16;
        const half = data.chord / 2 * 16;
        const d = data.dist * 16 || Math.sqrt(r * r - half * half);
        ctx.save();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        // 弦
        const chordY = cy - d;
        const chordW = Math.sqrt(r * r - d * d);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - chordW, chordY);
        ctx.lineTo(cx + chordW, chordY);
        ctx.stroke();
        // 垂线
        ctx.strokeStyle = '#3498db';
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, chordY);
        ctx.stroke();
        drawLabel(ctx, `d=${data.dist}cm`, cx + 15, (cy + chordY) / 2, '#3498db', 12);
        drawLabel(ctx, `弦长=${data.chord}cm`, cx, chordY - 15, '#e74c3c', 12);
        drawLabel(ctx, `R=${data.r}cm`, cx + r / 2 + 5, cy, '#27ae60', 12);
        ctx.restore();

    } else if (data.type === 'similar') {
        const h1 = data.h1 * 12, s1 = data.shadow * 8;
        const ox3 = 60, oy3 = h - 40;
        ctx.save();
        // 旗杆
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(ox3 + 10, oy3 - h1, 6, h1);
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(ox3 + 13, oy3 - h1, 6, 0, Math.PI * 2);
        ctx.fill();
        // 影子
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ox3 + 13, oy3);
        ctx.lineTo(ox3 + 13 + s1, oy3);
        ctx.stroke();
        drawLabel(ctx, `${data.h1}m`, ox3 + 25, oy3 - h1 / 2, '#e74c3c', 12);
        drawLabel(ctx, `${data.shadow}m`, ox3 + 13 + s1 / 2, oy3 + 20, '#3498db', 12);
        ctx.restore();

    } else if (data.type === 'equilateral') {
        const s = data.sides * 15;
        const h3 = s * Math.sqrt(3) / 2;
        const ox4 = (w - s) / 2, oy4 = (h - h3) / 2 + h3;
        ctx.save();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox4, oy4);
        ctx.lineTo(ox4 + s, oy4);
        ctx.lineTo(ox4 + s / 2, oy4 - h3);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(231, 76, 60, 0.08)';
        ctx.fill();
        drawLabel(ctx, `${data.name}`, ox4 + s / 2, oy4 - h3 - 15, '#e74c3c', 14);
        drawLabel(ctx, `a=${data.sides}cm`, ox4 + s / 2, oy4 + 22, '#2c3e50', 13);
        // 高
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox4 + s / 2, oy4);
        ctx.lineTo(ox4 + s / 2, oy4 - h3);
        ctx.stroke();
        drawLabel(ctx, `h≈${h3.toFixed(1)}cm`, ox4 + s / 2 + 18, oy4 - h3 / 2, '#3498db', 11);
        ctx.restore();

    } else if (data.type === 'cuboid') {
        const a2 = data.a * 14, b2 = data.b * 10, h4 = data.h * 12;
        const ox5 = (w - a2 - b2 / 2) / 2, oy5 = (h - h4 - b2 / 2) / 2;
        const dx = b2 / 2, dy = b2 / 3;
        ctx.save();
        // 前后面
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1.5;
        // 前面
        ctx.strokeRect(ox5, oy5, a2, h4);
        // 后面
        ctx.strokeRect(ox5 + dx, oy5 - dy, a2, h4);
        // 连接线
        ctx.beginPath();
        ctx.moveTo(ox5, oy5); ctx.lineTo(ox5 + dx, oy5 - dy);
        ctx.moveTo(ox5 + a2, oy5); ctx.lineTo(ox5 + a2 + dx, oy5 - dy);
        ctx.moveTo(ox5, oy5 + h4); ctx.lineTo(ox5 + dx, oy5 + h4 - dy);
        ctx.moveTo(ox5 + a2, oy5 + h4); ctx.lineTo(ox5 + a2 + dx, oy5 + h4 - dy);
        ctx.stroke();
        // 标注
        drawLabel(ctx, `${data.a}cm`, ox5 + a2 / 2, oy5 + h4 + 20, '#e74c3c', 12);
        drawLabel(ctx, `${data.h}cm`, ox5 - 22, oy5 + h4 / 2, '#3498db', 12);
        drawLabel(ctx, `${data.b}cm`, ox5 + a2 + 18, oy5 - dy / 2, '#27ae60', 12);
        ctx.restore();

    } else if (data.type === 'position') {
        const r = data.r * 25;
        const offsetX = data.cx * 20, offsetY = data.cy * -20;
        const centerX = cx + offsetX, centerY = cy + offsetY;
        const px = cx + data.px * 20, py = cy + data.py * -20;
        ctx.save();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
        ctx.fill();
        // 圆心
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();
        drawLabel(ctx, `O(${data.cx},${data.cy})`, centerX, centerY + r + 20, '#e74c3c', 12);
        // 点P
        const col = data.dist > data.r ? '#e74c3c' : data.dist === data.r ? '#f39c12' : '#27ae60';
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        drawLabel(ctx, `P(${data.px},${data.py})`, px + 15, py - 10, col, 12);
        ctx.restore();
    }
};

// ---------- 主入口 ----------
function renderVisualization(canvas, problem) {
    if (!canvas || !problem) return;
    const vizType = problem.visualizationType;
    const vizFn = VISUALIZERS[vizType];
    if (vizFn && problem.vizData) {
        try {
            vizFn(canvas, problem.vizData);
        } catch (e) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}
