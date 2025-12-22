package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// DeletePlugin 删除插件
func (h *PluginHandler) DeletePlugin(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "Invalid plugin ID",
		})
		return
	}

	if err := h.pluginService.DeletePlugin(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "Plugin deleted successfully",
	})
}

