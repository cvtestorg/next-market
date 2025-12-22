package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SavePluginConfig 保存插件配置
func (h *PluginHandler) SavePluginConfig(c *gin.Context) {
	pluginID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "Invalid plugin ID",
		})
		return
	}

	versionID, err := strconv.ParseUint(c.Query("version_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "Invalid version ID",
		})
		return
	}

	var configValues map[string]interface{}
	if err := c.ShouldBindJSON(&configValues); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: fmt.Sprintf("Invalid request body: %v", err),
		})
		return
	}

	if err := h.pluginService.SavePluginConfig(c.Request.Context(), uint(pluginID), uint(versionID), configValues); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "Configuration saved successfully",
	})
}

