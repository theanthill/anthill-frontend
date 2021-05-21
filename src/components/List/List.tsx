
import React from 'react';
import styled from 'styled-components';
import { isTemplateExpression } from 'typescript';

interface ListProps {
    elements?: { header?: string, content?: string }[];
  }

const List: React.FC<ListProps> = ( { elements }) => {
    const items = elements.map((item) =>
        <StyledListItem> 
            <StyledSpan>
                {item.header && <b>{item.header}:</b>}
                <StyledIndent>
                    {item.content}
                </StyledIndent>
            </StyledSpan>
        </StyledListItem>
    );

  return (

    <StyledList>
        {items}
    </StyledList> 
  );
};

const StyledSpan = styled.span`
    position: relative;
    left: -20px;
`;

const StyledIndent = styled.span`
    position: relative;
    left: 10px;
`;

const StyledList = styled.ul`
    color: ${(props) => props.theme.color.grey[300]};
`;

const StyledListItem = styled.li`
    display:'flex'
    color: ${(props) => props.theme.color.grey[300]};
`;

export default List;


