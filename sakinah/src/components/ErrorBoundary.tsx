import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { Text } from './typography/Text';
import { Button } from './Button';
import { Card } from './Card';
import { Heading } from './typography/Heading';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing[4],
    justifyContent: 'center',
  },
  card: {
    marginBottom: theme.spacing[4],
  },
  message: {
    marginBottom: theme.spacing[3],
  },
  stack: {
    marginTop: theme.spacing[3],
  },
});

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <ScrollView style={styles.container}>
          <Card padding={4} shadow="lg" radius="lg">
            <Heading
              level={2}
              color="primary"
              align="center"
              style={styles.message}
            >
              Oops! Something went wrong
            </Heading>

            <Text
              color="secondary"
              size="sm"
              align="center"
              style={styles.message}
            >
              We encountered an unexpected error. Please try again.
            </Text>

            {process.env.NODE_ENV === 'development' && (
              <View style={styles.stack}>
                <Heading level={6} color="error">
                  Error Details:
                </Heading>
                <Text
                  size="xs"
                  color="tertiary"
                  style={{ fontFamily: 'Courier New' }}
                >
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <Button
              label="Try Again"
              onPress={this.handleRetry}
              variant="primary"
              size="md"
              style={{ marginTop: theme.spacing[4] }}
            />
          </Card>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.displayName = 'ErrorBoundary';
