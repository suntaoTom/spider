/**
 * @description 顶栏容器，固定 46px，三区布局含全部操作按钮
 * @module features/topbar/components/TopBar
 * @dependencies useWorkspaceStore, useDrawerStore, useShellStore, useNotificationStore, PRDSelector
 * @prd docs/prds/claude-workflow-kanban.md#顶部操作栏
 * @task docs/tasks/tasks-claude-workflow-kanban-2026-05-02.json#T011
 * @design docs/designs/claude-workflow-kanban/Workflow Kanban.html (.topbar .brand .path .chip .btn .btn.primary)
 * @rules
 *   - TopBar 固定高度 46px，吸顶，z-index: 40，不随看板横向滚动
 *   - padding-left 64px（Activity Bar 48px + 留白 16px），为侧边栏留出空间
 *   - 左区：λ logo（20×20px，绿→青 135° 渐变）+ 品牌文字 + 路径副文字（灰色无边框）+ PRD 选择器
 *   - 统计区（margin-left: auto 右推）：mono 文本「X cmds · Y tasks · Z docs」+ running chip（有 running 时才显示）
 *   - 右区按钮均为文字按钮（padding: 5px 11px）：Rules（含● 指示点）/ Docs / 🔔 / ⌘K / >_ Shell / ↺ Reset / ▶ Run pipeline
 *   - Rules 按钮：● 绿色（无违规）/ 红色（有违规），违规数内联展示「(N)」
 *   - 🔔 未读数为 0 时不显示徽章
 *   - Reset 点击：关闭工作区，返回 empty 状态，保留最近记录
 *   - 工作区未加载时：统计区隐藏，右区操作按钮全部禁用
 */

import styles from './TopBar.module.css';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useDrawerStore } from '@/stores/useLayoutStore';
import { useShellStore } from '@/features/shell/stores/useShellStore';
import { useNotificationStore, selectUnreadCount } from '@/features/notifications/stores/useNotificationStore';
import { PRDSelector } from './PRDSelector';

function shortPath(full: string): string {
  const parts = full.replace(/\\/g, '/').split('/').filter(Boolean);
  if (parts.length <= 2) return full;
  return `…/${parts.slice(-2).join('/')}`;
}

export function TopBar() {
  const { workspace, phase, reset: closeWorkspace } = useWorkspaceStore();
  const { openDrawer } = useDrawerStore();
  const { toggle: toggleShell } = useShellStore();
  const { toggleDrawer: toggleNotifDrawer } = useNotificationStore();
  const unreadCount = useNotificationStore(selectUnreadCount);

  const isLoaded = phase === 'ready' && workspace != null;
  const rootPath    = workspace?.rootPath ?? '';
  const cmds        = workspace?.commands ?? [];
  const totalTasks  = workspace?.tasks.reduce((acc, m) => acc + m.tasks.length, 0) ?? 0;
  const bugs        = workspace?.bugReports.length ?? 0;
  const runningCards = 0; // TODO: from useKanbanStore

  function handleReset() {
    if (window.confirm('关闭当前工作区并返回欢迎页？')) {
      closeWorkspace();
    }
  }

  function handleRunPipeline() {
    if (window.confirm('确认触发完整流水线执行？')) {
      // TODO: implement pipeline run
    }
  }

  return (
    <header className={styles.topbar}>
      {/* ── 品牌区 ──────────────────────────────────────────────────────── */}
      <div className={styles.brand}>
        <span className={styles.logo}>λ</span>
        <span className={styles.brandName}>CLAUDE CODE WORKFLOW</span>
        {isLoaded && rootPath && (
          <span className={styles.brandSub} title={rootPath}>
            / {shortPath(rootPath)}
          </span>
        )}
      </div>

      <PRDSelector />

      {/* ── 统计区（margin-left: auto 推到右侧）────────────────────────── */}
      {isLoaded && (
        <div className={styles.statsArea}>
          <span className={styles.statsText}>
            <b>{cmds.length}</b> cmds · <b>{totalTasks}</b> tasks · <b>{workspace?.staticDocs.length ?? 0}</b> docs
          </span>
          {runningCards > 0 && (
            <span className={styles.runningChip}>
              <span className={styles.runDot}>●</span>
              {runningCards} running
            </span>
          )}
        </div>
      )}

      {/* ── 右区按钮 ─────────────────────────────────────────────────────── */}

      {/* Rules */}
      <button
        className={styles.tbarBtn}
        title="规则抽屉"
        disabled={!isLoaded}
        onClick={() => openDrawer('rules')}
      >
        <span style={{ color: bugs > 0 ? 'var(--red)' : 'var(--green)' }}>●</span>
        Rules
        {bugs > 0 && isLoaded && (
          <span style={{ color: 'var(--red)' }}>({bugs > 99 ? '99+' : bugs})</span>
        )}
      </button>

      {/* Docs */}
      <button
        className={styles.tbarBtn}
        title="文档浏览器"
        disabled={!isLoaded}
        onClick={() => openDrawer('docs')}
      >
        <span>📖</span> Docs
      </button>

      {/* Bell */}
      <button
        className={`${styles.tbarBtn} ${styles.badgeBtn}`}
        title="通知"
        disabled={!isLoaded}
        onClick={toggleNotifDrawer}
      >
        🔔
        {unreadCount > 0 && isLoaded && (
          <span className={styles.btnBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* ⌘K */}
      <button
        className={styles.tbarBtn}
        title="命令面板 (⌘K)"
        disabled={!isLoaded}
        onClick={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
        }}
      >
        ⌘K
      </button>

      {/* Shell */}
      <button
        className={styles.tbarBtn}
        title="全局终端 (⌘`)"
        disabled={!isLoaded}
        onClick={toggleShell}
      >
        &gt;_ Shell
      </button>

      {/* Reset */}
      <button
        className={styles.tbarBtn}
        title="关闭工作区"
        disabled={!isLoaded}
        onClick={handleReset}
      >
        ↺ Reset
      </button>

      {/* Run pipeline */}
      <button
        className={styles.runBtn}
        disabled={!isLoaded}
        onClick={handleRunPipeline}
      >
        ▶ Run pipeline
      </button>
    </header>
  );
}
