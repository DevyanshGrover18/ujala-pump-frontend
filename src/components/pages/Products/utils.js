export const getOrderTypeDisplay = (orderType) => {
  const types = {
    '1_unit': {
      label: '1 Unit/Box',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    '2_units': {
      label: '2 Units/Box',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
    '3_units': {
      label: '3 Units/Box',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
  };
  return types[orderType] || types['1_unit'];
};
