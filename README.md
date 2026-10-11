# 日光之间

个人网站完整源码，仓库：[xiaofei03/xiaofei03.ren](https://github.com/xiaofei03/xiaofei03.ren)。包含前台、动画、七个个人板块、AI 实验室、图文写作后台、SQLite 存储、静态图片、依赖锁文件及服务器部署配置。

**2026-10-11：域名备案仍在审核。** `xiaofei03.ren` 的正式 HTTPS 配置和候选版本已完成准备与隔离验证，尚未启用域名或签发正式公网证书。运行与部署步骤见 [部署说明](deploy/README.md)。数据库、正式文章附件、初始化密钥、私钥和实际 `.env` 不提交到本仓库；新安装会生成自己的数据与管理员初始化密钥。

2026-10-11 更新：新增公网 IP 阅读预览 `http://49.234.27.200/`，手机无需本机 SSH 隧道。IP 专用 Nginx 配置见 `deploy/sunlit-ip-preview.conf`，仅允许公开阅读；登录、写作、上传和初始化仍通过 SSH 私有入口。域名与 HTTPS 尚未上线。

Elliot Hu 的个人桌面与拼贴风格是视觉参考。本项目是重新实现的中文个人网站；未使用或声称拥有其私人源码。

## 访客内容

- 关于我、求学、荣誉、实习、研究、AI 实验室、志愿实践与学生工作。
- AI 实验室展示六个已实现项目：文献桥、研递、慧眼量化、影记、脉见 AI、豆格工作室；支持分类、图文详情与 GitHub 来源链接。
- 43 份原始材料预览：32 份获奖及荣誉证书、6 份志愿服务证明或感谢信、3 份聘书、2 项授权专利；支持分类、放大、双页证书翻页和原尺寸查看。
- 各个人板块为独立全屏页面：`/explore/about`、`education`、`awards`、`experience`、`research`、`projects`、`practice`；随笔和文章使用 `/notes`。支持直接访问、首页快捷入口与浏览器前进/后退，兼容旧首页板块 hash。
- 左侧只有半藏在屏幕边缘的玻璃圆球图标，悬停或键盘聚焦时滑出并显示名称；点击切换分类，当前板块有轮廓提示。左上角箭头回到首页；手机端保留边缘入口和至少 44 px 宽的点击区域。
- 独立随笔列表与文章页，分类筛选、搜索、富文本阅读与 Markdown 兼容。
- 首页中文名字使用 React Bits Tech Text：虚线轮廓、选框、粒子、拖动回弹和自动扫过；沿用中文宋体与 Sofian Sun 英文签名。触屏与减少动态效果模式保持稳定文字，页面隐藏或文字离开视口时暂停。
- 首页天空有缓慢飘云和轻微景深跟随；切到其他页面、页面隐藏或首页离开视口时暂停，减少动态效果时显示静态云。
- 全站鼠标流体光迹：蓝、紫、青与暖金渐变，会随移动翻卷，点击有小幅扩散；公共布局覆盖全屏个人板块、AI 实验室、独立随笔和文章。管理登录与工作室停用光迹，保证表单和正文稳定。保留原生指针和点击穿透，触屏与减少动态效果关闭；空闲、页面隐藏、滚动及编辑文字时清空并停止渲染。
- 首页侧脸人像从下方约 3 秒缓慢升起；随笔区域正面人像和纸签保持原位，在进入视口后约 2 秒缓慢淡入。首屏升起由 CSS 直接启动，断点变化不会重复进场；头像由 GSAP 在进入视口后淡入一次，GSAP 作用域在切页和断点变化时清理，减少动态效果时直接显示静态图像。
- 支持手机布局与减少动态效果设置。

## 写作工作室（独立服务器版本）

首页右上角与随笔页均有“管理随笔”入口。`/admin/login` 使用独立管理员账号，`/studio` 为图文写作空间；访客可以阅读公开文章，不能注册、编辑或上传。首次使用通过 `/admin/setup` 与本机一次性初始化密钥创建账号，不依赖 ChatGPT 登录或旧平台身份请求头。

编辑器支持标题、加粗、斜体、列表、引用、代码、链接、正文图片、图片说明、替代文字、居中小图、封面与预览。图片可选择、粘贴或拖入。Word `.docx` 通过 Mammoth 导入正文、标题、格式和插图；Markdown/TXT 导入正文；PDF 保留原稿，正文可另外补充。单个图片或原稿最大 10 MB。Word 的复杂表格等布局需要检查后调整。

正文以富文本 JSON 保存，SQLite 保存文章与独立的公开版本；图片和原稿保存在本机数据目录。停笔 2 秒自动保存草稿。修改已发布文章时，访客仍看到上一次发布的版本，点击“更新发布”才更新公开版本。“收回为草稿”停止公开文章及附件，继续保存数据。版本冲突会阻止覆盖，可先导出当前正文。正文导出 JSON 包含图片链接；完整站点备份还需要数据库和 uploads 目录。

密码以 scrypt 哈希保存，会话采用 HttpOnly/SameSite cookie、12 小时有效期、持久化限流与 CSRF/Origin 验证。不提供公开注册。数据目录应保留在网站静态目录外；不要将它提交到 Git。

当前线上 Sites 版本保持原样。独立版本已部署到腾讯云，网站进程使用回环地址，SSH 用于私下管理；另通过 Nginx 提供 IP 公开阅读预览。自动启动、异常重启和每日完整快照已验证。域名与 HTTPS 属于第三步。服务器操作见 `deploy/`，使用说明见项目交付目录。

## 本地运行

需要 Node.js 22.13 或更高版本（验证环境：24.16.0）。

1. `npm ci`
2. `npm run dev`，打开 `http://127.0.0.1:5173/`。
3. `npm run admin:setup` 会显示初始化密钥文件的位置，不打印密钥。
4. 在本机打开 `.local-data/first-admin-key`，复制到 `/admin/setup`，自行设置账号和至少 12 位的密码。
5. 后续从“管理随笔”或 `/admin/login` 登录即可。账号创建后初始化密钥不再可用。

生产构建：`npm run build`，然后 `npm run start -- --port 5173`。绑定地址默认为本机回环地址；服务器的反向代理与 HTTPS 配置见 [部署说明](deploy/README.md)，域名入口在备案获批后启用。

可选配置见 `.env.example`：`SUNLIT_DATA_DIR` 指定独立数据目录；`SITE_ORIGIN` 用于实际部署时验证完整站点来源；`SUNLIT_ICP_NUMBER` 指定本网站实际获批的完整服务备案号。本地默认无需修改；站点来源设置后必须与访问地址完全一致。

## 旧数据迁移

原始 `.wrangler/` 数据继续保留。本地旧版的 3 篇历史测试草稿、2 个原稿已导出并复制到 `.local-data/`，三篇初始示例也保留。迁移前建立了 SQLite 快照，附件经过 SHA-256 校验。迁移脚本不会覆盖已存在的非示例文章，重复导入会跳过它们。

```sh
node scripts/migrate-legacy.mjs export --state .wrangler/state/v3 --out /新的导出目录
node scripts/migrate-legacy.mjs import --from /导出目录 --data /数据目录 --dry-run
node scripts/migrate-legacy.mjs import --from /导出目录 --data /数据目录
```

来源范围是本机旧版 D1/R2。用户已确认线上没有正式文章；未读取或声称导出托管端数据库。

## 修改内容

- `app/content.ts`：教育、实习、研究和实践。
- `app/project-data.ts`：六个项目的介绍、实现范围、技术栈与来源。
- `app/project-lab.tsx`、`app/project-lab.css`：项目列表、分类与详情。
- `public/assets/projects/`：远端真实品牌资产及按源码整理的工作流配图；豆格配图使用仓库已有原图及算法结果。
- `app/awards.json`：证书条目，预览在 `public/assets/certificates/`。
- `app/seed-posts.ts`：初始文章；工作室保存的版本优先。
- `app/desktop.tsx`：首页导航和旧链接兼容。
- `app/explore/`、`app/section-page.tsx`：全屏板块路由与内容。
- `components/SectionShell.tsx` / `.css`：公共全屏布局、边缘圆球分类导航和返回入口。
- `app/home-scene.tsx` / `.css`：首页拼贴场景与人像出场。
- `app/globals.css`：视觉样式与响应式排版。

## 内容来源和样例

教育、实习、研究和学生工作来自用户最新版简历；补充志愿经历来自用户的证书及实践证明。没有添加学术发表或求职意向。北控水务杯按证书原文写作“银奖”。

**三篇初始随笔和部分性格文案是初版样例。公开展示前请替换或确认。** 原三个 AI 构想已由真实 GitHub 项目替换。项目功能基于 2026-10-10 的 GitHub 默认分支源码核对；工程规模与功能存在不代表个人原创工时或线上效果。脉见 AI 基于 TweetAI-Monitor / AI-News 二次开发；豆格基于 Zippland/perler-beads 扩展，保留来源和许可说明。慧眼量化为自动化系统，未宣称 LLM 分析或交易收益。

电脑与笔记本为原创生成的装饰图像。身份证信息、献血记录原件、完整成绩单、学籍报告与实践登记表未加入网站。原始简历、证书没有修改。

服务器测试版支持 IP 公开阅读，管理员初始化密钥由本机保管，管理功能只通过 SSH 隧道访问。域名、HTTPS 和正式上线留在第三步。

## 检查

`npx tsc --noEmit --incremental false`，`npm run build`。已在真实浏览器检查桌面、手机、全屏分类切换、荣誉、随笔和编辑器；保存与文件字节读取、草稿隔离和写入权限有实际验证。WebMCP 工具只在支持 `document.modelContext` 的浏览器注册；已在浏览器提供的 WebMCP 桥中观察到全屏导航工具，未宣称所有浏览器具备原生支持。

## 文字组件来源

`components/TechText.tsx` 基于 [React Bits Tech Text](https://reactbits.dev/text-animations/tech-text)，上游提交 `d86fccbd477786f94ca7eb891fbe0ec039d3cd3b`。不新增运行依赖；本站增加中文自适应、语义标题与首帧文字回退、触屏滚动和动态效果偏好适配；文字离开视口后立即停止，字体样式在尺寸变化时缓存。许可证与版权声明保留在 `licenses/react-bits-LICENSE.md`（MIT + Commons Clause）。

`components/FluidCursor.tsx` 基于 [React Bits Splash Cursor](https://reactbits.dev/animations/splash-cursor)，已实际阅读上游 `c1c460e6676407bc9eefd951b03941ed1046eaac` 的完整 TypeScript 流体模拟与着色器，并通过 `npx shadcn@latest view @react-bits/SplashCursor-TS-CSS` 核对注册源码（无额外运行依赖）。`PointerAtmosphere.tsx` 在公共布局按设备与动态效果偏好延迟加载。本站增加主题配色、空闲/隐藏/编辑暂停、GPU 分辨率上限、重置与清理，修正上游默认帧缓冲叠绘及尺寸调整时的资源释放。版权和许可同上。候选 Ribbons、Aurora 与最终 Splash Cursor 的源码、注册文件和验收记录保存在项目 `work/sky-motion-2026-10-10/`。

`public/assets/home-v2/sky-cloud.webp` 为本项目使用内置图像工具生成的透明云素材，经尺寸与 WebP 格式优化；原图、完整提示词、来源记录和验收文件保存在项目 `work/sky-motion-2026-10-10/`。

## 图文编辑组件

- [Tiptap React](https://tiptap.dev/docs/editor/getting-started/install/react)：3.31.4，MIT；`immediatelyRender: false` 适配服务端渲染。
- [Tiptap Image](https://tiptap.dev/docs/editor/extensions/nodes/image)：图片扩展增加本站图注和宽度选择。
- [Tiptap Markdown](https://tiptap.dev/docs/editor/markdown/getting-started/installation)：导入 Markdown；上游仍标注 beta，因此富文本 JSON 是保存的主格式。
- [Mammoth](https://github.com/mwilliamson/mammoth.js)：1.13.0，BSD-2-Clause，按需加载，读取 Word 文字与插图。
- [react-markdown](https://github.com/remarkjs/react-markdown)：10.1.0，MIT；跳过原始 HTML，限制链接和图片来源。

校验记录与隔离测试数据：项目 `work/independent-studio-2026-10-10/`。这些测试账号、会话和数据不进入交付源码，也不作为实际管理员账号。

## 动画与服务器第二阶段

首页与全屏页面提供“暂停动态 / 开启动效”，浏览器保留偏好，并遵从系统减少动态效果设置。保留慢升人像、淡入头像、悬挂轻摆、云层和全站流体光迹；后台标签暂停，管理与写作页不运行装饰效果。横屏/低高度侧边导航可滚动，项目详情写入 URL，刷新与浏览器返回能恢复。

`deploy/sunlit-web.service` 仅监听回环地址，开机自动启动、崩溃重启；独立 Node 24 运行环境不替换服务器系统 Node。`deploy/sunlit-backup.timer` 每日北京时间 03:20 触发，补跑错过的任务。`deploy/backup.py` 用 SQLite 在线备份制作一致快照，校验数据库、上传文件和程序包 SHA-256；每份快照包含数据库、完整 uploads、初始化密钥、配置、源码、静态素材、Linux 构建和依赖。相同程序包只保存一份，通过备份目录内硬链接复用空间。不自动删除历史。备份目录包含敏感资料，需以 700/600 权限保管。

运行 `sh deploy/preview.sh`，保留终端，再访问 `http://127.0.0.1:5183/`。服务器正式库保留 6 篇文章（3 篇公开样例 + 3 篇历史测试草稿）、2 个附件，未预设管理员账号。隔离验收账号和新增测试文章只在 `/opt/sunlit/verification/`，不进入正式数据库。
