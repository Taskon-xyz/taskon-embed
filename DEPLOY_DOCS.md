# 部署文档到 GitHub Pages

本指南介绍如何将 VitePress 文档部署到 GitHub Pages。

## 部署步骤

### 1. 推送代码到 GitHub

确保你的代码已经推送到 GitHub 仓库的 `main` 分支：

```bash
git add .
git commit -m "docs: update documentation"
git push origin main
```

### 2. 启用 GitHub Pages

1. 打开你的 GitHub 仓库
2. 点击 **Settings** 选项卡
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**

### 3. 配置仓库名称

如果你的仓库名称不是 `embed-sdk`，需要更新 VitePress 配置：

编辑 `docs/.vitepress/config.ts`：

```typescript
export default defineConfig({
  // ... 其他配置
  base: "/你的仓库名/", // 替换为实际的仓库名
  // ... 其他配置
});
```

### 4. 自动部署

推送到 `main` 分支后，GitHub Actions 会自动：

1. 安装依赖
2. 构建 VitePress 文档
3. 部署到 GitHub Pages

你可以在 **Actions** 选项卡中查看部署状态。

### 5. 访问文档

部署成功后，你可以通过以下 URL 访问文档：

```
https://你的用户名.github.io/仓库名/
```

例如：

```
https://taskon-xyz.github.io/taskon-embed/
```

## 本地开发

在本地开发和预览文档：

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run docs:dev

# 构建文档
pnpm run docs:build

# 预览构建结果
pnpm run docs:preview
```

## 自定义域名

如果你想使用自定义域名：

1. 在 `docs/.vitepress/public/` 目录下创建 `CNAME` 文件
2. 在文件中写入你的域名，例如：`docs.yourdomain.com`
3. 在你的域名提供商处设置 CNAME 记录指向 `你的用户名.github.io`

## 注意事项

1. **仓库必须是公开的**，或者你有 GitHub Pro 账户
2. **分支保护**：确保 `main` 分支允许推送
3. **构建时间**：首次部署可能需要几分钟
4. **缓存**：更新后可能需要等待几分钟才能看到变化

## 故障排除

### 部署失败

1. 检查 Actions 选项卡中的错误日志
2. 确保 `package.json` 中有正确的构建脚本
3. 验证 VitePress 配置文件语法正确

### 页面显示 404

1. 检查 `base` 配置是否正确
2. 确保文件路径大小写正确
3. 验证 GitHub Pages 设置中的源选择

### 样式或资源加载失败

1. 检查 `base` 配置
2. 确保静态资源路径正确
3. 检查构建输出目录

## 工作流配置

GitHub Actions 工作流位于 `.github/workflows/deploy-docs.yml`，包含：

- **构建任务**：安装依赖、构建文档、上传构建产物
- **部署任务**：部署到 GitHub Pages（仅在 main 分支）
- **权限设置**：允许读取内容和写入 Pages

如需自定义构建流程，可以修改这个工作流文件。
