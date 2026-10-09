export type LabProject = {
 id:string; name:string; english:string; category:string; tagline:string; summary:string;
 repo:string; branch:string; sourceCommit:string; private:boolean; accent:string; background:string;
 logo:string; cover:string; coverCaption:string;
 problem:string; features:{title:string;body:string}[];
 engineering:{title:string;body:string}[]; stack:string[]; flow:string[];
 credit?:{text:string;url:string}; evidence:{label:string;path:string}[];
};

export const labProjects:LabProject[] = [
 {
  id:"wenxianqiao",name:"文献桥",english:"BookBridge",category:"科研工具",
  tagline:"让文献从检索结果，走进自己的文库。",
  summary:"将文献检索、全文获取、PDF 核验与 Zotero 分类导入串成一条桌面工作流。",
  repo:"wenxianqiao",branch:"main",sourceCommit:"828b002e58f0eb89d02c4c885bcd3133e6cbd2da",private:true,accent:"#397461",background:"#e8f1e9",
  logo:"/assets/projects/wenxianqiao-logo-small.png",cover:"/assets/projects/wenxianqiao-overview.png",coverCaption:"检索、核验与归档的工作流",
  problem:"读论文之前，往往已经花了许多时间在找全文、检查文件和整理文库上。文献桥把这些分散的步骤连接起来，让获取过程和任务状态都可以追踪。",
  features:[
   {title:"多渠道检索与获取",body:"组合开放全文候选与有预算约束的求助渠道，保留来源和许可核验。"},
   {title:"文件核验与文库归档",body:"核对 PDF 身份与可读性，再按目标分类导入 Zotero，减少重复整理。"},
   {title:"Mac 与 Windows 客户端",body:"共享 Python 检索引擎，分别连接 SwiftUI 和 Qt 桌面界面。"}
  ],
  engineering:[
   {title:"共享引擎，原生界面",body:"把检索与任务逻辑同界面分离，兼顾双平台体验和复用。"},
   {title:"处理真实网络的不确定性",body:"对重复查询、限流与失败进行合并、退避和恢复，并为请求保留预算边界。"}
  ],stack:["Python","SwiftUI","Qt","Zotero"],flow:["检索文献","获取全文","核验 PDF","归档 Zotero"],
  evidence:[{label:"共享引擎",path:"scripts"},{label:"桌面客户端",path:"desktop"},{label:"Zotero 连接器",path:"zotero-extension"}]
 },
 {
  id:"yandi",name:"研递",english:"Yandi",category:"科研工具",
  tagline:"让值得读的论文，主动来到面前。",
  summary:"用主题与期刊双雷达发现论文，结合证据分级解读、收藏和简报送达。",
  repo:"yandi",branch:"main",sourceCommit:"d055a6e34bc59563e2ea8433b1ac8e8ba484a0df",private:true,accent:"#356098",background:"#e8eef7",
  logo:"/assets/projects/yandi-logo.svg",cover:"/assets/projects/yandi-overview.png",coverCaption:"从论文发现到阅读简报的工作流",
  problem:"研究兴趣持续变化，信息来源却散落在不同的期刊和平台。研递把发现、筛选、阅读与送达组织成一个可持续使用的个人论文收件箱。",
  features:[
   {title:"主题与期刊双雷达",body:"根据自然语言研究描述和自选期刊发现文献，支持跨学科来源。"},
   {title:"按证据深度解读",body:"区分标题与摘要证据；接入自己的模型后进行相关度复核、翻译和结构化解读。"},
   {title:"从收件箱到简报",body:"支持未读、收藏、归档、RIS 导出，以及邮件与 PushPlus 送达。"}
  ],
  engineering:[
   {title:"不重复的采集链路",body:"结合 Crossref 与 OpenAlex，记录来源健康，并以 DOI 和内容指纹去重。"},
   {title:"可配置的模型层",body:"兼容多种模型接口，服务端加密 API 凭据；规则模式与模型模式有明确区分。"}
  ],stack:["React","TypeScript","Cloudflare Workers","D1","Drizzle"],flow:["设定雷达","发现论文","筛选解读","生成简报"],
  evidence:[{label:"产品路由",path:"app"},{label:"数据模型",path:"db"},{label:"运行与功能说明",path:"README.md"}]
 },
 {
  id:"huiyan",name:"慧眼量化",english:"HuiYan QuantBot",category:"自动化",
  tagline:"把复杂的跟单执行，放进可观察的控制台。",
  summary:"Telegram Bot 与移动 WebApp 协同，管理跟单、虚拟账本、账户状态和风险操作。",
  repo:"huiyanlianghua",branch:"main",sourceCommit:"c1da7fe66c2a6e96fea0e66017db7b3fcc964e7f",private:true,accent:"#465c8f",background:"#e9ebf6",
  logo:"/assets/projects/huiyan-logo.png",cover:"/assets/projects/huiyan-overview.png",coverCaption:"虚拟账本、执行与审计的系统结构",
  problem:"多个交易员的仓位会在真实账户里合并，执行状态、账本归属和风险判断很难一眼看清。这个项目重点解决状态管理与执行可追踪的问题。",
  features:[
   {title:"单人与多交易员模式",body:"跟踪仓位变化，在多交易员模式下分离虚拟资金和仓位归属。"},
   {title:"移动管理界面",body:"在 Telegram WebApp 查看账户、账本、Cookie 健康、运行日志与手动调仓。"},
   {title:"执行保护与审计",body:"结合空仓复核、备用 Cookie 与风险拦截，记录关键操作。"}
  ],
  engineering:[
   {title:"真实仓位与虚拟归属",body:"在交易所合并仓位的条件下维护多个独立账本，区分资金分配和实际执行。"},
   {title:"身份与状态验证",body:"校验 Telegram initData 与授权用户，并避免将失效会话误判为真实全平。"}
  ],stack:["Python","Telegram Bot","Telegram WebApp","JavaScript"],flow:["读取仓位","计算账本","校验风险","执行与审计"],
  evidence:[{label:"虚拟账本",path:"quantbot/virtual_ledger.py"},{label:"风险控制",path:"quantbot/risk.py"},{label:"移动控制台",path:"quantbot/tg_webapp"}]
 },
 {
  id:"yingji",name:"影记",english:"Yingji / ClipMind",category:"知识管理",
  tagline:"看过的视频，变成能再次使用的知识。",
  summary:"采集 YouTube 与 B 站视频，经字幕整理与模型总结，沉淀为 Obsidian 笔记。",
  repo:"ClipMind",branch:"main",sourceCommit:"1fb53cf125215f3468c80bef69a9972f906f67b1",private:false,accent:"#775b43",background:"#f3ebdf",
  logo:"/assets/projects/yingji-logo.png",cover:"/assets/projects/yingji-overview.png",coverCaption:"视频采集与知识沉淀的工作流",
  problem:"收藏视频很容易，重新找到其中有价值的观点却很难。影记把收藏、处理和知识沉淀接成一条本地优先的链路。",
  features:[
   {title:"页内采集与侧边工作台",body:"在 YouTube 与 B 站页面采集内容，通过插件与本地 WebUI 跟进处理任务。"},
   {title:"从字幕到可处理的文本",body:"结合官方与浏览器采集的字幕、任务状态和按入口区分的转录能力；YouTube 插件任务采用浏览器采集链路。"},
   {title:"写入自己的知识库",body:"调用可配置模型生成中文总结，按主题写入 Obsidian，并支持文件夹级蒸馏。"}
  ],
  engineering:[
   {title:"三个客户端协同",body:"让浏览器扩展、WebUI 和 Python 服务共享任务链路，处理采集与后台工作的边界。"},
   {title:"输出可追踪",body:"用本地任务存储管理处理状态，将模型结果落到可继续编辑的 Markdown 文件。"}
  ],stack:["React","TypeScript","Python","FastAPI","Chrome Extension","Obsidian"],flow:["采集视频","获取文本","模型总结","写入 Obsidian"],
  evidence:[{label:"浏览器扩展",path:"chrome-extension"},{label:"Web 控制台",path:"webui/src"},{label:"后台处理服务",path:"work/youtube_obsidian"}]
 },
 {
  id:"maijian",name:"脉见 AI",english:"Maijian AI",category:"自动化",
  tagline:"从分散的动态里，读出值得关注的脉络。",
  summary:"聚合创作者跨平台内容，结合上下文分析、多模态模型与消息推送。",
  repo:"maijian-AI",branch:"main",sourceCommit:"5590608c5409e2903b4ede0bf39c0cbbdc6b859d",private:true,accent:"#486877",background:"#e6f0f1",
  logo:"/assets/projects/maijian-logo.svg",cover:"/assets/projects/maijian-overview.png",coverCaption:"跨平台内容采集与分析的工作流",
  problem:"同一位创作者的信息散落在多个平台，逐条翻译也难以理解上下文。脉见将账号绑定、内容聚合、模型分析和消息送达组织在一个工作台里。",
  features:[
   {title:"跨平台创作者档案",body:"绑定 X、B 站、微博、知乎与 RSS 来源，由用户确认账号关系。"},
   {title:"上下文与多模态分析",body:"结合回复链、引用和近期内容，调用兼容模型处理文本、图片与视频。"},
   {title:"时间线与消息送达",body:"通过 React 工作台查看合并动态，并按配置推送到微信或钉钉。"}
  ],
  engineering:[
   {title:"平台适配与统一内容模型",body:"将不同来源的采集方式、账号状态和内容结构接入共享的处理流程。"},
   {title:"前后端产品化",body:"在 Flask 服务上连接 React 管理界面，组织发现、阅读、分析与设置。"}
  ],stack:["Python","Flask","React","TypeScript","SQLite"],flow:["绑定来源","汇聚动态","AI 分析","推送与阅读"],
  credit:{text:"基于 wxwhhh / TweetAI-Monitor 二次开发，其上游为 AI-News；扩展跨平台档案、上下文分析与 React 工作台。",url:"https://github.com/wxwhhh/TweetAI-Monitor"},
  evidence:[{label:"平台适配",path:"platform_adapters.py"},{label:"产品接口",path:"saas_api.py"},{label:"React 工作台",path:"frontend/src"}]
 },
 {
  id:"douge",name:"豆格工作室",english:"Douge Studio",category:"创作工具",
  tagline:"把一张喜欢的图片，变成可以动手完成的拼豆作品。",
  summary:"将图片映射成拼豆图纸，支持调色、精修、材料统计与完整创作工作台。",
  repo:"pindoudao",branch:"master",sourceCommit:"a2e41d6a050dd6c59fa0ec1098d29f7c0db0893d",private:true,accent:"#b06735",background:"#fff0de",
  logo:"/assets/projects/douge-logo.svg",cover:"/assets/projects/douge-overview.png",coverCaption:"从图片到拼豆图纸的创作链路",
  problem:"图像转换只是制作拼豆作品的第一步，还需要处理品牌色号、杂色、手动精修和材料清单。豆格把算法与实际创作流程连接起来。",
  features:[
   {title:"图像与色号映射",body:"将图片像素映射到品牌色板，结合区域合并、背景去除与颜色重映射。"},
   {title:"精修与图纸导出",body:"在工作台手动调整像素，导出带网格与色号的图纸及材料清单。"},
   {title:"完整产品结构",body:"以 Workspaces 连接公共站、创作工作台、独立管理后台与共享组件。"}
  ],
  engineering:[
   {title:"把计算移出界面",body:"将像素处理封装为共享核心与 Worker，区分图像计算和界面交互。"},
   {title:"从工具到工作室",body:"组织用户、后台、共享设计系统与 PostgreSQL 数据层，扩展原有生成器的产品边界。"}
  ],stack:["Next.js","TypeScript","Canvas","Web Worker","Prisma","PostgreSQL"],flow:["导入图片","映射色板","精修像素","导出图纸"],
  credit:{text:"基于 Zippland / perler-beads 二次开发，保留原作者署名与 AGPL-3.0 许可说明。",url:"https://github.com/Zippland/perler-beads"},
  evidence:[{label:"图像处理核心",path:"packages/core"},{label:"创作工作台",path:"apps/web"},{label:"独立管理后台",path:"apps/admin"}]
 }
];

export const projectRepoUrl=(p:LabProject)=>`https://github.com/xiaofei03/${p.repo}`;
export const projectEvidenceUrl=(p:LabProject,path:string)=>`${projectRepoUrl(p)}/${/\.[^/]+$/.test(path)?"blob":"tree"}/${p.sourceCommit}/${path}`;
