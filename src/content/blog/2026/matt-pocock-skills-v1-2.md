---
title: 'Matt Pocock Skills v1.2：控制从主流程深入到每一步'
description: 'Matt Pocock Skills v1.2 将控制从 skill 之间的主流程深入到每一步：用 frontier 管理可推进的工作，保护阶段边界上的上下文，并让规则按需进入 agent 的上下文。'
pubDatetime: 2026-08-06T12:00:00+08:00
tags: ['ai', 'engineering']
draft: false
---

[上一篇](./matt-pocock-skills)分析了 v1.1 如何用 skill 边界固定主流程：先 grill，再写 spec、拆 tickets、implement。作者在 v1.2 发布邮件里重点提到三组更新：补全文档与 Claude Code、Codex 支持；调整 `grilling`、`prototype`、`writing-for-agents`；新增 `wizard`、`to-questionnaire`、`wait-what`。

把这些变化放在一起看，我更在意的不是 skill 数量，而是控制的位置变了。v1.1 主要规定 skill 之间怎么交接，v1.2 则继续往每一步里细分：工作什么时候能推进，哪些信息不能丢，规则什么时候才该进入上下文。下面就按这三件事展开。

## 一、工作什么时候能推进

### `frontier`：从任务调度扩展到提问

v1.1 的 `grilling` 一次只问一个问题。两个问题即使互不依赖，也得排队。v1.2 改成了[逐轮提问](https://github.com/mattpocock/skills/blob/v1.2.2/CHANGELOG.md#L110-L116)：先画出问题之间的依赖，再找出所有前置问题已经解决的项，一轮一起问；用户回答后重新计算，继续下一轮。

这批当前能问的问题叫 `frontier`。它不是「一次多问几个」的数量调整，重点是把串行约束换成依赖约束：有依赖的继续等，没依赖的不用互相排队。

[事实和决策的分工](https://github.com/mattpocock/skills/blob/v1.2.2/skills/productivity/grilling/SKILL.md#L18-L22)没有变。代码库或外部资料能回答的事实由 agent 查，需要人取舍的决策仍交给用户。查询事实时可以派 subagent；只有依赖查询结果的问题暂停，本轮其他问题照常推进。

同一个 `frontier` 现在管三类工作：

- `grilling` 中当前能回答的问题；
- `wayfinder` 中未关闭、未阻塞、无人领取的 decision tickets；
- `to-tickets` 中所有 blocker 已经完成的 implementation tickets。

三者的共同规则很简单：前置条件没满足就不动，满足后才进入当前这一批。

### `wayfinder`：先分清决定和实施

v1.2 把 `wayfinder` 的工作单元明确叫作 [decision ticket](https://github.com/mattpocock/skills/blob/v1.2.2/CHANGELOG.md#L68-L72)。它记录「哪个问题还没决定」，不是「接下来实现什么」。这个名字防止 agent 把地图里的问题误当成开发任务，没等路线理清就开始写代码。

研究类 ticket 也改由 `/research` subagent 并行处理。研究不需要用户当场拍板，可以在后台查；依赖研究结果的决定继续等待。地图完成后通常仍回到 [`/to-spec`](https://github.com/mattpocock/skills/blob/v1.2.2/skills/engineering/ask-matt/SKILL.md#L44-L46)，把散落的决定整理成可实施的计划，而不是直接把 decision tickets 交给 `/implement`。

本地 tracker 也配合这个粒度调整：`to-tickets` 不再把所有任务写进一个 `tickets.md`，而是[每个 ticket 一个文件](https://github.com/mattpocock/skills/blob/v1.2.2/skills/engineering/to-tickets/SKILL.md#L58-L65)。任务能单独记录状态和依赖，文件才真正对应可领取的工作单元。

### 三个新 skill：卡住时先找对人

三个新 skill 处理的是三种不同的卡点：

- 答案在同事、客户或领域专家那里，[`to-questionnaire`](https://github.com/mattpocock/skills/blob/v1.2.2/skills/productivity/to-questionnaire/SKILL.md) 就把缺口整理成问卷，不再逼当前用户猜答案；
- 模型已经说了，但用户没听懂，[`wait-what`](https://github.com/mattpocock/skills/blob/v1.2.2/skills/productivity/wait-what/SKILL.md) 就用少量背景、简化英语和 `CONTEXT.md` 中的项目术语重讲；
- 事情必须由人点击、批准或输入凭据，[`wizard`](https://github.com/mattpocock/skills/blob/v1.2.2/skills/engineering/wizard/SKILL.md) 就生成交互式 Bash，引导人完成这些步骤。

它们没有替 agent 增加新能力，而是先认清当前缺的是知情人、清楚的表达，还是必须亲手操作的人，再把流程交给正确的一方。

## 二、哪些信息不能丢

### 只在阶段之间处理上下文

v1.2 把上下文处理放到阶段边界：grilling、implementation、QA 这样一段连续工作结束后，再判断下一段需要什么。同一阶段中途随意压缩，容易把正在使用的理由和约束一起压掉。

[`PHASE-BOUNDARIES.md`](https://github.com/mattpocock/skills/blob/v1.2.2/skills/engineering/ask-matt/PHASE-BOUNDARIES.md) 给出的判断顺序是：

| 当前情况 | 选择 |
| --- | --- |
| 下一阶段需要完整对话，或窗口仍够用 | Continue |
| 当前上下文与下一阶段无关 | `/clear` |
| 内容要交给另一个 harness、目录、同事或支线 | `/handoff` |
| 工作已经明确，可以离线完成 | Subagent |
| 上下文仍有用，但窗口不够 | `/compact` |

Continue 放在第一位，因为它保留的是完整对话。其余做法都会丢掉一部分信息，区别只在用途：`/clear` 主动舍弃，`/handoff` 方便搬运，Subagent 隔离一项工作，`/compact` 用摘要换空间。

这样看，`/handoff` 不是通用的跨窗口办法。没有换环境或接手人，内容不需要搬走；`/compact` 也不是第一反应，只有上下文还要用、窗口又不够时才轮到它。

### `prototype`：临时代码不等于临时证据

v1.2 对 `prototype` 的改动有两部分。形式上，logic prototype 从终端程序改成[单个 HTML 文件](https://github.com/mattpocock/skills/blob/v1.2.2/CHANGELOG.md#L40-L44)：不用安装依赖，非开发者双击就能操作状态、走完预设场景。原型因此更容易交给真正了解业务的人验证。

更重要的是保存方式。原型仍按 throwaway code 来写：不补完整测试和错误处理，也不为未来需求提前抽象。但问题回答完后不再直接删除。验证过的纯逻辑可以进入正式代码；用于验证的 HTML [留在 `prototype/<name>` 临时分支](https://github.com/mattpocock/skills/blob/v1.2.2/skills/engineering/prototype/SKILL.md#L19-L26)，implementation issue 留一条链接，说明何时需要回看这份原型。

正式代码保存最后采用的做法，implementation issue、ADR 或 commit 记录结论，原型分支保留验证过程。主分支不会混进临时代码，以后又还能查到当初为什么这么定。

## 三、规则什么时候进入上下文

### 每份文档都要付一种成本

`writing-great-skills` 在 v1.2 改名为 `writing-for-agents`，讨论范围从 skill 扩展到 `AGENTS.md`、`CLAUDE.md` 和其他给 agent 读的文档。它把文档成本分成两种：

- **上下文成本（context load）**：材料每轮都在窗口里，持续占 token 和注意力；
- **记忆成本（cognitive load）**：材料不常驻，但人要记得它存在、知道何时去找。

连接两边的是 **context pointer**，也就是一条带读取条件的引用。skill 的 `description`，或 `AGENTS.md` 里指向另一份文档的一行，都属于这种引用。它不能只写「那里有一份文档」，还要说明文档讲什么、遇到什么情况才去读。条件写得含糊，后面的规则再完整也可能用不上。

文档内容因此分成三层：当前必须按顺序执行的步骤留在主文件；随时可能要查的规则也留在当前文件；只有某种情况才需要的内容放到独立文件，满足条件时再打开。拆分的目的不是追求文件短，而是别让当前步骤被无关材料淹没。

`writing-for-agents` 还把重复环境信息叫作 `cache`。`package.json` scripts、配置文件、目录结构和 `--help` 输出已经能直接查到，文档再抄一份只会多一个过期副本。真正值得写的是环境看不出来的内容：为什么这样定、团队默认怎么做、哪里容易踩坑。

### 触发规则必须在运行环境里生效

Claude Code 和 Codex 用不同配置表达同一条边界：

| 类型 | Claude Code | Codex |
| --- | --- | --- |
| 只能由用户触发 | `disable-model-invocation: true` | `policy.allow_implicit_invocation: false` |
| 模型也能触发 | 不设置限制 | 不设置 `policy` 限制 |

两边必须保持一致。用户触发型 skill 只能由人点名；模型触发型 skill 才会进入自动匹配范围。skills v1.2 的 Claude Code plugin 和每个 skill 旁边新增的 [`agents/openai.yaml`](https://github.com/mattpocock/skills/blob/v1.2.2/.agents/invocation.md)，就是把同一套触发分类落实到两个运行环境。

[v1.2.2](https://github.com/mattpocock/skills/releases/tag/v1.2.2) 修的正是这里：`writing-for-agents` 本来允许模型触发，Codex 配置却残留了 `policy.allow_implicit_invocation: false`，导致它不在模型可见列表中，只能由用户显式调用。删除这项限制后，自动触发才恢复。规则写对了还不够，它还得在需要时真正进入上下文。
