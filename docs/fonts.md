# 中文标题字体

站点自托管 **Noto Serif SC** 简体中文宋体，CSS 家族别名为 `Sunlit Serif`。字体来自 Google Fonts 官方服务，遵循 **SIL Open Font License 1.1**，可与网站一起分发；未复制 macOS 商业系统字体。

## 来源与授权

- 官方字体目录：[google/fonts · ofl/notoserifsc](https://github.com/google/fonts/tree/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoserifsc)
- 核验的上游提交：`8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5`。
- 原始字体：`NotoSerifSC[wght].ttf`，上游可变字体；本项目不附带约25MB完整版本。
- 授权原文：[OFL.txt](https://github.com/google/fonts/blob/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoserifsc/OFL.txt)，Git blob SHA：`94d1bf7b52481343e2983fb7751e8b7abe1ea07b`。本地完整副本保存在 `public/fonts/OFL-NotoSerifSC.txt`。
- 版权声明：Copyright 2012 Google Inc. All Rights Reserved.
- 子集通过官方 [Google Fonts CSS API](https://developers.google.com/fonts/docs/css2) 的 `text` 参数请求，下载地址仅使用 `fonts.gstatic.com`。保存的是官方返回的原始 WOFF2 二进制，没有本地重绘或修改字形。API响应未提供可与GitHub提交逐字节对应的字体版本号；以上提交用于核验官方字体目录与授权，不能据此宣称子集二进制与该TTF版本完全相同。

## 体积与覆盖范围

当前站点 `app/`、`components/` 下 TypeScript、TSX 和 JSON 源文件共提取 **862 个不同汉字**，加上 ASCII 和常用中文标点，分成两个有 `unicode-range` 的子集。字体覆盖正常字形，变量字重 **400–700**。两份字体合计 **357,108 字节（约349 KiB）**，低于500KB。

| 文件 | 字节 | SHA-256 |
| --- | ---: | --- |
| `noto-serif-sc-sunlit-1.woff2` | 162,520 | `8b78bfa26d3f45a751d14554ca0ad90f6a95336d99b056228356ca1f15fb869b` |
| `noto-serif-sc-sunlit-2.woff2` | 194,588 | `4c97bf60ad68d78640e960a66f96f33b83779e2b65fd43264849d94a623c0caf` |

浏览器按页面实际使用的字符加载对应子集，字体资源来自本站。动态文章或后续新增标题里的其他汉字会使用 CSS 回退字体，不会丢字。新增大量标题或更新站点内容时，应重新提取文字并刷新两个子集及 `unicode-range`。

## 接入

在全局样式或 HTML 中载入 `/fonts/sunlit-serif.css`，然后将标题字体设为：

```css
font-family: "Sunlit Serif", "Songti SC", "Noto Serif SC", serif;
```

`Songti SC` 仅为用户设备上可用时的回退字体，未与网站一起打包。字体使用 `font-display: swap`，避免等待字体时隐藏文字。正文可继续沿用站点无衬线字体。

## 可复核记录

`public/fonts/sources.json` 保存上游版本、授权标识、字重、文件体积、SHA-256及字符范围。准备阶段的官方 CSS 响应、请求字符清单及下载核验记录保存在项目的 `work/award-visual-2026-10-23/fonts/` 中。WOFF2 文件已经过魔数与文件长度核验；浏览器实际排版和标题视觉仍需在站点接入后核对。

需要再生成时：从当前 `app/`、`components/` 的显示文字提取字符，按请求长度拆分，向 Google Fonts 请求 `family=Noto+Serif+SC:wght@400..700` 与 `text`，逐份保存返回 CSS 指向的官方 WOFF2，并同步每份 `unicode-range`。保留完整OFL授权，不使用全系统字体替代下载物。
