// 判断是否支持symbol类型，支持就返回REACT_ELEMENT_TYPE，不支持就返回一个数字
const supportSymbol = typeof Symbol === 'function' && Symbol.for;

export const REACT_ELEMENT_TYPE = supportSymbol
	? Symbol.for('react.element')
	: 0xeac7;
