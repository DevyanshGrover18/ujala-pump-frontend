import React from 'react';
import PropTypes from 'prop-types';

const ListComponent = ({
  items,
  renderItem,
  itemContainer: ItemContainer = 'div',
  listContainer: ListContainer = 'div',
  itemClassName = 'list-item',
  listClassName = 'list-container',
}) => {
  return (
    <ListContainer className={listClassName}>
      {items.map((item, index) => (
        <ItemContainer key={index} className={itemClassName}>
          {renderItem(item, index)}
        </ItemContainer>
      ))}
    </ListContainer>
  );
};

ListComponent.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  renderItem: PropTypes.func.isRequired,
  itemContainer: PropTypes.elementType,
  listContainer: PropTypes.elementType,
  itemClassName: PropTypes.string,
  listClassName: PropTypes.string,
};

export default ListComponent;
