/**
 * @jest-environment jsdom
 */
import React, { Component } from 'react';
import { mount } from 'enzyme';
import ErrorBoundary from 'app/App/ErrorHandling/ErrorBoundary';
import { ErrorFallback } from 'app/App/ErrorHandling/ErrorFallback';

describe('ErrorBoundary', () => {
  class ComponentWithError extends Component {
    render() {
      return (
        <div>
          <span>content</span>
        </div>
      );
    }
  }
  const component = mount(
    <ErrorBoundary>
      <ComponentWithError />
    </ErrorBoundary>
  );

  it('should show the nested children if no errors', () => {
    expect(component.text()).toContain('content');
  });

  it('should show a fallback component when a nested component fails', () => {
    const error = new Error('error at rendering');
    component.find(ComponentWithError).simulateError(error);
    expect(component.text()).not.toContain('content');
    const errorProps = component
      .find(ErrorFallback)
      .at(0)
      .props();
    expect(errorProps.error.message).toEqual('error at rendering');
    expect(errorProps.errorInfo?.componentStack).toEqual(
      expect.stringContaining('ComponentWithError')
    );
  });
});
