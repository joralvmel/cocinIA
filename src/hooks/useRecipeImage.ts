import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { recipeService } from '@/services';
import type { AlertModalState } from './useRecipeDetail';

interface UseRecipeImageOptions {
  recipeId: string;
  reloadRecipe: () => Promise<void>;
  setAlertModal: (state: AlertModalState) => void;
}

/**
 * Encapsulates camera/gallery image picking, upload, and delete
 * for a single recipe.
 */
export function useRecipeImage({ recipeId, reloadRecipe, setAlertModal }: UseRecipeImageOptions) {
  const { t } = useTranslation();

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // ---- Upload helper ----
  const uploadImage = useCallback(
    async (uri: string) => {
      try {
        setIsUploadingImage(true);
        await recipeService.uploadRecipeImage(recipeId, uri);
        await reloadRecipe();
      } catch (error) {
        console.error('Error uploading image:', error);
        setAlertModal({
          visible: true,
          title: String(t('common.error')),
          message: String(t('recipes.detail.uploadError' as any)),
          variant: 'danger',
        });
      } finally {
        setIsUploadingImage(false);
      }
    },
    [recipeId, reloadRecipe, setAlertModal, t],
  );

  // ---- Camera ----
  const launchCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setAlertModal({
        visible: true,
        title: String(t('common.error')),
        message: String(t('recipes.detail.cameraPermissionDenied' as any)),
        variant: 'warning',
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  }, [setAlertModal, t, uploadImage]);

  const handleCameraPress = useCallback(async () => {
    setShowPhotoOptions(false);
    // Check if permission is already granted — skip pre-dialog
    const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
    if (existingStatus === 'granted') {
      launchCamera();
      return;
    }
    // Show pre-permission rationale dialog
    setAlertModal({
      visible: true,
      title: String(t('recipes.detail.cameraPermissionTitle' as any)),
      message: String(t('recipes.detail.cameraPermissionMessage' as any)),
      variant: 'info',
      confirmLabel: String(t('common.allow')),
      onConfirm: launchCamera,
    });
  }, [setAlertModal, t, launchCamera]);

  // ---- Gallery ----
  const launchGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setAlertModal({
        visible: true,
        title: String(t('common.error')),
        message: String(t('recipes.detail.permissionDenied' as any)),
        variant: 'warning',
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  }, [setAlertModal, t, uploadImage]);

  const handleGalleryPress = useCallback(async () => {
    setShowPhotoOptions(false);
    // Check if permission is already granted — skip pre-dialog
    const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (existingStatus === 'granted') {
      launchGallery();
      return;
    }
    // Show pre-permission rationale dialog
    setAlertModal({
      visible: true,
      title: String(t('recipes.detail.galleryPermissionTitle' as any)),
      message: String(t('recipes.detail.galleryPermissionMessage' as any)),
      variant: 'info',
      confirmLabel: String(t('common.allow')),
      onConfirm: launchGallery,
    });
  }, [setAlertModal, t, launchGallery]);

  // ---- Delete image ----
  const handleDeleteImage = useCallback(() => {
    setAlertModal({
      visible: true,
      title: String(t('recipes.detail.deletePhotoTitle' as any)),
      message: String(t('recipes.detail.deletePhotoConfirm' as any)),
      variant: 'danger',
      onConfirm: async () => {
        try {
          setIsUploadingImage(true);
          await recipeService.deleteRecipeImage(recipeId);
          await reloadRecipe();
        } catch (error) {
          console.error('Error deleting image:', error);
          setAlertModal({
            visible: true,
            title: String(t('common.error')),
            message: String(t('recipes.detail.deletePhotoError' as any)),
            variant: 'danger',
          });
        } finally {
          setIsUploadingImage(false);
        }
      },
    });
  }, [recipeId, reloadRecipe, setAlertModal, t]);

  const handlePickImage = useCallback(() => {
    setShowPhotoOptions(true);
  }, []);

  return {
    isUploadingImage,
    showPhotoOptions,
    setShowPhotoOptions,
    handlePickImage,
    handleCameraPress,
    handleGalleryPress,
    handleDeleteImage,
  };
}

