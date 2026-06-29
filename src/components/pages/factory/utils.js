export const generateSerialNumberRanges = (items) => {
  if (!items || items.length === 0) {
    return '';
  }

  const serialNumbers = items.map((item) => item.serialNumber).sort();

  const ranges = [];
  let start = serialNumbers[0];
  let end = serialNumbers[0];

  for (let i = 1; i < serialNumbers.length; i++) {
    const current = serialNumbers[i];
    const prev = serialNumbers[i - 1];

    const getNumber = (sn) => parseInt(sn.slice(-5));
    const getPrefix = (sn) => sn.slice(0, -5);

    if (
      getPrefix(current) === getPrefix(prev) &&
      getNumber(current) === getNumber(prev) + 1
    ) {
      end = current;
    } else {
      if (start === end) {
        ranges.push(start);
      } else {
        ranges.push(
          `${getPrefix(start)}${getNumber(start).toString().padStart(5, '0')}-${getNumber(end).toString().padStart(5, '0')}`
        );
      }
      start = current;
      end = current;
    }
  }

  if (start === end) {
    ranges.push(start);
  } else {
    const getNumber = (sn) => parseInt(sn.slice(-5));
    const getPrefix = (sn) => sn.slice(0, -5);
    ranges.push(
      `${getPrefix(start)}${getNumber(start).toString().padStart(5, '0')}-${getNumber(end).toString().padStart(5, '0')}`
    );
  }

  return ranges.join(', ');
};
