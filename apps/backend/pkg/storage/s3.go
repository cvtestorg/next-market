package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"path/filepath"

	"github.com/cvtestorg/next-market/backend/internal/config"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// S3Storage S3存储服务
type S3Storage struct {
	client     *minio.Client
	bucketName string
}

// NewS3Storage 创建S3存储实例
func NewS3Storage(cfg *config.S3Config) (*S3Storage, error) {
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	storage := &S3Storage{
		client:     client,
		bucketName: cfg.BucketName,
	}

	// 确保存储桶存在
	if err := storage.ensureBucket(context.Background()); err != nil {
		return nil, err
	}

	return storage, nil
}

// ensureBucket 确保存储桶存在
func (s *S3Storage) ensureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucketName)
	if err != nil {
		return fmt.Errorf("failed to check bucket: %w", err)
	}

	if !exists {
		err = s.client.MakeBucket(ctx, s.bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("failed to create bucket: %w", err)
		}
	}

	return nil
}

// UploadPlugin 上传插件包
func (s *S3Storage) UploadPlugin(ctx context.Context, pluginName, version string, data []byte) (string, error) {
	objectName := fmt.Sprintf("plugins/%s/%s/%s-%s.tgz", pluginName, version, pluginName, version)
	
	reader := bytes.NewReader(data)
	_, err := s.client.PutObject(ctx, s.bucketName, objectName, reader, int64(len(data)), minio.PutObjectOptions{
		ContentType: "application/gzip",
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload plugin: %w", err)
	}

	return objectName, nil
}

// UploadIcon 上传图标文件
func (s *S3Storage) UploadIcon(ctx context.Context, pluginName string, data []byte, ext string) (string, error) {
	objectName := fmt.Sprintf("icons/%s%s", pluginName, ext)
	
	contentType := "image/png"
	if ext == ".jpg" || ext == ".jpeg" {
		contentType = "image/jpeg"
	} else if ext == ".svg" {
		contentType = "image/svg+xml"
	}
	
	reader := bytes.NewReader(data)
	_, err := s.client.PutObject(ctx, s.bucketName, objectName, reader, int64(len(data)), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload icon: %w", err)
	}

	return objectName, nil
}

// DeleteObject 删除对象
func (s *S3Storage) DeleteObject(ctx context.Context, objectName string) error {
	err := s.client.RemoveObject(ctx, s.bucketName, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete object: %w", err)
	}
	return nil
}

// GetDownloadURL 获取下载URL
func (s *S3Storage) GetDownloadURL(ctx context.Context, objectName string) (string, error) {
	// 生成预签名URL（24小时有效）
	url, err := s.client.PresignedGetObject(ctx, s.bucketName, objectName, 3600*24, nil)
	if err != nil {
		return "", fmt.Errorf("failed to generate download URL: %w", err)
	}
	return url.String(), nil
}

// GetObject 获取对象内容
func (s *S3Storage) GetObject(ctx context.Context, objectName string) ([]byte, error) {
	object, err := s.client.GetObject(ctx, s.bucketName, objectName, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get object: %w", err)
	}
	defer object.Close()

	data, err := io.ReadAll(object)
	if err != nil {
		return nil, fmt.Errorf("failed to read object: %w", err)
	}

	return data, nil
}

// GetIconURL 获取图标的公开URL
func (s *S3Storage) GetIconURL(objectName string) string {
	// 在实际生产环境中，应该配置为CDN URL或公开的S3 URL
	return fmt.Sprintf("/api/v1/files/%s", filepath.Base(objectName))
}
