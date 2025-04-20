import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px; /* Limit maximum width for larger screens */
  height: 300px;
  background-color: #f2f2f2;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    height: 250px; /* Adjust height for smaller screens */
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CardContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${CardContainer}:hover & {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1; /* Show content on touch devices */
    background-color: rgba(0, 0, 0, 0.8); /* Darker background for better readability */
  }
`;

const CardTitle = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  padding: 0 10px; /* Add padding for better text wrapping */
`;

const CardDescription = styled.a`
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.4;
  color: white;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #ddd;
  }
`;

interface CardProps {
  imageUrl: string;
  title: string;
  description: string;
  link: string;
}

const Card: React.FC<CardProps> = ({ imageUrl, title, description, link }) => {
  return (
    <CardContainer>
      <CardImage src={imageUrl} alt={title} />
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription href={link} target="_blank" rel="noopener noreferrer">
          {description}
        </CardDescription>
      </CardContent>
    </CardContainer>
  );
};

export default Card;