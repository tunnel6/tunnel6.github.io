# 🌐 连接问题排查指南

> 如果遇到连接问题，请检查网络状态、防火墙设置以及 Edge 节点的运行状态。

## 🔍 常见连接问题诊断

### Edge 节点连接失败
- **现象**: 控制台显示 "Edge Offline" 或 "Connection Failed"
- **可能原因**:
  - Edge 节点未启动或已崩溃
  - 网络连接中断
  - 防火墙阻止了必要的端口
  - DNS 解析失败

### 隧道连接不稳定
- **现象**: 连接时断时续，延迟高
- **可能原因**:
  - 网络带宽不足
  - Edge 节点资源不足（CPU/内存）
  - 传输模式选择不当（P2P vs Relay）
  - 网络 NAT 类型复杂

## 🛠️ 排查步骤

### 步骤 1: 检查 Edge 节点状态
```bash
# 检查 Edge 进程
ps aux | grep yat-edge

# 检查端口监听
lsof -i :8080  # 或其他配置的端口

# 查看日志
tail -f /path/to/edge/logs/app.log
```

### 步骤 2: 测试网络连通性
```bash
# 测试到 Edge 的连通性
ping your-edge-domain.com

# 测试端口连通性
telnet your-edge-domain.com 8080
# 或使用 nc
nc -zv your-edge-domain.com 8080
```

### 步骤 3: 检查防火墙设置
- 确保 Edge 节点的端口在防火墙中开放
- 检查云服务商安全组设置
- 检查本地防火墙规则

## 📊 连接状态监控

YAT 提供以下连接状态指标：
- **连接状态**: Online/Offline/Connecting
- **延迟**: RTT (Round-Trip Time)
- **丢包率**: Packet loss percentage
- **带宽使用**: Current bandwidth usage

## 🚨 常见解决方案

### 方案 1: 切换传输模式
如果 P2P 连接失败，尝试切换到 Relay 模式：
1. 在隧道设置中选择 "Relay Mode"
2. 保存配置
3. 重新启动隧道

### 方案 2: 调整 Edge 配置
优化 Edge 节点性能：
```yaml
# config.yaml
performance:
  max_connections: 1000
  bandwidth_limit: 100mbps
  keep_alive: 30s
```

## 📚 相关资源
- [Edge 管理](./edge-management.md)
- [传输模式](./transport-modes.md)
- [隧道管理](./tunnel-management.md)

---
*文档最后更新: 2026-05-04*
