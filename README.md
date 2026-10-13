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

包含事件捕手、与我相关筛选、事件详情、闪电猫盯盘确认和我的追踪。已移除重点关注、政策事件行业关联整行、回测收益，以及正向／负向／高影响标签；普通个股报价保留。

行情和 AI 分析是原型样例。自选、持仓和追踪保存在当前域名的浏览器 localStorage 中；迁移域名不会自动同步旧网址的本地数据。

第三方资源的许可文件保留在 `LICENSE-lucide` 与 `vendor/LICENSE-SheetJS`。
