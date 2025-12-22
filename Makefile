.PHONY: clean personal enterprise

# 获取 Makefile 所在目录（项目根目录）
ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

# 清理所有 pack 脚本构建出的 tar 包
# 可以从项目根目录运行: make clean
# 也可以从子目录运行: make -C ../.. clean
clean:
	@echo "Cleaning up .tgz files..."
	@find $(ROOT_DIR)/examples -name "*.tgz" -type f -delete
	@echo "Done! All .tgz files have been removed."

# 打包个人插件
personal:
	@echo "📦 打包个人插件..."
	@cd $(ROOT_DIR)/examples/personal-plugin && \
		if [ -f "pack.sh" ]; then \
			chmod +x pack.sh && ./pack.sh; \
		else \
			npm pack; \
		fi

# 打包企业级插件
enterprise:
	@echo "📦 打包企业级插件..."
	@cd $(ROOT_DIR)/examples/enterprise-plugin && \
		if [ -f "pack.sh" ]; then \
			chmod +x pack.sh && ./pack.sh; \
		else \
			npm pack; \
		fi

