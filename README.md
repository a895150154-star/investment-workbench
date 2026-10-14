# 个人投研工作台 · 交互原型

线上工作台：https://a895150154-star.github.io/investment-workbench/#/overview

这是不依赖 ChatGPT Sites 的静态网站源码。HTML、CSS、JavaScript 都可以直接修改，无需构建。

## 本地运行

```sh
python3 -m http.server 5173 --bind 127.0.0.1
```

打开 http://127.0.0.1:5173/#/overview 。

## 修改与发布

1. 克隆本仓库，在修改前执行 `git pull --ff-only`。
2. 编辑根目录中的 HTML、CSS 和 JavaScript 文件；第三方依赖保留在 `vendor/`。
3. 本地检查页面及相关交互，为修改过的 JavaScript 执行 `node --check 文件名.js`。
4. 提交并推送到 `main`。GitHub Pages 从 `main` 的根目录自动部署。
5. 在仓库 Actions 中确认部署成功，再核对线上页面。

公开仓库允许任何 Agent 克隆和读取。直接推送需要仓库所有者账号或协作者写权限；其他账号可以 Fork 并提交 Pull Request。

## 当前版本

2026-10-14：总览保留我的追踪、个人简报、大盘指数、事件捕手、板块资金和市场概览。板块资金共用晚报功能，进入板块行情、成分股视图与短线异动；ETF机会支持合并分类、期限/因子筛选、指数行情和示例关注星级。股票工作台统一管理自选、持仓、新公告/新资讯追踪与历史提醒。

行情、分析、星级、板块成员及异动主要为固定样例或模拟数据，尚未接入在线AI、实时行情、公司Skill或后台监控。自选、持仓、布局和偏好沿用本机浏览器保存；当前追踪任务及提醒已读状态仍为内存演示，刷新恢复初始样例。迁移域名不会自动同步旧网址的本地数据。

验证：页面资源齐全，所有根目录JavaScript语法通过，17项交互检查通过；ETF与板块模块经桌面及390px浏览器验证。

第三方资源的许可文件保留在 `LICENSE-lucide` 与 `vendor/LICENSE-SheetJS`。
