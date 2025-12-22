package handlers

import (
	"io"
	"net/http"
	"strconv"

	"github.com/cvtestorg/next-market/internal/services"
	"github.com/gin-gonic/gin"
)

// PluginHandler 插件处理器
type PluginHandler struct {
	pluginService *services.PluginService
}

// NewPluginHandler 创建插件处理器
func NewPluginHandler(pluginService *services.PluginService) *PluginHandler {
	return &PluginHandler{
		pluginService: pluginService,
	}
}

// Response 统一响应格式
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// UploadPlugin 上传插件
func (h *PluginHandler) UploadPlugin(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "No file uploaded",
		})
		return
	}

	// 读取文件内容
	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "Failed to open file",
		})
		return
	}
	defer f.Close()

	fileData, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "Failed to read file",
		})
		return
	}

	// 重新打开文件用于解析
	f2, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "Failed to reopen file for parsing",
		})
		return
	}
	defer f2.Close()

	// TODO: 从认证中间件获取 publisherID
	// 当前使用硬编码的 publisherID，需要确保数据库中存在 ID 为 1 的组织
	publisherID := uint(1)

	plugin, err := h.pluginService.UploadPlugin(c.Request.Context(), f2, fileData, publisherID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "Plugin uploaded successfully",
		Data:    plugin,
	})
}

// ListPlugins 列出插件
func (h *PluginHandler) ListPlugins(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	pluginType := c.Query("type")

	plugins, total, err := h.pluginService.ListPlugins(c.Request.Context(), page, pageSize, pluginType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "Success",
		Data: gin.H{
			"items": plugins,
			"total": total,
			"page":  page,
			"pageSize": pageSize,
		},
	})
}

// GetPlugin 获取插件详情
func (h *PluginHandler) GetPlugin(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "Invalid plugin ID",
		})
		return
	}

	plugin, err := h.pluginService.GetPlugin(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, Response{
			Code:    404,
			Message: "Plugin not found",
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "Success",
		Data:    plugin,
	})
}

// GetPluginByName 根据包名获取插件
func (h *PluginHandler) GetPluginByName(c *gin.Context) {
	name := c.Param("name")

	plugin, err := h.pluginService.GetPluginByName(c.Request.Context(), name)
	if err != nil {
		c.JSON(http.StatusNotFound, Response{
			Code:    404,
			Message: "Plugin not found",
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "Success",
		Data:    plugin,
	})
}

// SearchPlugins 搜索插件
func (h *PluginHandler) SearchPlugins(c *gin.Context) {
	keyword := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	if keyword == "" {
		c.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "Search keyword is required",
		})
		return
	}

	plugins, total, err := h.pluginService.SearchPlugins(c.Request.Context(), keyword, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "Success",
		Data: gin.H{
			"items": plugins,
			"total": total,
			"page":  page,
			"pageSize": pageSize,
		},
	})
}
