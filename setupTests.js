// src/setupTests.js
import '@testing-library/jest-dom';

if (typeof window !== 'undefined') {
  // JSDOM doesn't implement PointerEvent
  class MockPointerEvent extends Event {
    constructor(type, props) {
      super(type, props);
      this.pointerType = props.pointerType || 'mouse';
    }
  }
  window.PointerEvent = MockPointerEvent;
  
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };

  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Needed for React testing-library
global.IS_REACT_ACT_ENVIRONMENT = true;