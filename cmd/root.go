package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var (
	// 版本信息
	Version   = "dev"
	BuildTime = "unknown"
	GitCommit = "unknown"
)

// rootCmd 代表基础命令
var rootCmd = &cobra.Command{
	Use:   "next-market",
	Short: "Next Market - Enterprise Plugin Distribution Platform",
	Long: `Next Market is an enterprise plugin distribution platform
that provides plugin management, version control, and authorization.`,
	Version: fmt.Sprintf("%s (built at %s, commit %s)", Version, BuildTime, GitCommit),
}

// Execute 执行根命令
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	// 设置版本模板
	rootCmd.SetVersionTemplate(`{{with .Name}}{{printf "%s " .}}{{end}}{{printf "version %s" .Version}}
`)
}

