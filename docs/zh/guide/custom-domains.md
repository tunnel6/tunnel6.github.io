# 自定义域名

> 为隧道配置自定义域名，提升专业形象

---

## 📋 目录

- [概述](#概述)
- [系统分配域名](#系统分配域名)
- [配置自定义域名](#配置自定义域名)
- [DNS 记录设置](#dns-记录设置)
- [证书管理](#证书管理)
- [CNAME 验证](#cname-验证)
- [常见问题](#常见问题)

---

## 概述

### 为什么需要自定义域名？

**系统分配域名**：
```
https://abc123-def456.edge.myroxy.dev
```

**自定义域名**：
```
https://api.yourcompany.com
```

**优势**：
- ✅ 更专业的外观
- ✅ 易于记忆
- ✅ 品牌统一
- ✅ SEO 友好

---

## 系统分配域名

### 域名格式

每个隧道会自动分配域名：

```
格式: {subdomain}.{base-domain}
示例: abc123.edge.myroxy.dev
```

### Subdomain 生成规则

- 使用 base36 编码
- 基于 Edge 自增 ID
- 生命周期保持不变

---

## 配置自定义域名

### 步骤 1：准备域名

确保您拥有一个域名，例如 `yourcompany.com`

### 步骤 2：添加 DNS 记录

#### HTTP/HTTPS 隧道

添加 **CNAME** 记录：

```
类型: CNAME
名称: api（或 @）
值: abc123-def456.edge.myroxy.dev
TTL: 300
```

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-alias-domain.png) DNS 配置示例
> 
> 说明：显示 DNS 提供商后台、CNAME 记录配置

#### TCP/UDP 隧道

TCP/UDP 隧道**不支持**自定义域名，只能使用 IP:Port。

### 步骤 3：在 YAT 中配置

1. 打开隧道详情
2. 找到 **自定义域名** 区域
3. 点击 **添加域名**
4. 输入您的域名
5. 点击 **保存**

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-alias-domain-setup.png)YAT 自定义域名配置
> 
> 说明：显示域名输入框、保存按钮、验证状态

### 步骤 4：验证 DNS

YAT 会自动验证 DNS 配置：

- ✅ **验证通过** - 域名可用，自动申请证书
- ⏳ **验证中** - 等待 DNS 传播
- ❌ **验证失败** - 检查 DNS 记录

---

## DNS 记录设置

### 常见 DNS 提供商

#### Cloudflare

1. 登录 Cloudflare Dashboard
2. 选择域名
3. 点击 **DNS**
4. 添加 CNAME 记录


#### 阿里云

1. 登录阿里云控制台
2. 进入 **域名解析**
3. 选择域名
4. 添加记录

#### 腾讯云

1. 登录腾讯云控制台
2. 进入 **DNS 解析**
3. 选择域名
4. 添加记录

### DNS 传播时间

- **通常**: 1-5 分钟
- **最长**: 48 小时
- **TTL 设置**: 建议 300 秒（5 分钟）

### 验证 DNS 配置

```bash
# 使用 dig
dig api.yourcompany.com CNAME

# 使用 nslookup
nslookup -type=CNAME api.yourcompany.com

# 使用 curl 测试
curl -I https://api.yourcompany.com
```

---

## 证书管理

### 自动证书签发

验证通过后，YAT 会自动：

1. **DNS-01 挑战** - 验证域名所有权
2. **申请证书** - Let's Encrypt 免费证书
3. **配置 TLS** - 自动启用 HTTPS
4. **证书续期** - 到期前自动续期

### 证书状态

| 状态 | 说明 | 操作 |
|------|------|------|
| **正常** | 证书有效 | 无需操作 |
| **即将过期** | 30 天内过期 | 等待自动续期 |
| **已过期** | 证书已过期 | 手动触发续期 |
| **申请失败** | 挑战失败 | 检查 DNS |

### 手动续期证书

1. 进入隧道详情
2. 点击 **续期证书** 按钮
3. 等待完成

---

## CNAME 验证

### 验证流程

```
1. YAT 检查 DNS 记录
   ↓
2. 解析 CNAME 目标
   ↓
3. 对比系统分配域名
   ↓
4. 返回验证结果
```

### 验证失败排查

#### 问题 1：DNS 记录未生效

**症状**: 验证失败，提示 DNS 记录不匹配

**解决**:
```bash
# 等待 DNS 传播
# 或刷新本地 DNS 缓存

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches

# Windows
ipconfig /flushdns
```

#### 问题 2：CNAME 值错误

**症状**: CNAME 目标地址不正确

**解决**:
1. 检查 CNAME 值是否为系统分配域名
2. 复制正确的域名
3. 更新 DNS 记录

#### 问题 3：使用了 A 记录而非 CNAME

**症状**: 配置了 A 记录

**解决**:
- 必须使用 **CNAME** 记录
- 不能使用 A 记录指向 IP

---

## 常见问题

### Q: 一个隧道可以配置多个自定义域名吗？

目前**不支持**多域名，一个隧道只能配置一个自定义域名。

### Q: 自定义域名需要额外付费吗？

**不需要**。YAT 提供免费证书和域名配置。

### Q: 支持通配符域名吗？

目前**不支持**通配符域名（如 `*.example.com`）。

### Q: TCP/UDP 隧道支持自定义域名吗？

**不支持**。TCP/UDP 隧道只能使用 IP:Port。

### Q: 证书到期后会自动续期吗？

**会**。YAT 会在到期前 30 天自动续期。

### Q: 如何查看证书信息？

在隧道详情的 **域名状态** 区域可以看到：
- 证书颁发者
- 有效期
- 状态

---

## 💡 最佳实践

### 1. 选择子域名

```
✅ api.yourcompany.com     - API 服务
✅ app.yourcompany.com     - Web 应用
✅ dev.yourcompany.com     - 开发环境
❌ yourcompany.com         - 根域名（不推荐）
```

### 2. 设置合理的 TTL

- **开发环境**: 60 秒（快速切换）
- **生产环境**: 300 秒（平衡性能和灵活性）

### 3. 监控证书状态

定期检查证书状态，确保自动续期正常。

### 4. 使用 HTTPS

始终使用 HTTPS，避免混合内容警告。

---

## 📚 相关文档

- [隧道管理](./tunnel-management.md) - 创建和管理隧道
- [Edge 服务器管理](./edge-management.md) - Edge 域名配置
- [常见问题](./faq.md) - 解决域名相关问题

---

*YAT Team - 让内网穿透更简单*
