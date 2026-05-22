# Methodology Adherence Report — Spider

> 本文档说明 [claude-code-workflow](https://github.com/Caspian-Sun/claude-code-workflow) 方法论在本项目的执行情况, 以及一个**特别的元意义**。
>
> 报告区间: 2026-04-24 (Initial) → 2026-05-12 (本次冻结)
> 状态: 早期开发中 (P0 看板雏形完成, P1 功能补完中)

---

## 1. 项目背景

**Spider** 是一款 Tauri 2 桌面工具, 把任何 `claude-code-workflow` 仓库的 `.claude/` + `docs/` **可视化成可操作的看板**。

| 项 | 值 |
|---|---|
| 技术栈 | Tauri 2 + Rust 后端 + React 前端 |
| 目标平台 | macOS · Windows · Linux 桌面端 |
| 业务领域 | AI 工作流可视化 / 开发者工具 |
| 项目周期 | 2026-04-24 启动 → 进行中 |
| 总 commit 数 | 16 |

### 业务核心 (摘自 PRD)

> Claude Code Workflow 看板应用是一款 Tauri 2.x 桌面应用, 将 `.claude/commands/` 定义的 AI Agent 工作流可视化为 DAG 看板。用户选择一个工程目录 (workspace) 后, 应用自动扫描并呈现 **8 个流水线步骤** (prd → plan → code → test → review → build → deploy → release) 和 **2 个辅助步骤** (fix / meta-audit), 每个步骤对应一条泳道, 泳道内的 Agent 卡片承载真实的 PTY 终端会话。

---

## 2. 元意义: 一个用方法论造出的、用来可视化方法论的工具

这是 Spider 区别于一般"AI 工具"项目的核心特征:

```
   claude-code-workflow (方法论)
            │
            │ 我用这套方法论来开发
            ▼
        Spider (产品)
            │
            │ 这个产品的功能就是
            ▼
   可视化 claude-code-workflow
```

**这是一个 dogfooding (吃自家狗粮) + 自指 (self-referential) 的双重案例:**

- **dogfooding**: 我用方法论 A 造产品 B, 验证方法论 A 是否真好用
- **自指**: 产品 B 的功能就是把方法论 A 可视化, 用 B 来管理方法论 A 自己

这种自指结构在工程界很少见, 因为它对工具和方法论的"成熟度"都有要求 —— 工具能稳定运行说明方法论稳, 方法论能驱动出工具说明方法论实。**两者互证**。

---

## 3. 八步法执行情况

| 步骤 | 是否执行 | 产物 |
|------|---------|------|
| `/prd` | ✅ | `docs/prds/claude-workflow-kanban.md` (13 功能点 + 6 milestone) |
| `/prd-check` | ✅ | `[待填写]` 锚点机制就绪 |
| `/plan` | ✅ | 2 个迭代版本的 task manifest (`2026-04-28` → `2026-05-02`) |
| `/code` | ✅ | 16 commits, 跨 React + Rust 双栈实现 |
| `/test` | 🔶 部分 | Vitest + cargo test 框架就绪 |
| `/review` | ✅ | code-reviewer subagent 介入过 |
| `/build` | ✅ | Tauri 二进制构建命令 (`pnpm tauri:build`) |
| `/deploy` | 🔶 | 桌面端分发未上线 |
| `/release` | 🔶 | 未发版 |
| `/meta-audit` | ⏳ | 未触发 |

**当前阶段评价**: 八步法的前 7 步全部跑通, 验证了**方法论可以从 UmiJS 顺利迁移到 Tauri + Rust 双栈**。

---

## 4. 跨栈迁移的具体证据

Spider 是把方法论从 **TypeScript 单语言** 拓展到 **TypeScript + Rust 双语言** 的关键案例:

### 4.1 文件级注释规范的跨语言适配

| 维度 | TypeScript 端 | Rust 端 |
|------|--------------|--------|
| 注释语法 | JSDoc `/** @prd ... */` | Rust doc `/// @prd ...` |
| `@rules` 写入位置 | 组件 / hook 顶部 | mod / fn 顶部 |
| 追溯链不变 | ✅ | ✅ |

**结论**: `.claude/rules/file-docs.md` 不需要重写, **只需在 ADAPTING.md 补 Rust 语法适配**。

### 4.2 IPC 边界 = 新的"硬编码红线"

Spider 引入了 Tauri IPC, 这暴露出方法论"P0 禁硬编码"的一个新场景:

```
❌ 禁止: invoke('get-tasks')          // 字符串字面量
✅ 正确: invoke(IPC.Cmd.GET_TASKS)    // 常量
```

这条规则被沉淀到 `.claude/rules/no-hardcode.md` 的本项目特化版本, **可回流主仓库的 ADAPTING.md**。

### 4.3 模块组织 (frontend + backend 双栈)

```
workspace/
├── src/                     ← React 前端 (15 个 feature 模块)
│   └── features/
│       ├── kanban/           ← 看板主视图
│       ├── command-palette/  ← 命令面板
│       ├── prd/ retro/ rules/ docs/  ← 各类目录可视化
│       └── terminal/ shell/  ← PTY 终端
└── src-tauri/src/           ← Rust 后端
    ├── commands/            ← Tauri IPC 命令处理
    ├── pty/                 ← PTY 会话管理
    ├── scan/                ← 工作区扫描
    ├── watcher/             ← 文件系统监听
    └── models/              ← 数据模型
```

**双栈下方法论依然成立**: 业务规则锚点在 PRD, 实现可以横跨 TS/Rust, `@prd / @task` 链条不断。

---

## 5. 这个项目对方法论本身的反向价值

### 5.1 它"看见"了方法论的状态

绝大多数 AI 工作流工具是"AI 输出 → 终端打印 → 走人", **方法论本身没有可视化**。Spider 让方法论第一次有了"控制台":

- 八步法每一步是泳道
- 每个 PRD / task / bug / retrospective 是卡片
- 每个 AI 调用是 PTY 会话, 可暂停可恢复
- 跨会话的进度状态变成可观察的图

**这不仅是工具, 更是方法论的可视化教材**。任何想理解 claude-code-workflow 的人, 打开 Spider 就懂了, 不用看 docs。

### 5.2 它把"档案沉淀"从被动变主动

主方法论的 `docs/retrospectives/` / `tasks.json` 是"AI 写到磁盘上, 人偶尔翻一下"。Spider 把这些档案做成实时看板, **档案变成了首屏信息**, 自然就会被消费。

### 5.3 它暴露了方法论的"探索性场景"短板

Spider 16 commits 之后节奏放慢, 反映出**当业务本身处于"边设计边实现"的探索期, 八步法的前置 PRD 成本相对偏高**。这是一个真实的边界案例, 应该写进主仓库的 "When NOT to Use This Framework" 章节。

---

## 6. 一句话总结

> **Spider = 用方法论造的、可视化方法论的、桌面端 AI 工作流控制台**
>
> 它既是方法论的"产物", 又是方法论的"镜子" —— 在桌面端 Tauri + Rust 这个完全不同的栈上, **方法论的核心机制 (八步法 / @rules 链 / 五件套) 全部成立**。

---

## 相关文档

- [PRD: claude-workflow-kanban.md](./prds/claude-workflow-kanban.md)
- [任务清单 v1](./tasks/tasks-claude-workflow-kanban-2026-04-28.json) · [任务清单 v2](./tasks/tasks-claude-workflow-kanban-2026-05-02.json)
- [设计稿](./designs/claude-workflow-kanban/)
- [跨工种适配清单](./ADAPTING.md)
- 方法论原仓库: [claude-code-workflow](https://github.com/Caspian-Sun/claude-code-workflow)
