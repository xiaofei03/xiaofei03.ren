# 独立服务器部署

本项目使用 React、TypeScript、Vinext/Vite 和 Node.js。文章存入 SQLite，正文图片和原稿存入本机目录，不依赖托管平台的 D1/R2 或 ChatGPT 登录。仓库同时保留旧平台的适配与迁移源文件。

## 从源码运行

需要 Node.js >= 22.13.0，已在 macOS 和 Ubuntu 的 Node.js 24.16.0 上验证。

```sh
git clone https://github.com/xiaofei03/xiaofei03.ren.git
cd xiaofei03.ren
npm ci
npm run check
npm run dev
```

浏览器打开 `http://127.0.0.1:5173/`。不要把 `node_modules` 从 macOS 直接复制到 Linux；在目标系统安装依赖。

生产方式：

```sh
npm run build
npm run start -- --port 5183
```

默认仅监听 `127.0.0.1`。反向代理负责公开访问。

## 管理员和数据

在项目目录运行 `npm run admin:setup`，命令会显示一次性初始化密钥的文件位置。打开该文件，在 `/admin/setup` 输入密钥并自行设置账号和至少 12 位密码；后续使用 `/admin/login` 和 `/studio`。密钥、账号密码、数据库及备份不应上传到 GitHub。

默认数据目录为 `.local-data/`，首次运行会初始化数据库与样例文章。服务器使用环境变量指定独立目录：

```dotenv
SUNLIT_DATA_DIR=/opt/sunlit/data
SITE_ORIGIN=https://xiaofei03.ren
# 备案获批后填写该网站的完整服务备案号，包含 -N 后缀：
SUNLIT_ICP_NUMBER=
```

`SITE_ORIGIN` 必须等于浏览器实际使用的来源。生产服务器通过 `/etc/sunlit.env` 加载变量；该文件应保留为私有文件，不进入源码仓库。`SUNLIT_ICP_NUMBER` 留空时不渲染备案页脚。

持久数据包括 `sunlit.sqlite`、`uploads/` 和 `first-admin-key`。只复制源码不会包含用户后续保存的文章。迁移这些数据时使用一致数据库快照与完整附件副本。

## 服务器目录和服务

当前配置采用以下目录约定，迁移到其他服务器时按实际环境调整：

| 路径 | 用途 |
| --- | --- |
| `/opt/sunlit/releases/版本号` | 独立发布版本，含源码、素材、目标系统依赖和构建 |
| `/opt/sunlit/current` | 指向当前发布版本 |
| `/opt/sunlit/runtime/node-v24.16.0-linux-x64/` | 独立 Node 运行时 |
| `/opt/sunlit/data/` | SQLite、图片、原稿和初始化密钥 |
| `/opt/sunlit/backups/` | 私有完整备份 |
| `/etc/sunlit.env` | 服务运行配置 |
| `/var/lib/sunlit-acme/` | ACME HTTP 验证文件 |

`sunlit-web.service` 由 `sunlit` 系统用户运行，监听回环端口 5183，开机启动并在进程异常退出后重启。正式程序目录应只读，数据目录由该用户拥有。使用单元文件之前先准备对应的用户、目录、运行时和环境文件；不能只复制单元文件就启动。

`sunlit-backup.service` 配合 `sunlit-backup.timer` 每日执行。定时器使用服务器本地时间 03:20，因此按当前部署设为 Asia/Shanghai。备份程序要求当前发布目录中存在 `release-complete.tar.gz`；该归档包含该版本的源码、素材、生产构建和 Linux 依赖，制作时避免把归档本身递归包含进去。

备份使用 SQLite 在线备份、附件大小核对和 SHA256 校验；包含管理员初始化密钥和环境配置，应以私有目录权限保存。归档不会自动删除历史。源码仓库不包含数据库备份。

## IP 预览、域名和 HTTPS

截至 2026-10-11，用户确认 xiaofei03.ren 仍在腾讯云或管局审核中。当前 `sunlit-ip-preview.conf` 提供 `http://49.234.27.200/` 只读预览，阻止管理员入口、写入方法、Cookie 和授权信息。正式域名配置尚未启用。

正式上线顺序：

1. 核实本次新增网站已获批及其完整服务备案号，保存当前程序、代理和环境配置备份。
2. 安装 `sunlit-domain-http.conf`，先通过 `nginx -t`；配置根域名和 www 的 DNS，核对解析。此配置仅响应 ACME 验证，其他请求返回 503。
3. 用 Certbot 的 webroot 插件为根域名与 www 签发可信证书，webroot 为 `/var/lib/sunlit-acme`。正式配置使用 `/etc/letsencrypt/live/xiaofei03.ren/` 的证书，并依赖 Certbot 提供的 SSL options 和 DH 参数文件。
4. 配置实际的 `SITE_ORIGIN` 和 `SUNLIT_ICP_NUMBER`，切换到验证过的发布版本并重启服务。
5. 使用 `sunlit-domain-https.conf` 替换本网站的 HTTP 临时配置，通过 `nginx -t` 后重载。不要同时加载两个配置或覆盖其他网站的虚拟主机。
6. 在 Certbot 的 deploy hooks 目录安装 `sunlit-certificate-reloaded.sh`，核对续期定时器并对本域名运行续期演练。该钩子仅在本域名证书更新时检查并重载 Nginx。
7. 验收 HTTP/www 跳转到根域名 HTTPS、证书、七个板块、图文阅读、登录、上传和手机布局。保留原程序和配置以便回退。

腾讯云的[备案拦截说明](https://cloud.tencent.com/document/product/243/20220)要求新增网站取得备案号后才能开放访问。此处提供部署配置不表示备案已通过；HTTPS 隔离测试通过也不表示已取得公网证书。

## 已验证的范围

本地和 Linux 类型检查、生产构建均通过。HTTP/HTTPS 配置通过服务器 Nginx 语法检查；独立数据副本的 12 项 HTTPS 测试覆盖登录、Secure/HttpOnly/SameSite 会话、来源校验、草稿隔离和退出失效。运行时备案页脚在四个页面中验证通过。最终正式域名、可信证书及续期验收等待备案获批。

网站内容与装饰素材均在仓库中；真实运行数据、测试账号、服务器私钥及私有备份不在仓库中。第三方组件和素材的许可声明保留在 `licenses/`、`vendor/` 及素材目录。
