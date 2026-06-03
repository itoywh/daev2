# Copyright (C) 2016-2024 OpenWrt.org
# Copyright (C) 2026 itoywh
#
# This is free software, licensed under the Apache License, Version 2.0 .

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-dae
PKG_VERSION:=2.0.0
PKG_RELEASE:=1

LUCI_TITLE:=LuCI support for DAE (JavaScript UI)
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+dae +dae-geoip +dae-geosite +rpcd-mod-file +rpcd-mod-luci2

include $(TOPDIR)/feeds/luci/luci.mk

# Install JS views and RPC helper
define Package/luci-app-dae/install
	# Install RPAC helper script
	$(INSTALL_DIR) $(1)/usr/libexec/rpcd
	$(INSTALL_BIN) ./usr/libexec/rpcd/dae $(1)/usr/libexec/rpcd/dae

	# JS views are auto-installed via luci.mk template (htdocs/luci-static/resources/view/)

	# Install menu configuration
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./usr/share/luci/menu.d/luci-app-dae.json $(1)/usr/share/luci/menu.d/luci-app-dae.json
endef

# call BuildPackage - OpenWrt buildroot signature
$(eval $(call BuildPackage,luci-app-dae))
