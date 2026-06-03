<h1 align="center">daev2</h1>
<p align="center">
  <b>LuCI support for DAE v2 - 基于 eBPF 的高性能透明代理</b>
</p>

> **Note**: 这是一个独立的社区维护仓库，基于 dae **v2.0.0rc1** 开发。
> 原仓库 [sbwml/luci-app-dae](https://github.com/sbwml/luci-app-dae) 已归档。

-----------

## 版本信息

| 组件 | 版本 | 说明 |
|------|------|------|
| dae core | **v2.0.0rc1** | 基于 eBPF 的核心代理引擎 |
| geo data | v2ray-geodata | 地理位置和域名数据 |

### 版本切换

在 `dae/Makefile` 中修改即可切换版本：

- **v2.0.0rc1**（当前默认）- Set `PKG_VERSION:=2.0.0rc1`
- **v1.1.0**（稳定版）- Set `PKG_VERSION:=1.1.0`

-----------

## 构建说明

### 1. 获取源码

```bash
git clone https://github.com/itoywh/daev2 package/dae
git clone https://github.com/sbwml/v2ray-geodata package/v2ray-geodata
```

### 2. 安装编译工具

```bash
apt-get update
apt-get install -y clang-13
```

### 3. 配置 OpenWrt 内核选项

在 `.config` 中启用 eBPF 支持：

```
CONFIG_DEVEL=y
CONFIG_BPF_TOOLCHAIN_HOST=y
# CONFIG_BPF_TOOLCHAIN_NONE is not set
CONFIG_KERNEL_BPF_EVENTS=y
CONFIG_KERNEL_CGROUP_BPF=y
CONFIG_KERNEL_DEBUG_INFO=y
CONFIG_KERNEL_DEBUG_INFO_BTF=y
# CONFIG_KERNEL_DEBUG_INFO_REDUCED is not set
CONFIG_KERNEL_XDP_SOCKETS=y
```

### 4. 应用 cgroupfs v2 补丁

```bash
# 修复 unmount hierarchical mount
pushd feeds/packages
    curl -s https://raw.githubusercontent.com/itoywh/daev2/main/.cgroupfs/cgroupfs-mount.init.patch | patch -p1
popd
# cgroupfs v2
mkdir -p feeds/packages/utils/cgroupfs-mount/patches
curl -s https://raw.githubusercontent.com/itoywh/daev2/main/.cgroupfs/900-add-cgroupfs2.patch > feeds/packages/utils/cgroupfs-mount/patches/900-add-cgroupfs2.patch
```

### 5. 编译

```bash
make menuconfig  # 选择 LUCI -> Applications -> luci-app-dae
make package/dae/luci-app-dae/compile V=s
```

-----------

## 致谢

- [daeuniverse/dae](https://github.com/daeuniverse/dae) - dae 核心项目
- [sbwml/luci-app-dae](https://github.com/sbwml/luci-app-dae) - 原始 LuCI 界面参考
