# Image Flow

Obsidian 图片管理插件。拖拽移动图片链接、粘贴/拖入时自动转换格式、图库浏览与管理。插件可独立使用，不需要安装其它图片插件。

## 功能

- **拖拽移动图片**：在笔记中拖拽图片到任意位置，自动移动对应的 Markdown 链接
- **自动导入与转换**：粘贴或拖入图片时，自动转换格式（WebP / JPEG / PNG，支持 HEIC / HEIF 转换）并保存到指定文件夹
- **图库浏览**：侧边栏图库面板，按文件夹筛选、搜索、排序
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

## 更新日志

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
