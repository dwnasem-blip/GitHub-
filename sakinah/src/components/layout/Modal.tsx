import React from 'react';
import {
  Modal as RNModal,
  ModalProps as RNModalProps,
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { mergeStyles } from '@/utils/styleUtils';
import { Button } from '../Button';
import { Heading } from '../typography/Heading';

export interface ModalProps extends Omit<RNModalProps, 'style'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  rtl?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  container: {
    backgroundColor: theme.colors.semantic.background.primary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.semantic.border.light,
  },
  content: {
    padding: theme.spacing[4],
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
  button: {
    flex: 1,
  },
});

const getSizeStyles = (size: 'sm' | 'md' | 'lg'): ViewStyle => {
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = size === 'sm' ? 300 : size === 'md' ? 450 : 600;

  return {
    maxWidth: Math.min(maxWidth, screenWidth - theme.spacing[4] * 2),
    width: '100%',
  };
};

export const Modal = React.forwardRef<View, ModalProps>(
  (
    {
      visible,
      onClose,
      title,
      subtitle,
      children,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      size = 'md',
      dismissible = true,
      rtl = false,
      style,
      ...props
    },
    ref
  ) => {
    const { theme: themeObj } = useTheme();

    const handleDismiss = () => {
      if (dismissible) {
        onClose();
      }
    };

    const handleConfirm = () => {
      if (onConfirm) {
        onConfirm();
      }
      onClose();
    };

    const handleCancel = () => {
      if (onCancel) {
        onCancel();
      }
      onClose();
    };

    const containerStyle = mergeStyles(
      styles.container,
      getSizeStyles(size),
      style
    ) as ViewStyle;

    return (
      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
        {...props}
      >
        <Pressable
          style={styles.overlay}
          onPress={handleDismiss}
          disabled={!dismissible}
        >
          <Pressable
            style={containerStyle}
            onPress={(e) => e.stopPropagation()}
          >
            {(title || subtitle) && (
              <View style={styles.header}>
                {title && (
                  <Heading
                    level={3}
                    color="primary"
                    align={rtl ? 'right' : 'left'}
                    rtl={rtl}
                  >
                    {title}
                  </Heading>
                )}
                {subtitle && (
                  <Heading
                    level={6}
                    color="secondary"
                    align={rtl ? 'right' : 'left'}
                    rtl={rtl}
                    style={{ marginTop: theme.spacing[1] }}
                  >
                    {subtitle}
                  </Heading>
                )}
              </View>
            )}

            {children && (
              <View style={styles.content}>
                {children}
              </View>
            )}

            {(confirmText || cancelText) && (
              <View
                style={[
                  styles.footer,
                  { flexDirection: rtl ? 'row-reverse' : 'row' },
                ]}
              >
                {cancelText && (
                  <Button
                    label={cancelText}
                    onPress={handleCancel}
                    variant="outline"
                    size="md"
                    style={styles.button}
                  />
                )}
                {confirmText && (
                  <Button
                    label={confirmText}
                    onPress={handleConfirm}
                    variant="primary"
                    size="md"
                    style={styles.button}
                  />
                )}
              </View>
            )}
          </Pressable>
        </Pressable>
      </RNModal>
    );
  }
);

Modal.displayName = 'Modal';
