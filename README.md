# Image Flow

Obsidian 图片管理插件。拖拽移动图片链接、粘贴/拖入时自动转换格式、图库浏览与管理、单张图片下载到本地。插件可独立使用，不需要安装其它图片插件。

## 功能

- **拖拽移动图片**：在笔记中拖拽图片到任意位置，自动移动对应的 Markdown 链接
- **自动导入与转换**：粘贴或拖入图片时，自动转换格式（WebP / JPEG / PNG，支持 HEIC / HEIF 转换）并保存到指定文件夹
- **图库浏览**：侧边栏图库面板，按文件夹筛选、搜索、排序
- **下载到本地**：图库中每张图片可一键下载到本地磁盘，弹出系统「另存为」对话框，可修改文件名与存储位置
- **引用检测**：自动检测图片在哪些笔记中被引用
- **批量操作**：多选图片后批量删除或移动

## 安装

### 手动安装

1. 下载最新 Release 中的 `main.js`、`manifest.json`、`styles.css`
2. 放入 vault 的 `.obsidian/plugins/obsidian-image-flow/` 目录
3. 在 Obsidian 设置中启用插件

### 通过 BRAT

添加 `jiujiu1771/obsidian-image-flow` 到 BRAT 插件。

也可以填写完整地址：

```text
https://github.com/jiujiu1771/obsidian-image-flow
```

## 使用

- **图库**：点击左侧丝带图标或使用命令面板「打开图片图库」
- **拖拽移动**：在预览模式或实时预览中，直接拖拽图片到目标位置
- **格式转换**：粘贴或拖入图片时自动处理，设置中可选择目标格式和压缩质量；HEIC / HEIF 可转换为 JPEG / PNG / WebP
- **复制链接**：选中图片后使用命令「复制选中图片嵌入链接」，或在图库中点击复制按钮
- **下载图片**：在图库中点击图片卡片上的下载按钮，弹出系统「另存为」对话框，可修改文件名与保存位置

## 更新日志

### v0.2.5

- **图库单张图片操作：「移动」改为「下载到本地」**
  - 图库卡片上的移动按钮（`folder-tree` 图标）替换为下载按钮（`download` 图标）。点击后调用 Electron `remote.dialog.showSaveDialog` 弹出系统「另存为」对话框，文件名与存储位置都可修改；默认路径为系统「下载」文件夹 + 原文件名，并按图片扩展名预设类型筛选。
  - 实现：`vault.readBinary` 读取字节后由 `fs.writeFileSync` 直接写入 Vault 之外的本地磁盘，**不改动 Vault 内任何文件**；用户点取消则不做任何操作。
  - 兜底：拿不到 Electron 对话框（例如移动端）时回退为浏览器 Blob 下载；读取或写入失败弹出错误提示，不静默失败。
  - 注意：顶部多选状态栏的「移动选中」批量操作**保持不变**。
  - `manifest.json` 的描述同步更新，加入「下载到本地」。

### v0.2.4

- **修复：Obsidian 1.13+ 原生图片放大 / 编辑功能失效**
  - 根因：v0.2.2/v0.2.3 的 `onCapturePointerDown` 在 document capture 阶段对任何落在图片上的 pointerdown 立即 `startPointerDrag` 并 `preventDefault + stopPropagation`，Obsidian 1.13+ 原生图片 widget 收不到 pointerdown，导致放大镜按钮 click 不触发、widget 选中（编辑态）不进入。
  - 修复：引入 4px 拖拽阈值机制——pointerdown 时只进入 `pendingDrag` 态，**不阻止默认行为**，让原生点击/选中/放大正常；仅当指针移动超过 4px 才升级为真正拖拽（`startPointerDrag` 抢回 pointer capture + preventDefault）。缩放手柄在 pointerdown 阶段直接放行。
  - 同步移除 `startPointerDrag` 内的 `evt.button` / `isResizeGesture` 检查（升级时 evt 是 pointermove，button=-1 会误拒；isResizeGesture 已在 pointerdown 阶段用准确坐标检查过）。
  - 构造函数加 `pendingDrag / boundPendingMove / boundPendingUp` 字段，`unload` 调 `cancelPendingDrag` 清理。

### v0.2.3

- **修复：点击图片但未移动后，再次拖拽失效**
  - 根因：`onPointerUp` 在「按下但未移动」分支调用 `cleanupPointerDrag(false)` 不清理 `this.dragState`，只有「已移动」分支的 `moveDraggedImage` 内部会清。v0.2.2 删除编辑按钮后，用户更易单纯点击图片（而非拖动），导致 `dragState` 残留，下一次 pointerdown 被 `onCapturePointerDown` 首行 `if (... || this.dragState) return;` 拦截，表现为「拖不动」。
  - 修复：未移动分支改调 `cleanupPointerDrag(true)` 完整清理 `dragState`；已移动分支维持原逻辑（`cleanupPointerDrag(false)` 保留 state 给 `moveDraggedImage` 用）。

### v0.2.2

- **移除：图片右上角「编辑图片链接」按钮**
  - 该按钮在 Obsidian 1.13+ 与原生图片 widget 的悬浮操作按钮（放大镜）位置重叠，且点击后行为与原生点击图片进入编辑态重复，因此移除插件版按钮，保留 Obsidian 原生能力。
  - 同步清理 `main.js` 中 `ensureEditButton` / `revealImageLinkInEditor` / `activateEditButton` 函数及相关 DOM 守卫，以及 `styles.css` 中 `.iflow-edit-source-button` / `.iflow-edit-active` 样式。

### v0.2.1

- **修复：Obsidian 1.13.x 下「自由拖拽移动图片」失效**
  - 根因：1.13 起图片改为 CodeMirror widget，`<img>` 被包进 `.cm-widgetBuffer`；原代码把 `.cm-widgetBuffer` 误判为缩放手柄，导致每次按下图片都被当成缩放手势，拖拽在启动前就被拦截，表现为「无法拖动」。
  - 坐标解析修复：CodeMirror 6 的 `posAtCoords` 返回的是 `{from,to}` 偏移量而非 `{line,ch}`，旧代码误按 `{line,ch}` 读取导致落点 `setCursor` 失败；改为用 `editor.offsetToPos(offset)` 转换。
  - 拖拽入口兼容 1.13 的 widget DOM：新增 `findImageEmbedFromTarget`，除 `.image-embed/.internal-embed` 外也接纳原生 `<img>` 及其 `.cm-image-widget` 容器，并在解析不到 `src` 时回退到 `img.alt`（即 `![[名称]]`）定位图片。
  - 编辑按钮在 embed 为 `<img>` 时挂到父节点（`<img>` 不能包含子元素）。

## 致谢

本项目基于以下开源项目构建：

- [albus-imagine](https://github.com/AlbusGuo/albus-imagine) (AGPL-3.0) — 图片管理器核心
- [obsidian-image-converter](https://github.com/xryul/obsidian-image-converter) (MIT) — 图片格式转换

## 许可证

[AGPL-3.0](LICENSE)
