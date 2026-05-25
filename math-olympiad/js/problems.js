/* ===================================================================
   problems.js — 奥数题库：10大题型，每类3种难度，每难度 ≥ 2 题
   所有题目通过参数随机生成，保证每次刷新获得不同题目
   =================================================================== */

// ---------- 工具函数 ----------
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function uid() { return '_' + Math.random().toString(36).slice(2, 8); }

// ---------- 题型元信息 ----------
const CATEGORIES = [
    { id: 'geometry',        name: '几何问题', icon: '📐', desc: '平面几何、立体几何、角度与面积计算（支持草稿画板）',
      schoolLevels: { '普通': '初中', '进阶': '高中', '挑战': '高中' },
      hasScratchpad: true },
    { id: 'distance',        name: '路程问题', icon: '🚗', desc: '速度、时间、路程关系；相遇与追及问题',
      schoolLevels: { '普通': '小学', '进阶': '初中', '挑战': '高中' } },
    { id: 'sequence',        name: '等比数列', icon: '📊', desc: '等比数列通项、求和与实际应用',
      schoolLevels: { '普通': '初中', '进阶': '高中', '挑战': '高中' } },
    { id: 'concentration',   name: '浓度问题', icon: '🧪', desc: '溶液浓度计算、混合与稀释',
      schoolLevels: { '普通': '小学', '进阶': '初中', '挑战': '高中' } },
    { id: 'cowgrass',        name: '牛吃草问题', icon: '🐄', desc: '牛顿问题：草匀速生长，牛定量消耗',
      schoolLevels: { '普通': '小学', '进阶': '初中', '挑战': '高中' } },
    { id: 'work',            name: '工程问题', icon: '🔧', desc: '工作效率、合作与交替工作',
      schoolLevels: { '普通': '小学', '进阶': '初中', '挑战': '高中' } },
    { id: 'chicken-rabbit',  name: '鸡兔同笼', icon: '🐔', desc: '头脚计数问题及扩展',
      schoolLevels: { '普通': '小学', '进阶': '小学', '挑战': '初中' } },
    { id: 'profit-loss',     name: '盈亏问题', icon: '⚖️', desc: '分配剩余与不足',
      schoolLevels: { '普通': '小学', '进阶': '小学', '挑战': '初中' } },
    { id: 'tree-planting',   name: '植树问题', icon: '🌲', desc: '直线与环形植树、间隔计算',
      schoolLevels: { '普通': '小学', '进阶': '小学', '挑战': '初中' } },
    { id: 'age',             name: '年龄问题', icon: '👨‍👩‍👧‍👦', desc: '年龄差不变下的倍数关系',
      schoolLevels: { '普通': '小学', '进阶': '小学', '挑战': '初中' } },
    { id: 'sum-diff',        name: '和差倍问题', icon: '🔢', desc: '和、差、倍数综合推理',
      schoolLevels: { '普通': '小学', '进阶': '小学', '挑战': '初中' } },
];

// ---------- 生成器注册表 ----------
const GENERATORS = {};

// =============================================================
//  1. 路程问题
// =============================================================
GENERATORS.distance = {
    name: '路程问题',
    generate: function (difficulty) {
        if (difficulty === '普通') return genDistanceEasy();
        if (difficulty === '进阶') return genDistanceMedium();
        return genDistanceHard();
    }
};

function genDistanceEasy() {
    const v = pick([45, 50, 60, 70, 75, 80, 90]);
    const t = pick([1, 1.5, 2, 2.5, 3]);
    const s = Math.round(v * t);
    const name1 = pick(['小明', '小华', '小红', '小刚', '小丽']);
    const from = pick(['A地', '北京', '学校', '家']);
    const to = pick(['B地', '上海', '公园', '商场']);
    const unit = '公里';
    return {
        question: `${name1}从${from}到${to}，速度为每小时${v}公里，经过${t}小时到达。请问${from}到${to}相距多少${unit}？`,
        solutionSteps: [
            `速度 × 时间 = 路程`,
            `${v} 公里/小时 × ${t} 小时 = ${s} 公里`,
            `所以${from}到${to}相距${s}公里。`
        ],
        answer: `${s} 公里`,
        visualizationType: 'distance',
        vizData: { v, t, s, name: name1, from, to, type: 'easy' }
    };
}

function genDistanceMedium() {
    const v1 = pick([30, 40, 45, 50, 55, 60]);
    const v2 = pick([35, 40, 50, 55, 65, 70]);
    const s = pick([180, 200, 240, 280, 300, 360, 400]);
    const t = s / (v1 + v2);
    const tNice = Math.round(t * 10) / 10;
    const name1 = pick(['甲', '小明', '客车']);
    const name2 = pick(['乙', '小华', '货车']);
    const unit = '公里';
    return {
        question: `${name1}和${name2}分别从相距${s}${unit}的两地同时出发，相向而行。${name1}的速度为每小时${v1}${unit}，${name2}的速度为每小时${v2}${unit}。几小时后两人相遇？`,
        solutionSteps: [
            `相向而行，相对速度 = 速度之和`,
            `相对速度 = ${v1} + ${v2} = ${v1 + v2} 公里/小时`,
            `相遇时间 = 路程 ÷ 相对速度 = ${s} ÷ ${v1 + v2} = ${tNice} 小时`,
            `答：${tNice}小时后相遇。`
        ],
        answer: `${tNice} 小时`,
        visualizationType: 'distance',
        vizData: { v1, v2, s, t: tNice, name1, name2, type: 'meet' }
    };
}

function genDistanceHard() {
    const v1 = pick([50, 60, 70, 80]);
    const v2 = pick([40, 50, 60, 70]);
    const s = pick([300, 360, 420, 480, 540]);
    const meetT = s / (v1 + v2);
    const tNice = Math.round(meetT * 10) / 10;
    const dogSpeed = pick([100, 120, 150]);
    const dogRun = Math.round(dogSpeed * tNice * 10) / 10;
    const name1 = pick(['小明', '小刚']);
    const name2 = pick(['小华', '小丽']);
    return {
        question: `${name1}和${name2}从相距${s}公里的两地同时相向而行，${name1}时速${v1}公里，${name2}时速${v2}公里。一只小狗以时速${dogSpeed}公里从${name1}处向${name2}跑，遇到${name2}后立即折返，如此往复直到两人相遇。问小狗一共跑了多少公里？`,
        solutionSteps: [
            `关键：小狗一直在跑，跑的时间就是两人相遇所需的时间`,
            `两人相遇时间 = ${s} ÷ (${v1} + ${v2}) = ${tNice} 小时`,
            `小狗跑的路程 = 速度 × 时间 = ${dogSpeed} × ${tNice} = ${dogRun} 公里`,
            `答：小狗一共跑了 ${dogRun} 公里。`
        ],
        answer: `${dogRun} 公里`,
        visualizationType: 'distance',
        vizData: { v1, v2, s, t: tNice, dogSpeed, dogRun, name1, name2, type: 'dog' }
    };
}

// =============================================================
//  2. 等比数列
// =============================================================
GENERATORS.sequence = {
    name: '等比数列',
    generate: function (difficulty) {
        if (difficulty === '普通') return genSeqEasy();
        if (difficulty === '进阶') return genSeqMedium();
        return genSeqHard();
    }
};

function genSeqEasy() {
    const a1 = rand(2, 8);
    const q = rand(2, 5);
    const n = rand(4, 8);
    const an = a1 * Math.pow(q, n - 1);
    return {
        question: `已知等比数列的首项为 ${a1}，公比为 ${q}，求第 ${n} 项的值。`,
        solutionSteps: [
            `等比数列通项公式：a${n} = a₁ × q^(n-1)`,
            `a${n} = ${a1} × ${q}^(${n} - 1) = ${a1} × ${q}^${n - 1}`,
            `a${n} = ${a1} × ${Math.pow(q, n - 1)} = ${an}`
        ],
        answer: `${an}`,
        visualizationType: 'sequence',
        vizData: { a1, q, n, terms: Array.from({length: n}, (_, i) => a1 * Math.pow(q, i)), type: 'easy' }
    };
}

function genSeqMedium() {
    const a1 = rand(1, 5);
    const q = rand(2, 4);
    const n = rand(4, 7);
    const sum = Math.round(a1 * (1 - Math.pow(q, n)) / (1 - q));
    const terms = Array.from({length: n}, (_, i) => a1 * Math.pow(q, i));
    return {
        question: `求等比数列 ${terms.join(', ')} 的前 ${n} 项之和。`,
        solutionSteps: [
            `等比数列求和公式：Sₙ = a₁ × (1 - qⁿ) / (1 - q)`,
            `首项 a₁ = ${a1}，公比 q = ${q}，项数 n = ${n}`,
            `Sₙ = ${a1} × (1 - ${q}^${n}) / (1 - ${q})`,
            `Sₙ = ${a1} × (1 - ${Math.pow(q, n)}) / (${1 - q})`,
            `Sₙ = ${sum}`
        ],
        answer: `${sum}`,
        visualizationType: 'sequence',
        vizData: { a1, q, n, terms, sum, type: 'medium' }
    };
}

function genSeqHard() {
    const a1 = rand(2, 6);
    const q = rand(2, 3);
    const n = rand(5, 8);
    const an = a1 * Math.pow(q, n - 1);
    const sum = Math.round(a1 * (1 - Math.pow(q, n)) / (1 - q));
    const target = a1 * Math.pow(q, n);
    return {
        question: `等比数列首项 ${a1}，公比 ${q}。问第几项开始大于 ${target}？`,
        solutionSteps: [
            `设第 k 项满足 a₁ × q^(k-1) > ${target}`,
            `即 ${a1} × ${q}^(k-1) > ${target}`,
            `${q}^(k-1) > ${target / a1}`,
            ...(() => {
                let k;
                for (k = 1; k <= 20; k++) {
                    if (a1 * Math.pow(q, k - 1) > target) break;
                }
                return [
                    `计算得 k = ${k}，即第 ${k} 项开始大于 ${target}`,
                    `验证：第 ${k} 项 = ${a1} × ${q}^${k - 1} = ${a1 * Math.pow(q, k - 1)}`
                ];
            })()
        ],
        answer: (() => {
            let k; for (k = 1; k <= 20; k++) { if (a1 * Math.pow(q, k - 1) > target) break; }
            return `第 ${k} 项`;
        })(),
        visualizationType: 'sequence',
        vizData: { a1, q, n, an, sum, type: 'hard' }
    };
}

// =============================================================
//  3. 浓度问题
// =============================================================
GENERATORS.concentration = {
    name: '浓度问题',
    generate: function (difficulty) {
        if (difficulty === '普通') return genConcEasy();
        if (difficulty === '进阶') return genConcMedium();
        return genConcHard();
    }
};

function genConcEasy() {
    const total = pick([100, 150, 200, 250, 300]);
    const pct = pick([5, 8, 10, 12, 15, 20]);
    const salt = total * pct / 100;
    const water = total - salt;
    return {
        question: `有 ${total} 克浓度为 ${pct}% 的盐水，其中盐和水各有多少克？`,
        solutionSteps: [
            `盐的质量 = 总质量 × 浓度 = ${total} × ${pct}%`,
            `盐 = ${total} × ${pct / 100} = ${salt} 克`,
            `水的质量 = 总质量 - 盐质量 = ${total} - ${salt} = ${water} 克`
        ],
        answer: `盐 ${salt} 克，水 ${water} 克`,
        visualizationType: 'concentration',
        vizData: { total, pct: pct / 100, salt, water, type: 'easy' }
    };
}

function genConcMedium() {
    const m1 = pick([100, 150, 200, 250]);
    const p1 = pick([10, 15, 20, 25]);
    const m2 = pick([100, 150, 200, 250]);
    const p2 = pick([5, 8, 10, 15]);
    const total = m1 + m2;
    const salt1 = m1 * p1 / 100;
    const salt2 = m2 * p2 / 100;
    const totalSalt = salt1 + salt2;
    const finalPct = Math.round(totalSalt / total * 1000) / 10;
    return {
        question: `将 ${m1} 克 ${p1}% 的盐水与 ${m2} 克 ${p2}% 的盐水混合，混合后盐水浓度是多少？`,
        solutionSteps: [
            `第一份盐 = ${m1} × ${p1}% = ${salt1} 克`,
            `第二份盐 = ${m2} × ${p2}% = ${salt2} 克`,
            `总盐 = ${salt1} + ${salt2} = ${totalSalt} 克，总质量 = ${total} 克`,
            `混合浓度 = ${totalSalt} ÷ ${total} × 100% = ${finalPct}%`
        ],
        answer: `${finalPct}%`,
        visualizationType: 'concentration',
        vizData: { m1, p1, m2, p2, totalSalt, total, finalPct, type: 'medium' }
    };
}

function genConcHard() {
    const initial = pick([200, 300, 400]);
    const pct = pick([20, 24, 25, 30]);
    const salt = initial * pct / 100;
    const boil = rand(50, 150);
    const waterLoss = boil;
    const newM = initial - waterLoss;
    const newPct = Math.round(salt / newM * 1000) / 10;
    return {
        question: `有 ${initial} 克浓度为 ${pct}% 的盐水，加热蒸发掉 ${waterLoss} 克水后，盐水浓度变为多少？`,
        solutionSteps: [
            `蒸发前盐的质量 = ${initial} × ${pct}% = ${salt} 克`,
            `蒸发后总质量 = ${initial} - ${waterLoss} = ${newM} 克`,
            `盐的质量不变，新浓度 = ${salt} ÷ ${newM} × 100% = ${newPct}%`,
            `答：浓度为 ${newPct}%`
        ],
        answer: `${newPct}%`,
        visualizationType: 'concentration',
        vizData: { initial, pct, waterLoss, newM, salt, newPct, type: 'hard' }
    };
}

// =============================================================
//  4. 牛吃草问题
// =============================================================
GENERATORS.cowgrass = {
    name: '牛吃草问题',
    generate: function (difficulty) {
        if (difficulty === '普通') return genCowEasy();
        if (difficulty === '进阶') return genCowMedium();
        return genCowHard();
    }
};

function genCowEasy() {
    let c1, d1, c2, d2, c3, r, G, d3;
    for (let tries = 0; tries < 20; tries++) {
        c1 = rand(12, 22);
        d1 = rand(8, 14);
        c2 = rand(22, 36);
        d2 = rand(3, d1 - 2);
        if (d2 < 2) continue;
        c3 = rand(26, 42);
        const eat1 = c1 * d1;
        const eat2 = c2 * d2;
        r = Math.round((eat1 - eat2) / (d1 - d2));
        if (r < 1) continue;
        G = Math.round(eat1 - r * d1);
        if (G < 1 || c3 <= r) continue;
        d3 = Math.round(G / (c3 - r));
        if (d3 > 0 && d3 < 60) break;
    }
    if (!d3) { d3 = '12'; r = 10; G = 100; c1 = 15; d1 = 10; c2 = 25; d2 = 6; c3 = 30; }
    const eat1 = c1 * d1;
    const eat2 = c2 * d2;
    return {
        question: `一片草地每天匀速生长。${c1}头牛${d1}天吃完，${c2}头牛${d2}天吃完。问${c3}头牛几天吃完？`,
        solutionSteps: [
            `设初始草量为G，每天生长量为r`,
            `${c1}×${d1} = G + r×${d1} → 总草 = ${eat1}`,
            `${c2}×${d2} = G + r×${d2} → 总草 = ${eat2}`,
            `解得 r = (${eat1} - ${eat2}) ÷ (${d1} - ${d2}) = ${r}，G = ${G}`,
            `${c3}头牛每天消耗${c3}份，每天净减少 ${c3} - ${r} = ${c3 - r} 份`,
            `天数 = ${G} ÷ ${c3 - r} = ${d3} 天`
        ],
        answer: `${d3} 天`,
        visualizationType: 'cowgrass',
        vizData: { c1, d1, c2, d2, c3, d3, r, G, eat1, eat2, type: 'easy' }
    };
}

function genCowMedium() {
    let c1, d1, c2, d2, r, G;
    for (let tries = 0; tries < 20; tries++) {
        c1 = rand(16, 28);
        d1 = rand(9, 16);
        c2 = rand(30, 48);
        d2 = rand(4, d1 - 2);
        if (d2 < 2) continue;
        const eat1 = c1 * d1;
        const eat2 = c2 * d2;
        r = Math.round((eat1 - eat2) / (d1 - d2));
        if (r < 1) continue;
        G = Math.round(eat1 - r * d1);
        if (G > 0) break;
    }
    if (!G) { r = 12; G = 80; c1 = 20; d1 = 10; c2 = 32; d2 = 6; }
    return {
        question: `一片草地草匀速生长。经测算，${c1}头牛${d1}天能将草吃完，${c2}头牛${d2}天能将草吃完。问这片草地最多能养活多少头牛（即草永远吃不完）？`,
        solutionSteps: [
            `设每天生长量为r，初始草量为G`,
            `${c1}×${d1} = G + r×${d1} → ①`,
            `${c2}×${d2} = G + r×${d2} → ②`,
            `①-② 得：(${c1}×${d1} - ${c2}×${d2}) = r×(${d1} - ${d2})`,
            `r = ${c1 * d1 - c2 * d2} ÷ ${d1 - d2} = ${r}`,
            `要使草永远吃不完，牛的数量不能超过每天生长量`,
            `最多可养 ${r} 头牛`
        ],
        answer: `${r} 头`,
        visualizationType: 'cowgrass',
        vizData: { c1, d1, c2, d2, r, G, type: 'medium' }
    };
}

function genCowHard() {
    let c1, d1, c2, d2, r, G, half, rem, dRem, remaining;
    for (let tries = 0; tries < 20; tries++) {
        c1 = rand(22, 32);
        d1 = rand(10, 16);
        c2 = rand(36, 50);
        d2 = rand(5, d1 - 2);
        if (d2 < 2) continue;
        const eat1 = c1 * d1;
        const eat2 = c2 * d2;
        r = Math.round((eat1 - eat2) / (d1 - d2));
        if (r < 2) continue;
        G = Math.round(eat1 - r * d1);
        half = pick([5, 6, 7, 8]);
        if (half >= c1) continue;
        rem = c1 - half;
        const eaten1 = half * half;
        remaining = G + r * half - eaten1;
        if (remaining < 1 || rem <= r) continue;
        dRem = Math.round(remaining / (rem - r));
        if (dRem > 0 && dRem < 50) break;
    }
    if (!dRem) { c1 = 25; d1 = 12; c2 = 40; d2 = 7; r = 10; G = 180; half = 6; rem = 19; remaining = 150; dRem = 12; }
    const eat1 = c1 * d1;
    const eat2 = c2 * d2;
    return {
        question: `${c1}头牛${d1}天吃完一片草地（草匀速生长）。${c2}头牛${d2}天吃完同样的草地。现在先让${half}头牛吃了${half}天，又增加${rem}头牛（共${half + rem}头），问还需几天吃完？`,
        solutionSteps: [
            `先求生长速度r和初始草量G：`,
            `r = (${eat1} - ${eat2}) ÷ (${d1} - ${d2}) = ${r}`,
            `G = ${eat1} - ${r}×${d1} = ${G}`,
            `前${half}天：${half}头牛吃掉 ${half}×${half} = ${half * half}`,
            `此时草剩余 = G + ${r}×${half} - ${half * half} = ${remaining}`,
            `之后共 ${half + rem} 头牛，每天净减 ${half + rem} - ${r} = ${half + rem - r}`,
            `还需 ${remaining} ÷ ${half + rem - r} = ${dRem} 天`
        ],
        answer: `${dRem} 天`,
        visualizationType: 'cowgrass',
        vizData: { c1, d1, c2, d2, r, G, half, rem, dRem, remaining, type: 'hard' }
    };
}

// =============================================================
//  5. 工程问题
// =============================================================
GENERATORS.work = {
    name: '工程问题',
    generate: function (difficulty) {
        if (difficulty === '普通') return genWorkEasy();
        if (difficulty === '进阶') return genWorkMedium();
        return genWorkHard();
    }
};

function genWorkEasy() {
    const days = pick([6, 8, 10, 12, 15, 20]);
    const rate = Math.round(100 / days * 10) / 10;
    const w = pick([30, 40, 50, 60, 75]);
    const need = Math.ceil(w / rate);
    return {
        question: `一项工程，甲单独做需要 ${days} 天完成。甲每天完成这项工程的百分之多少？如果完成全部工程的 ${w}%，需要几天？`,
        solutionSteps: [
            `甲每天完成 1/${days} ≈ ${rate}%`,
            `完成 ${w}% 需要 ${w} ÷ ${rate} ≈ ${need} 天`,
            `精确计算：${w}% = ${w/100}，天数 = ${w/100} ÷ 1/${days} = ${w*days/100} = ${need} 天`
        ],
        answer: `每天 ${rate}%，需要 ${need} 天`,
        visualizationType: 'work',
        vizData: { days, rate, w, need, type: 'easy' }
    };
}

function genWorkMedium() {
    const d1 = pick([6, 8, 10, 12]);
    const d2 = pick([8, 10, 12, 15]);
    const total = Math.round(1 / (1/d1 + 1/d2) * 10) / 10;
    return {
        question: `一项工程，甲单独做需 ${d1} 天，乙单独做需 ${d2} 天。两人合作需要几天完成？`,
        solutionSteps: [
            `甲效率 = 1/${d1}，乙效率 = 1/${d2}`,
            `合作效率 = 1/${d1} + 1/${d2} = ${1/d1 + 1/d2}（取小数 ${Math.round((1/d1 + 1/d2) * 1000) / 1000}）`,
            `合作时间 = 1 ÷ (1/${d1} + 1/${d2})`,
            `= 1 ÷ (${(1/d1 + 1/d2).toFixed(3)}) = ${total} 天`
        ],
        answer: `${total} 天`,
        visualizationType: 'work',
        vizData: { d1, d2, total, type: 'medium' }
    };
}

function genWorkHard() {
    const d1 = pick([6, 8, 10]);
    const d2 = pick([8, 10, 12]);
    const d3 = pick([12, 15, 18]);
    const eff1 = 1 / d1;
    const eff2 = 1 / d2;
    const eff3 = 1 / d3;
    const together = eff1 + eff2 + eff3;
    const days = Math.round(1 / together * 10) / 10;
    const seq = pick(['甲乙丙轮流', '先甲再乙再丙']);
    return {
        question: `一项工程，甲需${d1}天，乙需${d2}天，丙需${d3}天。三人合作${days}天后，甲因事离开，剩下的由乙丙合作还需几天？`,
        solutionSteps: [
            `三人合作${days}天完成：${together.toFixed(3)} × ${days} = ${(together * days).toFixed(3)}`,
            `剩余：${(1 - together * days).toFixed(3)}`,
            `乙丙效率：${(eff2 + eff3).toFixed(3)}`,
            `还需：${(1 - together * days).toFixed(3)} ÷ ${(eff2 + eff3).toFixed(3)} ≈ ${Math.round((1 - together * days) / (eff2 + eff3) * 10) / 10} 天`
        ],
        answer: `${Math.round((1 - together * days) / (eff2 + eff3) * 10) / 10} 天`,
        visualizationType: 'work',
        vizData: { d1, d2, d3, days, together, type: 'hard' }
    };
}

// =============================================================
//  6. 鸡兔同笼
// =============================================================
GENERATORS['chicken-rabbit'] = {
    name: '鸡兔同笼',
    generate: function (difficulty) {
        if (difficulty === '普通') return genCREasy();
        if (difficulty === '进阶') return genCRMedium();
        return genCRHard();
    }
};

function genCREasy() {
    const heads = rand(10, 25);
    const rabbits = rand(2, heads - 2);
    const chickens = heads - rabbits;
    const legs = rabbits * 4 + chickens * 2;
    return {
        question: `笼中共有 ${heads} 个头，${legs} 只脚。问鸡和兔各有多少只？`,
        solutionSteps: [
            `假设全是鸡：${heads}×2 = ${heads * 2} 只脚`,
            `实际多出：${legs} - ${heads * 2} = ${legs - heads * 2} 只脚`,
            `每只兔比鸡多 2 只脚，所以兔有：${legs - heads * 2} ÷ 2 = ${rabbits} 只`,
            `鸡有：${heads} - ${rabbits} = ${chickens} 只`,
            `验算：${rabbits}×4 + ${chickens}×2 = ${rabbits * 4 + chickens * 2} = ${legs} ✓`
        ],
        answer: `鸡 ${chickens} 只，兔 ${rabbits} 只`,
        visualizationType: 'chicken-rabbit',
        vizData: { chickens, rabbits, heads, legs, type: 'easy' }
    };
}

function genCRMedium() {
    const heads = rand(20, 35);
    const rabbits = rand(5, heads - 5);
    const chickens = heads - rabbits;
    const legs = rabbits * 4 + chickens * 2;
    const diff = Math.abs(legs - heads * 3);
    return {
        question: `鸡兔同笼，共有 ${heads} 个头，${legs} 只脚。已知兔的脚比鸡的脚多 ${rabbits * 4 - chickens * 2} 只。问鸡兔各多少只？`,
        solutionSteps: [
            `设兔有 x 只，鸡有 ${heads} - x 只`,
            `兔脚：4x，鸡脚：2(${heads} - x)`,
            `4x - 2(${heads} - x) = ${rabbits * 4 - chickens * 2}`,
            `4x - ${2 * heads} + 2x = ${rabbits * 4 - chickens * 2}`,
            `6x = ${rabbits * 4 - chickens * 2 + 2 * heads}`,
            `x = ${rabbits}，鸡 = ${chickens}`
        ],
        answer: `兔 ${rabbits} 只，鸡 ${chickens} 只`,
        visualizationType: 'chicken-rabbit',
        vizData: { chickens, rabbits, heads, legs, type: 'medium' }
    };
}

function genCRHard() {
    let heads, legs, rabbits, chickens;
    for (let tries = 0; tries < 20; tries++) {
        heads = rand(25, 40);
        legs = heads * 2 + (rand(1, heads - 1)) * 2; // ensure even extra legs
        rabbits = (legs - heads * 2) / 2;
        chickens = heads - rabbits;
        if (rabbits >= 1 && chickens >= 1) break;
    }
    if (!chickens) { heads = 30; rabbits = 10; chickens = 20; legs = rabbits * 4 + chickens * 2; }
    return {
        question: `鸡兔同笼，头数之和为 ${heads}，脚数之和为 ${legs}。如果将鸡兔数量互换，则互换后脚数之和是多少？`,
        solutionSteps: [
            `原：兔 = (${legs} - ${heads}×2) ÷ 2 = ${rabbits} 只，鸡 = ${chickens} 只`,
            `互换后：鸡 ${rabbits} 只，兔 ${chickens} 只`,
            `脚数 = ${rabbits}×2 + ${chickens}×4 = ${rabbits * 2 + chickens * 4} 只`
        ],
        answer: `${rabbits * 2 + chickens * 4} 只脚`,
        visualizationType: 'chicken-rabbit',
        vizData: { chickens, rabbits, heads, legs, type: 'hard' }
    };
}

// =============================================================
//  7. 盈亏问题
// =============================================================
GENERATORS['profit-loss'] = {
    name: '盈亏问题',
    generate: function (difficulty) {
        if (difficulty === '普通') return genPLEasy();
        if (difficulty === '进阶') return genPLMedium();
        return genPLHard();
    }
};

function genPLEasy() {
    const students = rand(8, 20);
    const per1 = rand(3, 6);
    const per2 = per1 + rand(1, 3);
    const remain = rand(2, 8);
    const lack = rand(2, 8);
    const total1 = students * per1 + remain;
    const total2 = students * per2 - lack;
    // ensure total1 ≈ total2
    const total = Math.round((total1 + total2) / 2);
    return {
        question: `老师给同学们分糖果。每人分 ${per1} 颗，多 ${remain} 颗；每人分 ${per2} 颗，少 ${lack} 颗。问有多少位同学？糖果共有多少颗？`,
        solutionSteps: [
            `两次分配每人相差：${per2} - ${per1} = ${per2 - per1} 颗`,
            `糖果总量相差：${remain} + ${lack} = ${remain + lack} 颗`,
            `人数 = 总量差 ÷ 每人差 = ${remain + lack} ÷ ${per2 - per1}  = ${(remain + lack) / (per2 - per1)} 位`,
            `糖果数 = ${per1} × ${(remain + lack) / (per2 - per1)} + ${remain} = ${per1 * (remain + lack) / (per2 - per1) + remain} 颗`
        ],
        answer: `${(remain + lack) / (per2 - per1)} 位同学，${per1 * (remain + lack) / (per2 - per1) + remain} 颗糖`,
        visualizationType: 'profit-loss',
        vizData: { students, per1, per2, remain, lack, type: 'easy' }
    };
}

function genPLMedium() {
    const people = rand(10, 25);
    const p1 = rand(4, 7);
    const p2 = p1 + 1;
    const surplus = rand(3, 10);
    return {
        question: `一批物资要分给若干人。每人分 ${p1} 件，多 ${surplus} 件；每人分 ${p2} 件，刚好分完。求人数和物资数量。`,
        solutionSteps: [
            `每人多分 ${p2 - p1} 件，正好把多出的 ${surplus} 件分完`,
            `人数 = ${surplus} ÷ ${p2 - p1} = ${surplus / (p2 - p1)} 人`,
            `物资 = ${p2} × ${surplus / (p2 - p1)} = ${p2 * surplus / (p2 - p1)} 件`
        ],
        answer: `${surplus / (p2 - p1)} 人，${p2 * surplus / (p2 - p1)} 件`,
        visualizationType: 'profit-loss',
        vizData: { people, p1, p2, surplus, type: 'medium' }
    };
}

function genPLHard() {
    const p1 = rand(3, 6);
    const p2 = p1 + rand(2, 4);
    const surplus = rand(5, 15);
    const lack = rand(3, 10);
    const people = Math.round((surplus + lack) / (p2 - p1));
    const total = p1 * people + surplus;
    return {
        question: `幼儿园分玩具。若每人分 ${p1} 件则多 ${surplus} 件；若每人分 ${p2} 件则少 ${lack} 件；若每人分 ${p2 + 1} 件，会多出还是缺少多少件？`,
        solutionSteps: [
            `人数 = (${surplus} + ${lack}) ÷ (${p2} - ${p1}) = ${people} 人`,
            `玩具总数 = ${p1} × ${people} + ${surplus} = ${total} 件`,
            `每人分 ${p2 + 1} 件需要：${p2 + 1} × ${people} = ${(p2 + 1) * people} 件`,
            `${total > (p2 + 1) * people ? '多出' : '缺少'} ${Math.abs(total - (p2 + 1) * people)} 件`
        ],
        answer: `${total > (p2 + 1) * people ? '多出' : '缺少'} ${Math.abs(total - (p2 + 1) * people)} 件`,
        visualizationType: 'profit-loss',
        vizData: { p1, p2, surplus, lack, people, total, type: 'hard' }
    };
}

// =============================================================
//  8. 植树问题
// =============================================================
GENERATORS['tree-planting'] = {
    name: '植树问题',
    generate: function (difficulty) {
        if (difficulty === '普通') return genTreeEasy();
        if (difficulty === '进阶') return genTreeMedium();
        return genTreeHard();
    }
};

function genTreeEasy() {
    const len = pick([100, 120, 150, 180, 200, 240]);
    const gap = pick([4, 5, 6, 8, 10, 12]);
    const trees = len / gap + 1;
    return {
        question: `在一条 ${len} 米长的道路一侧从头到尾每隔 ${gap} 米种一棵树，一共需要种多少棵树？`,
        solutionSteps: [
            `两端都种树：棵数 = 段数 + 1`,
            `段数 = ${len} ÷ ${gap} = ${len / gap}`,
            `棵数 = ${len / gap} + 1 = ${trees} 棵`
        ],
        answer: `${trees} 棵`,
        visualizationType: 'tree-planting',
        vizData: { len, gap, trees, type: 'easy' }
    };
}

function genTreeMedium() {
    const len = pick([100, 150, 200, 250, 300]);
    const gap = pick([5, 6, 8, 10, 12]);
    const trees = Math.floor(len / gap);
    return {
        question: `在周长 ${len} 米的圆形池塘周围每隔 ${gap} 米种一棵柳树，一共需要种多少棵？`,
        solutionSteps: [
            `封闭图形植树：棵数 = 段数`,
            `棵数 = ${len} ÷ ${gap} = ${trees} 棵`
        ],
        answer: `${trees} 棵`,
        visualizationType: 'tree-planting',
        vizData: { len, gap, trees, type: 'medium' }
    };
}

function genTreeHard() {
    const road = pick([200, 240, 300, 360, 400]);
    const gap1 = pick([6, 8, 10]);
    const gap2 = pick([4, 5, 6]);
    const trees1 = road / gap1 + 1;
    const trees2 = road / gap2 + 1;
    return {
        question: `一条${road}米长的道路，从头到尾先每隔${gap1}米种一棵梧桐树，然后在相邻梧桐树之间每隔${gap2}米种一棵月季花。问需要种多少棵月季花？`,
        solutionSteps: [
            `梧桐树段数 = ${road} ÷ ${gap1} = ${road / gap1}`,
            `每段种月季花：${gap1} ÷ ${gap2} - 1 = ${gap1 / gap2 - 1} 棵`,
            `月季花总数 = ${road / gap1} × ${gap1 / gap2 - 1} = ${road / gap1 * (gap1 / gap2 - 1)} 棵`
        ],
        answer: `${road / gap1 * (gap1 / gap2 - 1)} 棵`,
        visualizationType: 'tree-planting',
        vizData: { road, gap1, gap2, trees1, trees2, type: 'hard' }
    };
}

// =============================================================
//  9. 年龄问题
// =============================================================
GENERATORS.age = {
    name: '年龄问题',
    generate: function (difficulty) {
        if (difficulty === '普通') return genAgeEasy();
        if (difficulty === '进阶') return genAgeMedium();
        return genAgeHard();
    }
};

function genAgeEasy() {
    const child = rand(5, 12);
    const parent = child + rand(20, 30);
    return {
        question: `爸爸今年 ${parent} 岁，小明今年 ${child} 岁。几年后爸爸的年龄是小明的 2 倍？`,
        solutionSteps: [
            `年龄差不变：${parent} - ${child} = ${parent - child} 岁`,
            `当爸爸年龄是小明 2 倍时，小明年龄等于年龄差`,
            `小明那时 ${parent - child} 岁，现在 ${child} 岁`,
            `需要经过：${parent - child} - ${child} = ${parent - child - child} 年`
        ],
        answer: `${parent - child - child} 年后`,
        visualizationType: 'age',
        vizData: { child, parent, diff: parent - child, type: 'easy' }
    };
}

function genAgeMedium() {
    const c = rand(6, 14);
    const p = c + rand(22, 32);
    const y = rand(3, 8);
    return {
        question: `妈妈今年 ${p} 岁，女儿今年 ${c} 岁。${y} 年前妈妈的年龄是女儿的几倍？`,
        solutionSteps: [
            `${y}年前妈妈：${p} - ${y} = ${p - y} 岁`,
            `${y}年前女儿：${c} - ${y} = ${c - y} 岁`,
            `倍数 = ${p - y} ÷ ${c - y} = ${Math.round((p - y) / (c - y) * 10) / 10} 倍`
        ],
        answer: `${Math.round((p - y) / (c - y) * 10) / 10} 倍`,
        visualizationType: 'age',
        vizData: { child: c, parent: p, years: y, type: 'medium' }
    };
}

function genAgeHard() {
    const s1 = rand(5, 10);
    const s2 = s1 + rand(2, 6);
    const p = s1 + s2 + rand(20, 35);
    return {
        question: `父亲今年 ${p} 岁，两个儿子年龄分别是 ${s1} 岁和 ${s2} 岁。多少年后父亲的年龄等于两个儿子年龄之和？`,
        solutionSteps: [
            `目前儿子年龄和 = ${s1} + ${s2} = ${s1 + s2} 岁`,
            `父亲比年龄和多：${p} - ${s1 + s2} = ${p - s1 - s2} 岁`,
            `每年父亲增长1岁，两个儿子共增长2岁，差距缩小1岁`,
            `需要：${p - s1 - s2} ÷ (2 - 1) = ${p - s1 - s2} 年`
        ],
        answer: `${p - s1 - s2} 年后`,
        visualizationType: 'age',
        vizData: { p, s1, s2, sum: s1 + s2, type: 'hard' }
    };
}

// =============================================================
//  10. 和差倍问题
// =============================================================
GENERATORS['sum-diff'] = {
    name: '和差倍问题',
    generate: function (difficulty) {
        if (difficulty === '普通') return genSDEasy();
        if (difficulty === '进阶') return genSDMedium();
        return genSDHard();
    }
};

function genSDEasy() {
    const a = rand(20, 80);
    const b = rand(10, a - 5);
    const sum = a + b;
    const diff = a - b;
    return {
        question: `甲乙两数之和为 ${sum}，差为 ${diff}。求甲乙两数各是多少？`,
        solutionSteps: [
            `较大数 = (和 + 差) ÷ 2 = (${sum} + ${diff}) ÷ 2 = ${a}`,
            `较小数 = (和 - 差) ÷ 2 = (${sum} - ${diff}) ÷ 2 = ${b}`,
            `验算：${a} + ${b} = ${sum}，${a} - ${b} = ${diff} ✓`
        ],
        answer: `较大数 ${a}，较小数 ${b}`,
        visualizationType: 'sum-diff',
        vizData: { a, b, sum, diff, type: 'easy' }
    };
}

function genSDMedium() {
    const small = rand(15, 40);
    const large = small * rand(2, 4);
    const sum = large + small;
    return {
        question: `甲乙两数之和为 ${sum}，甲是乙的 ${Math.round(large / small)} 倍。求甲乙两数。`,
        solutionSteps: [
            `设乙为1份，则甲为${Math.round(large / small)}份，一共${Math.round(large / small) + 1}份`,
            `1份 = ${sum} ÷ ${Math.round(large / small) + 1} = ${small}`,
            `乙 = ${small}，甲 = ${small} × ${Math.round(large / small)} = ${large}`
        ],
        answer: `甲 ${large}，乙 ${small}`,
        visualizationType: 'sum-diff',
        vizData: { a: large, b: small, sum, ratio: Math.round(large / small), type: 'medium' }
    };
}

function genSDHard() {
    const b = rand(10, 25);
    const a = b * rand(2, 4);
    const c = a + rand(5, 20);
    const sum = a + b + c;
    const abDiff = a - b;
    const acDiff = c - a;
    return {
        question: `甲乙丙三数之和为 ${sum}，甲比乙多 ${abDiff}，丙比甲多 ${acDiff}。求三个数。`,
        solutionSteps: [
            `设乙为 x，则甲 = x + ${abDiff}，丙 = x + ${abDiff} + ${acDiff} = x + ${abDiff + acDiff}`,
            `总和 = x + (x + ${abDiff}) + (x + ${abDiff + acDiff}) = 3x + ${2 * abDiff + acDiff}`,
            `3x + ${2 * abDiff + acDiff} = ${sum}`,
            `3x = ${sum - (2 * abDiff + acDiff)}，x = ${(sum - (2 * abDiff + acDiff)) / 3}`,
            `乙 = ${b}，甲 = ${a}，丙 = ${c}`
        ],
        answer: `甲 ${a}，乙 ${b}，丙 ${c}`,
        visualizationType: 'sum-diff',
        vizData: { a, b, c, sum, type: 'hard' }
    };
}

// =============================================================
//  11. 几何问题
// =============================================================
GENERATORS.geometry = {
    name: '几何问题',
    generate: function (difficulty) {
        if (difficulty === '普通') return genGeoEasy();
        if (difficulty === '进阶') return genGeoMedium();
        return genGeoHard();
    }
};

function genGeoEasy() {
    const type = pick(['triangle', 'rectangle', 'circle', 'angle']);
    if (type === 'triangle') {
        const a = pick([3, 4, 5, 6, 8]);
        const b = pick([4, 5, 6, 8, 10]);
        const area = Math.round(a * b / 2 * 10) / 10;
        return {
            question: `一个直角三角形的两条直角边分别为 ${a}cm 和 ${b}cm，求这个三角形的面积。`,
            solutionSteps: [
                `直角三角形面积 = 直角边₁ × 直角边₂ ÷ 2`,
                `= ${a} × ${b} ÷ 2 = ${a * b} ÷ 2 = ${area} cm²`,
                `答：三角形面积为 ${area} 平方厘米。`
            ],
            answer: `${area} cm²`,
            visualizationType: 'geometry',
            vizData: { type: 'right-triangle', a, b, area }
        };
    } else if (type === 'rectangle') {
        const l = rand(5, 15);
        const w = rand(3, 10);
        return {
            question: `一个长方形的长为 ${l}cm，宽为 ${w}cm，求它的周长和面积。`,
            solutionSteps: [
                `周长 = 2 × (长 + 宽) = 2 × (${l} + ${w}) = 2 × ${l + w} = ${2 * (l + w)} cm`,
                `面积 = 长 × 宽 = ${l} × ${w} = ${l * w} cm²`
            ],
            answer: `周长 ${2 * (l + w)} cm，面积 ${l * w} cm²`,
            visualizationType: 'geometry',
            vizData: { type: 'rectangle', l, w }
        };
    } else if (type === 'circle') {
        const r = pick([3, 4, 5, 6, 7, 8]);
        const area = Math.round(Math.PI * r * r * 100) / 100;
        const circ = Math.round(2 * Math.PI * r * 100) / 100;
        return {
            question: `一个圆的半径为 ${r}cm，求它的周长和面积。（π 取 3.14）`,
            solutionSteps: [
                `周长 = 2πr = 2 × 3.14 × ${r} = ${circ} cm`,
                `面积 = πr² = 3.14 × ${r}² = 3.14 × ${r * r} = ${area} cm²`
            ],
            answer: `周长 ${circ} cm，面积 ${area} cm²`,
            visualizationType: 'geometry',
            vizData: { type: 'circle', r, area, circ }
        };
    } else {
        const deg = pick([30, 45, 60, 90, 120]);
        const comp = 180 - deg;
        return {
            question: `一个三角形中，一个角为 ${deg}°，另外两个角相等，求这两个角的度数。`,
            solutionSteps: [
                `三角形内角和 = 180°`,
                `另外两个角之和 = 180° - ${deg}° = ${comp}°`,
                `每个角 = ${comp}° ÷ 2 = ${comp / 2}°`
            ],
            answer: `${comp / 2}°`,
            visualizationType: 'geometry',
            vizData: { type: 'angle', deg, comp }
        };
    }
}

function genGeoMedium() {
    const type = pick(['pythagorean', 'circle-theorem', 'similar-triangle']);
    if (type === 'pythagorean') {
        const a = pick([3, 5, 6, 7, 8, 9, 10]);
        const b = pick([4, 6, 8, 9, 10, 12, 15]);
        const c = Math.round(Math.sqrt(a * a + b * b) * 100) / 100;
        return {
            question: `直角三角形两条直角边分别为 ${a}cm 和 ${b}cm，求斜边长。（结果保留两位小数）`,
            solutionSteps: [
                `勾股定理：a² + b² = c²`,
                `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`,
                `c = √(${a * a + b * b}) ≈ ${c} cm`
            ],
            answer: `${c} cm`,
            visualizationType: 'geometry',
            vizData: { type: 'pythagorean', a, b, c }
        };
    } else if (type === 'circle-theorem') {
        const r = pick([4, 5, 6, 8, 10]);
        const chord = pick([6, 8, 10, 12]);
        const halfChord = chord / 2;
        const dist = Math.round(Math.sqrt(r * r - halfChord * halfChord) * 10) / 10;
        return {
            question: `在半径为 ${r}cm 的圆中，一条弦长为 ${chord}cm，求圆心到弦的距离。`,
            solutionSteps: [
                `圆心到弦的垂线平分弦，形成直角三角形`,
                `斜边 = 半径 = ${r}，一条直角边 = 弦长的一半 = ${halfChord}`,
                `距离 = √(${r}² - ${halfChord}²) = √(${r * r} - ${halfChord * halfChord}) = √${r * r - halfChord * halfChord} ≈ ${dist} cm`
            ],
            answer: `${dist} cm`,
            visualizationType: 'geometry',
            vizData: { type: 'circle-chord', r, chord, dist }
        };
    } else {
        const h1 = pick([4, 5, 6, 8]);
        const shadow = pick([6, 8, 10, 12]);
        const h2 = Math.round(shadow / (shadow / h1) * 10) / 10;
        const ratio = Math.round(shadow / h1 * 10) / 10;
        return {
            question: `在同一时刻，一根 ${h1}m 高的旗杆影子长 ${shadow}m，旁边一棵树影子长 ${shadow + 3}m，求树高。`,
            solutionSteps: [
                `相似三角形：物高与影长成正比`,
                `比例 = 影长 ÷ 物高 = ${shadow} ÷ ${h1} = ${ratio}`,
                `树高 = 树影长 ÷ 比例 = ${shadow + 3} ÷ ${ratio} ≈ ${Math.round((shadow + 3) / ratio * 10) / 10} m`
            ],
            answer: `${Math.round((shadow + 3) / ratio * 10) / 10} m`,
            visualizationType: 'geometry',
            vizData: { type: 'similar', h1, shadow, ratio }
        };
    }
}

function genGeoHard() {
    const type = pick(['triangle-proof', 'solid-geo', 'analytic']);
    if (type === 'triangle-proof') {
        const sides = pick([3, 4, 5, 5, 6, 7, 8, 10]);
        const area = Math.round(Math.sqrt(3) / 4 * sides * sides * 100) / 100;
        const name = pick(['ABC', 'DEF', 'XYZ']);
        const aLabel = name[0], bLabel = name[1], cLabel = name[2];
        return {
            question: `在正三角形 ${name} 中，边长为 ${sides}cm，求三角形 ${name} 的面积以及外接圆半径。`,
            solutionSteps: [
                `正三角形面积 = √3/4 × a² = √3/4 × ${sides}²`,
                `= √3/4 × ${sides * sides} = ${area} cm²`,
                `外接圆半径 R = a/√3 = ${sides}/√3 ≈ ${Math.round(sides / Math.sqrt(3) * 100) / 100} cm`
            ],
            answer: `面积 ${area} cm²，外接圆半径 ${Math.round(sides / Math.sqrt(3) * 100) / 100} cm`,
            visualizationType: 'geometry',
            vizData: { type: 'equilateral', sides, area, name }
        };
    } else if (type === 'solid-geo') {
        const a = pick([3, 4, 5, 6]);
        const b = pick([4, 5, 6, 8]);
        const h = pick([5, 6, 8, 10]);
        const vol = a * b * h;
        const surface = 2 * (a * b + a * h + b * h);
        return {
            question: `一个长方体的长宽高分别为 ${a}cm、${b}cm、${h}cm，求它的体积和表面积。`,
            solutionSteps: [
                `体积 = 长 × 宽 × 高 = ${a} × ${b} × ${h} = ${vol} cm³`,
                `表面积 = 2(长×宽 + 长×高 + 宽×高)`,
                `= 2(${a}×${b} + ${a}×${h} + ${b}×${h}) = 2(${a * b} + ${a * h} + ${b * h})`,
                `= 2 × ${a * b + a * h + b * h} = ${surface} cm²`
            ],
            answer: `体积 ${vol} cm³，表面积 ${surface} cm²`,
            visualizationType: 'geometry',
            vizData: { type: 'cuboid', a, b, h, vol, surface }
        };
    } else {
        const cx = pick([1, 2, 3, -1, -2]);
        const cy = pick([1, 2, 3, -1, -2]);
        const r = pick([2, 3, 4, 5]);
        const px = cx + rand(-3, 3);
        const py = cy + rand(-3, 3);
        const dist = Math.round(Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) * 100) / 100;
        return {
            question: `已知圆心在 (${cx}, ${cy})，半径为 ${r} 的圆，判断点 P(${px}, ${py}) 与圆的位置关系。`,
            solutionSteps: [
                `点P到圆心距离 d = √((${px} - ${cx})² + (${py} - ${cy})²)`,
                `d = √(${px - cx}² + ${py - cy}²) = √(${(px - cx) ** 2} + ${(py - cy) ** 2}) = √${(px - cx) ** 2 + (py - cy) ** 2} ≈ ${dist}`,
                `圆半径 r = ${r}`,
                `因为 d ${dist > r ? '>' : dist === r ? '=' : '<'} r，所以点P在圆${dist > r ? '外' : dist === r ? '上' : '内'}`
            ],
            answer: `点P在圆${dist > r ? '外' : dist === r ? '上' : '内'}（d=${dist}, r=${r}）`,
            visualizationType: 'geometry',
            vizData: { type: 'position', cx, cy, r, px, py, dist }
        };
    }
}

// ---------- 自定义题目管理 ----------
const customProblems = [];

function loadCustomProblems() {
    try {
        const saved = localStorage.getItem('olympiad_custom_problems');
        if (saved) {
            const parsed = JSON.parse(saved);
            customProblems.length = 0;
            customProblems.push(...parsed);
        }
    } catch (e) { /* ignore */ }
}

function saveCustomProblems() {
    try {
        localStorage.setItem('olympiad_custom_problems', JSON.stringify(customProblems));
    } catch (e) { /* ignore */ }
}

function addCustomProblem(data) {
    const p = {
        id: 'custom_' + uid(),
        type: data.categoryName,
        typeId: data.categoryId || 'custom',
        difficulty: data.difficulty,
        schoolLevel: data.schoolLevel,
        question: data.question,
        solutionSteps: data.solutionSteps.split('\n').filter(s => s.trim()),
        answer: data.answer,
        visualizationType: null,
        vizData: null,
        showSolution: false,
        isCustom: true,
        hasScratchpad: data.hasScratchpad || false,
        createdAt: Date.now()
    };
    customProblems.push(p);
    saveCustomProblems();
    return p;
}

function removeCustomProblem(id) {
    const idx = customProblems.findIndex(p => p.id === id);
    if (idx >= 0) {
        customProblems.splice(idx, 1);
        saveCustomProblems();
    }
}

function getCustomProblemsForCategory(catId) {
    return customProblems.filter(p => p.typeId === catId);
}

// =============================================================
//  批量生成接口
// =============================================================
function getSchoolLevel(catId, difficulty) {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (cat && cat.schoolLevels && cat.schoolLevels[difficulty]) {
        return cat.schoolLevels[difficulty];
    }
    return '小学';
}

function generateProblemsForCategory(catId, difficultyFilter) {
    const gen = GENERATORS[catId];
    if (!gen) return [];
    const difficulties = difficultyFilter === 'all'
        ? ['普通', '进阶', '挑战']
        : [difficultyFilter];
    const cat = CATEGORIES.find(c => c.id === catId);
    const hasScratchpad = cat && cat.hasScratchpad;

    const results = [];
    difficulties.forEach(diff => {
        const count = rand(2, 3);
        for (let i = 0; i < count; i++) {
            const p = gen.generate(diff);
            results.push({
                id: uid(),
                type: gen.name,
                typeId: catId,
                difficulty: diff,
                schoolLevel: getSchoolLevel(catId, diff),
                question: p.question,
                solutionSteps: p.solutionSteps,
                answer: p.answer,
                visualizationType: p.visualizationType,
                vizData: p.vizData,
                showSolution: false,
                hasScratchpad: hasScratchpad
            });
        }
    });

    // 混入自定义题目
    const customs = getCustomProblemsForCategory(catId);
    customs.forEach(p => {
        if (difficultyFilter === 'all' || p.difficulty === difficultyFilter) {
            results.push(p);
        }
    });

    return results;
}

function refreshAllProblems(difficultyFilter) {
    const all = {};
    CATEGORIES.forEach(cat => {
        all[cat.id] = generateProblemsForCategory(cat.id, difficultyFilter);
    });
    return all;
}
