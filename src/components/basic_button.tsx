'use client';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

type ButtonProps = {
  onClick?: (e: React.MouseEvent) => void;
  label: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'flat' | 'bordered' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  width?: string;
  type?: 'button' | 'submit' | 'reset';
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  label,
  className,
  disabled = false,
  variant = 'bordered',
  size = 'md',
  width = 'auto',
  type = 'button'
}) => {
  return (
    <StyledButton
      type={type}
      className={`${className} ${variant} ${size}`}
      onClick={onClick}
      disabled={disabled}
      style={{ width }}
    >
      <span className="label">{label}</span>
    </StyledButton>
  );
};

const StyledButton = styled.button`
  /* Base Styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;
  overflow: hidden;
  background: transparent;
  border: none;
  font-family: inherit;
  min-width: 160px;
  
  .label {
    position: relative;
    z-index: 2;
    transition: all 0.2s ease;
    font-weight: 600;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  /* Size Variants */
  &.sm {
    font-size: 0.9375rem;
    padding: 0.625rem 1.5rem;
  }
  
  &.md {
    font-size: 1.0625rem;
    padding: 0.75rem 2rem;
  }
  
  &.lg {
    font-size: 1.25rem;
    padding: 0.875rem 2.25rem;
  }

  /* Flat Variant */
  &.flat {
    background: #000;
    color: #fff;
    border-radius: 0.75rem;
    font-weight: 600;
    
    &:hover:not(:disabled) {
      background: #333;
    }
    
    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }

  &.bordered {
    border: 2px solid #000;
    border-radius: 0.75rem;
    color: #000;
    background: #fff;
    font-weight: 600;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.3s ease;
      z-index: 1;
      border-radius: 0.5rem;
    }
    
    &:hover:not(:disabled) {
      color: #fff;
      
      &::before {
        transform: scaleX(1);
        transform-origin: left;
      }
    }
    
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &.minimal {
    color: #000;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    padding: 0.125rem 0;
    margin: 0 0.25rem;
    font-weight: 600;
    min-width: auto;
    
    &:hover:not(:disabled) {
      border-bottom-color: #000;
    }
    
    &:active:not(:disabled) {
      opacity: 0.8;
    }
  }

  &:disabled {
    cursor: not-allowed;
    
    &.flat {
      background: #e0e0e0;
      color: #a0a0a0;
    }
    
    &.bordered {
      border-color: #e0e0e0;
      color: #a0a0a0;
      
      &::before {
        display: none;
      }
    }
    
    &.minimal {
      color: #e0e0e0;
      border-bottom-color: transparent;
    }
  }
`;

export default Button;