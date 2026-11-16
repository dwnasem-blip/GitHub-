import React, { useState } from 'react';
import { View, ViewProps, Pressable, FlatList, StyleSheet, ViewStyle, Modal, Dimensions } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { Text } from '../typography/Text';
import { mergeStyles } from '@/utils/styleUtils';

export interface SelectOption { label: string; value: string | number; }

export interface FormSelectProps extends Omit<ViewProps, 'style'> {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  onSelect: (value: string | number) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  rtl?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing[3] },
  label: { marginBottom: theme.spacing[1] },
  selectWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: theme.radius.md, paddingVertical: theme.spacing[3], paddingHorizontal: theme.spacing[3], minHeight: 48, justifyContent: 'space-between' },
  selectText: { flex: 1 },
  errorText: { marginTop: theme.spacing[1] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.semantic.background.primary, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg, maxHeight: Dimensions.get('window').height * 0.7 },
  modalHeader: { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3], borderBottomWidth: 1, borderBottomColor: theme.colors.semantic.border.light },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3], borderBottomWidth: 1, borderBottomColor: theme.colors.semantic.border.light },
});

export const FormSelect = React.forwardRef<View, FormSelectProps>(
  ({ label, options, value, onSelect, error, helperText, placeholder = 'Select an option', rtl = false, containerStyle, required = false, disabled = false, style, ...props }, ref) => {
    const { theme: themeObj } = useTheme();
    const [showModal, setShowModal] = useState(false);
    const selectedOption = options.find((opt) => opt.value === value);
    const selectWrapperStyle = mergeStyles(styles.selectWrapper, { backgroundColor: themeObj.colors.semantic.background.tertiary, borderColor: error ? themeObj.colors.status.error : themeObj.colors.semantic.border.light, opacity: disabled ? 0.6 : 1, flexDirection: rtl ? 'row-reverse' : 'row' }, style) as ViewStyle;
    const handleSelectOption = (optionValue: string | number) => { onSelect(optionValue); setShowModal(false); };
    return (
      <View style={[styles.container, containerStyle]} ref={ref} {...props}>
        {label && (<Text style={styles.label} size="sm" weight="semibold" color="primary" rtl={rtl}>{label}{required && <Text size="sm" weight="semibold" customColor={themeObj.colors.status.error}> *</Text>}</Text>)}
        <Pressable style={selectWrapperStyle} onPress={() => !disabled && setShowModal(true)} disabled={disabled}>
          <Text style={styles.selectText} size="base" color={selectedOption ? 'primary' : 'tertiary'} align={rtl ? 'right' : 'left'} rtl={rtl}>{selectedOption ? selectedOption.label : placeholder}</Text>
          <Text color="secondary" size="lg">{rtl ? '◀' : '▶'}</Text>
        </Pressable>
        {error && (<Text style={styles.errorText} size="xs" color="error" align={rtl ? 'right' : 'left'} rtl={rtl}>{error}</Text>)}
        {helperText && !error && (<Text style={styles.errorText} size="xs" color="tertiary" align={rtl ? 'right' : 'left'} rtl={rtl}>{helperText}</Text>)}
        <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text size="lg" weight="bold" color="primary" align={rtl ? 'right' : 'left'} rtl={rtl}>{label || 'Select'}</Text>
              </View>
              <FlatList data={options} keyExtractor={(item) => String(item.value)} scrollEnabled renderItem={({ item }) => (
                <Pressable style={styles.optionItem} onPress={() => handleSelectOption(item.value)}>
                  {selectedOption?.value === item.value && (<Text color="accent" weight="bold" style={{ marginRight: themeObj.spacing[2] }}>✓</Text>)}
                  <Text size="base" color={selectedOption?.value === item.value ? 'accent' : 'primary'} weight={selectedOption?.value === item.value ? 'semibold' : 'normal'} flex={1}>{item.label}</Text>
                </Pressable>
              )} />
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }
);
FormSelect.displayName = 'FormSelect';
