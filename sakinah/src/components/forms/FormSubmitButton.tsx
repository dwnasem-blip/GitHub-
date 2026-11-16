import React from 'react';
import { Button, ButtonProps } from '../Button';

export interface FormSubmitButtonProps extends Omit<ButtonProps, 'label' | 'onPress'> {
  label?: string;
  onPress: () => void | Promise<void>;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export const FormSubmitButton = React.forwardRef<any, FormSubmitButtonProps>(
  ({ label = 'Submit', onPress, isLoading = false, isDisabled = false, disabled, loading, ...rest }, ref) => {
    const handlePress = async () => {
      try {
        await onPress();
      } catch (error) {
        console.error('Form submission error:', error);
      }
    };
    return <Button ref={ref} label={label} onPress={handlePress} loading={isLoading || loading} disabled={isDisabled || disabled} variant="primary" size="md" fullWidth {...rest} />;
  }
);
FormSubmitButton.displayName = 'FormSubmitButton';
