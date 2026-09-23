# Edge 常见问题

> Edge 服务器部署和运行中的常见问题解答

---

## 📋 目录

- [连接与状态](#连接与状态)
- [日志与监控](#日志与监控)
- [配置与部署](#配置与部署)
- [系统与性能](#系统与性能)

---

## 连接与状态

### Q: Edge 显示离线怎么办？

**检查清单**：
1. 服务器是否正常运行
2. 防火墙是否开放 443 端口
3. Edge 进程是否运行
4. 网络连接是否正常

**解决步骤**：

```bash
# 1. 检查 Edge 进程
ps aux | grep edge

# 2. 检查端口
netstat -tlnp | grep 443

# 3. 查看日志
journalctl -u edge -n 100

# 4. 重启服务
sudo systemctl restart edge
```

### Q: Edge 可以更换 IP 吗？

可以，但需要：
1. 更新 DNS 记录
2. 重新生成证书
3. 重启 Edge

---

## 日志与监控

### Q: 如何查看 Edge 日志？

```bash
# systemd 方式
sudo journalctl -u edge -f

# 直接查看日志文件
tail -f /var/log/edge.log
```

---

## 配置与部署

### Q: 一个账号可以创建多少个 Edge？

目前没有限制，但建议：
- 个人用户：1-3 个 Edge
- 团队用户：5-10 个 Edge

---

## 系统与性能

### Q: Edge 服务器的性能要求？

**最低配置**：
- CPU: 1 核
- 内存: 512MB
- 带宽: 1Mbps
- 存储: 1GB

**推荐配置**：
- CPU: 2 核
- 内存: 1GB
- 带宽: 10Mbps
- 存储: 5GB

### Q: Edge 支持哪些操作系统？

- ✅ Ubuntu 18.04+
- ✅ CentOS 7+
- ✅ Debian 9+
- ✅ macOS（开发测试）
- ❌ Windows（暂不支持）

---

## 🔗 相关文档

- [Edge 服务器管理](./management.md) - 部署和管理 Edge
- [启动参数参考](./startup-params.md) - 完整命令行参数列表
- [配置参数参考](./config-reference.md) - YAML 配置文件完整参考
- [常见问题](./faq.md) - 全局常见问题

---

*YAT Team - 让内网穿透更简单*
