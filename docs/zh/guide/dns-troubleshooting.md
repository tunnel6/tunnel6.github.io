# 🌐 DNS 故障排除指南

> 确保您的 DNS 设置正确，以便正常解析域名。如果遇到 DNS 解析问题，请检查网络连接和 DNS 配置。

## 🔍 常见 DNS 问题诊断

### DNS 解析失败
- **现象**: 域名无法访问，浏览器显示 "DNS_PROBE_FINISHED_NXDOMAIN" 或类似错误
- **可能原因**: 
  - DNS 记录未正确配置
  - DNS 传播尚未完成（通常需要 1-48 小时）
  - 本地 DNS 缓存过期
  - DNS 服务器不可用

### DNS 验证失败
- **现象**: YAT 控制台显示 "DNS Verification Failed"
- **可能原因**:
  - CNAME 记录指向错误的 Edge 地址
  - DNS 记录 TTL 设置过长，导致更新延迟
  - DNS 提供商限制或防火墙拦截

## 🛠️ 排查步骤

### 步骤 1: 获取 CNAME 记录值

#### 在 Edge 控制台中获取记录值
1. 登录 YAT 控制台 → [Edge 管理](./edge-management.md)
2. 在 Edge 列表中找到您的 Edge 服务器
3. 点击 **管理** 按钮或点击 Edge 卡片进入详情页
4. 在 **域名健康** 或 **DNS 配置** 区域找到 CNAME 记录值
5. 复制显示的 CNAME 记录值（通常格式为 `xxx.edge.tunnel6.com`）

> 📸 **[Screenshot Location]** Edge 控制台 DNS 配置提示
> Description: 展示 Edge 控制台中的 DNS 配置区域，包含 CNAME 记录类型、名称、值和复制按钮

#### 在 yat-fe 客户端中获取记录值
1. 打开 yat-fe 客户端应用
2. 在左侧导航栏选择 **隧道管理**
3. 找到对应的隧道并点击进入详情页
4. 在 **远程地址** 或 **域名配置** 区域找到 CNAME 记录值
5. 点击复制按钮获取记录值

> 📸 **[Screenshot Location]** yat-fe 客户端隧道详情页
> Description: 展示 yat-fe 客户端中的隧道详情页面，包含远程地址、CNAME 记录和复制按钮

### 步骤 2: 检查 DNS 记录配置
1. 登录您的 DNS 提供商控制台
2. 确认 CNAME 记录已正确添加
3. 验证记录值是否指向正确的 Edge 节点地址

### 步骤 2: 验证 DNS 传播状态
使用以下命令检查 DNS 是否已生效：
```bash
# 检查 DNS 解析
nslookup your-domain.com

# 或使用 dig 命令
dig your-domain.com CNAME +short
```

### 步骤 3: 配置隧道 alias 域名

#### 在 yat-fe 客户端中配置 alias 域名
1. 打开 yat-fe 客户端应用
2. 在左侧导航栏选择 **隧道管理**
3. 点击右上角 **+ 创建隧道** 按钮
4. 在创建隧道向导中选择应用类型（如 HTTP）
5. 在 **域名配置** 区域输入您的自定义域名（如 `myapp.example.com`）
6. 保存配置并启动隧道

> 📸 **[Screenshot Location]** yat-fe 隧道创建域名配置
> Description: 展示 yat-fe 客户端中的隧道创建向导，包含域名输入框和保存按钮

### 步骤 4: 清除本地 DNS 缓存
```bash
# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches
```

## 📚 相关资源
- [DNS 记录配置指南](./custom-domains.md#dns-record-setup)
- [自定义域名配置](./custom-domains.md)
- [Edge 管理](./edge-management.md)

## ❓ 常见问题

### Q: DNS 传播需要多长时间？
A: 通常需要 1-48 小时，具体取决于 DNS 记录的 TTL 设置。

### Q: 如何加快 DNS 传播？
A: 在 DNS 配置前将 TTL 设置为较短时间（如 300 秒），配置完成后可恢复为较长 TTL。

### Q: YAT 支持哪些 DNS 提供商？
A: 支持所有主流 DNS 提供商，包括 Cloudflare、阿里云 DNS、腾讯云 DNS、GoDaddy、Namecheap 等。

---
*文档最后更新: 2026-05-04*
