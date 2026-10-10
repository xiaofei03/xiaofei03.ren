# 孙烁飞的个人桌面

Elliot Hu 的个人桌面与拼贴风格是视觉参考。本项目是重新实现的中文个人网站；未使用或声称拥有其私人源码。

## 访客内容

- 关于我、求学、荣誉、实习、研究、AI 实验室、志愿实践与学生工作。
- AI 实验室展示六个已实现项目：文献桥、研递、慧眼量化、影记、脉见 AI、豆格工作室；支持分类、图文详情与 GitHub 来源链接。
- 43 份原始材料预览：32 份获奖及荣誉证书、6 份志愿服务证明或感谢信、3 份聘书、2 项授权专利；支持分类、放大、双页证书翻页和原尺寸查看。
- 可关闭、收起、放大的桌面窗口；电脑端支持拖动标题栏。
- 独立随笔列表与文章页，分类筛选、搜索与基础 Markdown 排版。
- 首页中文名字使用 React Bits Tech Text：虚线轮廓、选框、粒子、拖动回弹和自动扫过；沿用中文宋体与 Sofian Sun 英文签名。触屏与减少动态效果模式保持稳定文字，页面隐藏或文字离开视口时暂停。
- 支持手机布局与减少动态效果设置。

## 写作工作室

入口 `/studio`。使用站点拥有者的 ChatGPT 账号登录。上传 Word `.docx`、PDF、Markdown 或 TXT，最大 10 MB。Word/文本文件导入可编辑正文，PDF 保留原稿，可补充正文或摘要。保存草稿或发布；打开已有文章可编辑，也可把已发布内容改为草稿。

正文和文章状态保存在 D1，上传原件保存在 R2。写入与草稿读取需要拥有者账号，原稿继承文章权限。原件替换时保留已有对象，不提供永久删除操作。平台运行变量 `OWNER_EMAIL` 必须设置为站点主人登录账号的邮箱；托管值由 Sites 管理。

## 本地运行

需要 Node.js 22.13 或更高版本。

1. `npm ci`
2. 将 `.env.example` 复制为 `.env`，以及 `.dev.vars`（本地模拟拥有者为 `seedy@sites.test`）。
3. `npm run build`
4. 仅首次运行时执行本地迁移：

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_living_purifiers.sql
```

5. `npm run dev`，访问终端显示的本机地址。
6. 访问 `/signin-with-chatgpt?return_to=/studio` 模拟登录。本地状态位于 `.wrangler/`，不参与部署。

## 修改内容

- `app/content.ts`：教育、实习、研究和实践。
- `app/project-data.ts`：六个项目的介绍、实现范围、技术栈与来源。
- `app/project-lab.tsx`、`app/project-lab.css`：项目列表、分类与详情。
- `public/assets/projects/`：远端真实品牌资产及按源码整理的工作流配图；豆格配图使用仓库已有原图及算法结果。
- `app/awards.json`：证书条目，预览在 `public/assets/certificates/`。
- `app/seed-posts.ts`：初始文章；工作室保存的版本优先。
- `app/desktop.tsx`：桌面布局与窗口交互。
- `app/globals.css`：视觉样式与响应式排版。

## 内容来源和样例

教育、实习、研究和学生工作来自用户最新版简历；补充志愿经历来自用户的证书及实践证明。没有添加学术发表或求职意向。北控水务杯按证书原文写作“银奖”。

**三篇初始随笔和部分性格文案是初版样例。公开展示前请替换或确认。** 原三个 AI 构想已由真实 GitHub 项目替换。项目功能基于 2026-10-10 的 GitHub 默认分支源码核对；工程规模与功能存在不代表个人原创工时或线上效果。脉见 AI 基于 TweetAI-Monitor / AI-News 二次开发；豆格基于 Zippland/perler-beads 扩展，保留来源和许可说明。慧眼量化为自动化系统，未宣称 LLM 分析或交易收益。

电脑与笔记本为原创生成的装饰图像。身份证信息、献血记录原件、完整成绩单、学籍报告与实践登记表未加入网站。原始简历、证书没有修改。

站点默认仅拥有者可访问。公开发布与绑定个人域名可以在确认内容后另行设置。

## 检查

`npx tsc --noEmit --incremental false`，`npm run build`。已在真实浏览器检查桌面、手机、窗口、荣誉、随笔和编辑器；保存与文件字节读取、草稿隔离和写入权限有实际验证。WebMCP 工具只在支持 `document.modelContext` 的浏览器注册；当前环境没有该原生接口，无法验证原生注册。

## 文字组件来源

`components/TechText.tsx` 基于 [React Bits Tech Text](https://reactbits.dev/text-animations/tech-text)，上游提交 `d86fccbd477786f94ca7eb891fbe0ec039d3cd3b`。不新增运行依赖；本站增加中文自适应、语义标题与首帧文字回退、触屏滚动和动态效果偏好适配。许可证与版权声明保留在 `licenses/react-bits-LICENSE.md`（MIT + Commons Clause）。
