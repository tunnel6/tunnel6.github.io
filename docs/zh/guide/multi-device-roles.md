# 多设备与角色管理

> 了解 YAT 的 Actor 模型和多设备协作机制

---

## 📋 目录

- [Actor 模型概述](#actor-模型概述)
- [角色定义](#角色定义)
- [多设备协作](#多设备协作)
- [Session 管理](#session-管理)
- [设备管理](#设备管理)
- [常见问题](#常见问题)

---

## Actor 模型概述

### 什么是 Actor 模型？

YAT 使用 **Actor 模型** 来管理多设备协作。每个设备在隧道中扮演一个**角色（Actor）**，共同完成远程访问任务。

### 为什么需要 Actor 模型？

**场景示例**：

```
公司电脑 ──想要访问──► 家里 Mac

传统方案：
- 无法区分谁在访问
- 无法控制权限
- 状态混乱

YAT Actor 模型：
- 公司电脑 = Consumer（消费者）
- 家里 Mac = Publisher（发布者）
- 角色清晰，权限明确
```

### 身份标识

YAT 使用两层身份标识：

1. **传输层身份**: `session_id` / `device_id`
2. **业务层身份**: `actor_role` / `actor_session_id` / `actor_device_id`

---

## 角色定义

### Publisher（发布端）

**职责**: 提供远程服务

**权限**:
- ✅ 启动隧道
- ✅ 停止隧道
- ✅ 控制通道
- ✅ 修改配置

**示例场景**:
- 家里的 Mac 提供 VNC 服务
- 公司服务器提供 API 服务
- 本地开发环境提供调试服务

### Consumer（消费端）

**职责**: 使用远程服务

**权限**:
- ✅ 查看隧道状态
- ✅ 访问远程地址
- ✅ 查看详细信息
- ❌ 不能启动/停止隧道
- ❌ 不能修改配置

**示例场景**:
- 公司电脑访问家里 Mac
- 手机访问公司服务器
- 客户访问演示环境

### Controller（控制端）

**职责**: 管理隧道配置（预留角色）

**权限**:
- ✅ 所有 Publisher 权限
- ✅ 管理共享设置
- ✅ 管理参与者

> ⚠️ **注意**: Controller 角色目前为预留功能，尚未实现。

---

## 多设备协作

### 典型场景

#### 场景 1：远程办公

```
家里 Mac (Publisher)
  ↓ 创建隧道，共享
  ↓
公司笔记本 (Consumer)
  ↓ 访问共享隧道
  ↓
远程桌面连接成功
```

**配置步骤**：

1. **家里 Mac**：
   - 创建 ARD 隧道
   - 设置为 **共享** 模式
   - 角色自动为 **Publisher**
   - 启动隧道

2. **公司笔记本**：
   - 登录同一账号
   - 在隧道列表看到共享隧道
   - 角色自动为 **Consumer**
   - 点击连接远程桌面

#### 场景 2：团队协作

```
开发者 A (Publisher)
  ↓ 创建 API 隧道
  ↓
开发者 B (Consumer)
  ↓ 访问 API
  ↓
测试人员 C (Consumer)
  ↓ 访问 API
```

### 角色分配规则

#### 创建时分配

- **创建设备**: 默认 **Publisher**
- **其他设备**: 自动 **Consumer**

#### 运行时解析

YAT 会从以下来源解析角色：

1. **Participants 列表** - 运行时参与者信息
2. **Sessions 列表** - 会话信息
3. **Config 配置** - tunnelRole 字段

```typescript
// 角色解析优先级
1. participants 中的 role
2. sessions 中的 publisherDeviceId / consumerDeviceId
3. config.tunnelRole
4. 默认 fallback
```

### 权限矩阵

| 操作 | Publisher | Consumer | Controller |
|------|-----------|----------|------------|
| 启动隧道 | ✅ | ❌ | ✅ |
| 停止隧道 | ✅ | ❌ | ✅ |
| 查看状态 | ✅ | ✅ | ✅ |
| 访问服务 | ✅ | ✅ | ✅ |
| 修改配置 | ✅ | ❌ | ✅ |
| 删除隧道 | ✅ | ❌ | ✅ |
| 管理参与者 | ❌ | ❌ | ✅ |

---

## Session 管理

### 什么是 Session？

**Session（会话）** 表示一次隧道运行实例。

### Session ID 格式

```
格式: {appId}:{tunnelId}:{deviceId}:{actorRole}

示例: 
- app-ard:tunnel-123:device-abc:publisher
- app-ard:tunnel-123:device-xyz:consumer
```

### 为什么需要角色后缀？

同一设备可能在不同时间扮演不同角色：

```
设备 A 上午：publisher（提供服务的角色）
设备 A 下午：consumer（访问其他服务的角色）

Session 区分：
- ard:tunnel-123:device-A:publisher
- ard:tunnel-456:device-A:consumer
```

### Session 生命周期

```
创建隧道
  ↓
启动通道 → 创建 Session
  ↓
运行中 → Session 活跃
  ↓
停止通道 → Session 结束
  ↓
删除隧道 → Session 清理
```

---

## 设备管理

### 设备 ID

每个设备有唯一的设备 ID：

```
格式: device-{random-string}
示例: device-a1b2c3d4e5f6
```

### 查看设备信息

在隧道详情的 **参与者** 区域可以看到：

- **设备 ID**
- **角色**
- **状态**（Online/Offline）
- **最后在线时间**

> 📸 **[截图位置]** 参与者列表
> 
> 说明：显示设备 ID、角色标签、状态指示器

### 设备状态

| 状态 | 说明 |
|------|------|
| **Online** | 设备在线，正在参与隧道 |
| **Offline** | 设备离线 |
| **Idle** | 设备在线但未参与 |

### 管理设备

#### 移除设备（开发中）

未来版本支持：
1. 进入隧道详情
2. 找到参与者列表
3. 点击 **移除** 按钮
4. 确认移除

> ⚠️ **注意**: 移除 Publisher 设备会导致隧道停止

---

## 常见问题

### Q: 如何切换角色？

目前**不支持**运行时切换角色。

**解决方法**：
1. 停止隧道
2. 删除隧道
3. 在新设备上重新创建

### Q: 一个设备可以有多个角色吗？

**可以**。同一设备可以在不同隧道中扮演不同角色：

```
隧道 A: Publisher
隧道 B: Consumer
```

但在**同一个隧道**中，一个设备只能有一个角色。

### Q: Publisher 离线后隧道会怎样？

**隧道会停止**。因为 Publisher 是服务提供者，离线后服务不可用。

### Q: Consumer 可以变成 Publisher 吗？

目前**不支持**动态转换。

**设计原因**：
- Publisher 需要提供本地服务
- Consumer 只是访问服务
- 角色转换需要服务迁移

### Q: 如何查看当前设备 ID？

在开发者工具控制台：

```javascript
localStorage.getItem('device:id')
```

### Q: 设备 ID 可以修改吗？

**不建议修改**。设备 ID 用于：
- 身份识别
- 会话管理
- 权限控制

修改可能导致：
- 隧道状态混乱
- 权限丢失
- 会话失效

### Q: 多设备同时操作会冲突吗？

YAT 使用 **revision-based conflict resolution** 机制：

1. 每次修改递增 revision
2. 冲突时同步最新状态
3. 409 冲突 → 同步 → 重试

---

## 💡 最佳实践

### 1. 明确角色分工

- **Publisher**: 稳定的服务器设备
- **Consumer**: 移动的客户端设备

### 2. 合理设置共享模式

```
个人多设备: Shared（共享）
团队协作: Shared（共享）
敏感服务: Exclusive（独占）
```

### 3. 监控设备状态

定期检查参与者列表：
- Publisher 是否在线
- Consumer 数量是否合理
- 有无异常设备

### 4. 设备命名规范

建议在设备上做标记：

```
MacBook-Pro (Publisher)
ThinkPad (Consumer)
iPhone (Consumer)
```

---

## 📚 相关文档

- [隧道管理](./tunnel-management.md) - 创建共享隧道
- [应用与扩展](./apps-and-extensions.md) - ARD 多设备使用
- [常见问题](./faq.md) - 角色相关问题

---

*YAT Team - 让内网穿透更简单*
