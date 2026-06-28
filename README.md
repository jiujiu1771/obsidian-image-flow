# Image Flow

Obsidian 图片管理插件。拖拽移动图片链接、粘贴/拖入时自动转换格式、图库浏览与管理。插件可独立使用，不需要安装其它图片插件。

## 功能

- **拖拽移动图片**：在笔记中拖拽图片到任意位置，自动移动对应的 Markdown 链接
- **自动导入与转换**：粘贴或拖入图片时，自动转换格式（WebP / JPEG / PNG）并保存到指定文件夹
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
- **格式转换**：粘贴或拖入图片时自动处理，设置中可选择目标格式和压缩质量
- **复制链接**：选中图片后使用命令「复制选中图片嵌入链接」，或在图库中点击复制按钮

## 致谢

本项目基于以下开源项目构建：

- [albus-imagine](https://github.com/AlbusGuo/albus-imagine) (AGPL-3.0) — 图片管理器核心
- [obsidian-image-converter](https://github.com/xryul/obsidian-image-converter) (MIT) — 图片格式转换

## 许可证

[AGPL-3.0](LICENSE)
