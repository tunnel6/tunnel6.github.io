# 常见问题

> 解决使用 YAT 过程中遇到的常见问题

---

## 📋 目录

- [安装问题](#安装问题)
- [登录问题](#登录问题)
- [隧道问题](#隧道问题)
- [Edge 服务器问题](#edge-服务器问题)
- [扩展问题](#扩展问题)
- [性能问题](#性能问题)
- [网络问题](#网络问题)
- [高级问题](#高级问题)

---

## 安装问题

### Q: YAT 支持哪些操作系统？

**支持**：
- ✅ macOS 10.15+ (Catalina)
- ✅ Windows 10+
- ✅ Linux (Ubuntu 18.04+, CentOS 7+, Debian 9+)

**不支持**：
- ❌ macOS 10.14 及以下
- ❌ Windows 7/8
- ❌ 32 位系统

### Q: macOS 提示"无法验证开发者"？

**原因**: macOS Gatekeeper 安全策略

**解决**:
1. 打开 **系统设置** > **隐私与安全性**
2. 找到 **仍要打开** 按钮
3. 点击 **仍要打开**
4. 确认打开

或者使用命令行：
```bash
xattr -d com.apple.quarantine /Applications/YAT.app
```

### Q: Windows SmartScreen 阻止安装？

**解决**:
1. 点击 **更多信息**
2. 点击 **仍要运行**

### Q: Linux 缺少依赖？

**Ubuntu/Debian**:
```bash
sudo apt install libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2
```

**CentOS/RHEL**:
```bash
sudo yum install nss atk at-spi2-atk cups-libs \
  libdrm libxkbcommon xorg-x11-util-macros \
  libXcomposite libXdamage libXrandr mesa-libgbm \
  pango cairo alsa-lib
```

### Q: 安装后无法启动？

**排查步骤**：

1. **检查系统要求**
   - 操作系统版本
   - 内存（至少 2GB）
   - 磁盘空间（至少 500MB）

2. **查看日志**

**macOS**:
```bash
cat ~/Library/Logs/YAT/main.log
```

**Windows**:
```
%APPDATA%\YAT\logs\main.log
```

**Linux**:
```bash
cat ~/.config/yat/logs/main.log
```

3. **重新安装**
   - 卸载当前版本
   - 清理配置目录
   - 重新下载最新版本

---

## 登录问题

### Q: 无法登录 GitHub？

**可能原因**:
1. 网络问题
2. GitHub OAuth 应用配置问题
3. 浏览器拦截

**解决**:
1. 检查网络连接
2. 尝试在浏览器中访问 GitHub
3. 禁用广告拦截插件
4. 清除浏览器缓存

### Q: 登录后立即退出？

**可能原因**:
1. Token 过期
2. 网络断开
3. 账户被禁用

**解决**:
1. 重新登录
2. 检查网络
3. 联系支持团队

### Q: 多设备登录冲突？

**不会冲突**。YAT 支持多设备同时登录。

---

## 隧道问题

### Q: 创建隧道时提示"没有可用的 Edge"？

**原因**: 未订阅任何 Edge 服务器

**解决**:
1. 前往 **Edges** 页面
2. 切换到 **市场** 标签
3. 订阅一个 Edge 服务器
4. 返回创建隧道

### Q: 隧道启动失败？

**常见错误**：

#### 错误 1: Edge 离线

**症状**: "Edge is offline"

**解决**:
1. 检查 Edge 状态
2. 重启 Edge 服务器
3. 等待 Edge 上线

#### 错误 2: 端口被占用

**症状**: "Port already in use"

**解决**:
```bash
# macOS/Linux
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

#### 错误 3: 网络超时

**症状**: "Connection timeout"

**解决**:
1. 检查网络连接
2. 检查防火墙设置
3. 尝试切换网络

#### 错误 4: 权限不足

**症状**: "Permission denied"

**解决**:
- Consumer 角色不能启动隧道
- 联系 Publisher 启动

### Q: 隧道启动后立即停止？

**可能原因**:
1. 本地服务未启动
2. Edge 连接断开
3. 配置错误

**排查步骤**:
```
1. 确认本地服务运行
   curl http://localhost:8080

2. 检查 Edge 状态
   - 查看 Edge 页面
   - 状态应为"在线"

3. 查看隧道日志
   - 详情页面查看错误信息
```

### Q: 远程地址无法访问？

**检查清单**：

- [ ] 隧道状态是否为"运行中"
- [ ] 本地服务是否正常
- [ ] Edge 是否在线
- [ ] 浏览器是否提示证书错误
- [ ] 防火墙是否阻止连接

**测试方法**:

```bash
# 测试本地服务
curl http://localhost:8080

# 测试远程地址
curl https://xxx.myroxy.dev

# 测试 Edge 连接
ping edge.myroxy.dev
```

### Q: 如何停止隧道？

1. 找到隧道卡片
2. 点击 **停止** 按钮
3. 确认停止

### Q: 隧道可以重命名吗？

目前**不支持**重命名。需要：
1. 删除旧隧道
2. 创建新隧道

---

## Edge 服务器问题

### Q: Edge 显示离线？

**排查步骤**：

```bash
# 1. 检查服务器是否运行
ssh user@edge-server
uptime

# 2. 检查 Edge 进程
ps aux | grep yat-edge

# 3. 检查端口
netstat -tlnp | grep 443

# 4. 查看日志
sudo journalctl -u yat-edge -n 100

# 5. 重启服务
sudo systemctl restart yat-edge
```

### Q: 如何更新 Edge？

**自动更新**（推荐）:
```bash
# YAT 客户端中点击"更新"按钮
```

**手动更新**:
```bash
# 1. 下载新版本
curl  https://github.com/tunnel6/edge/releases/latest/download/edge-${os}-${arch} -o /usr/local/bin/edge


# 4. 启动新版本
killall edge && edge server start
```

### Q: Edge 证书过期？

**自动续期**（默认）:
YAT 会在到期前 30 天自动续期。

**手动续期**:
```bash
# 在 Edge 服务器上
./yat-edge certs renew --config config.yaml

# 重启 Edge
sudo systemctl restart yat-edge
```

### Q: 如何查看 Edge 资源使用？

```bash
# CPU 和内存
top -p $(pgrep yat-edge)

# 网络流量
iftop -i eth0

# 磁盘使用
du -sh /opt/yat/
```

---

## 扩展问题

### Q: 扩展安装后没有显示？

**排查步骤**：

1. **检查目录结构**
```
extensions/my-extension/
├── index.js        # 必须
├── index.d.ts      # 可选
└── manifest.json   # 可选
```

2. **检查入口文件**
```javascript
// index.js 必须导出 extension
export const extension = { ... }
```

3. **查看控制台**
```
打开开发者工具 > Console
查看是否有加载错误
```

4. **重启 YAT**

### Q: ARD 扩展连接失败？

**常见错误**：

#### 错误 1: VNC 端口不可达

**症状**: "Target port is unreachable: 127.0.0.1:5900"

**解决**:
1. 确认 macOS 已开启屏幕共享
2. 检查防火墙设置
3. 测试本地连接：
   ```bash
   nc -zv 127.0.0.1 5900
   ```

#### 错误 2: 角色错误

**症状**: "当前设备是客户端，不能创建 ARD 通道"

**解决**:
- 确保 Publisher 设备启动隧道
- Consumer 设备只能连接

#### 错误 3: VNC 客户端未安装

**症状**: "未找到可用的本地 VNC 客户端"

**解决**:
- macOS: 使用内置"屏幕共享"应用
- Windows: 安装 RealVNC 或 TightVNC
- Linux: 安装 Remmina 或 Vinagre

### Q: 如何卸载扩展？

1. 前往 **Apps** 页面
2. 找到扩展
3. 点击 **卸载**
4. 确认卸载

> ⚠️ **注意**: 卸载会删除该扩展的所有隧道

---

## 性能问题

### Q: 隧道延迟高？

**优化建议**：

1. **选择更近的 Edge**
   - 中国用户：香港、日本
   - 欧美用户：法兰克福、美西

2. **切换传输模式**
   - Relay → P2P（同地域）
   - Relay → WireGuard（大文件）

3. **检查网络质量**
   ```bash
   # 测试延迟
   ping edge.myroxy.dev
   
   # 测试带宽
   speedtest-cli
   ```

### Q: 带宽限制？

**限制因素**：
- Edge 服务器带宽
- 本地网络带宽
- 传输模式

**建议**：
- 小文件：Relay 模式
- 大文件：P2P 或 WireGuard
- 视频流：P2P 模式

### Q: CPU 占用高？

**优化建议**：

1. **减少隧道数量**
   - 关闭不用的隧道

2. **切换传输模式**
   - WireGuard CPU 占用最低

3. **检查扩展**
   - 某些扩展可能消耗较多资源

---

## 网络问题

### Q: 公司网络无法使用？

**可能原因**：
- 防火墙阻止连接
- 代理服务器拦截
- 端口被封锁

**解决**：

1. **使用 HTTPS（443 端口）**
   - 通常不会被封锁

2. **配置代理**
   ```bash
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

3. **联系 IT 部门**
   - 申请开放 443 端口
   - 将 Edge 域名加入白名单

### Q: 移动网络不稳定？

**优化建议**：

1. **使用 Relay 模式**
   - P2P 在移动网络下成功率低

2. **启用自动重连**
   - YAT 默认启用

3. **使用 WireGuard**
   - 对移动网络优化好

### Q: IPv6 支持？

YAT 的 Edge 服务器可以通过 IPv6 访问，客户端也会自动检测 IPv6 连通性。

但 **WireGuard 网络当前仅支持 IPv4**：
- 网络 CIDR 分配仅支持 IPv4（如 `10.0.0.0/24`）
- LAN endpoint 采集（same-NAT 发现）仅处理 IPv4 地址
- Relay 转发不处理 IPv6 数据包

如果需求足够，未来版本可能会为 WireGuard 网络添加 IPv6 支持。

### Q: WireGuard relay 网络不通（peer 间无法通信）

**现象**：Edge 已上线，WireGuard 接口已创建，但 peer 之间 ping 不通

**快速排查**：

```bash
# 1. 确认 nftables 规则已安装
sudo nft list table ip yat_relay
# 期望看到 forward 链，counter 有计数

# 2. 确认 IP 转发已启用
cat /proc/sys/net/ipv4/ip_forward   # 应为 1

# 3. 确认 rp_filter 已关闭
cat /proc/sys/net/ipv4/conf/all/rp_filter   # 应为 0

# 4. 检查 Docker iptables 是否干扰
sudo iptables -L DOCKER-USER -v -n   # 检查是否有 DROP 策略
sudo iptables -V                      # 确认是 nft 还是 legacy
```

**常见原因**：
- `ip_forward` 未启用（Edge 会自动设置，但容器权限不足时可能失败）
- Docker 主机的 `DOCKER-USER` 链 DROP 策略拦截了转发包
- iptables-legacy 与 nftables 规则不兼容（两者使用独立内核路径）

::: tip 详细排查指南
参见 [Edge 管理文档 - 异常处理](./edge-management.md#异常处理)，包含 Docker iptables DROP 策略的完整诊断流程和解决方案。
:::

### Q: 虚拟机 guest 与同局域网 peer 单向通信（能发不能收）

**现象**：
运行在虚拟机 guest（KVM、VirtualBox、VMware）中的设备可以向同局域网 peer 发送数据，但收不到任何回包（`0 B received, N KiB sent`）。

**原因**：VM guest 同时有 bridge 和 NAT 模式的虚拟网卡。NAT 网卡导致 guest 的流量被 host 做 masquerading，产生非对称路由：

```
Peer → 发往 guest 的 LAN IP → 到达 guest ✓
Guest → 经 NAT 网卡回包 → 源 IP 变成 host IP → peer 不识别 → 丢包 ✗
```

**解决方案**：

#### 方案 1：确保 bridge 网卡为默认路由（推荐）

确保 guest 的默认网关走 **bridge** 网卡，而不是 NAT 网卡：

**Linux guest**：
```bash
# 查看当前路由
ip route

# bridge 网卡应该是默认路由
# 如果 NAT 网卡是默认路由，调整 metric：
sudo ip route change default via <bridge-gateway> dev <bridge-interface> metric 100
```

**Windows guest**：
1. 打开**网络连接**
2. 右键 bridge 适配器 → **属性** → **IPv4** → **高级**
3. 取消勾选"自动跃点"，设置较低值（如 10）
4. 对 NAT 适配器设置较高跃点值（如 100）

#### 方案 2：移除 NAT 模式网卡

如果不需要 NAT 网卡，从 VM 配置中删除：

**KVM/libvirt**：
```bash
virsh edit <vm-name>
# 删除 <interface type='network'> 且 <source network='default'/> 的块
```

#### 方案 3：使用 relay 模式

如果 VM 网络无法重新配置，将 WireGuard 网络切换为 `force` relay 模式。流量将通过 Edge relay 服务器转发，绕过局域网路由问题。

::: tip
observed endpoint 显示的是 **host 的 IP**（而非 guest 的 IP），这在 guest 使用 NAT 模式网络时是正常行为。host 执行 NAT masquerading，因此外部 peer 看到的是 host 的 IP。这是正常的，不是 bug。
:::

### Q: 为什么 same-NAT（同局域网）优先使用 LAN endpoint 而不是 observed 公网 endpoint？

当两个 peer 处于同一个 NAT 后（共享相同公网 IP），你可能会问：既然 observed 公网 endpoint 已经验证可用，为什么不直接用它？

**原因是 Hairpin NAT（NAT 回环）的支持不确定。**

如果 same-NAT 的 peer 使用 observed 公网 endpoint，流量路径会是：

```
设备 A (192.168.1.100) → 路由器 → 公网 → 路由器 → 设备 B (192.168.1.101)
```

这要求路由器支持 **Hairpin NAT** —— 即把来自 LAN 设备、目标为本路由器公网 IP 的流量，回环转发到 LAN 内的另一台设备。许多家用路由器：

- ❌ 完全不支持 Hairpin NAT
- ⚠️ 实现有 bug 或不稳定
- ⚠️ 仅对特定协议支持（不一定支持 UDP）

**YAT 的方案**：当检测到 same-NAT（两个 peer 共享相同的 observed 公网 IP）时，优先使用各 peer 上报的 LAN endpoint，实现局域网直连，不依赖路由器的 Hairpin NAT 能力：

```
设备 A (192.168.1.100) → 局域网直连 → 设备 B (192.168.1.101)
```

如果 LAN endpoint 不可用或无效，YAT 会自动回退到 observed 公网 endpoint，并且 WireGuard 内置的自愈机制（PersistentKeepalive 每 25 秒）可以在数秒内恢复 endpoint 问题。

---

## 高级问题

### Q: 如何自定义 Edge 配置？

编辑 Edge 配置文件：

```yaml
# config.yaml
server:
  port: 443
  tls:
    cert_file: certs/edge-tls.crt
    key_file: certs/edge-tls.key

captain:
  address: captain.myroxy.dev:443
  token: "your-token"

edge:
  name: "my-edge"
  data_dir: ./data
  
  # 高级配置
  max_channels: 100
  heartbeat_interval: 30
  reconnect_interval: 5
```

### Q: 如何调试隧道？

**启用调试日志**：

在客户端中设置日志级别为 DEBUG。

**查看日志**：
```bash
# macOS
tail -f ~/Library/Logs/YAT/main.log

# 过滤隧道相关日志
grep -i tunnel ~/Library/Logs/YAT/main.log
```

### Q: 数据备份策略？

**自动备份**（开发中）

**手动备份**：
```bash
# 备份配置
tar czf yat-backup-$(date +%Y%m%d).tar.gz \
  ~/Library/Application\ Support/YAT/

# 恢复配置
tar xzf yat-backup-20241210.tar.gz \
  -C ~/Library/Application\ Support/YAT/
```

### Q: 如何贡献代码？

1. Fork 仓库
2. 创建分支
3. 提交修改
4. 提交 Pull Request

详见：[CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 💡 通用排查步骤

### 1. 检查日志

日志是最有用的调试信息。

### 2. 重启服务

很多问题是临时的，重启可以解决。

### 3. 更新版本

确保使用最新版本。

### 4. 搜索 Issue

在 GitHub Issues 中搜索类似问题。

### 5. 提交 Issue

如果问题未解决，提交 Issue 并附带：
- 操作系统版本
- YAT 版本
- 错误日志
- 复现步骤
- 截图

---

## 📚 相关文档

- [快速开始](./quick-start.md) - 入门指南
- [隧道管理](./tunnel-management.md) - 隧道相关
- [Edge 管理](./edge-management.md) - Edge 相关
- [应用与扩展](./apps-and-extensions.md) - 扩展相关

---

## 💬 获取帮助

- **GitHub Issues**: [提交问题](https://github.com/tunnel6/yat/issues)
- **Discussions**: [社区讨论](https://github.com/tunnel6/yat/discussions)
- **Email**: support@tunnel6.com
---

*YAT Team - 让内网穿透更简单*
