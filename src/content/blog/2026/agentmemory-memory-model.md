---
title: "探究 agentmemory 记忆分层思想"
description: "agentmemory 借用了认知科学的 working、episodic、semantic、procedural 四个词，但它不是把人类记忆搬进代码，而是按 agent 的工作流重新切了边界——保存经历、沉淀知识、组织行动，再把经验用回下一次行动。"
pubDatetime: 2026-06-03T12:00:00+08:00
tags: ["ai", "engineering", "agentmemory", "memory"]
draft: false
---

> agentmemory v0.9.24 · 2026-06-02

我理解的 agentmemory 记忆分层，不是“把人类记忆搬进代码”。它更像是一套给 agent 用的工程记忆系统：把运行过程中出现的上下文、事件、经验和行动，整理成可以保存、检索、强化和复用的东西。

它确实借了[认知科学里的几个词：working、episodic、semantic、procedural](https://www.google.com/search?q=%E8%AE%A4%E7%9F%A5%E7%A7%91%E5%AD%A6+working%E3%80%81episodic%E3%80%81semantic%E3%80%81procedural&sca_esv=a4f5fd6faf7ec072&sxsrf=ANbL-n4-L8GngRxHBTlNdsqda9TtoF9jaw%3A1780397273579&ei=2bQeau6BI5eJ4-EP9cLt2A8&biw=1960&bih=1068&ved=0ahUKEwiu0rPYsOiUAxWXxDgGHXVhG_sQ4dUDCBA&uact=5&oq=%E8%AE%A4%E7%9F%A5%E7%A7%91%E5%AD%A6+working%E3%80%81episodic%E3%80%81semantic%E3%80%81procedural&gs_lp=Egxnd3Mtd2l6LXNlcnAiN-iupOefpeenkeWtpiB3b3JraW5n44CBZXBpc29kaWPjgIFzZW1hbnRpY-OAgXByb2NlZHVyYWwyCBAAGIAEGKIEMggQABiABBiiBDIFEAAY7wUyBRAAGO8FMgUQABjvBUiQB1CQAljMBHABeAGQAQCYAf0BoAH0AqoBBTAuMS4xuAEDyAEA-AEB-AECmAIDoAKHA8ICChAAGEcY1gQYsAPCAgUQABiABMICBxAAGIAEGAyYAwCIBgGQBgqSBwUxLjEuMaAHhAWyBwUwLjEuMbgHggPCBwMyLTPIBw2ACAE&sclient=gws-wiz-serp)。这不是随便起名。agent 工作时也会遇到类似的问题：当前要记住什么，过去发生过什么，从过去能总结出什么，以后遇到类似情况该怎么做。但这些词到了 agentmemory 里，边界已经变成工程边界，不再是心理学概念本身。

这也是读这套系统时最容易混淆的地方。认知科学给了一个好理解的入口，但真正决定 agentmemory 怎么分层的，是 agent 的工作流。

![agentmemory](/assets/img/2026/agentmemory.webp)

## working：当前上下文

working memory 在这里最好理解成“当前工作台”。

agent 处理任务时，总有一些东西需要放在手边：用户偏好、项目约束、还没做完的事项、这次任务的注意点，以及一些应该被带进上下文的长期记忆。agentmemory 里的 slot、pinned context、working context，大体都可以放到这个角度理解。

所以 working 不太适合看成一条自动整理流水线的第一站。它更像一个可编辑的上下文层。内容可以被写入、替换、压缩，也可以在构造上下文时被挑出来。它主要是为了让当前任务不断片，而不是把所有东西都送去沉淀。

## episodic：发生记录

episodic memory 保存的是“发生过什么”。

一次会话里，用户说了什么，agent 调了什么工具，读了哪些文件，碰到什么错误，做过什么决定，这些都属于经历记录。session、observation、timeline、session summary 都可以放在这一层看。

这一层的特点是带着时间和场景。它不急着回答“这件事抽象成什么知识”，它先保证事情被留下来。后面要续接上次任务、追溯某个文件为什么改过、回看一段时间里做了什么，靠的就是这类记录。

## semantic：沉淀知识

semantic memory 关心的不是过程，而是从过程中留下来的稳定内容。

这里需要稍微区分几个名词。`Memory` 更像长期保存的事实、偏好、架构判断或模式；`SemanticMemory` 更接近从会话摘要里合并出来的稳定事实；`Lesson` 是经验教训，带置信度和强化次数；`Insight` 则更像多条记忆或教训综合出来的观察。

这些东西都可以叫“知识”，但不能混成一个概念。`Memory` 和 `Lesson` 的稳定性信号就不一样：前者更偏长期记录，后者更偏经验置信度。这个区别不能抹掉，因为 agentmemory 并不是简单地把所有记忆放进一个池子里，而是在用不同结构保存不同形态的知识。

episodic 和 semantic 的分界也在这里。episodic 说“这件事发生过”，semantic 说“这件事里有个值得记住的结论”。前者保留现场，后者抽掉现场。

## procedural：行动模式

procedural memory 处理的是“下次怎么做”。

这层不只是知识。它更接近行动组织。agentmemory 里一方面有从重复 pattern 中提取出来的 procedure，描述遇到某类情况时该按哪些步骤处理；另一方面还有 `Action`、`Routine`、`Lease`、`Checkpoint`、`Sentinel` 这些偏执行管理的结构。它们关心的不是“我知道什么”，而是“接下来谁做什么、什么时候算完成、被什么条件卡住、能不能复用成流程”。

把 procedural 理解成“语义知识的下一层”会有点窄。它更像把经验接回行动：过去哪些做法有效，当前有哪些任务要推进，未来哪些流程可以重复使用。

## 借鉴在这里，边界也在这里

用 working、episodic、semantic、procedural 来读 agentmemory，是有帮助的。四个词刚好对应四个很自然的问题：

- 当前要记住什么？
- 过去发生过什么？
- 从过去沉淀出了什么？
- 以后遇到类似情况怎么做？

但这个类比也只能到这里。agentmemory 不是在复现认知科学模型，它要解决的是工程问题：数据怎么捕获，怎么压缩，怎么检索，什么时候进入上下文，哪些内容要强化，哪些内容应该慢慢降权，多个 agent 之间怎么协作。

尤其是 consolidation，不能直接理解成“四层记忆的完整晋升链”。它确实会把已有记录整理成更稳定的事实，也会从反复出现的模式中抽取可复用流程，还能配合反思和衰减机制。但 working 和 episodic 并不需要作为 consolidation 的产物存在。working 更接近当前上下文，episodic 更接近原始经历和摘要。consolidation 是整理机制，不是四层本身。

这点如果不分清，就容易得出两个都不太准确的判断：要么以为 agentmemory 在完整模拟人类记忆，要么以为它没有把某个理论实现完整。更合适的看法是：它借了认知科学的语言，但按 agent 的工程需求重新切了边界。

## 从记录到经验

agentmemory 比“保存聊天历史”多走了一步。它不只是把过去放进仓库，还试图把过去变成以后能用的经验。

先有记录。session 和 observation 让 agent 的行为留下痕迹，用户输入、工具调用、文件读写、错误和决策都有机会被追溯。

然后是整理。会话摘要、`Memory`、`SemanticMemory`、`Lesson`、`Insight` 把原始经历里的部分内容变得更稳定。这里的稳定不是“绝对正确”，而是系统通过重复出现、置信度、强化次数、访问记录这些信号，判断哪些内容更值得保留。

再往后是行动化。`Action` 让记忆系统可以表达下一步任务；`Routine` 把可重复流程固定下来；`Checkpoint` 和 `Sentinel` 让任务和外部状态、时间、审批或事件挂钩。

`Crystal` 是这里很值得单独看的一环。它把一串完成过的行动压缩成经验摘要，再把值得复用的内容沉淀为 `Lesson`。也就是说，系统不是只记录“做完了”，还会尝试回答“这次做完之后，有什么以后还能用”。

衰减和强化也放在这个逻辑里看。部分记忆长期不被访问，强度会下降；`Lesson` 和 `Insight` 也有自己的置信度衰减和强化方式。这和认知科学里的遗忘直觉相似，但本质上还是工程里的权重调整：常用、常被确认的内容更容易留下来，长期不用的内容逐渐退到低优先级。

## 结语

我更愿意把 agentmemory 看成一套面向 agent 工作流的记忆组织方式，而不是一套认知科学模型的代码版。

working 维持当前上下文，episodic 保存经历，semantic 沉淀知识，procedural 组织行动。认知科学的词汇让这套结构容易理解，但真正决定它怎么运转的，是 agent 需要如何保存经验、找回经验、强化经验，再把经验用到下一次行动里。
