# 📜 证书管理指南

> 证书是保证通信安全的关键。定期检查证书有效期，确保证书及时更新，避免服务中断。

## 🔐 YAT 证书体系概述

YAT 使用 mTLS（双向 TLS）认证确保所有通信安全：
- **Root CA 证书**: 用于签发所有其他证书的根证书
- **Edge TLS 证书**: Edge 节点的 TLS 证书，用于 HTTPS 访问
- **gRPC 证书**: 用于 gRPC 服务间的安全通信
- **客户端证书**: 用于客户端身份验证

## 📅 证书生命周期管理

### 自动证书管理
YAT 支持自动证书签发和续期：
- **Let's Encrypt**: 自动申请免费 SSL/TLS 证书
- **自动续期**: 证书到期前 30 天自动续期
- **状态监控**: 实时监控证书有效期

### 手动证书管理
当需要手动管理证书时：
```bash
# 查看证书信息
./yat-edge certs info --config config.yaml

# 手动续期证书
./yat-edge certs renew --config config.yaml

# 重新生成证书
./yat-edge certs generate --config config.yaml
```

## 🚨 常见证书问题

### 证书过期
- **现象**: 浏览器显示 "您的连接不是私密连接" 或 "NET::ERR_CERT_DATE_INVALID"
- **解决方案**: 
  - 等待自动续期（通常在到期前 30 天）
  - 手动执行 `./yat-edge certs renew`
  - 检查系统时间是否正确

### 证书不匹配
- **现象**: "NET::ERR_CERT_COMMON_NAME_INVALID"
- **解决方案**: 
  - 确认证书域名与访问域名完全匹配
  - 检查 CNAME 记录是否正确指向 Edge 节点
  - 重新生成证书并指定正确的域名

## 🛠️ 证书配置最佳实践

- **域名配置**: 确保证书包含所有需要访问的域名（主域名 + www 子域名）
- **密钥安全**: 私钥文件应设置适当的文件权限（600）
- **备份策略**: 定期备份证书和私钥文件
- **监控告警**: 设置证书到期前 7 天告警

## 📚 相关资源
- [Edge 管理](./edge-management.md)
- [自定义域名](./custom-domains.md)
- [FAQ - 证书相关问题](./faq.md#q-edge-certificate-expired)

---
*文档最后更新: 2026-05-04*
